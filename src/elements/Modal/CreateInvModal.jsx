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

export default function CreateInv({ show, onHide }){
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
    // const [ controlledCheckAll, setControlledCheckAll ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    
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
            name: '',
            invoice_date: new Date(),
            // invoice_due:
        }
    });

    const [ sevenDaysAdded, set7DaysAdded ] = useState(getValues('invoice_date'));

    const fetchAllCust = async () => {
        await axiosPrivate.get("/customers")
            .then(resp => {
                setCustData(resp.data);
            })
            .catch(error => {
                toast.current.show({
                  severity: "error",
                  summary: "Failed",
                  detail: "Error when get customer data",
                  life: 3000,
                });
            }
        )
    };

    const fetchUpdateSales = async (ids, newInvID, paymentIDs, totalPayment, invRemainingPayment) => {
        await axiosPrivate.patch(`/sales/invs?id=${ids}`, newInvID)
        .then(resp => {
            let paramsPayment;
            if(paymentIDs.length > 0){
                if(paymentIDs.length > 1){
                    paramsPayment = paymentIDs.join("&id=");
                } else {
                    paramsPayment = paymentIDs[0];
                }
            }

            if(paramsPayment){
                let invID = JSON.parse(newInvID);
                axiosPrivate.patch(`/payment/minor-update?id=${paramsPayment}`, newInvID)
                .then(resp1 => {
                    if(resp1.data){
                        let invUpdate = JSON.stringify({
                            remaining_payment: invRemainingPayment - totalPayment,
                            is_paid: (invRemainingPayment - totalPayment) <= 0 ? true : false
                        });
                        axiosPrivate.patch(`/inv/payment?id=${invID.invoice_id}`, invUpdate)
                        .then(resp2 => {
                            if(resp2.data){
                                setTimeout(() => {
                                    window.location.reload();
                                },1700);

                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil membuat invoice",
                                    life: 1500,
                                }); 
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil menambahkan pembayaran",
                                    life: 1500,
                                });   
                            }
                        })
                        .catch(err2 => {
                            if(err2.response.status == 404){
                                toast.current.show({
                                    severity: "error",
                                    summary: "Not found",
                                    detail: "gagal memperbarui invoice",
                                    life: 1500,
                                });  
                            }
                        })
                    }
                })
                .catch(err1 => {
                    if(err1.response.status == 404){
                        toast.current.show({
                            severity: "error",
                            summary: "Not found",
                            detail: "gagal memperbarui pembayaran",
                            life: 1500,
                        });  
                    }
                })

            } else {
                setTimeout(() => {
                    window.location.reload();
                },1700);

                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Berhasil membuat invoice",
                    life: 1700,
                });
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

    const fetchInsertInv = async (body, paymentIDs, totalPayment) => {
        let bodyData = JSON.stringify(body);
        
        await axiosPrivate.post("/inv/write", bodyData)
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Invoice baru telah terbit",
                    life: 1700,
                });

                // update order table => add invoice id
                let invoiceID = JSON.stringify({invoice_id: resp.data.invoice_id});

                if(choosedOrderId.length > 1){
                    let sendReq = choosedOrderId.join("&id=");
                    fetchUpdateSales(sendReq, invoiceID, paymentIDs, totalPayment, resp.data.remaining_payment);
                } else {
                    let sendReq = choosedOrderId[0];
                    fetchUpdateSales(sendReq, invoiceID, paymentIDs, totalPayment, resp.data.remaining_payment);
                }

                
            })
        .catch(error => {
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
    
    const fetchSalesbyOneCustUnpaid = async () => {
        await axiosPrivate.get("/sales/cust/paytype", { params: { 
            custid: chooseCust.customer_id, 
            paytype:'unpaid'
        } })
        .then(resp => {
            setOrdersByCust(resp.data);
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

    const onSubmit = async (formData) => {
        if(choosedOrderId.length > 0 ){
            let pay_type = 'unpaid';
            let modelInv = {
                customer_id: formData.customer_id,
                order_id: JSON.stringify(choosedOrderId),
                invoice_date: formData.invoice_date,
                invoice_due: formData.invoice_due,
                is_paid: false,
                payment_type: pay_type,
                status: 'active'
            };

            let totalPaymentInvNull = 0;
            let paymentIDs = [];
            await axiosPrivate.get(`/payment/cust/nullish?custid=${formData.customer_id}`)
            .then(resp => {
                if(resp.data){
                    paymentIDs = resp.data.map(e => e.payment_id);
                    totalPaymentInvNull = resp.data.reduce((prevValue, currValue) => prevValue + Number(currValue.amount_paid), 0);
                }
            })
            .catch(err => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Gagal mencari pembayaran",
                    life: 3000,
                });
            })
            
            // check total order in new orders added to inv with amountPaid with same invoice id
            // const getGrandtotalOrder = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.grandtotal), 0);
            // const getSubtotalOrder = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.subtotal), 0);
            // const getTotalOrderDisc = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.order_discount), 0);
            const getGrandtotalOrder = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + (Number(currValue.grandtotal) - (currValue.return_order ? Number(currValue.return_order.refund_total):0) + (currValue.orders_credit ? Number(currValue.orders_credit.return_order.refund_total):0)), 0);
            const getSubtotalOrder = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + (Number(currValue.subtotal) - (currValue.return_order ? Number(currValue.return_order.refund_total):0) + (currValue.orders_credit ? Number(currValue.orders_credit.return_order.refund_total):0)), 0);
            const getTotalOrderDisc = choosedOrder.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.order_discount), 0);
            // update total value
            modelInv.total_discount = getTotalOrderDisc;
            modelInv.subtotal = getSubtotalOrder; 
            modelInv.amount_due = getGrandtotalOrder - getTotalOrderDisc;

            modelInv.remaining_payment = (getGrandtotalOrder - getTotalOrderDisc);

            fetchInsertInv(modelInv, paymentIDs, totalPaymentInvNull);
            // fetchSumOrder(formData.customer_id, pay_type, modelInv);
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

    // // handle checkboxes
    // const handleChooseOrder = (checked, order_id) => {
    //     let dupe = [...choosedOrder];
    //     if(checked){
    //         dupe.push(order_id);
    //         setChoosedOrder(dupe);
    //     } else {
    //         let getIndex = choosedOrder.indexOf(order_id);
    //         if(getIndex < 0) {
    //             // if not found or empty
    //             dupe.push(order_id)
    //             setChoosedOrder(dupe);
    //         } else {
    //             // if found
    //             dupe.splice(getIndex, 1);
    //             setChoosedOrder(dupe);
    //         }
    //     }
    // }

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
        if(ordersByCust && choosedOrder){
            if(choosedOrder.length == ordersByCust.orders.length) {
                setCheckAll(true);
            } else {
                setCheckAll(false); 
            }
        }
    },[choosedOrder])
    // end of checkboxes handle

    const handleFilterCust = (e) => {
        handleAutoComplete(getValues('name'));
    }  
    
    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
            setOrdersByCust(null);
            setCheckAll(false);
            setChoosedOrder([]);
            checkboxSingle.current = [];
        }
    }

    useEffect(() =>{
        if(ordersByCust){
            setCheckAll(true);
            controlledCheckAll(true);
        } else {
            setChoosedOrder([]);
        }
    },[ordersByCust])

    useEffect(() => {
        if(chooseCust && chooseCust != ""){
            setChoosedOrder([]);
            setCheckAll(false);
            fetchSalesbyOneCustUnpaid();
        }
    },[chooseCust]);
    
    useEffect(() => {
        fetchAllCust();
        add7days(getValues('invoice_date'));
    },[]);

    useEffect(() => {
        if(ordersByCust){
            setIsLoading(false);
        }
    },[ordersByCust])

    useEffect(() => {
        if(isLoading){
            return;
        }
    },[isLoading]);

    return(
        <>
        <Modal dialogClassName="modal-90w" show={show} onHide={onHide} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>Create invoice</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{overflowY: 'unset', height: 'fit-content'}}>
                <form className="row gy-3 mb-4">
                    <div className="col-lg-4 col-sm-6 col-md-6 col-6">
                        <div style={{position:'relative'}}>
                            <InputWLabel 
                                label="Customer Name" 
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
                    <div className="col-lg-4 col-sm-6 col-md-6 col-6">
                        <InputWLabel 
                            label={'invoice date'}
                            type={'date'}
                            name={'invoice_date'}
                            onChange={(e) => add7days(e.value)}
                            require={true}
                            register={register}
                            errors={errors} 
                            defaultValue={getValues('invoice_date')}
                            />
                    </div>
                    <div className="col-lg-4 col-sm-6 col-md-6 col-6">
                        <InputWLabel 
                            label={'invoice due'}
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
                                            order date
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-name">
                                            customer name
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-id">
                                            customer ID
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-type">
                                            customer type
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-type">
                                            order type
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
                                            type
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
                                            <td>
                                                {ordersByCust.cust_type}
                                            </td>
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
                                                    : ""} light`}
                                                >
                                                    {
                                                        order.order_status == "completed" ? 'completed'
                                                        : order.order_status == "pending" ? 'pending'
                                                        : order.order_status == "in-delivery" ? 'in-delivery'
                                                        : order.order_status == "canceled" ? 'canceled'
                                                        : ""
                                                    }                                                                                
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    order.payment_type == "unpaid" ? 'danger'
                                                    : order.payment_type == "paid"? "primary"
                                                    : order.payment_type == "partial"? "warning"
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
                <button type="button" className="btn btn-secondary light" onClick={onHide}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit(onSubmit,onError)}>Create</button>
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