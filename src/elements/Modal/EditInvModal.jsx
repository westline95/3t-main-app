import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, ToastContainer, Collapse } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import InputWLabel from '../Input/InputWLabel';
import InputWSelect from '../Input/InputWSelect';
import { useForm } from 'react-hook-form';
import FetchApi from '../../assets/js/fetchApi.js';
import ConvertDate from '../../assets/js/ConvertDate.js';
import NumberFormat from '../Masking/NumberFormat.jsx';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import axios from '../../api/axios.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';

export default function EditInv({ show, onHide, data }){
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const [ custData, setCustData ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ chooseCust, setCust] = useState("");
    const [ ordersByCust, setOrdersByCust] = useState(null);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ choosedOrderId, setChoosedOrderId ] = useState([]);
    const [ choosedOrder, setChoosedOrder ] = useState([]);
    const [ showToast, setShowToast ] = useState(false);
    const [ checkAll, setCheckAll ] = useState(false);
    const [ orderSum, setOrderSum ] = useState(null);
    const [ totalRecords, setTotalRecords ] = useState(0);
    const [ totalPayment, setTotalPayment ] = useState(0);
    // const [ controlledCheckAll, setControlledCheckAll ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    
    const orderIds = data ? JSON.stringify(data.items.order_id) : [];
    
    const toast = useRef(null);
    const refToThis = useRef(null);
    const checkboxParent = useRef(null);
    const checkboxSingle = useRef([]);
    const axiosPrivate = useAxiosPrivate();
    const {
        getValues,
        setValue,
        setError,
        register,
        handleSubmit,
        formState: { errors },
        clearErrors
    } = useForm({
        defaultValues: {
            customer_id: data.items?.customer_id,
            name: data.items?.customer?.name,
            invoice_date: data.items ? new Date(data.items.invoice_date) : null,
            invoice_due: data.items ? new Date(data.items.invoice_due) : null
        }
    });
    const [ sevenDaysAdded, set7DaysAdded ] = useState(getValues('invoice_due'));

    const fetchUpdateSalesInv = async (reqLink, reqUnlink) => {
        if(reqLink){
            let invoiceID = JSON.stringify({invoice_id: data?.id});
            console.log(reqLink)
            console.log(reqUnlink)
            await axiosPrivate.patch(`/sales/invs?id=${reqLink}`, invoiceID)
            .then(resp => {
                if(reqUnlink){
                    let invoiceID = JSON.stringify({invoice_id: null});

                    axiosPrivate.patch(`/sales/invs?id=${reqUnlink}`, invoiceID)
                    .then(resp2 => {
                        toast.current.show({
                            severity: "success",
                            summary: "Success",
                            detail: "Successfully update sales",
                            life: 3000,
                        });

                        // setTimeout(() => {
                        //     window.location.reload();
                        // },1200)
                    })
                    .catch(err2 => {
                        toast.current.show({
                            severity: "error",
                            summary: "Failed",
                            detail: "Invoice error",
                            life: 3000,
                        });
                    })
                } else {
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Successfully update sales",
                        life: 3000,
                    });

                    // setTimeout(() => {
                    //     window.location.reload();
                    // },1200)
                }

                
            })
            .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to update sales",
                    life: 3000,
                });
            })
        } 
    };

    const fetchInsertInv = async (body) => {
        let bodyData = JSON.stringify(body);
        console.log(body)
        await axiosPrivate.post("/inv/write", bodyData)
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New invoice is created",
                    life: 3000,
                });

                // update order table => add invoice id
                let invoiceID = JSON.stringify({invoice_id: resp.data.invoice_id});

                if(choosedOrderId.length > 1){
                    let forUrl = [];
                    choosedOrderId.forEach((id, idx) => {
                        if(idx !=0 ){
                            forUrl.push("id=");
                        }
                        forUrl.push(id);
                        if(idx != choosedOrderId.length-1){
                            forUrl.push("&");
                        }
                    });
                    let sendReq = forUrl.join("");
                    fetchUpdateSales(sendReq, invoiceID);
                } else {
                    let sendReq = getSalesRef[0];
                    fetchUpdateSales(sendReq, invoiceID);
                }
            })
        .catch(error => {
            console.error(error)
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add new invoice!",
                life: 3000,
            });
        })
    };
    
    const fetchSumOrder = async (cust_id, pay_type, modelInv) => {
        await axiosPrivate(`sales/summary?id=${cust_id}&paytype=${pay_type}`)
        .then(resp => {
            let newModelInv;
            if(resp.data.length > 0) {
                newModelInv = {
                    ...modelInv,
                    subtotal: resp.data[0].total_subtotal,
                    amount_due: resp.data[0].total_grandtotal,
                    remaining_payment: resp.data[0].total_grandtotal,
                    total_discount: resp.data[0].total_order_disc,
                };
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Not found",
                    life: 3000,
                });
            }
            fetchInsertInv(newModelInv);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get order data!",
                life: 3000,
            });
        })
    };
    
    const fetchSalesbyOneCust = async () => {
        await axiosPrivate.get("/sales/cust/paytype/v2", { params: { 
            custid: data.items?.customer?.customer_id, 
            paytype: data.items?.payment_type,
            invid: data?.id
        }})
        .then(resp => {
            setOrdersByCust(resp.data);
            let getOrderId = [];
            let getOrders = [];
            let parsingCurrOrderID = JSON.parse(data.items?.order_id);
            resp.data.orders && resp.data.orders.filter(order => {
                if(parsingCurrOrderID.includes(order.order_id)) {
                    getOrderId.push(order.order_id);
                    getOrders.push(order);
                }
            })
            setChoosedOrderId(getOrderId);
            setChoosedOrder(getOrders);
        })
        .catch(error => {
            setOrdersByCust(null);
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Order data is empty or not found!",
                life: 3000,
            });
        })
    };

    const fetchUpdateInv = async (inv) => {
        let invBody = JSON.stringify(inv);
        await axiosPrivate.put("/inv", invBody, { params: {id: data?.id} })
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully update invoice",
                life: 3000,
            });

            // link order_id to current invoice_id
            let sendReq1;
            if(choosedOrderId.length > 1 ){
                sendReq1 = choosedOrderId.join("&id=");
            } else if(choosedOrderId.length == 1) {
                sendReq1 = choosedOrderId[0];
            }

            // unlink invopice_id in order if true
            let currentOrderId = JSON.parse(data.items.order_id);
            let unlinkOrderId = currentOrderId.filter(item => !choosedOrderId.includes(item));
            let sendReq2;
            if(unlinkOrderId.length > 1 ){
                sendReq2 = unlinkOrderId.join("&id=");
            } else if(unlinkOrderId.length == 1) {
                sendReq2 = unlinkOrderId[0];
            }
            fetchUpdateSalesInv(sendReq1, sendReq2);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to update invoice",
                life: 3000,
            });
        })
    }

    const fetchGetPayment = async (invModel) => [
        await axiosPrivate.get(`/payment/inv?invid=${data?.id}`)
        .then(resp => {
            let amountPaid;
            if(resp.data.length == 0) {
                amountPaid = 0;
            } else {
                amountPaid = resp.data.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.amount_paid), 0);
            }
            setTotalPayment(amountPaid);

            // check total order in new orders added to inv with amountPaid with same invoice id
            const getGrandtotalOrder = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.grandtotal), 0)
            const getSubtotalOrder = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.subtotal), 0)
            const getTotalOrderDisc = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.order_discount), 0)

            // update is_paid value
            let newModelInv = {
                ...invModel, 
                amount_due: getGrandtotalOrder,
                subtotal: getSubtotalOrder, 
                total_discount: getTotalOrderDisc
            };

            if(amountPaid >= getGrandtotalOrder){
                newModelInv.is_paid = true;
                newModelInv.remaining_payment = 0;
            } else {
                newModelInv.is_paid = false;
                newModelInv.remaining_payment = getGrandtotalOrder - amountPaid;
            }

            fetchUpdateInv(newModelInv);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed when get payment data!",
                life: 3000,
            });
        })
    ]

    const fetchUnlinkInv = async () => {
        const orderID = JSON.parse(data.items.order_id);
        const orderInv = JSON.stringify({invoice_id: null});
        const payments = data.items.payments ? data.items.payments : [];
        let params;
        if(payments.length > 0){
            let paymentsID = data.items.payments.map(pay => pay.payment_id);
            if(payments.length > 1){
                params = paymentsID.join("&id=");
            } else {
                params = paymentsID[0];
            }
        }  

        if(orderID.length == 1){
            await axiosPrivate.patch(`/sales/invs?id=${orderID[0]}`, orderInv)
            .then(resp1 => {
                if(resp1.data){
                    axiosPrivate.delete(`/inv?id=${data.items.invoice_id}`)
                    .then(resp2 => {
                        if(resp2.data){
                            if(params){
                                axiosPrivate.patch(`/payment/minor-update?id=${params}`, orderInv)
                                .then(resp3 => {
                                    if(resp3.data[0] == payments.length){
                                        // setTimeout(() => {
                                        //     window.location.reload();
                                        // },1200)

                                        toast.current.show({
                                            severity: "success",
                                            summary: "Sukses",
                                            detail: "Invoice berhasil dihapus",
                                            life: 3000,
                                        });
                                    } else {
                                        toast.current.show({
                                            severity: "success",
                                            summary: "Sukses",
                                            detail: "Ada beberapa payment yg gagal unlink",
                                            life: 3000,
                                        });
                                    }
                                })
                                .catch(err3 => {
                                    if(err3.response.status == 404){
                                        toast.current.show({
                                            severity: "error",
                                            summary: "Not Found",
                                            detail: "Payment id tidak ditemukan!",
                                            life: 3000,
                                        });
                                    }
                                })
                            } else {
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Invoice tanpa payment berhasil dihapus",
                                    life: 3000,
                                });
                            }
                            
                        }
                    })
                    .catch(err2 => {
                        if(err2.response.status == 404){
                            toast.current.show({
                                severity: "error",
                                summary: "Not Found",
                                detail: "Invoice id tidak ditemukan!",
                                life: 3000,
                            });
                        }
                    })
                }
            })
            .catch(err1 => {
                if(err1.response.status == 404){
                    toast.current.show({
                        severity: "error",
                        summary: "Not Found",
                        detail: "Order id tidak ditemukan!",
                        life: 3000,
                    });
                }
            })
        }
    }

    const onSubmit = (formData) => {
        console.log(formData)
        if(choosedOrderId.length > 0){
            let modelInv = {
                customer_id: formData.customer_id,
                order_id: JSON.stringify(choosedOrderId),
                invoice_date: formData.invoice_date,
                invoice_due: formData.invoice_due,
                payment_type: data.items.payment_type
            };
            // console.log(data)
            // console.log(modelInv)
            fetchGetPayment(modelInv);
            // fetchSumOrder(formData.customer_id, pay_type, modelInv);
        } else {
            // console.log(data)
            // console.log(formData)
            fetchUnlinkInv();
        }
    };

    const onError = () => {
        console.log(errors)
    }

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(refToThis.current 
                    && !ref.current.contains(evt.target) 
                    && evt.target.className !== "res-item" 
                    && evt.target.className !== "popup-element") {
                    setOpenPopup(false);
                    // setOpenPopupProd(false);
                } 
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        },[ref])
        
    };
    handleClickSelect(refToThis);

    const handleAutoComplete = (custName) => {
        if(custData && custName !== ""){
            let filteredCust = custData.filter(item => item.name.includes(custName.toLowerCase()));
            if(filteredCust.length === 0){
                setOpenPopup(false);
                setFilteredCust(filteredCust);
                setError("name", { type: 'required', message: "Customer name error!" });
            } else {
                setOpenPopup(true);
                setFilteredCust(filteredCust);
                clearErrors("name");
            }
        } else if(!custName || custName === ""){
            setOpenPopup(true);
            setFilteredCust(custData);
            setError("name", { type: 'required', message: "This field is required!" })
        } else {
            setOpenPopup(false);
            setFilteredCust("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    }

    const add7days = (value) => {
        const invDate = new Date(value);
        invDate.setDate(new Date(value).getDate() + 7);
        set7DaysAdded(invDate);
        setValue('invoice_due', invDate);
    }


    const handleChooseCust = (e) => {
        setCust(e);
        setValue('customer_id', e.customer_id);
        setValue('name', e.name);
        setOpenPopup(false);
        clearErrors("name");
    }

    // handle checkboxes
    const handleChooseOrder = (checked, order) => {
        let dupe = [...choosedOrderId];
        let orders = [...choosedOrder];
        if(checked){
            dupe.push(order.order_id);
            setChoosedOrderId(dupe);
            orders.push(order);
            setChoosedOrder(orders);
        } else {
            let getIndex = choosedOrderId.indexOf(order.order_id);
            if(getIndex < 0) {
                // if not found or empty
                dupe.push(order.order_id)
                setChoosedOrderId(dupe);
            } else {
                // if found
                dupe.splice(getIndex, 1);
                setChoosedOrderId(dupe);
            }
            let filteringOrder = choosedOrder.filter(order => dupe.includes(order.order_id));
            setChoosedOrder(filteringOrder);
        }
    }

    const addCheckboxRef = (checkboxEl) =>{
        if(checkboxEl && !checkboxSingle.current.includes(checkboxEl)){
            checkboxSingle.current.push(checkboxEl);
        }
    }

    const controlledCheckAll = (checkedAll) => {
        if(checkedAll){
            if(checkboxSingle){
                let orders_id = [];
                checkboxSingle.current.forEach(e => {
                    e.checked = true;
                    orders_id.push(e.value);
                });

                let orders = ordersByCust?.orders.filter(order => orders_id.includes(order.order_id));
                setChoosedOrderId(orders_id);
                setChoosedOrder(orders);
            }
        } else {
            if(checkboxSingle){
                checkboxSingle.current.forEach(e => {
                    e.checked = false;
                });
                setChoosedOrderId([]);
                setChoosedOrder([]);
            }
        }
    };
    
    useEffect(() => {
        if(ordersByCust && choosedOrderId){
            if(choosedOrderId.length == ordersByCust.orders.length) {
                setCheckAll(true);
            } else {
                setCheckAll(false); 
            }
        }
    },[choosedOrderId])
    // end of checkboxes handle

    const handleFilterCust = (e) => {
        handleAutoComplete(getValues('name'));
    }  
    
    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
            setOrdersByCust(null);
            setCheckAll(false);
            setChoosedOrderId([]);
            checkboxSingle.current = [];
        }
    }

    useEffect(() => {
        if(chooseCust && chooseCust != ""){
            setChoosedOrderId([]);
            setCheckAll(false);
            
        }
    },[chooseCust]);
    
    useEffect(() => {
        if(data){
            // fetchAllCust();
            fetchSalesbyOneCust();
        }
        // add7days();
    },[]);


    useEffect(() => {
        if(!data){
            return;
        }
    },[data])

    return(
        <>
        <Modal dialogClassName={isMobile || isMediumScr ? 'modal-xl' : 'modal-90w'} show={show} onHide={onHide} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>Edit invoice</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{overflowY: 'unset', height: 'fit-content'}}>
                <form className="row mb-4" style={{gap: isMobile || isMediumScr ? '.3rem' : '0'}}>
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                        <div style={{position:'relative'}}>
                            <InputWLabel 
                                label="Nama pelanggan" 
                                type="text"
                                name="name" 
                                placeholder="Search customer name..." 
                                onChange={handleFilterCust}
                                onFocus={handleFilterCust}
                                onKeyDown={handleKeyDown}
                                require={true}
                                register={register}
                                errors={errors} 
                                textStyle={'capitalize'}
                                autoComplete={"off"}
                                disabled={true}
                            />
                            {/* popup autocomplete */}
                            <div className="popup-element" aria-expanded={openPopup} ref={refToThis}>
                                {filterCust && filterCust.length > 0 ? 
                                    filterCust.map((e,idx) => {
                                        return (
                                            <div key={`cust-${idx}`} className="res-item" onClick={() => 
                                                handleChooseCust({ 
                                                    ...e
                                            })}>{e.name}</div>
                                        )
                                    }) : ""
                                }
                            </div>   
                        </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                        <InputWLabel 
                            label={'Tanggal terbit'}
                            type={'date'}
                            name={'invoice_date'}
                            onChange={(e) => {add7days(e.value)}}
                            require={true}
                            register={register}
                            errors={errors} 
                            defaultValue={getValues('invoice_date')}
                        />
                    </div>
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                        <InputWLabel 
                            label={'Jatuh tempo'}
                            type={'date'}
                            name={'invoice_due'}
                            require={true}
                            register={register}
                            errors={errors} 
                            defaultValue={sevenDaysAdded}
                        />
                    </div>
                    {/* <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                        <label className="mb-1" for="inv-for">invoice for</label>
                        <input type="text" className="form-control" placeholder="type a customer name...">
                    </div> */}
                    {/* <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                        <label className=" align-self-center">
                            add customer sales</label>
                        <input type=" text" className="form-control" placeholder="Type a customer name..." />
                    </div> */}
                
                {/* <p className="card-title" style={{fontWeight: 500}}>Order list</p> */}
                {/* {ordersByCust ? 
                (    */}

                <Collapse in={ordersByCust != null}>
                    <div className="modal-table-wrap mt-2">
                        <div className="table-responsive" style={{height: '350px'}}>
                            <table className="table" id="salesList" data-table-search="true" data-table-sort="true"
                                data-table-checkbox="true">
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            <input ref={checkboxParent} className="form-check-input checkbox-primary checkbox-all"
                                                type="checkbox" checked={checkAll} 
                                                onChange={(e) => {
                                                    setCheckAll(e.currentTarget.checked);
                                                    controlledCheckAll(e.currentTarget.checked);
                                                }} 
                                            />
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-id">
                                            order id
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-date">
                                            tanggal order
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-name">
                                            nama pelanggan
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-id">
                                            ID pelanggan
                                            <span className="sort-icon"></span>
                                        </th>
                                        {/* <th scope="col" className="head-w-icon sorting" aria-label="cust-type">
                                            customer type
                                            <span className="sort-icon"></span>
                                        </th> */}
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-type">
                                            tipe order
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="total">
                                            total
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="status">
                                            status
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="payment-type">
                                            Tipe Pembayaran
                                            <span className="sort-icon"></span>
                                        </th>
                                        {/* <th scope="col" aria-label="action">
                                            action
                                        </th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                {ordersByCust?.orders.map((order, idx) => {
                                    
                                    return(
                                        <tr key={`order-${idx}`} style={{textTransform: 'capitalize'}}>
                                            <th scope="row">
                                                <input className="form-check-input checkbox-primary checkbox-single" 
                                                    checked={choosedOrderId.includes(order.order_id)}
                                                    type="checkbox" value={order.order_id} ref={addCheckboxRef} 
                                                    onChange={(e) => handleChooseOrder(e.currentTarget.checked, order)} 
                                                />
                                            </th>
                                            <td>
                                                {order.order_id}
                                            </td>
                                            <td className="">{ConvertDate.convertToFullDate(order.order_date, "/")}</td>
                                            <td className="data-img">
                                                {ordersByCust.name}
                                            </td>
                                            <td>{ordersByCust.customer_id}</td>
                                            {/* <td>
                                                {ordersByCust.cust_type}
                                            </td> */}
                                            <td>{order.order_type}</td>
                                            <td>
                                                {
                                                <NumberFormat intlConfig={{
                                                    value: order.grandtotal, 
                                                    locale: "id-ID",
                                                    style: "currency", 
                                                    currency: "IDR",
                                                    }} 
                                                />
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    order.order_status == "completed" ? 'success'
                                                    : order.order_status == "pending" ? "secondary" 
                                                    : order.order_status == "in-delivery" ? "warning" 
                                                    : order.order_status == "canceled" ? "danger" 
                                                    : order.order_status == "confirmed" ? "primary" 
                                                    : ""} light`}
                                                >
                                                    {
                                                        order.order_status == "completed" ? 'selesai'
                                                        : order.order_status == "pending" ? 'pending'
                                                        : order.order_status == "in-delivery" ? 'in-delivery'
                                                        : order.order_status == "canceled" ? 'batal'
                                                        : order.order_status == "confirmed" ? 'dikonfirmasi'
                                                        : ""
                                                    }                                                                                
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    order.payment_type == "bayar nanti" ? 'danger'
                                                    : order.payment_type == "lunas"? "primary"
                                                    : order.payment_type == "sebagian"? "warning"
                                                    : ""} light`}
                                                >
                                                    {order.payment_type }                                                                                
                                                </span>
                                            </td>
                                            {/* <td>
                                                <span className="table-btn detail-table-data" data-bs-toggle="modal"
                                                    data-bs-target="#salesDetail"><i className='bx bx-show'></i></span>
                                            </td> */}
                                        </tr>
                                    )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>

                </Collapse>
                 {/* ):''} */}
                 </form>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>Batal</button>
                <button type="button" className="btn btn-primary" onClick={() => {
                    choosedOrderId.length > 0 ? handleSubmit(onSubmit,onError)()
                    : toast.current.show({
                        severity: "warn",
                        summary: "Peringatan",
                        detail: "Pilih minimal 1 order",
                        life: 3000,
                    });
                }}>Buat invoice</button>
            </Modal.Footer>
        </Modal>
        

        {/* toast area */}
        {/* <ToastContainer className="p-3 custom-toast">
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                <Toast.Body>{toastContent.msg}</Toast.Body>
            </Toast>
        </ToastContainer> */}
        <Toast ref={toast} />

        </>


    )
}