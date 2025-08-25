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
import CreatePayment from './CreatePaymentModal.jsx';
import InvoiceModal from './InvoiceModal.jsx';

export default function InvoicePayment({ show, onHide }){
    const [ custData, setCustData ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ chooseCust, setCust] = useState("");
    const [ showModal, setShowModal] = useState("");
    const [ invsByCust, setInvsByCust] = useState([]);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ choosedOrder, setChoosedOrder ] = useState([]);
    const [ showToast, setShowToast ] = useState(false);
    const [ selectedMode, setSelectedMode ] = useState(false);
    const [ checkAll, setCheckAll ] = useState(false);
    const [ showInvList, setShowInvList ] = useState(false);
    const [ invData, setInvData ] = useState(null);
    const [ orderSum, setOrderSum ] = useState(null);
    const [ paidData, setPaidData ] = useState(null);
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
        await axiosPrivate.get("/customer/unpaid-inv")
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

    const getCustInv = () => {
        // get cust only with available invoices:unpaid
        let selectInv = custData.filter(data => {
            if(data.invoices.length > 0){
                return data.invoices.find(({is_paid}) => is_paid == false);
            }
        });
        setInvsByCust(selectInv);
    }

    const fetchUpdateSales = async (ids, newInvID) => {
        await axiosPrivate.patch(`/sales/invs?id=${ids}`, newInvID)
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully update sales",
                life: 3000,
            });

            setTimeout(() => {
                window.location.reload();
            },3000)
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

    const fetchInsertInv = async (body) => {
        let bodyData = JSON.stringify(body);
        // console.log(choosedOrder)
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

                if(choosedOrder.length > 1){
                    let forUrl = [];
                    choosedOrder.forEach((id, idx) => {
                        if(idx !=0 ){
                            forUrl.push("id=");
                        }
                        forUrl.push(id);
                        if(idx != choosedOrder.length-1){
                            forUrl.push("&");
                        }
                    });
                    let sendReq = forUrl.join("");
                    fetchUpdateSales(sendReq, invoiceID);
                } else {
                    let sendReq = choosedOrder[0];
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
    
    const fetchSalesbyOneCustUnpaid = async () => {
        await axiosPrivate.get("/sales/cust/paytype", { params: { 
            custid: chooseCust.customer_id, 
            paytype:'bayar nanti'
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

    const onSubmit = (formData) => {
        if(formData.customer_id && choosedOrder.length > 0 && formData.invoice_date && formData.invoice_due){
            let pay_type = 'bayar nanti';
            let modelInv = {
                customer_id: formData.customer_id,
                order_id: JSON.stringify(choosedOrder),
                invoice_date: formData.invoice_date,
                invoice_due: formData.invoice_due,
                is_paid: false,
                payment_type: pay_type
            };
            fetchSumOrder(formData.customer_id, pay_type, modelInv);
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
    const handleChooseOrder = (checked, order_id) => {
        let dupe = [...choosedOrder];
        if(checked){
            dupe.push(order_id);
            setChoosedOrder(dupe);
        } else {
            let getIndex = choosedOrder.indexOf(order_id);
            if(getIndex < 0) {
                // if not found or empty
                dupe.push(order_id)
                setChoosedOrder(dupe);
            } else {
                // if found
                dupe.splice(getIndex, 1);
                setChoosedOrder(dupe);
            }
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
                setChoosedOrder(orders_id);
            }
        } else {
            if(checkboxSingle){
                checkboxSingle.current.forEach(e => {
                    e.checked = false;
                });
                setChoosedOrder([]);
            }
        }
    };

    // useEffect(() => {
    //     if(ordersByCust && choosedOrder){
    //         if(choosedOrder.length == ordersByCust.orders.length) {
    //             setCheckAll(true);
    //         } else {
    //             setCheckAll(false); 
    //         }
    //     }
    // },[choosedOrder])
    // end of checkboxes handle

     const handleModal = (e, invData, InvRef) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "viewInvModal":
                setInvData(invData);
                setShowModal("viewInvModal");
                break;
            case "addPaymentModal":
                setInvData(invData);
                setShowModal("addPaymentModal");
            break;
        }
    }


    const handleFilterCust = (e) => {
        handleAutoComplete(getValues('name'));
    }  
    
    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
            // setOrdersByCust(null);
            setCheckAll(false);
            setChoosedOrder([]);
            checkboxSingle.current = [];
        }
    }

    // useEffect(() =>{
    //     if(ordersByCust){
    //         setCheckAll(true);
    //         controlledCheckAll(true);
    //     } else {
    //         setChoosedOrder([]);
    //     }
    // },[ordersByCust])

    const showInvByCust = () => {
        let dupeAllCustUnpaid = [...custData];
        let invoices;
        dupeAllCustUnpaid.length > 0 && dupeAllCustUnpaid.map(item => {
            if(item.customer_id == chooseCust.customer_id){
                invoices = item.invoices;
            }
        });
        
        // let ascInv = invoices.sort((a, b) => {
        //     let invDateA = new Date(a.invoice_date);
        //     let invDateB = new Date(b.invoice_date);
        //     // Compare 
        //     if (invDateA < invDateB) return -1;
        //     if (invDateA > invDateB) return 1;
        //     return 0;
        // })
        // console.log(ascInv)
        console.log(dupeAllCustUnpaid)
        setInvsByCust(invoices);
    }

    useEffect(() => {
        if(chooseCust && chooseCust != ""){
            setChoosedOrder([]);
            setCheckAll(false);
            setShowInvList(true);
            showInvByCust();
        } else {
            setShowInvList(false);
        }
    },[chooseCust]);
    
    useEffect(() => {
        fetchAllCust();
        add7days(getValues('invoice_date'));
    },[]);

    useEffect(() => {
        if(custData){
            setIsLoading(false);
        }
    },[custData])

    useEffect(() => {
        if(isLoading){
            return;
        }
    },[isLoading]);

    return(
        <>
        <Modal size='md' show={show} onHide={onHide} scrollable={false} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>Invoice payment</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{overflowY: 'unset', height: 'fit-content'}}>
                {/* <div className='action-choose-btn' style={{display: selectedMode ? 'none' : 'flex'}}>
                    <button
                        type="button"
                        className="btn btn-primary btn-w-icon"
                        style={{ fontWeight: 500 }}
                        // onClick={clearFilter}
                    >
                        <i className="bx bx-plus" style={{ fontSize: "24px" }}></i>
                        pembayaran ke invoice yang ada (automatis)
                    </button>
                    <div className='divider-w-text'>
                        <span className='divider'></span>
                        <span>atau</span>
                        <span className='divider'></span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-w-icon"
                        style={{ fontWeight: 500 }}
                        onClick={() => setSelectedMode(true)}
                    >
                        <i className="bx bx-plus" style={{ fontSize: "24px" }}></i>
                        pembayaran ke invoice pilihan (manual)
                    </button>
                </div> */}
                

                {/* <Collapse in={selectedMode == true}> */}
                    <form className="row gy-3 mb-4">
                        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
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
                                />
                                <div className="popup-element" aria-expanded={openPopup} ref={refToThis}>
                                    {filterCust ?
                                        filterCust.length > 0 ? 
                                            filterCust.map((e,idx) => {
                                                return (
                                                    <div key={`cust-${idx}`} className="res-item" onClick={() => 
                                                        handleChooseCust({ 
                                                            ...e
                                                    })}>{e.name}</div>
                                                )
                                            }) 
                                        : (
                                            <div className="res-item">Data tidak ada</div>
                                        )
                                    :null
                                    }
                                </div>   
                            </div>
                        </div>

                    <Collapse in={showInvList == true}>
                        <div className="modal-table-wrap mt-2">
                            <div className="table-responsive" style={{height: '350px'}}>
                                <div className='mini-card-container'>
                                    {
                                    custData && invsByCust ?
                                        invsByCust.length > 0 ?
                                            invsByCust.map((inv, idx) => {
                                                return(
                                                    <div className='mini-card' key={idx} aria-label="viewInvModal" onClick={(e) => handleModal(e, {id: inv.invoice_id, items: inv})}>
                                                        <div className={`header-highlight ${new Date() > new Date(inv.invoice_due) ? 'bg-danger': 'bg-warning'}`}>
                                                            {new Date() > new Date(inv.invoice_due) ?  'due' : 'in-progress'}
                                                        </div>
                                                        {/* <p className='mini-card-caption mt-4'>{'Felicia'}</p> */}
                                                        <p className='mini-card-title' style={{marginTop: '2rem'}}>{inv.invoice_number}</p>
                                                        <div style={{display: 'inline-flex', gap: '.2rem', textTransform: 'capitalize', marginBottom: '1rem', fontSize: '12.5px'}}>
                                                            <span className={`badge badge-${
                                                                !inv.is_paid ? 'danger' :  "primary"} light`}
                                                            >
                                                                {inv.is_paid ? 'lunas' : 'bayar nanti'}                                                                                
                                                            </span>
                                                            <span className={`badge badge-${
                                                                inv.payment_type == "bayar nanti" ? 'danger'
                                                                : inv.payment_type == "lunas"? "primary"
                                                                : inv.payment_type == "sebagian"? "warning"
                                                                : ""} light`}
                                                            >
                                                                {inv.payment_type }                                                                                
                                                            </span>
                                                        </div>
                                                    
                                                        <div>
                                                            <p className='mini-card-subtitle'>{'sisa'}</p>
                                                            <p className='mini-card-text'>
                                                                <NumberFormat intlConfig={{
                                                                    value: inv.remaining_payment, 
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                    }} 
                                                                />
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            
                                            }) 
                                        : null
                                    :null
                                    }
                                </div>
                            </div>
                        </div>

                    </Collapse>
                    </form>
                {/* </Collapse> */}
                            {/* <table className="table" id="salesList" data-table-search="true" data-table-sort="true"
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
                                        <th scope="col" aria-label="action">
                                            action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                {ordersByCust?.orders.map((order, idx) => {
                                    return(
                                        <tr key={`order-${idx}`} style={{textTransform: 'capitalize'}}>
                                            <th scope="row">
                                                <input className="form-check-input checkbox-primary checkbox-single"
                                                    type="checkbox" value={order.order_id} ref={addCheckboxRef} 
                                                    onChange={(e) => handleChooseOrder(e.currentTarget.checked, order.order_id)}  
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
                                            <td>
                                                <span className="table-btn detail-table-data" data-bs-toggle="modal"
                                                    data-bs-target="#salesDetail"><i className='bx bx-show'></i></span>
                                            </td>
                                        </tr>
                                    )
                                    })
                                }
                                </tbody>
                            </table> */}
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>Cancel</button>
                {/* <button type="button" className="btn btn-primary" >Auto select invoice</button> */}
            </Modal.Footer>
        </Modal>


        {/* modal */}
        {
            showModal === "addPaymentModal" ? 
            (
                <CreatePayment
                    show={showModal === "addPaymentModal" ? true : false} 
                    onHide={() => setShowModal("")} 
                    source={'payment'}
                    totalCart={showModal === "addPaymentModal" && invData ? invData.items.remaining_payment : ""} 
                    data={invData}
                    returnValue={(paymentData) => {setPaidData(paymentData)}} 
                />
            )
            : showModal === "viewInvModal" ?
            (
                <InvoiceModal
                    show={showModal === "viewInvModal" ? true : false} 
                    onHide={() => setShowModal("")} 
                    data={showModal === "viewInvModal" ? invData : null} 
                />
            )
            :""
        }
        

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