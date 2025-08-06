import React, { useState, useEffect, useRef } from 'react';
import { Controller, get, useController, useForm } from 'react-hook-form';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';
import { CustomSelect } from '../elements/CustomSelect';
import NumberFormat from '../elements/Masking/NumberFormat';
import DropzoneFile from '../elements/DropzoneFile';
import SalesDetailModal from '../elements/Modal/salesDetailModal';
import SalesEditModal from '../elements/Modal/SalesEditModal';
import ConfirmModal from '../elements/Modal/ConfirmModal';
import InputWLabel from '../elements/Input/InputWLabel';
import InputWSelect from '../elements/Input/InputWSelect';
import FetchApi from '../assets/js/fetchApi';
import { Accordion, Col, Collapse, Dropdown, Form, Row, 
    // Toast, ToastContainer 
} from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown as PrimeDropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import dataStatic from '../assets/js/dataStatic.js';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

import AutoComplete from '../elements/AutoComplete';
import QtyButton from '../elements/QtyButton';
import DiscountModal from '../elements/Modal/DiscModal';
import CreatePayment from '../elements/Modal/CreatePaymentModal';
import ConvertDate from '../assets/js/ConvertDate.js';
import CustomToggle from '../elements/Custom/CustomToggle.jsx';
import EmptyState from "../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import ReturnOrderModal from '../elements/Modal/ReturnOrderModal.jsx';
import ModalTextContent from '../elements/Modal/ModalTextContent.jsx';
import EditReturnOrderModal from '../elements/Modal/EditReturnOrderModal.jsx';
import { DataView } from 'primereact/dataview';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

export default function Sales({handleSidebar, showSidebar}){
    const toast = useRef(null);
    const toastUpload = useRef(null);
    const mobileSearchInput = useRef(null);
    const [progress, setProgress] = useState(0);
    const [mobileSearchMode, setMobileSearchMode] = useState(false);
    const [mobileFilterValue, setMobileFilterValue] = useState("");
    const [ isLoading, setLoading ] = useState(true);
    const [ isClicked, setClicked ] = useState(false);
    const [ isClickedProd, setClickedProd ] = useState(false);
    const [ isClose, setClose ] = useState(false);
    const [ salesData, setSalesData ] = useState();
    const [ openTab, setOpenTab ] = useState('salesListTab');
    const [ salesListObj, setSalesList ] = useState(null);
    const [ showModal, setShowModal ] = useState("");
    const [ modalMsg, setModalMsg ] = useState("");
    const [ custTypeFilter, setCustTypeFilter ] = useState(null);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ filterCourier, setFilteredCourier ] = useState([]);
    const [ filterProd, setFilteredProd ] = useState([]);
    const [ salesDataArr, setSalesDataArr ] = useState([]);
    const [ custData, setCustData ] = useState(null);
    const [ courierList, setCourierList ] = useState(null);
    const [ openDropdown, setopenDropdown] = useState(false);
    const [ custTypeData, setCustType ] = useState(null);
    const [ statusCode, setStatusCode ] = useState(null);
    const [ allProdData, setAllProd ] = useState(null);
    const [ chooseCust, setCust] = useState("");
    const [ chooseCourier, setCourier] = useState("");
    const [ chooseProd, setProd] = useState(null);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ openPopupProd, setOpenPopupProd ] = useState(false);
    const [ openPopupCourier, setOpenPopupCourier ] = useState(false);
    const [ confirmVal, setConfirm ] = useState(false);
    const [ dupeSalesData, setDupeSalesData ] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [ salesComplete, setSalesComplete ] = useState(null);
    const [ salesCanceled, setSalesCanceled ] = useState(null);
    const [ salesMain, setSalesMain ] = useState(null);
    const [ roData, setROData ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ cantCanceled, setCantCanceled ] = useState(false);
    const [ mergeOrderInv, setMergeOrderInv ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ qtyVal, setQtyVal ] = useState(0);
    const [ salesItems, setSalesItems] = useState([]);

    // const [ salesPaid, setSalesPaid] = useState({payType: 0, val: 0});
    const [ salesPaid, setSalesPaid] = useState({payType: 0, val: 0});
    const [ salesDisc, setSalesDisc] = useState(null);
    const [ discVal, setDiscVal] = useState(0);
    const [ totalDiscProd, setTotalDiscProd] = useState(0);
    const [ currOrderCredit, setCurrOrderCredit] = useState(0);
    const [ paidData, setPaidData] = useState(null);
    const [ salesEndNote, setSalesEndNote] = useState(null);
    const [ existInv, setExistInv] = useState(false);
    const [ currentOrder, setCurrentOrder] = useState(null);
    const [ addOrderItem, setAddOrderItem] = useState(false);
    const [ addInvID, setAddInvID] = useState(false);
    const [ resetInputWSelect, setResetInputWSelect] = useState(false);
    const [ delivSwitch, setDelivSwitch] = useState(false);
    const [ selectedSales, setSelectedSales ] = useState(null);
    const [ salesFilters, setSalesFilters ] = useState(null);
    const [ globalFilterValue, setGlobalFilterValue ] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const [orderStatus] = useState(dataStatic.orderStatus);

    const refToThis = useRef(null);
    const refToCourier = useRef(null);
    const refToProd = useRef(null);
    
    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        setValue,
        getValues,
        setFocus,
        setError,
        trigger,
        clearErrors,
        getFieldState,
        formState: { errors},
    } = useForm({
        defaultValues:{
            customer_id: '',
            order_date: new Date().toString(),
            ship_date: new Date().toString(),
            order_type: ''
        }
    });

    const fetchAllSales = async () => {
        await axiosPrivate.get("/sales")
        .then(response => {
            setSalesData(response.data);
            setDupeSalesData(response.data);
            setTotalRecords(response.data.length);

            // filtering
            let tmp = [...response.data];
            const mainFilter = ["pending", "confirmed", "in-delivery", "delivered"];
            let getMain = tmp.filter(e => mainFilter.includes(e.order_status));
            let getComplete = tmp.filter(e => e.order_status === "completed");
            let getCanceled = tmp.filter(e => e.order_status === "canceled");

            // sorting maindata to descending by createdAt
            let getMainSorted;
            if(getMain.length > 1){
                getMainSorted = getMain.sort((a, b) => {
                    let invDateA = new Date(a.createdAt);
                    let invDateB = new Date(b.createdAt);
                    // Compare 
                    if (invDateA > invDateB) return -1;
                    if (invDateA < invDateB) return 1;
                    return 0;
                })
            } else {
                getMainSorted = getMain;
            }

            setSalesMain(getMainSorted);
            setSalesComplete(getComplete);
            setSalesCanceled(getCanceled);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get sales data",
                life: 3000,
            });
        }
        )
    }

    const fetchAllRO = async() => {
        await axiosPrivate.get("/ro")
        .then(resp => {
            console.log(resp.data)
            setROData(resp.data);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get return order data",
                life: 3000,
            });
        })
    }

    const fetchAllCust = async () => {
        await axiosPrivate.get("/customers")
            .then(response => {
                setCustData(response.data);
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
    
    const fetchAllCourier = async () => {
        await axiosPrivate.get("/user/courier")
            .then(response => {
                console.log(response)
                setCourierList(response.data);
            })
            .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Error when get user:courier data",
                    life: 3000,
                });
            }
        )
    };

    // const fetchCustType = () => {
    //     FetchApi.fetchCustType()
    //         .then(data => {
    //             setCustType(data);
    //         })
    //         .catch(error => {
    //             setToastContent({variant:"danger", msg: "Error when get customer type data!"});
    //             setShowToast(true);
    //         }
    //     )
    // };

    const fetchStatus = () => {
        FetchApi.fetchStatus()
            .then(data => {
                setStatusCode(data);
            })
            .catch(error => {
                setToastContent({variant:"danger", msg: "Error when get status data!"});
                setShowToast(true);
            }
        )
    };

    const fetchAllProd = async () => {
        await axiosPrivate.get("/products")
          .then(response => {
                let dupe = [...response.data];
                response.data.map((e, idx) => {
                    dupe[idx].fullProdName = e.product_name + " " + e.variant;
                })
                setAllProd(response.data);
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Error when get product data",
                    life: 3000,
                });
          })
    }

    const fetchInsertreceipt = async (body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/receipt/write", bodyData)
          .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New receipt is created",
                    life: 3500,
                });
                setTimeout(() => {
                    window.location.reload();
                },1700)
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to create new receipt",
                    life: 3500,
                });
          })
    };

    const fetchInsertPayment = async (body, completed) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/payment/write", bodyData)
          .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New payment is created",
                    life: 3000,
                });
                
                if(completed){
                    let receiptModel = {
                        customer_id: resp.data.customer_id,
                        invoice_id: resp.data.invoice_id,
                        total_payment: paidData.amountOrigin,
                        change: paidData.change,
                        receipt_date: new Date()
                    }
                    fetchInsertreceipt(receiptModel);
                } else {
                    setTimeout(() => {
                        window.location.reload();
                    },1700)
                }
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to create new payment data",
                    life: 3000,
                });
          })
    };

    const fetchUpdateInv = async (invoiceID, body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.put("/inv", bodyData, {
            params: {
                id: invoiceID
            }
        })
        .then(resp => {
            let salesBody = JSON.stringify({invoice_id: invoiceID});
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully update invoice",
                life: 3000,
            });

            axiosPrivate.put("/sales", salesBody, {
                params: {
                    id: currentOrder.order_id
                }
            })
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Successfully update sales",
                    life: 3000,
                });

                setTimeout(() => {
                    window.location.reload();
                },1700)
            })
            .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to update sales",
                    life: 3000,
                });
            })
      })
      .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to update invoice",
                life: 3000,
            });
      })
    }

    const fetchUpdateSales = (salesID, body) => {
        let bodyData = JSON.stringify(body);
        FetchApi.fetchUpdateSales(salesID, bodyData)
        .then(data => {
            setToastContent({variant:"success", msg: "Successfully update sales"});
            setShowToast(true);
        })
        .catch(error => {
            setToastContent({variant:"danger", msg: "Failed to update sales!"});
            setShowToast(true);
      })
    }

    const fetchInsertInv = async (body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/inv/write", bodyData)
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "New invoice is created",
                life: 3500,
            });

            // update order table => add invoice id
            let invoiceID = JSON.stringify({invoice_id: resp.data.invoice_id});
            axiosPrivate.patch(`/sales/${currentOrder.order_id}`, invoiceID)
                .then(updateResp => {
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Successfully update sales",
                        life: 3500,
                    });

                    // payment manage
                    if(resp.data.is_paid){
                        if(paidData){
                            let paymentModel = {
                                customer_id: resp.data.customer_id,
                                invoice_id: resp.data.invoice_id,
                                payment_date: paidData.payment_date,
                                amount_paid: paidData.amountOrigin,
                                payment_method: paidData.payment_method,
                                payment_ref: paidData.payment_ref,
                                note: paidData.note 
                            };
                            fetchInsertPayment(paymentModel, true);
                        } else {
                            toast.current.show({
                                severity: "error",
                                summary: "Error",
                                detail: "Payment error not found",
                                life: 3500,
                            });
                        }
                    } else {
                        if(resp.data.payment_type == "partial"){
                            let paymentModel = {
                                customer_id: resp.data.customer_id,
                                invoice_id: resp.data.invoice_id,
                                payment_date: paidData.payment_date,
                                amount_paid: paidData.amountOrigin,
                                payment_method: paidData.payment_method,
                                payment_ref: paidData.payment_ref,
                                note: paidData.note 
                            };
                            fetchInsertPayment(paymentModel, false);
                        } 
                        else {
                            setTimeout(() => {
                                window.location.reload();
                            },1700)
                        }
                    }
                })
                .catch(error => {
                    console.log(error)
                    toast.current.show({
                        severity: "error",
                        summary: "Failed",
                        detail: "Failed to update sales",
                        life: 3500,
                    });
            })
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add new invoice",
                life: 3000,
            });
        })
    };

    const fetchMergeOrderInv =  async() => {
        await axiosPrivate.patch(`/inv/status?id=${existInv.invId}`, existInv.invData)
        .then(resp1 => {
            if(resp1.data.length > 0 && resp1.data[0] > 0){
                // update order table => add invoice id
                let invoiceID = JSON.stringify({invoice_id: existInv.invId});
                axiosPrivate.patch(`/sales/${currentOrder.order_id}`, invoiceID)
                .then(resp2 => {
                    if(resp2.data.sales){
                        toast.current.show({
                            severity: "success",
                            summary: "Success",
                            detail: "Berhasil menambahkan order ke invoice",
                            life: 3000,
                        });
                        setShowModal("");
                        fetchAllSales();
                    }
                })
                .catch(error => {
                    toast.current.show({
                        severity: "error",
                        summary: "Fatal Error",
                        detail: "Gagal menambahkan order ke invoice",
                        life: 3000,
                    });
                })
            }
        })
        .catch(err1 => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Gagal menambahkan order ke invoice",
                life: 3000,
            });
        })
    }

    const fetchDeleteSales = async (salesID) => {
        await axiosPrivate.delete(`/sales?id=${salesID}`)
        .then((resp) => {
            // idk what 2 do
            console.log("success delete")
        })
        .catch(err => {
            throw new Error(err);
        })
    }

    const fetchInsertMultipleOrderItem =  async (order_id, body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/order-item/writes", bodyData)
          .then(resp => {
                reset();
                setResetInputWSelect(true);
                setValue('order_type', '');
                setSalesItems([]);

                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Successfully insert order item",
                    life: 3500,
                });
                // run to invoice
                setAddOrderItem(true);
        })
        .catch(error => {
            setAddOrderItem(false);

            // delete sales which already created but failed to create order item
            fetchDeleteSales(order_id);
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add order items",
                life: 3500,
            });
        })
    };

    const fetchCreateDelivery = async (delivBody) => {
        await axiosPrivate.post("/delivery", delivBody)
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Delivery created",
                life: 3500,
            });

        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to create delivery",
                life: 3500,
            });
        })
    }

    

    const fetchInsertSales = async (body, deliveryModel) => {
        let bodyData = JSON.stringify(body);
        let deliveryBody;
        await axiosPrivate.post("/sales/write", bodyData)
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully add new data",
                life: 3500,
            });

            // check if customer has order credit with order id null
            axiosPrivate.get(`/orders-credit/available/${resp.data.customer_id}`)
            .then(resp1 => {
                console.log(resp1)
                if(resp1.data.length > 0){
                    // update order credits => order id to current order id
                    const order_credit_id = resp1.data[0].order_credit_id;
                    const order_id = JSON.stringify({order_id: resp.data.order_id});
                    axiosPrivate.patch(`/order-credit/${order_credit_id}`, order_id)
                    .then(resp2 => {
                        toast.current.show({
                            severity: "success",
                            summary: "Success",
                            detail: "Successfully update order credit",
                            life: 3500,
                        });
                        // setCurrOrderCredit(resp1.data[0].return_order.refund_total);
                    })
                    .catch(err2 => {
                        toast.current.show({
                            severity: "error",
                            summary: "Failed",
                            detail: `Failed to update order credit`,
                            life: 3000,
                        });
                    })
                }

            })
            .catch(err1 => {
                console.error('something error in order credit');
            })

            salesItems.map(e => {
                e.order_id = resp.data.order_id;
                e.discount_prod_rec = e.discount;
            });

            if(resp.data.order_type == 'delivery' && deliveryModel.courier_id !== "" || deliveryModel.courier_id){
                let delivery = {
                    order_id: resp.data.order_id,
                    courier_id: deliveryModel.courier_id,
                    courier_name: deliveryModel.courier_name,
                    delivery_address: deliveryModel.delivery_address,
                    ship_date: deliveryModel.ship_date
                }
                deliveryBody = JSON.stringify(delivery);
            } 

            setCurrentOrder(resp.data);
            updateTotalSalesCust(resp.data);
            return fetchInsertMultipleOrderItem(resp.data.order_id, salesItems);            
        })
        .then(orderItemResp => {
            if(deliveryBody){
                fetchCreateDelivery(deliveryBody);
            }

        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: `Failed to add new data: ${error}`,
                life: 3000,
            });
        })
    };

    const fetchInvStatusCust = (ispaid, custid, payment_type) => {
        FetchApi.fetchInvByStatusCustID(ispaid, custid, payment_type)
        .then(data => {
              if(data.length > 0) {
                setExistInv(data[data.length-1]);
            } else {
                setExistInv(false);
              }
        })
        .catch(error => {
              setToastContent({variant:"danger", msg: "Failed to add new sales!"});
              setShowToast(true);
        })
    };

    const add7days = () => {
        // const invDate = new Date(getValues('invoice_date'));
        const invDate = new Date();
        invDate.setDate(invDate.getDate() + 7);
        // setValue('invoice_due', new Date(invDate));
        return new Date(invDate);
    }

    const updateTotalSalesCust = async(currentOrderData) => {
        await axiosPrivate.get("/customers/member", {params: { id: currentOrderData.customer_id }})
        .then((resp1) => {
            console.log(resp1.data)
            if(resp1.data){
                const updatedTotalOrder = Number(resp1.data.total_sales)+Number(currentOrderData.grandtotal);
                const updatedTotalDebt = Number(resp1.data.total_debt)+Number(currentOrderData.grandtotal);
                axiosPrivate.patch(`/customer/sales/${resp1.data.customer_id}/${updatedTotalOrder}`)
                .then(resp2 => {
                    if(currentOrderData.payment_type == "unpaid"){
                        axiosPrivate.patch(`/customer/debt/${resp1.data.customer_id}/${updatedTotalDebt}`)
                        .then(resp3 => {
                            toast.current.show({
                                severity: "success",
                                summary: "Sukses",
                                detail: `Data pelanggan diperbarui!`,
                                life: 1700,
                            });
                        })
                        .catch(err3 => {
                            console.error("Failed to update total debt");
                        })
                    }

                })
                .catch(err2 => {
                    console.error("Failed to update total sales");
                })
            }
        })
        .catch(err1 => {
            if(err1.response.status === 404){
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: `Update detail customer failed, because customer id is not found!`,
                    life: 3000,
                });
            }
        })
    }

    const runAddInvoice = () => {
        let data = {...currentOrder};
        
        let modelInv = {
            customer_id: data.customer_id,
            order_id: JSON.stringify([data.order_id]),
            invoice_date: new Date(),
            invoice_due: add7days(),
            subtotal: data.subtotal + Number(currOrderCredit),
            amount_due: data.grandtotal + Number(currOrderCredit),
            total_discount: discVal,
            is_paid: true,
            remaining_payment: 0,
            payment_type: data.payment_type,
            status: 'active'
        };
        if(data.payment_type == "paid"){
            fetchInsertInv(modelInv);
        } else if(data.payment_type == "partial"){
            let newModelInv = {
                ...modelInv,
                is_paid: false,
                remaining_payment: (data.grandtotal + Number(currOrderCredit)) - paidData.amountOrigin,
            }
            fetchInsertInv(newModelInv);
        } else if(data.payment_type == "unpaid") {
            // check if there is an invoice with same customer ID and payment type and is_paid false
            axiosPrivate.get("/inv/check", { params: { custid:  data.customer_id,  ispaid: false, type: "unpaid"} })
            .then(resp => {
                if(resp.data && resp.data.length > 0){
                    let orderId = JSON.parse(resp.data[0].order_id);
                    let newOrderId = [...orderId, data.order_id];
                    let modelInv = {
                        order_id: JSON.stringify(newOrderId),
                        subtotal: Number(resp.data[0].subtotal) + Number(data.subtotal),
                        amount_due: Number(resp.data[0].amount_due) + Number(data.grandtotal),
                        total_discount: Number(resp.data[0].total_discount) + Number(discVal),
                        remaining_payment: Number(resp.data[0].remaining_payment) + Number(data.grandtotal),
                    };
                    // console.log(resp.data)
                    setExistInv({invId: resp.data[0].invoice_id, invData: modelInv});
                    setSalesList({endpoint: 'inv', action: 'warning', items: {...resp.data[0]}});
                    setShowModal("existInvOrderModal");
                } else {
                    // get all sales to update front
                    reset();
                    fetchAllSales();
                }
            })  
            .catch(err => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: `Failed to check invoice`,
                    life: 3000,
                });
            })
            
            
        }
    }

    useEffect(() => {
        // make sure order item successfully insert to db
        if(addOrderItem){
            runAddInvoice();
        }
    },[addOrderItem])

    useEffect(() => {
        // coming from payment type unpaid with existed invoice and new order want to merge
        if(mergeOrderInv){
            fetchMergeOrderInv();
        }
    },[mergeOrderInv])

   
    const handleClick = (e) => {
        switch(e.target.id) {
            case "salesListTab":
                setOpenTab("salesListTab");
            break;
            case "addSalesTab":
                setOpenTab("addSalesTab");
            break;
            case "completeTab":
                setOpenTab("completeTab");
            break;
            case "returnTab":
                setOpenTab("returnTab");
            break;
            case "canceledTab":
                setOpenTab("canceledTab");
            break;
        }
    };

    const returnSelectVal = (val) => {
    }

    const handleModalWData = (e, dataToSend, salesDataProd) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "salesDetailModal":
                data = {
                    origin: dataToSend, 
                    // items: salesDataProd != null ? JSON.parse(salesDataProd) : salesDataProd
                }
                setSalesList(dataToSend);
                setShowModal("salesDetailModal");
                break;
            case "salesEditModal":
                    // items: salesDataProd != null ? JSON.parse(salesDataProd) : salesDataProd
                setSalesList(dataToSend);
                setShowModal("salesEditModal");
                break;
            case "cancelSalesModal":
               
                setSalesList(dataToSend);
                // console.log(data)
                setShowModal("cancelSalesModal");
                break;
            case "custTypeModal":
                setShowModal("custTypeModal");
                break;
            case "roEditModal":
                setShowModal("roEditModal");
                setSalesList(dataToSend);
                break;
            case "roCancelModal":
                setShowModal("roCancelModal");
                setSalesList(dataToSend);
                break;
        }
    }

    const handleModal = (e) => {
        switch (e.currentTarget.ariaLabel) {
            case 'addDiscount':
                setShowModal("addDiscount");
                break;
            case 'createPayment':
                setShowModal("createPayment");
                break;
            case 'returnOrderModal':
                setShowModal("returnOrderModal");
                break;
        }
    }

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(refToThis.current 
                    && !ref.current.contains(evt.target) 
                    && evt.target.className !== "res-item" 
                    && evt.target.className !== "popup-element") {
                    setOpenPopup(false);
                    setOpenPopupProd(false);
                    setOpenPopupCourier(false);
                } 
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        },[ref])
        
    };
    handleClickSelect(refToThis);
    handleClickSelect(refToProd);
    handleClickSelect(refToCourier);

    const handleAutoComplete = (custName) => {
        if(custData && custName !== ""){
            let filteredCust = custData.filter(item => item.name.includes(custName.toLowerCase()));
            if(filteredCust.length === 0){
                setOpenPopup(false);
                setFilteredCust(filteredCust);
            } else {
                setOpenPopup(true);
                setFilteredCust(filteredCust);
            }
        } 
        else if(custName || custName === ""){
            setOpenPopup(true);
            setFilteredCust(custData);
        } 
        else {
            setOpenPopup(false);
            setFilteredCust("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    };
    
    const handleAutoCompleteCourier = (courierName) => {
        if(courierList && courierName !== ""){
            let filteredCourier = courierList.filter(item => item.name.includes(courierName.toLowerCase()));
            if(filteredCourier.length === 0){
                setOpenPopupCourier(false);
                setFilteredCourier(filteredCourier);
            } else {
                setOpenPopupCourier(true);
                setFilteredCourier(filteredCourier);
            }
        } 
        else if(courierName || courierName === ""){
            setOpenPopupCourier(true);
            setFilteredCourier(courierList);
        } 
        else {
            setOpenPopupCourier(false);
            setFilteredCourier("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    }
    
    const handleAutoCompleteProd = (product) => {
        if(allProdData && product !== ""){
            let filteredProd = allProdData.filter(item => item.fullProdName.includes(product.toLowerCase()));
            if(filteredProd.length === 0){
                setOpenPopupProd(false);
                setFilteredProd(filterProd);
                setError("salesProduct", { type: 'required', message: "Product name error!" });
            } else {
                setOpenPopupProd(true);
                setFilteredProd(filteredProd);
                clearErrors("salesProduct");
            }
        }
         else if(product || product === ""){
            setOpenPopupProd(true);
            setFilteredProd(allProdData);
        } else {
            setOpenPopupProd(false);
            setFilteredProd("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    }

    const handleChooseCust = (e) => {
        setCust(e);
        setValue('customer_id', e.customer_id);
        setValue('name', e.name);
        setOpenPopup(false);
    }
    
    const handleChooseCourier = (e) => {
        setCourier(e);
        setValue('courier_id', e.id);
        setValue('courier_name', e.user_name);
        setOpenPopupCourier(false);
    }
    
    const handleChooseProd = (e) => {
        setProd(e);
        setValue('salesProduct', e.variant !== "" ? e.product_name + " " + e.variant : e.product_name);
        setValue('product_id', e.product_id);
        setOpenPopupProd(false);
    }

    const addToSalesData = () => {
        
        if(qtyVal === 0 && !chooseProd){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Tambah produk dan kuantitas terlebih dahulu!",
                life: 3000,
            });
        } else if(chooseProd && qtyVal == 0){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Kuantitas tidak boleh 0",
                life: 3000,
            });
        } else if(!chooseProd && qtyVal !== 0){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Produk tidak boleh kosong!",
                life: 3000,
            });
        } else {
            let tmpArr = [];
            let prodObjDupe = {...chooseProd};
            prodObjDupe.quantity = qtyVal;
            if(salesItems.length === 0){
                tmpArr.push(prodObjDupe);
                setSalesItems(tmpArr);
            } else {
                tmpArr = [...salesItems];
                let findDuplicateIdx = salesItems.findIndex((e =>  e.product_id == prodObjDupe.product_id))
                if(findDuplicateIdx >= 0){
                    tmpArr[findDuplicateIdx].quantity = tmpArr[findDuplicateIdx].quantity + prodObjDupe.quantity;
                } else {
                    tmpArr.push(prodObjDupe);
                }
                setSalesItems(tmpArr);
            }
            // setPaidData(null);
            setProd(null);
            setValue('salesProduct', "");
            handleUpdateEndNote();
        } 
    }

    const handleFilterCust = () => {
        handleAutoComplete(getValues('name'));
        setCust(null);
    }    
    const handleFilterCourier = () => {
        handleAutoCompleteCourier(getValues('courier_name'));
        setCourier(null);
    }    

    const handleSearchProd = () => {
        handleAutoCompleteProd(getValues('salesProduct'));
        setProd(null);
    }

    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
        }
    }
    const handleKeyDownCourier = (e) => {
        if(e){
            setCourier(null);
        }
    }
    
    const keyDownSearchProd = (e) => {
        if(e){
            setProd(null);
        }
    }

    useEffect(() => {
        if(!chooseCust){
            setValue('customer_id', '');
        } else {
            clearErrors("name");
        }
    },[chooseCust]);
    
    useEffect(() => {
        if(!chooseCourier){
            setValue('courier_id', '');
        } else {
            clearErrors("courier_name");
        }
    },[chooseCourier]);
    
    useEffect(() => {
        if(!chooseProd){
            setValue('product_id', '');
        } else {
            clearErrors("salesProduct");
        }
    },[chooseProd]);

    const handleEdit = (val, idx) => {
        let duplicate = [...salesItems];
        duplicate[idx].quantity = val;
        setSalesItems(duplicate);
        
    }

    const handleUpdateEndNote = () => {
        if(salesItems && salesItems.length > 0){
            let totalQty = 0;
            let subtotal = 0;
            let discount = 0;
            let allDiscProd = 0;
            
            salesItems.forEach(e => {
                totalQty += e.quantity;
                subtotal += (e.quantity*Number(e.sell_price)) - (e.quantity*Number(e.discount));
                allDiscProd += (e.quantity*Number(e.discount));
                e.discProd = e.quantity*Number(e.discount);
            });
            
            discount = salesDisc ? salesDisc.discType === "percent" ? 
            subtotal*salesDisc.value/100 
            : salesDisc.discType === "nominal" ? salesDisc.value
            : 0 
            : 0;

            setDiscVal(discount);
            setTotalDiscProd(allDiscProd);

            if(paidData && paidData.payment_type == "paid"){
                if(paidData.amountOrigin < (subtotal - discount)){
                    setPaidData(null);
                }
            } else if(paidData && paidData.payment_type == "partial"){
                if(paidData.amountOrigin >= (subtotal - discount)){
                    setPaidData(null);
                }
            }
            
            let endNote = {
                ...salesEndNote,
                totalQty: totalQty,
                subtotal: subtotal,
                order_discount: discount,
                grandtotal: (subtotal - discount),
                remaining_payment: 
                    paidData ? 
                    paidData.payment_type == "paid" ? 0 
                    : paidData.payment_type == "unpaid" ? (subtotal - discount)
                    : paidData.payment_type == "partial" ? (subtotal - discount) - paidData.amountOrigin
                    : (subtotal - discount) : (subtotal - discount)
            }

            setSalesEndNote(endNote);
        } else {
            setPaidData(null);
            setSalesDisc(null);
            setSalesEndNote(null);
        }
    }

    const delSalesItems = (idx) => {
        salesItems.splice(idx, 1);
        handleUpdateEndNote();
    }

    useEffect(() => {
        if(salesDisc || paidData ){
            if(salesItems.length > 0) {
                handleUpdateEndNote();
            } else {
                setPaidData(null);
                setSalesDisc(null);
            }
        }
    },[salesDisc, paidData]);

    const handleCloseModal = () => {
        setShowModal("");
    }
    
    const onSubmitSales = (formData, e) => {
        if(!salesItems || salesItems.length < 1) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please add product first",
                life: 3500,
            });
        } else {
            let objStr;
            let grandQty = 0;
            let subtotal = 0;
           
            if(paidData){
                objStr  = [...salesItems];

                objStr.forEach((e) => {
                    subtotal += Number(e.sell_price)*e.quantity
                    grandQty += Number(e.quantity)
                });
                
                let forming = {
                    customer_id: formData.customer_id,
                    order_date: formData.order_date,
                    order_type: formData.order_type,
                    note: formData.note,
                    source: 'main',
                    subtotal: salesEndNote ? salesEndNote.subtotal : null,
                    grandtotal: salesEndNote ? salesEndNote.grandtotal : null,
                    order_discount: discVal,
                }

                let deliveryModel = {
                    courier_id: formData.courier_id,
                    courier_name: formData.courier_name,
                    ship_date: formData.ship_date,
                    delivery_address: formData.delivery_address,
                }


                if(e.order_type == "walk-in"){
                    forming.shipped_date = formData.order_date;
                }

                if(paidData.payment_type == "paid"){
                    let modified = {
                        ...forming,
                        order_status: "completed",
                        payment_type: paidData.payment_type,
                        is_complete: true, 
                    }
                    fetchInsertSales(modified, deliveryModel);

                } else if(paidData.payment_type == "partial") {
                    let modified = {
                        ...forming,
                        order_status: "pending",
                        payment_type: paidData.payment_type,
                        is_complete: false, 
                    }
                    fetchInsertSales(modified, deliveryModel);
                    // fetchInvStatusCust(false, e.customer_id, paidData.payment_type);
                } else if(paidData.payment_type == "unpaid"){
                    if(Number(chooseCust.total_debt) > Number(chooseCust.debt_limit) && !confirmVal){
                        let send = {endpoint: "sales", action: 'warning', data:forming};
                    
                        setSalesList(send);
                        setModalMsg(`Pelanggan ini sudah mencapai limit!`);
                        setShowModal('confirmationModal');
    
                    } else {
                        let modified = {
                            ...forming,
                            order_status: "pending",
                            payment_type: paidData.payment_type,
                            is_complete: false, 
                        }
                        fetchInsertSales(modified, deliveryModel);
                        // fetchInvStatusCust(false, e.customer_id, paidData.payment_type);
                    }
                } 
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Please set payment data",
                    life: 3500,
                });
            }
       }
    }

    useEffect(() => {
        if(confirmVal){
            handleSubmit(onSubmitSales, onError)();
            setShowModal("");
        }
    },[confirmVal])

    const onError = (errors, e) => {
        if(getValues('name') != "" && errors.customer_id){
            setError("name", { type: 'required', message: 'Choose customer name correctly!' });
        }
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "There is an error with required field",
            life: 3500,
        });
    } 

    // control select filter
    useEffect(() => {
        if(custTypeFilter && custTypeFilter !== null && custTypeFilter !== ""){
            const getMatch = salesData.filter(({ order_status }) => order_status === custTypeFilter);
            setDupeSalesData(getMatch);
        } else {
            setDupeSalesData(salesData);
        }
    },[custTypeFilter])

    useEffect(() => {
        fetchAllSales();
        fetchAllCourier();
        // fetchCustType();
        // fetchStatus();
        fetchAllCust();
        fetchAllProd();
        fetchAllRO();
    },[])

    useEffect(() => {
        if(salesData && allProdData && custData && courierList && roData){
            setLoading(false);
        } 
    },[salesData, allProdData, custData, courierList, roData]);

    const tableHeader = (e) => {
        return (
          <div className="flex justify-content-between" style={{ width: "100%" }}>
            <div className="flex gap-3 align-items-center" style={{ width: "60%" }}>
                <div className="input-group-right" style={{ width: "40%" }}>
                    <span className="input-group-icon input-icon-right">
                    <i className="zwicon-search"></i>
                    </span>
                    <input
                    type="text"
                    className="form-control input-w-icon-right"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-w-icon"
                    style={{ fontWeight: 500 }}
                    onClick={clearFilter}
                >
                    <i className="bx bx-filter-alt" style={{ fontSize: "24px" }}></i>
                    Clear filter
                </button>
                <InputWSelect
                    name="custTypeFilter"
                    selectLabel="Select order status"
                    options={[{id: 1, type: "pending"},{id: 2, type: "confirmed"},{id: 3, type: "in-delivery"},{id: 4, type: "delivered"}]}
                    optionKeys={["id", "type"]}
                    value={(selected) => setCustTypeFilter(selected.value)}
                    width={"220px"}
                />
            </div>
    
            <div
              className="wrapping-table-btn flex gap-3"
              style={{ width: "60%", height: "inherit" }}
            >
              {/* <button
                type="button"
                className="btn btn-light light"
                style={{ height: "100%" }}
              >
                <i className="bx bx-printer"></i>
              </button> */}
              <Dropdown drop={"down"}>
                <Dropdown.Toggle variant="primary" style={{ height: "100%" }}>
                  <i className="bx bx-download"></i> export
                </Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                  <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="viewInvModal"
                    onClick={(e) =>
                      handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                    }
                  >
                    <i className="bx bx-show"></i> PDF (.pdf)
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="editInvModal"
                    onClick={(e) => handleModal(e, inv.invoice_id)}
                  >
                    <i className="bx bxs-edit"></i> Microsoft Excel (.xlsx)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <button
                type="button"
                className=" btn btn-primary btn-w-icon"
                style={{ height: "100%" }}
              >
                <i className="bx bxs-file-plus"></i> import
              </button>
            </div>
          </div>
        );
    };
    const returnOrderHeader = () => {
        return (
          <div className="flex justify-content-between" style={{ width: "100%" }}>
            <div className="flex gap-3 align-items-center" style={{ width: "60%" }}>
                <div className="input-group-right" style={{ width: "40%" }}>
                    <span className="input-group-icon input-icon-right">
                    <i className="zwicon-search"></i>
                    </span>
                    <input
                    type="text"
                    className="form-control input-w-icon-right"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-w-icon"
                    style={{ fontWeight: 500 }}
                    onClick={clearFilter}
                >
                    <i className="bx bx-filter-alt" style={{ fontSize: "24px" }}></i>
                    Clear filter
                </button>
                {/* <InputWSelect
                    name="custTypeFilter"
                    selectLabel="Select order status"
                    options={[{id: 1, type: "pending"},{id: 2, type: "confirmed"},{id: 3, type: "in-delivery"},{id: 4, type: "delivered"}]}
                    optionKeys={["id", "type"]}
                    value={(selected) => setCustTypeFilter(selected.value)}
                    width={"220px"}
                /> */}
            </div>
    
            <div
              className="wrapping-table-btn flex gap-3"
              style={{ width: "60%", height: "inherit" }}
            >
              {/* <button
                type="button"
                className="btn btn-light light"
                style={{ height: "100%" }}
              >
                <i className="bx bx-printer"></i>
              </button> */}
              <Dropdown drop={"down"}>
                <Dropdown.Toggle variant="primary" style={{ height: "100%" }}>
                  <i className="bx bx-download"></i> export
                </Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                  <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="viewInvModal"
                    onClick={(e) =>
                      handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                    }
                  >
                    <i className="bx bx-show"></i> PDF (.pdf)
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="editInvModal"
                    onClick={(e) => handleModal(e, inv.invoice_id)}
                  >
                    <i className="bx bxs-edit"></i> Microsoft Excel (.xlsx)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <button
                type="button"
                className=" btn btn-primary btn-w-icon"
                style={{ height: "100%" }}
              >
                <i className="bx bxs-file-plus"></i> import
              </button>
              <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                    aria-label="returnOrderModal"
                    onClick={(e) =>
                        handleModal(e)
                    }
                >
                    <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                    tambah pengembalian
                </button>
              </div>
          </div>
        );
    };
    
    const tableHeader2 = () => {
        return (
          <div className="flex justify-content-between" style={{ width: "100%" }}>
            <div className="flex gap-3 align-items-center" style={{ width: "60%" }}>
                <div className="input-group-right" style={{ width: "40%" }}>
                    <span className="input-group-icon input-icon-right">
                    <i className="zwicon-search"></i>
                    </span>
                    <input
                    type="text"
                    className="form-control input-w-icon-right"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-w-icon"
                    style={{ fontWeight: 500 }}
                    onClick={clearFilter}
                >
                    <i className="bx bx-filter-alt" style={{ fontSize: "24px" }}></i>
                    Clear filter
                </button>
            </div>
    
            <div
              className="wrapping-table-btn flex gap-3"
              style={{ width: "60%", height: "inherit" }}
            >
              {/* <button
                type="button"
                className="btn btn-light light"
                style={{ height: "100%" }}
              >
                <i className="bx bx-printer"></i>
              </button> */}
              <Dropdown drop={"down"}>
                <Dropdown.Toggle variant="primary" style={{ height: "100%" }}>
                  <i className="bx bx-download"></i> export
                </Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                  <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="viewInvModal"
                    onClick={(e) =>
                      handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                    }
                  >
                    <i className="bx bx-show"></i> PDF (.pdf)
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="editInvModal"
                    onClick={(e) => handleModal(e, inv.invoice_id)}
                  >
                    <i className="bx bxs-edit"></i> Microsoft Excel (.xlsx)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <button
                type="button"
                className=" btn btn-primary btn-w-icon"
                style={{ height: "100%" }}
              >
                <i className="bx bxs-file-plus"></i> import
              </button>
            </div>
          </div>
        );
    };

    const clearFilter = () => {
        initFilters();
    };
    
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...salesFilters };

        _filters["global"].value = value;

        setSalesFilters(_filters);
        setGlobalFilterValue(value);
    };
    
    const initFilters = () => {
        setSalesFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            order_id: {
              operator: FilterOperator.AND,
              constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            order_date: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
            },
            'customer.name': {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
            },
            order_type: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
            },
            grandtotal: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            source: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            order_status: { 
                value: null, matchMode: FilterMatchMode.EQUALS 
            },
            payment_type: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
        });
        setGlobalFilterValue("");
    };

    const formatedGrandtotal = (rowData) => {
        return(
            <NumberFormat intlConfig={{
                value: rowData.grandtotal, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };

    const formatedRefundtotal = (rowData) => {
        return(
            <NumberFormat intlConfig={{
                value: rowData.refund_total, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };

     const viewReturnMethod = (rowData) => {
        return(
            <p className="view-note" aria-label="viewReturnMethod" onClick={(e) => { 
                let data = {
                    textContent: rowData.return_method, 
                    title: "Metode pengembalian"
                }
                setSalesList(data);
                setShowModal("viewReturnMethod");
            }}>Lihat metode pengembalian</p>
        )
    }

    const formatedOrderDate = (rowData) => {
        return <span>{ConvertDate.convertToFullDate(rowData.order_date, "/")}</span>;
    };
    
    const formatedReturnDate = (rowData) => {
        return <span>{ConvertDate.convertToFullDate(rowData.return_date, "/")}</span>;
    };

    const actionCell = (rowData, rowIndex) => {
        return (
            <Dropdown drop={rowIndex == salesData.length - 1 ? "up" : "down"}>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>

                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="handleBg"  as="button" aria-label="salesEditModal" 
                        onClick={(e) => handleModalWData(e, {endpoint: "sales", id: rowData.order_id, action: 'update', ...rowData})}
                    >
                        <i className='bx bxs-edit'></i> Ubah order
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="handleBg" as="button" aria-label="cancelSalesModal" onClick={(e) => handleModalWData(
                        e, 
                        {
                            endpoint: "sales", 
                            id: rowData.order_id, 
                            action: 'canceled',
                            items: {...rowData}
                        })}>
                        <i className='bx bx-trash'></i> Batalkan order
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    };
    
    const returnOrderActionCell = (rowData, rowIndex) => {
        console.log(rowData)
        return (
            <Dropdown drop={rowIndex == roData.length - 1 ? "up" : "down"}>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>

                <Dropdown.Menu align={"end"}>
                    {rowData.status?.toLowerCase() !== "dikonfirmasi" ? 
                        (
                            <>
                            <Dropdown.Item eventKey={rowIndex}  as="button" aria-label="roEditModal" 
                                onClick={(e) => handleModalWData(e, {id: rowData.return_order_id, ro: {...rowData}})}
                            >
                                <i className='bx bxs-edit'></i> Edit pengembalian
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={rowIndex} as="button" aria-label="roCancelModal" onClick={(e) => handleModalWData(
                            e, 
                            {
                                endpoint: "ro", 
                                id: rowData.return_order_id, 
                                action: 'delete',
                                items: {...rowData}
                            })}>
                            <i className='bx bx-trash'></i> Hapus
                            </Dropdown.Item>
                            </>
                        )
                        : (
                            <Dropdown.Item eventKey={rowIndex} as="button" aria-label="roCancelModal" onClick={(e) => 
                                handleModalWData(e, 
                                    {
                                        endpoint: "ro", 
                                        id: rowData.return_order_id, 
                                        action: 'delete',
                                        items: {...rowData}
                                    }
                                )}
                            >
                            <i className='bx bx-trash'></i> Hapus
                            </Dropdown.Item>
                        )
                    }
                    
                </Dropdown.Menu>
            </Dropdown>
        );
    };
    

    const statusCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.order_status == "completed" ? 'success'
                : rowData.order_status == "pending" ? "secondary" 
                : rowData.order_status == "in-delivery" ? "warning" 
                : rowData.order_status == "canceled" ? "danger" 
                : ""} light`}
            >
                {
                    rowData.order_status == "completed" ? 'completed'
                    : rowData.order_status == "pending" ? 'pending'
                    : rowData.order_status == "in-delivery" ? 'in-delivery'
                    : rowData.order_status == "canceled" ? 'canceled'
                    : ""
                }                                                                                
            </span>
        )
    };
    
    const returnStatusCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.status == "dikonfirmasi" ? 'success'
                : rowData.status == "tunda" ? "secondary"
                : rowData.status == "batal" ? "danger" 
                : ""} light`}
            >
                {
                    rowData.status == "dikonfirmasi" ? "dikonfirmasi"
                    : rowData.status == "tunda" ? "tunda"
                    : rowData.status == "batal" ? "batal"
                    : "???"
                }                                                                                
            </span>
        )
    };

    const paymentTypeCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.payment_type == "unpaid" ? 'danger'
                : rowData.payment_type == "paid"? "primary"
                : rowData.payment_type == "partial"? "warning"
                : ""} light`}
            >
                {rowData.payment_type }                                                                                
            </span>
        )
    };

    const selectedToDelete = () => {
        const getOnlyID = selectedSales.map(e => {
            return e.order_id
        });
        console.log(getOnlyID)
        set({
            endpoint: "sales",
            id: getOnlyID,
            action: "cancel",
        });
        setShowModal("confirmModal");
    };

    const statusItemTemplate = (option) => {
        return (
            <span className={`badge badge-${
                option == "completed" ? 'success'
                : option == "pending" ? "secondary" 
                : option == "in-delivery" ? "warning" 
                : option == "canceled" ? "danger" 
                : ""} light`}
            >
                {
                    option == "completed" ? 'completed'
                    : option == "pending" ? 'pending'
                    : option == "in-delivery" ? 'in-delivery'
                    : option == "canceled" ? 'canceled'
                    : ""
                }                                                                                
            </span>
        )
    }

    const statusRowFilter = (options) => {
        return (
            <PrimeDropdown 
              value={options.value} 
              options={orderStatus} 
              onChange={(e) => options.filterApplyCallback(e.value.toLowerCase())} 
              itemTemplate={statusItemTemplate} 
              placeholder="Select One" 
              className="p-column-filter" 
              showClear 
              style={{ width: '100%'}} 
            />
        )
    };
    

    const emptyStateHandler = () =>{
        return (
        <div style={{width: '100%', textAlign: 'center'}}>
            <img src={EmptyState} style={{width: '165px', height: '170px'}}  />
            <p style={{marginBottom: ".3rem"}}>No result found</p>
        </div>
        )
    };

    // list setting
    const itemTemplate = (rowData, index) => {
        return (
        <div className="col-12" key={rowData.id} style={{position:'relative'}}>
            <div className='flex flex-column xl:align-items-start gap-2'
            style={{
                backgroundColor: '#F8F9FD',
                padding: '1rem',
                boxShadow: '1px 1px 7px #9a9acc1a',
                borderRadius: '9px',
                position:'relative'
            }}
            aria-label="custDetailModal"
            onClick={(e) => handleModal(e, rowData)}
            >
            
            <div className="flex align-items-center gap-3" 
                style={{
                    textTransform: 'capitalize', 
                    paddingBottom: '.75rem',
                    borderBottom: '1px solid rgba(146, 146, 146, .2509803922)'
                }}
            >
                <span className="user-img" style={{marginRight: 0}}>
                <img
                    src={
                    rowData.img && rowData.img != ""
                        ? rowData.img
                        : "../src/assets/images/Avatar 2.jpg"
                    }
                    alt=""
                />
                </span>
                <div style={{width: '80%'}}>
                    <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600}}>{rowData.order_id}</p>
                    <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{ConvertDate.LocaleStringDate(rowData.order_date)}</p>
                    <div className='flex flex-row gap-2' style={{fontSize: 13, marginTop: '.5rem'}}>
                        <span className={`badge badge-${
                            rowData.order_type == "walk-in" ? 'primary'
                            : rowData.order_type == "delivery" ? "warning" 
                            : ""} light`}
                        >
                            {
                                rowData.order_type
                            }                                                                                
                        </span>
                        <span className={`badge badge-${
                            rowData.order_status == "completed" ? 'success'
                            : rowData.order_status == "pending" ? "secondary" 
                            : rowData.order_status == "in-delivery" ? "warning" 
                            : rowData.order_status == "canceled" ? "danger" 
                            : ""} light`}
                        >
                            {
                                rowData.order_status == "completed" ? 'completed'
                                : rowData.order_status == "pending" ? 'pending'
                                : rowData.order_status == "in-delivery" ? 'in-delivery'
                                : rowData.order_status == "canceled" ? 'canceled'
                                : ""
                            }                                                                                
                        </span>
                        
                    </div>
                </div>
            </div>
            <div className="flex flex-column gap-1" 
                style={{
                    textTransform: 'capitalize', 
                }}
            >
                {/* <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Pelanggan:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>{rowData.customer_id ? `${rowData.customer?.name} (${rowData.customer_id})` : `guest.name (non-member)`}</p>
                </div> */}
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total order:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>
                        <NumberFormat intlConfig={{
                            value: rowData.grandtotal, 
                            locale: "id-ID",
                            style: "currency", 
                            currency: "IDR",
                        }} 
                        />
                    </p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Tipe pembayaran:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>
                        <span className={`badge badge-${
                            rowData.payment_type == "unpaid" ? 'danger'
                            : rowData.payment_type == "paid"? "primary"
                            : rowData.payment_type == "partial"? "warning"
                            : ""} light`}
                        >
                            {rowData.payment_type }                                                                                
                        </span>
                    </p>
                </div>
            </div>
            </div>
            <Dropdown drop={index == custData.length - 1 ? "up" : "down"}  style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="1" as="button" 
                        aria-label="salesEditModal" 
                        onClick={(e) => handleModalWData(e, {endpoint: "sales", id: rowData.order_id, action: 'update', ...rowData})}
                    >
                        <i className='bx bxs-edit'></i> Ubah order
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="1" as="button" 
                        aria-label="cancelSalesModal" 
                        onClick={(e) => handleModalWData(
                            e, 
                            {
                                endpoint: "sales", 
                                id: rowData.order_id, 
                                action: 'canceled',
                                items: {...rowData}
                            }
                        )}
                    >
                        <i className='bx bx-trash'></i> Batalkan order
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
        );
    };
    
    const orderTemplate = (rowData, index) => {
        console.log(rowData)
        return (
        <div className="flex flex-row col-12" key={rowData.product_id} style={{position:'relative', backgroundColor:'#F8F9FD', padding: '.9rem', borderRadius:'7px'}}>
            <Swiper slidesPerView={'auto'} style={{width:'100%'}}>
                <SwiperSlide style={{width: '100%'}}>
                    <div className='flex flex-column xl:align-items-start gap-1 order-list-mobile'
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '1rem',
                            boxShadow: '1px 1px 7px #9a9acc1a',
                            borderRadius: '9px',
                            position:'relative',
                            width:'100%',
                            height:'100%',
                        }}
                        aria-label="custDetailModal"
                        onClick={(e) => handleModal(e, rowData)}
                    >
                    
                        <div className="flex align-items-center gap-3" 
                            style={{
                                textTransform: 'capitalize', 
                                // paddingBottom: '.75rem',
                                // borderBottom: '1px solid rgba(146, 146, 146, .2509803922)'
                            }}
                        >
                            <span className="user-img" style={{marginRight: 0}}>
                            <img
                                src={
                                rowData.img && rowData.img != ""
                                    ? rowData.img
                                    : "../src/assets/images/Avatar 2.jpg"
                                }
                                alt=""
                            />
                            </span>
                            <div className='flex flex-column' style={{width: '80%'}}>
                                <div className='mb-1'>
                                    <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600, maxWidth: '130px'}}>{`${rowData.product_name} ${rowData.variant}`}</p>
                                    <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086', maxWidth: '130px'}}>
                                        <NumberFormat intlConfig={{
                                                value: rowData.sell_price, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                        />
                                    </p>
                                    {/* <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{`Disc: ${rowData.discProd}`}</p> */}
                                </div>
                                <div className="order-qty-btn">
                                    <QtyButton 
                                        min={1} 
                                        max={999} 
                                        name={`qty-product`} 
                                        id="qtyItem" 
                                        value={rowData.quantity} 
                                        returnValue={(e) => {handleEdit(e,index);handleUpdateEndNote()}} 
                                        size={100} 
                                    />

                                </div>
                                
                                {/* <div className='flex flex-row gap-2' style={{fontSize: 13, marginTop: '.5rem'}}>
                                    <span className={`badge badge-${
                                        rowData.order_type == "walk-in" ? 'primary'
                                        : rowData.order_type == "delivery" ? "warning" 
                                        : ""} light`}
                                    >
                                        {
                                            rowData.order_type
                                        }                                                                                
                                    </span>
                                    <span className={`badge badge-${
                                        rowData.order_status == "completed" ? 'success'
                                        : rowData.order_status == "pending" ? "secondary" 
                                        : rowData.order_status == "in-delivery" ? "warning" 
                                        : rowData.order_status == "canceled" ? "danger" 
                                        : ""} light`}
                                    >
                                        {
                                            rowData.order_status == "completed" ? 'completed'
                                            : rowData.order_status == "pending" ? 'pending'
                                            : rowData.order_status == "in-delivery" ? 'in-delivery'
                                            : rowData.order_status == "canceled" ? 'canceled'
                                            : ""
                                        }                                                                                
                                    </span>
                                    
                                </div> */}
                            </div>

                        </div>
                        <div style={{position:'absolute',right:24, bottom: 60}}>
                            <div style={{textAlign:'center', marginBottom:'.3rem', fontSize:'16px', fontWeight: 600}}>
                                <NumberFormat intlConfig={{
                                        value: (rowData.sell_price*rowData.quantity) - (rowData.discProd), 
                                        locale: "id-ID",
                                        style: "currency", 
                                        currency: "IDR",
                                    }} 
                                />
                            </div>
                        
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide style={{width: '70px'}}>
                    <div className='mobile-swiper-content danger'>
                        <i className='bx bx-trash'></i>
                    </div>
                </SwiperSlide>
            </Swiper>
            
        </div>
        );
    };

    const mobileFilterFunc = (e) => {
        setMobileFilterValue(e.target.value);
        e.target.value == "" ? setMobileSearchMode(false):setMobileSearchMode(true)
    }

    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((sales, index) => {
            return itemTemplate(sales, index);
        });

        return (
        <>
        <div className="flex flex-column gap-2" style={{ width: "100%" }}>
            <div
            className="wrapping-table-btn flex gap-3 justify-content-end"
            style={{ width: "100%", height: "inherit" }}
            >
            <Dropdown drop={"down"}>
                <Dropdown.Toggle variant="primary" style={{ height: "100%" }}>
                <i className="bx bx-download"></i> export
                </Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="viewInvModal"
                    onClick={(e) =>
                        handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                    }
                >
                    <i className="bx bx-show"></i> PDF (.pdf)
                </Dropdown.Item>
                <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="editInvModal"
                    onClick={(e) => handleModal(e, inv.invoice_id)}
                >
                    <i className="bx bxs-edit"></i> Microsoft Excel (.xlsx)
                </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <button
                type="button"
                className=" btn btn-primary btn-w-icon"
                style={{ height: "100%" }}
            >
                <i className="bx bxs-file-plus"></i> import
            </button>
            </div>
            <div className="flex gap-3 align-items-center mb-4" style={{ width: "100%" }}>
            <div className="input-group-right" style={{ width: "100%" }}>
                {mobileSearchMode ?
                (
                <span className="input-group-icon input-icon-right" 
                    onClick={() => {
                        setMobileFilterValue('');
                        setMobileSearchMode(false);
                        mobileSearchInput.current.focus();
                    }}
                >
                    <i class='bx bx-x'></i>
                </span>
                ):(
                <span className="input-group-icon input-icon-right">
                    <i className="zwicon-search"></i>
                </span>
                )
                }
                <input
                    ref={mobileSearchInput}
                    type="text"
                    className="form-control input-w-icon-right"
                    value={mobileFilterValue}
                    onChange={mobileFilterFunc}
                    placeholder="Keyword Search"
                    // onKeyDown={() => setMobileSearchMode(true)}
                />
            </div>
            {/* <button
                type="button"
                className="btn btn-primary btn-w-icon"
                style={{ fontWeight: 500 }}
                onClick={clearFilter}
            >
                <i className="bx bx-filter-alt" style={{ fontSize: "24px" }}></i>
                Clear filter
            </button> */}
            {/* <div
                className="selected-row-stat"
                style={{
                height: "inherit",
                display:
                    selectedCusts && selectedCusts.length > 0 ? "block" : "none",
                }}
            >
                <p className="total-row-selected"></p>
                <button
                type="button"
                className=" btn btn-danger btn-w-icon"
                style={{ height: "100%" }}
                onClick={selectedToDelete}
                >
                <i className="bx bx-trash" style={{ fontSize: "24px" }}></i>Delete
                selected row
                </button>
            </div> */}
            </div>

            
        </div>
        <div className="grid gap-1">{list}</div>
        </>
        );
    };
    
    const orderListTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((order, index) => {
            return orderTemplate(order, index);
        });

        return (
            <div className="grid gap-1">{list}</div>
        );
    };

    useEffect(() => {
        initFilters();
      }, []);

      useEffect(() => {
        if(cantCanceled){
            let data = {
                id: salesListObj.id, 
                endpoint: 'content',
                action: 'info',
                items: salesListObj.items
            }
            setSalesList(data);
            setShowModal("");
            setShowModal("warningCancelModal");
        } else {
            fetchAllSales();
        }
      },[cantCanceled])

    if(isLoading){
        return;
    }

    return(
        <>
        {/* <Sidebar show={isClose} /> */}
            {/* <main className={`main-content ${showSidebar ? "active" : ""}`}>
                <Header onClick={() => handleSidebar((p) => !p)} /> */}
                <div className="container-fluid">
                    <div className="row mt-4">
                        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                            <div className="basic-tabs">
                                <div className="tabs">
                                    <div className={`tab-indicator ${openTab === "salesListTab" ? "active" : ""}`}  
                                        id='salesListTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">Penjualan</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "addSalesTab" ? "active" : ""}`} 
                                        id='addSalesTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">Tambah data </span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "completeTab" ? "active" : ""}`} 
                                        id='completeTab' 
                                        onClick={(e) => handleClick(e)}>
                                        <span className="tab-title">selesai</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "returnTab" ? "active" : ""}`} 
                                        id='returnTab' 
                                        onClick={(e) => handleClick(e)}>
                                        <span className="tab-title">pengembalian</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "canceledTab" ? "active" : ""}`} 
                                        id='canceledTab' 
                                        onClick={(e) => handleClick(e)}>
                                        <span className="tab-title">dibatalkan</span>
                                    </div>
                                    
                                </div>
                                <div className="tabs-content" style={openTab === "salesListTab" ? {display: "block"} : {display: "none"}}>
                                    <div className="card card-table add-on-shadow">
                                        {/* <div className="wrapping-table-btn">
                                            <span className="selected-row-stat">
                                                <p className="total-row-selected"></p>
                                                <button type="button" className=" btn btn-danger btn-w-icon">
                                                    <i className='bx bx-trash'></i>Delete selected row
                                                </button>
                                            </span>
                                            <button type="button" className="btn btn-light light"><i className='bx bx-filter-alt'></i>
                                            </button>
                                            <button type="button" className="btn btn-light light"><i className='bx bx-printer'></i>
                                            </button>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-primary btn-w-icon dropdown-toggle"
                                                    data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className='bx bx-download'></i> export
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><a className="dropdown-item" href="#">PDF (.pdf)</a></li>
                                                    <li><a className="dropdown-item" href="#">Microsoft Excel (.xlsx)</a></li>
                                                </ul>
                                            </div>
                                            <button type="button" className=" btn btn-primary btn-w-icon">
                                                <i className='bx bxs-file-plus'></i> import
                                            </button>
                                        </div>
                                        <p className="card-title">filter</p>
                                        <div className="filter-area">
                                            <div className="table-search">
                                                <div className="input-group-right">
                                                    <span className="input-group-icon input-icon-right"><i
                                                            className="zwicon-search"></i></span>
                                                    <input type="text" className="form-control input-w-icon-right"
                                                        placeholder="Search customer..." />
                                                </div>
                                            </div>
                                            <InputWSelect
                                                name="custTypeFilter"
                                                selectLabel="Select customer type"
                                                options={[{id: "member", value: "member"}, {id:"non-member", value:"non-member"}]}
                                                optionKeys={["id", "value"]}
                                                value={(selected) => setCustTypeFilter(selected)}
                                            />
                                        </div> */}
                                        <DataTable
                                            className="p-datatable"
                                            value={salesMain}
                                            size="normal"
                                            removableSort
                                            // stripedRows
                                            // selectionMode={"checkbox"}
                                            // selection={selectedSales}
                                            // onSelectionChange={(e) => {
                                            //     setSelectedSales(e.value);
                                            // }}
                                            dataKey="order_id"
                                            style={{marginTop: '1.5rem' }}
                                            tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                            filters={salesFilters}
                                            filterDisplay='menu'
                                            globalFilterFields={[
                                                "order_id",
                                                "order_date",
                                                "customer.name",
                                                "order_type",
                                                "grandtotal",
                                                "source",
                                                "order_status",
                                                "payment_type",
                                            ]}
                                            
                                            emptyMessage={emptyStateHandler}
                                            onFilter={(e) => setSalesFilters(e.filters)}
                                            header={tableHeader}
                                            paginator
                                            totalRecords={totalRecords}
                                            rows={50}
                                        >
                                            {/* <Column
                                                selectionMode="multiple"
                                                headerStyle={{ width: "3.5rem" }}
                                            ></Column> */}
                                            <Column
                                                field="order_id"
                                                header="Order ID"
                                                sortable
                                                bodyStyle={{ textTransform: "capitalize" }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_date"
                                                header="order date"
                                                body={formatedOrderDate}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="customer.name"
                                                header="customer"
                                                filter 
                                                filterPlaceholder="Search by customer name"
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={{ textTransform: "capitalize" }}
                                            ></Column>
                                            <Column
                                                field="order_type"
                                                header="Order type"
                                                filter 
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: '100%' }}
                                                filterPlaceholder={"order type"}
                                                bodyStyle={{ textTransform: 'capitalize' }}
                                                style={{ textTransform: 'uppercase' }}
                                            ></Column>
                                            <Column
                                                field="grandtotal"
                                                header="Total"
                                                body={formatedGrandtotal}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                sortable 
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="source"
                                                header="source"
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: 'inherit' }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="payment_type"
                                                header="type"
                                                body={paymentTypeCell}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_status"
                                                header="status"
                                                body={statusCell}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                showFilterMenu={false} 
                                                filterMenuStyle={{ width: '100%' }}
                                                filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="Action"
                                                body={(rowData, rowIndex) => actionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                        </DataTable>

                                        <DataView value={salesMain} listTemplate={listTemplate} style={{marginTop: '.5rem'}} />
                                        {/* <div className="table-responsive mt-4">
                                            <table className="table" id="advancedTablesWFixedHeader" data-table-search="true"
                                                data-table-sort="true" data-table-checkbox="true">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <input className="form-check-input checkbox-primary checkbox-all"
                                                                type="checkbox" />
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="product Name">
                                                            Order ID
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="category">
                                                            Order Date
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="variant">
                                                            Customer Name
                                                            <span className="sort-icon"></span>
                                                        </th> 
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Customer type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Order type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Total
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="source">
                                                            source
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Status
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" aria-label="total">
                                                            type
                                                        </th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="custListRender">
                                                    {dupeSalesData ? 
                                                        ( 
                                                            dupeSalesData.map((sales, idx) => {
                                                                console.log(sales)
                                                                return (
                                                                    <tr key={`sales-list- ${idx}`}>
                                                                        <th scope="row">
                                                                            <input className="form-check-input checkbox-primary checkbox-single" type="checkbox" value="" />
                                                                        </th>
                                                                        <td>{sales.order_id}</td>
                                                                        <td>{ConvertDate.convertToFullDate(sales.order_date, "/")}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.name}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.cust_type}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.order_type}</td>
                                                                        <td>
                                                                            <NumberFormat intlConfig={{
                                                                                value: sales.grandtotal, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                            }} />
                                                                        </td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.source}</td>
                                                                        <td style={{textTransform:'capitalize'}}>
                                                                            <span className={`badge badge-${
                                                                                sales.order_status == "completed" ? 'success'
                                                                                : sales.order_status == "pending" ? "secondary" 
                                                                                : sales.order_status == "in-delivery" ? "warning" 
                                                                                : sales.order_status == "canceled" ? "danger" 
                                                                                : ""} light`}
                                                                            >
                                                                                {
                                                                                    sales.order_status == "completed" ? 'completed'
                                                                                    : sales.order_status == "pending" ? 'pending'
                                                                                    : sales.order_status == "in-delivery" ? 'in-delivery'
                                                                                    : sales.order_status == "canceled" ? 'canceled'
                                                                                    : ""
                                                                                }                                                                                
                                                                            </span>
                                                                        </td>
                                                                        <td style={{textTransform:'capitalize'}}>
                                                                            <span className={`badge badge-${
                                                                                sales.payment_type == "unpaid" ? 'danger'
                                                                                : sales.payment_type == "paid"? "primary"
                                                                                : sales.payment_type == "partial"? "warning"
                                                                                : ""} light`}
                                                                            >
                                                                                {sales.payment_type }                                                                                
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <Dropdown drop={idx == salesData.length - 1 ? "up" : "down"}>
                                                                                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>

                                                                                <Dropdown.Menu align={"end"}>
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="salesEditModal" onClick={(e) => handleModalWData(e, {endpoint: "sales", id: sales.order_id, action: 'update', ...sales})}>
                                                                                        <i className='bx bxs-edit'></i> Edit sales
                                                                                    </Dropdown.Item>
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="cancelSalesModal" onClick={(e) => handleModalWData(
                                                                                        e, 
                                                                                        {
                                                                                            endpoint: "sales", 
                                                                                            id: sales.order_id, 
                                                                                            action: 'canceled',
                                                                                            data: {...sales}
                                                                                        })}>
                                                                                        <i className='bx bx-trash'></i> Cancel sales
                                                                                    </Dropdown.Item>
                                                                                </Dropdown.Menu>
                                                                            </Dropdown>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            
                                                        ):""
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="table-end d-flex justify-content-between">
                                                <p className="table-data-capt" id="tableCaption"></p>
                                                <ul className="basic-pagination" id="paginationBtnRender"></ul>
                                            </div>
                                        </div> */}
                                        {/* <!-- mobile list -->
                                        <div className="mobile-list-wrap">
                                            <div className="mobile-list" id="custLists">
                                                <div className="list-item mt-3">
                                                    <div className="modal-area" data-bs-toggle="modal"
                                                        data-bs-target="#custDetailModal">
                                                        <div className="list-img">
                                                            <img src="../assets/images/Avatar 1.jpg" alt="user-img">
                                                        </div>
                                                        <div className="list-content">
                                                            <h4 className="list-title">Kiya</h4>
                                                            <p className="list-sub-title">cust091</p>
                                                        </div>
                                                    </div>
                                                    <div className="list-badge primary">
                                                        <p className="badge-text">Delivery Order</p>
                                                    </div>
                                                    <div className="more-opt" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className='bx bx-dots-horizontal-rounded'></i>
                                                    </div>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#editCustModal">
                                                                <i className='bx bxs-edit'></i> Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#dangerModal">
                                                                <i className='bx bx-trash'></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="list-item mt-3">
                                                    <div className="modal-area" data-bs-toggle="modal"
                                                        data-bs-target="#custDetailModal">
                                                        <div className="list-img">
                                                            <img src="../assets/images/Avatar 1.jpg" alt="user-img">
                                                        </div>
                                                        <div className="list-content">
                                                            <h4 className="list-title">Kiya</h4>
                                                            <p className="list-sub-title">cust091</p>
                                                        </div>
                                                    </div>
                                                    <div className="list-badge primary">
                                                        <p className="badge-text">Delivery Order</p>
                                                    </div>
                                                    <div className="more-opt" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className='bx bx-dots-horizontal-rounded'></i>
                                                    </div>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#editCustModal">
                                                                <i className='bx bxs-edit'></i> Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#dangerModal">
                                                                <i className='bx bx-trash'></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="list-item mt-3">
                                                    <div className="modal-area" data-bs-toggle="modal"
                                                        data-bs-target="#custDetailModal">
                                                        <div className="list-img">
                                                            <img src="../assets/images/Avatar 1.jpg" alt="user-img">
                                                        </div>
                                                        <div className="list-content">
                                                            <h4 className="list-title">Kiya</h4>
                                                            <p className="list-sub-title">cust091</p>
                                                        </div>
                                                    </div>
                                                    <div className="list-badge primary">
                                                        <p className="badge-text">Delivery Order</p>
                                                    </div>
                                                    <div className="more-opt" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className='bx bx-dots-horizontal-rounded'></i>
                                                    </div>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#editCustModal">
                                                                <i className='bx bxs-edit'></i> Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#dangerModal">
                                                                <i className='bx bx-trash'></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="tabs-content" style={openTab === "addSalesTab" ? {display: "block"} : {display: "none"}}>
                                    <div className="card card-table add-on-shadow">
                                        <p className="card-title mb-3">Add sales data</p>
                                        <Accordion defaultActiveKey={['0', '1']} alwaysOpen className="accordion accordion-w-icon">
                                            <form autoComplete='off'>
                                                <Accordion.Item eventKey="0">
                                                    <Accordion.Header>
                                                        <i className='bx bx-info-circle'></i>Customer information
                                                    </Accordion.Header>
                                                    <Accordion.Body className='mt-1'>
                                                        <div className='mt-3 mb-4'>
                                                            <Row className='mb-4' style={{gap: '1.5rem'}}>
                                                                <Col lg={3} sm={12}>
                                                                    {/* start: this is helper */}
                                                                    <InputWLabel 
                                                                        type="text"
                                                                        name="customer_id"
                                                                        require={true}
                                                                        register={register}
                                                                        errors={errors} 
                                                                        display={false}
                                                                    />
                                                                    {/* end: helper for validate */}

                                                                    <div style={{position:'relative'}}>
                                                                        <InputWLabel 
                                                                            label="Customer Name" 
                                                                            type="text"
                                                                            name="name"
                                                                            placeholder="Search customer name..." 
                                                                            onChange={handleFilterCust}
                                                                            onFocus={() => handleAutoComplete(getValues('name'))}
                                                                            onKeyDown={handleKeyDown}
                                                                            require={true}
                                                                            register={register}
                                                                            errors={errors} 
                                                                            textStyle={'capitalize'}
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
                                                                </Col>
                                                                <Col lg={2} sm={12}>
                                                                    <InputWLabel 
                                                                        label="sales date" 
                                                                        type="date"
                                                                        name="order_date" 
                                                                        defaultValue={getValues('order_date')}
                                                                        register={register}
                                                                        require={true}
                                                                        errors={errors}
                                                                    />                                                            
                                                                </Col>
                                                                <Col lg={2} sm={12}>
                                                                    <InputWSelect
                                                                        label={'Order type'}
                                                                        name="order_type"
                                                                        selectLabel="Select order type"
                                                                        options={dataStatic.orderTypeList}
                                                                        optionKeys={["id", "type"]}
                                                                        value={(selected) => {
                                                                            setValue('order_type', selected.value);
                                                                            selected.value != "" ? clearErrors("order_type") : null;
                                                                            setResetInputWSelect(false);
                                                                            selected.value == "delivery" ? setDelivSwitch(true) : setDelivSwitch(false);
                                                                        }}
                                                                        resetController={resetInputWSelect}
                                                                        require={true}
                                                                        register={register}
                                                                        errors={errors}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Collapse in={getValues('order_type') == 'delivery'}>
                                                                <Row style={{gap: '1.5rem'}}>
                                                                    <Col lg={3} sm={12}>
                                                                        <InputWLabel 
                                                                            label={"Tentukan pengiriman sekarang"}
                                                                            type={'switch'}
                                                                            name={'deliv_switch'}
                                                                            style={{alignItems:'center'}}
                                                                            defaultChecked={true}
                                                                            onChange={(e) => {setValue('deliv_switch', e.target.checked); setDelivSwitch(e.target.checked)}}
                                                                            register={register}
                                                                            require={false}
                                                                            errors={errors}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </Collapse>
                                                            <Collapse in={delivSwitch == true}>
                                                                <Row className='mt-4' style={{gap: '1.5rem'}}>
                                                                    <Col lg={3} sm={12}>
                                                                        <div style={{position:'relative'}}>
                                                                            <InputWLabel 
                                                                                label="Courier Name" 
                                                                                type="text"
                                                                                name="courier_name"
                                                                                placeholder="Search courier name..." 
                                                                                onChange={handleFilterCourier}
                                                                                onFocus={() => handleAutoCompleteCourier(getValues('courier_name'))}
                                                                                onKeyDown={handleKeyDownCourier}
                                                                                require={delivSwitch ? true : false}
                                                                                register={register}
                                                                                errors={errors} 
                                                                                textStyle={'capitalize'}
                                                                            />
                                                                                    
                                                                            {/* popup autocomplete */}
                                                                            <div className="popup-element" aria-expanded={openPopupCourier} ref={refToCourier}>
                                                                                {filterCourier && filterCourier.length > 0 ? 
                                                                                    filterCourier.map((e,idx) => {
                                                                                        return (
                                                                                            <div key={`cust-${idx}`} className="res-item" onClick={() => 
                                                                                                handleChooseCourier({ 
                                                                                                    ...e
                                                                                            })}>{e.user_name}</div>
                                                                                        )
                                                                                    }) : ""
                                                                                }
                                                                            </div>   
                                                                        </div>
                                                                    </Col>
                                                                    <Col lg={2} sm={12}>
                                                                        <InputWLabel 
                                                                            label="ship date" 
                                                                            type="date"
                                                                            name="ship_date" 
                                                                            defaultValue={getValues('ship_date')}
                                                                            register={register}
                                                                            require={delivSwitch ? true : false}
                                                                            errors={errors}
                                                                        />
                                                                    </Col>
                                                                    <Col lg={3} sm={12}>
                                                                        <InputWLabel 
                                                                            label="delivery address" 
                                                                            as="textarea"
                                                                            name="delivery_address" 
                                                                            register={register}
                                                                            require={false}
                                                                            errors={errors}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </Collapse>
                                                            <Row className='mt-4'>
                                                                 <Col lg={3} sm={12}>
                                                                    <InputWLabel 
                                                                        label="note" 
                                                                        as="textarea"
                                                                        name="note" 
                                                                        register={register}
                                                                        require={false}
                                                                        errors={errors}
                                                                    />
                                                                </Col>
                                                            </Row>

                                                        </div>
                                                                
                                                                
                                                                {/* <AutoComplete show={} data={} /> */}
                                                            {/* </div> */}
                                                            
                                                            {/* <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                                                            <label htmlFor="productName">product name</label>
                                                            <div className="d-flex">
                                                                    <div className="form-switch">
                                                                        <input type='checkbox' className="form-check-input switch-primary" />
                                                                        <label className="mx-2" htmlFor="newCustomer">No</label>
                                                                    </div>
                                                            </div>
                                                            </div>
                                                            new cust option 
                                                            <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                                                                <div className="row gy-3">
                                                                    <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                        <InputWLabel
                                                                            label="customer name"
                                                                            type="text" 
                                                                            name="custName" 
                                                                            placeholder="Jane Doe" 
                                                                            register={register}
                                                                            require={true}
                                                                            errors={errors}
                                                                        />
                                                                    </div>
                                                                    <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                        <InputWSelect
                                                                            name="custType"
                                                                            selectLabel="Select customer type"
                                                                            options={["member", "non-members"]}
                                                                            value={(selected) => console.log(selected)}
                                                                        />
                                                                    </div>
                                                                    <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                        <InputWLabel 
                                                                            label="Customer email" 
                                                                            type="email"
                                                                            name="salesNewCustMail" 
                                                                            placeholder="customer@mail.com" 
                                                                        />
                                                                        <InputWLabel
                                                                            label="customer email"
                                                                            type="email" 
                                                                            name="name" 
                                                                            placeholder="Jane Doe" 
                                                                            register={register}
                                                                            require={true}
                                                                            errors={errors}
                                                                        />
                                                                    </div>
                                                                    <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                        <label htmlFor="newcustphone">Phone</label>
                                                                        <div className="input-group-left">
                                                                            <span
                                                                                className="input-group-w-text fw-semibold">+62</span>
                                                                            <input type="text"
                                                                                className="form-control input-w-text-left"
                                                                                id="custPhone" placeholder="8xxxxxxxxxx"/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div> */}
                                                            
                                                        {/* </div>   */}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                                <Accordion.Item eventKey="1">
                                                    <Accordion.Header>
                                                        <i className='bx bx-cube-alt'></i>Tambah produk
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        {/* <p className="card-title mb-3 mt-1">Sales products</p> */}
                                                        {/* <div className="col-lg-6 col-sm-12 col-md-12 col-12">
                                                            <div className="d-flex flex-fill gap-3 flex-wrap">
                                                                <div>
                                                                    <InputWLabel 
                                                                        label="add product"
                                                                        type="text"
                                                                        name="salesProduct" 
                                                                        placeholder="Search product name..." 
                                                                        onChange={handleSearchProd}
                                                                        onFocus={handleSearchProd}
                                                                        onKeyDown={keyDownSearchProd}
                                                                        style={{width: '100%', textTransform:'capitalize'}}
                                                                        register={register}
                                                                        require={false}
                                                                        errors={errors}
                                                                        
                                                                    />
                                                                    <div className="popup-element" aria-expanded={openPopupProd} ref={refToProd}>
                                                                        {filterProd && filterProd.length > 0 ? 
                                                                            filterProd.map((e,idx) => {
                                                                                return (
                                                                                    <div key={`cust-${idx}`} className="res-item" onClick={() => 
                                                                                        handleChooseProd({ 
                                                                                            product_id: e.product_id, 
                                                                                            product_name: e.product_name, 
                                                                                            variant: e.variant, 
                                                                                            img:e.img, 
                                                                                            product_cost: e.product_cost , 
                                                                                            sell_price: e.sell_price, 
                                                                                            discount: e.discount 
                                                                                        })}
                                                                                    >{e. variant !== "" ? e.product_name + " " + e.variant : e.product_name}</div>
                                                                                )
                                                                            }) : ""
                                                                        }
                                                                    </div>  
                                                                </div>

                                                                    <QtyButton min={0} max={999} label={"qty"}  name={`qty-product`} id="qtyItem" width={"180px"} returnValue={(e) => {setQtyVal(Number(e)); console.log(e)}} value={qtyVal} />
                                                                <div className='align-self-end mt-1'>
                                                                    <span className="btn btn-primary" onClick={() => {addToSalesData(); setQtyVal(0)}}><i className="bx bx-plus" style={{width:24, height:24}}></i></span>
                                                                </div>
                                                            </div>
                                                        </div> */}
                                                        <div className="flex sm:flex-column md:flex-column lg:flex-row xl:flex-row xl:gap-3 lg:gap-0 md:gap-3 sm:flex-wrap add-product-control mt-3 mb-4" >
                                                            <div className='sm:w-12 lg:w-5'>
                                                                <InputWLabel 
                                                                    label="add product"
                                                                    type="text"
                                                                    name="salesProduct" 
                                                                    placeholder="Search product name..." 
                                                                    onChange={handleSearchProd}
                                                                    onFocus={handleSearchProd}
                                                                    onKeyDown={keyDownSearchProd}
                                                                    style={{width: 'inherit', textTransform:'capitalize'}}
                                                                    register={register}
                                                                    require={false}
                                                                    errors={errors}
                                                                    autoComplete={"off"}
                                                                    // disabled={editMode ? false : true}  
                                                                />
                                                                {/* popup autocomplete */}
                                                                <div className="popup-element" aria-expanded={openPopupProd} ref={refToProd}>
                                                                    {filterProd && filterProd.length > 0 ? 
                                                                        filterProd.map((e,idx) => {
                                                                            return (
                                                                                <div key={`product-${e.product_id}`} className="res-item" onClick={() => 
                                                                                    
                                                                                    handleChooseProd({ 
                                                                                    product_id: e.product_id, 
                                                                                    product_name: e.product_name, 
                                                                                    variant: e.variant, 
                                                                                    img:e.img, 
                                                                                    product_cost: e.product_cost , 
                                                                                    sell_price: e.sell_price,
                                                                                    discount: e.discount
                                                                                })}
                                                                                >{e. variant !== "" ? e.product_name + " " + e.variant : e.product_name}</div>
                                                                            )
                                                                        }) : ""
                                                                    }
                                                                </div>  
                                                            </div>
                                    
                                                            <div className='flex sm:flex-row lg:flex-row gap-3'>
                                                                {/* <div> */}
                                                                    {/* <Form.Label className="mb-1">qty</Form.Label> */}
                                                                    <QtyButton 
                                                                        min={0} 
                                                                        max={999} 
                                                                        name={`qty-add-product`} 
                                                                        width={"180px"} 
                                                                        returnValue={(e) => setQtyVal(e)}
                                                                        value={qtyVal} 
                                                                        // disabled={editMode ? false : true}  
                                                                        label={"qty"}
                                                                    />
                                                                {/* </div> */}
                                                                {/* <div className='align-self-end'> */}
                                                                    <div className={`btn btn-primary qty-add-btn align-self-end`} onClick={addToSalesData}><i className="bx bx-plus"></i></div>
                                                                {/* </div> */}
                                                            </div>
                                                        </div>

                                                        {/* large view */}
                                                        <div className="table-responsive mt-4">
                                                            <table className="table">
                                                                <thead>
                                                                    <tr>
                                                                        <th scope="col" aria-label="product desc">
                                                                            product
                                                                        </th> 
                                                                        <th scope="col" aria-label="product variant">
                                                                            variant
                                                                        </th>
                                                                        <th scope="col" aria-label="qty">
                                                                            qty
                                                                        </th>
                                                                        <th scope="col" aria-label="product price">
                                                                            price
                                                                        </th>
                                                                        <th scope="col" aria-label="product price">
                                                                            discount
                                                                        </th>
                                                                        <th scope="col" aria-label="total">
                                                                            total
                                                                        </th>
                                                                        <th scope="col" aria-label="action">
                                                                            action
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {salesItems && salesItems.length > 0 ? 
                                                                        salesItems.map((item, idx) => {
                                                                        return(
                                                                        <tr key={idx}>
                                                                            <td className="data-img" style={{textTransform: 'capitalize'}}>
                                                                                <span className="user-img">
                                                                                    <img src={item.img} alt="prod-img"/>
                                                                                </span>{item.product_name}
                                                                            </td>
                                                                            <td>{item.variant}</td>
                                                                            <td>
                                                                                <QtyButton 
                                                                                    min={1} 
                                                                                    max={999} 
                                                                                    name={`qty-product`} 
                                                                                    id="qtyItem" 
                                                                                    value={item.quantity} 
                                                                                    returnValue={(e) => {handleEdit(e,idx);handleUpdateEndNote()}} 
                                                                                    width={'150px'} 
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <NumberFormat intlConfig={{
                                                                                    value: item.sell_price, 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                    }} 
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <NumberFormat intlConfig={{
                                                                                    value: item.discount, 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                    }}                                                                                                                                     v
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <NumberFormat intlConfig={{
                                                                                    value: (Number(item.quantity)*Number(item.sell_price))-(Number(item.quantity)*Number(item.discount)), 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                    }} 
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <span className="table-btn del-table-data" onClick={() => {delSalesItems(idx)}}>
                                                                                    <i className='bx bx-trash'></i>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                        )
                                                                        })
                                                                    :""}
                                                                    {salesItems && salesItems.length > 0 && salesEndNote ?
                                                                    <>
                                                                    <tr className="endnote-row">
                                                                        <td colSpan="2" className="endnote-row-title">items</td>
                                                                        <td colSpan="4">{salesEndNote.totalQty}</td>
                                                                    </tr>
                                                                    <tr className="endnote-row">
                                                                        <td colSpan="5" className="endnote-row-title">subtotal</td>
                                                                        <td colSpan="2" style={{fontWeight: 500}}>
                                                                            <NumberFormat intlConfig={{
                                                                                value: salesEndNote.subtotal, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                                }} 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    <tr className="endnote-row">
                                                                        <td colSpan="5" className="endnote-row-title">add more discount</td>
                                                                        <td colSpan="2" style={{fontWeight: 500}}>
                                                                            {salesDisc  ?
                                                                                salesDisc.discType == "percent" ?
                                                                            (
                                                                                <>
                                                                                <NumberFormat intlConfig={{
                                                                                    value: salesDisc ? (salesDisc.value*Number(salesEndNote.subtotal)/100) : 0, 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                }}
                                                                                />
                                                                                <span>{`(${salesDisc.value}%)`}</span>
                                                                                </>
                                                                            ) : 
                                                                            (
                                                                                <NumberFormat intlConfig={{
                                                                                    value: salesDisc.value, 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                }} 
                                                                                />
                                                                            )
                                                                            :  (
                                                                                <NumberFormat intlConfig={{
                                                                                    value: 0, 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                }} 
                                                                                />
                                                                            )
                                                                            }
                                                                            <span className="endnote-row-action">
                                                                                <span className="table-btn edit-table-data" aria-label='addDiscount' onClick={(e) => handleModal(e)}>
                                                                                    <i className='bx bx-cog'></i>
                                                                                </span>
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    <tr className="endnote-row">
                                                                        <td colSpan="5" className="endnote-row-title">total</td>
                                                                        <td colSpan="2" >
                                                                            <NumberFormat intlConfig={{
                                                                                value: salesEndNote.grandtotal, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                                }} 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                        <tr className="endnote-row">
                                                                        <td colSpan="5" className="endnote-row-title">paid & payment type</td>
                                                                        <td colSpan="2">
                                                                            <NumberFormat intlConfig={{
                                                                                value: paidData ? paidData.amountOrigin : 0, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                                }} 
                                                                            />
                                                                            <span style={{textTransform: 'capitalize', fontWeight: 500}}>{`${paidData ? '~ ' + paidData.payment_type : ""}`}</span>
                                                                            <span className="endnote-row-action">
                                                                                <span className="table-btn edit-table-data" aria-label="createPayment" onClick={handleModal}>
                                                                                    <i className='bx bx-cog'></i>
                                                                                </span>
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                    <tr className="endnote-row">
                                                                        <td colSpan="5" className="endnote-row-title">remaining payment</td>
                                                                        <td colSpan="2">
                                                                            <NumberFormat intlConfig={{
                                                                                value: salesEndNote.remaining_payment, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                                }} 
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                    </>
                                                                    :""}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* mobile view */}
                                                        <DataView value={salesItems} listTemplate={orderListTemplate} ></DataView>
                                                        
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                                <div className="wrapping-table-btn mt-5">
                                                    <button type="button" className="add-btn btn btn-primary btn-w-icon" onClick={handleSubmit(onSubmitSales, onError)}>
                                                        submit
                                                    </button>
                                                </div>
                                            </form>
                                        </Accordion>
                                    </div>
                                </div>
                                <div className="tabs-content" style={openTab === "completeTab" ? {display: "block"} : {display: "none"}}>
                                    <div className="card card-table add-on-shadow">
                                        
                                        <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={salesComplete}
                                                size="normal"
                                                removableSort
                                                // stripedRows
                                                // selectionMode={"checkbox"}
                                                // selection={selectedSales}
                                                // onSelectionChange={(e) => {
                                                //     setSelectedSales(e.value);
                                                // }}
                                                dataKey="order_id"
                                                tableStyle={{ minWidth: "50rem" }}
                                                filters={salesFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "order_id",
                                                    "order_date",
                                                    "customer.name",
                                                    "order_type",
                                                    "grandtotal",
                                                    "source",
                                                    "order_status",
                                                    "payment_type",
                                                ]}
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setSalesFilters(e.filters)}
                                                header={tableHeader2}
                                                paginator
                                                totalRecords={totalRecords}
                                                rows={50}
                                            >
                                            {/* <Column
                                                selectionMode="multiple"
                                                headerStyle={{ width: "3.5rem" }}
                                            ></Column> */}
                                            <Column
                                                field="order_id"
                                                header="Order ID"
                                                sortable
                                                bodyStyle={{ textTransform: "capitalize" }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_date"
                                                header="order date"
                                                body={formatedOrderDate}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="customer.name"
                                                header="customer"
                                                filter 
                                                filterPlaceholder="Search by customer name"
                                                style={{ textTransform: "capitalize" }}
                                            ></Column>
                                            <Column
                                                field="order_type"
                                                header="Order type"
                                                filter 
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: '100%' }}
                                                filterPlaceholder={"order type"}
                                                bodyStyle={{ textTransform: 'capitalize' }}
                                                style={{ textTransform: 'uppercase' }}
                                            ></Column>
                                            <Column
                                                field="grandtotal"
                                                header="Total"
                                                body={formatedGrandtotal}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                sortable 
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="source"
                                                header="source"
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: 'inherit' }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="payment_type"
                                                header="type"
                                                body={paymentTypeCell}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_status"
                                                header="status"
                                                body={statusCell}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                showFilterMenu={false} 
                                                filterMenuStyle={{ width: '100%' }}
                                                filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="Action"
                                                body={(rowData, rowIndex) => actionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            </DataTable>
                                        </div>
                                        {/* <div className="table-responsive mt-4">
                                            <table className="table" id="custTypeList" data-table-search="true"
                                                data-table-sort="true" data-table-checkbox="true">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <input className="form-check-input checkbox-primary checkbox-all"
                                                                type="checkbox" />
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="product Name">
                                                            order id
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="category">
                                                            order Date
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="variant">
                                                            Customer Name
                                                            <span className="sort-icon"></span>
                                                        </th> 
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Customer type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Total
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Status
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="">
                                                    {salesComplete ? 
                                                        ( 
                                                            salesComplete.map((sales, idx) => {
                                                                return (
                                                                    <tr key={`sales-list- ${idx}`}>
                                                                        <th scope="row">
                                                                            <input className="form-check-input checkbox-primary checkbox-single" type="checkbox" value="" />
                                                                        </th>
                                                                        <td>{sales.order_id}</td>
                                                                        <td>{ConvertDate.convertToFullDate(sales.order_date, "/")}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.name}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.cust_type}</td>
                                                                        <td>
                                                                            <NumberFormat intlConfig={{
                                                                                value: sales.grandtotal, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                            }} />
                                                                        </td>
                                                                        <td style={{textTransform:'capitalize'}}>
                                                                            <span className={`badge badge-${
                                                                                sales.order_status == "completed" ? 'success'
                                                                                : sales.order_status == "pending" ? "secondary" 
                                                                                : sales.order_status == "in-delivery" ? "warning" 
                                                                                : sales.order_status == "canceled" ? "danger" 
                                                                                : ""} light`}
                                                                            >
                                                                                {
                                                                                    sales.order_status == "completed" ? 'completed'
                                                                                    : sales.order_status == "pending" ? 'pending'
                                                                                    : sales.order_status == "in-delivery" ? 'in-delivery'
                                                                                    : sales.order_status == "canceled" ? 'canceled'
                                                                                    : ""
                                                                                }                                                                                
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span className="table-btn detail-table-data" aria-label="salesDetailModal" onClick={(e) => handleModalWData(e, sales ? sales.id : null)}>
                                                                                <i className='bx bx-show'></i>
                                                                            </span>
                                                                            <span className="table-btn edit-table-data" aria-label="salesEditModal" onClick={(e) => handleModalWData(e, sales ? sales.id : null)}>
                                                                                <i className='bx bxs-edit'></i></span>
                                                                            <span className="table-btn del-table-data" aria-label="cancelSalesModal" onClick={(e) => handleModalWData(e, {endpoint: "sales", id: sales.id})}><i className='bx bx-trash'></i></span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            
                                                        ):""
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="table-end d-flex justify-content-between">
                                                <p className="table-data-capt" id="tableCaption"></p>
                                                <ul className="basic-pagination" id="paginationBtnRender"></ul>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="tabs-content" style={openTab === "returnTab" ? {display: "block"} : {display: "none"}}>
                                    <div className="card card-table add-on-shadow">
                                        <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={roData}
                                                size="normal"
                                                removableSort
                                                dataKey="order_id"
                                                tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                                // filters={salesFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "return_order_id",
                                                    "order_id",
                                                    "return_date",
                                                    "customer.customer_id",
                                                    
                                                ]}
                                                
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setSalesFilters(e.filters)}
                                                header={returnOrderHeader}
                                                paginator
                                                totalRecords={totalRecords}
                                                rows={50}
                                            >
                                            {/* <Column
                                                selectionMode="multiple"
                                                headerStyle={{ width: "3.5rem" }}
                                            ></Column> */}
                                            <Column
                                                field="return_order_id"
                                                header="RO ID"
                                                sortable
                                                bodyStyle={{ textTransform: "capitalize" }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_id"
                                                header="Order ID"
                                                sortable
                                                bodyStyle={{ textTransform: "capitalize" }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="return_date"
                                                header="return date"
                                                body={formatedReturnDate}
                                                dataType='date'
                                                sortable
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="customer.customer_id"
                                                header="customer ID"
                                                sortable
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={{ textTransform: "capitalize" }}
                                            ></Column>
                                            <Column
                                                field="customer.name"
                                                header="customer"
                                                sortable
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={{ textTransform: "capitalize" }}
                                            ></Column>
                                            <Column
                                                field="refund_total"
                                                header="total refund"
                                                body={formatedRefundtotal}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                sortable 
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="return_method"
                                                header="Metode pengembalian"
                                                body={viewReturnMethod}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="status"
                                                header="status"
                                                sortable
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: '100%' }}
                                                filterPlaceholder={"order type"}
                                                bodyStyle={{ textTransform: 'capitalize' }}
                                                style={{ textTransform: 'uppercase' }}
                                                body={returnStatusCell}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="Action"
                                                body={(rowData, rowIndex) => returnOrderActionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            </DataTable>
                                        </div>
                                        
                                        
                                    </div>
                                </div>
                                <div className="tabs-content" style={openTab === "canceledTab" ? {display: "block"} : {display: "none"}}>
                                    <div className="card card-table add-on-shadow">
                                        <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={salesCanceled}
                                                size="normal"
                                                removableSort
                                                // stripedRows
                                                // selectionMode={"checkbox"}
                                                // selection={selectedSales}
                                                // onSelectionChange={(e) => {
                                                //     setSelectedSales(e.value);
                                                // }}
                                                dataKey="order_id"
                                                tableStyle={{ minWidth: "50rem" }}
                                                filters={salesFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "order_id",
                                                    "order_date",
                                                    "customer.name",
                                                    "order_type",
                                                    "grandtotal",
                                                    "source",
                                                    "order_status",
                                                    "payment_type",
                                                ]}
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setSalesFilters(e.filters)}
                                                header={tableHeader2}
                                                paginator
                                                totalRecords={totalRecords}
                                                rows={50}
                                            >
                                            {/* <Column
                                                selectionMode="multiple"
                                                headerStyle={{ width: "3.5rem" }}
                                            ></Column> */}
                                            <Column
                                                field="order_id"
                                                header="Order ID"
                                                sortable
                                                bodyStyle={{ textTransform: "capitalize" }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_date"
                                                header="order date"
                                                body={formatedOrderDate}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="customer.name"
                                                header="customer"
                                                filter 
                                                filterPlaceholder="Search by customer name"
                                                style={{ textTransform: "capitalize" }}
                                            ></Column>
                                            <Column
                                                field="order_type"
                                                header="Order type"
                                                filter 
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: '100%' }}
                                                filterPlaceholder={"order type"}
                                                bodyStyle={{ textTransform: 'capitalize' }}
                                                style={{ textTransform: 'uppercase' }}
                                            ></Column>
                                            <Column
                                                field="grandtotal"
                                                header="Total"
                                                body={formatedGrandtotal}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                sortable 
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="source"
                                                header="source"
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: 'inherit' }}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="payment_type"
                                                header="type"
                                                body={paymentTypeCell}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_status"
                                                header="status"
                                                body={statusCell}
                                                bodyStyle={{textTransform: 'capitalize'}}
                                                filter
                                                showFilterMenu={false} 
                                                filterMenuStyle={{ width: '100%' }}
                                                filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="Action"
                                                body={(rowData, rowIndex) => actionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            </DataTable>
                                        </div>

                                        {/* <div className="table-responsive mt-4">
                                            <table className="table" id="custTypeList" data-table-search="true"
                                                data-table-sort="true" data-table-checkbox="true">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <input className="form-check-input checkbox-primary checkbox-all"
                                                                type="checkbox" />
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="product Name">
                                                            order id
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="category">
                                                            order Date
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="variant">
                                                            Customer Name
                                                            <span className="sort-icon"></span>
                                                        </th> 
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Customer type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Total
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Status
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="">
                                                    {salesCanceled ? 
                                                        ( 
                                                            salesCanceled.map((sales, idx) => {
                                                                return (
                                                                    <tr key={`sales-list- ${idx}`}>
                                                                        <th scope="row">
                                                                            <input className="form-check-input checkbox-primary checkbox-single" type="checkbox" value="" />
                                                                        </th>
                                                                        <td>{sales.order_id}</td>
                                                                        <td>{ConvertDate.convertToFullDate(sales.order_date, "/")}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.name}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.cust_type}</td>
                                                                        <td>
                                                                            <NumberFormat intlConfig={{
                                                                                value: sales.grandtotal, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                            }} />
                                                                        </td>
                                                                        <td style={{textTransform:'capitalize'}}>
                                                                            <span className={`badge badge-${
                                                                                sales.order_status == "completed" ? 'success'
                                                                                : sales.order_status == "pending" ? "secondary" 
                                                                                : sales.order_status == "in-delivery" ? "warning" 
                                                                                : sales.order_status == "canceled" ? "danger" 
                                                                                : ""} light`}
                                                                            >
                                                                                {
                                                                                    sales.order_status == "completed" ? 'completed'
                                                                                    : sales.order_status == "pending" ? 'pending'
                                                                                    : sales.order_status == "in-delivery" ? 'in-delivery'
                                                                                    : sales.order_status == "canceled" ? 'canceled'
                                                                                    : ""
                                                                                }                                                                                
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span className="table-btn edit-table-data" aria-label="salesEditModal" onClick={(e) => handleModalWData(e, sales ? sales.id : null)}>
                                                                                <i className='bx bxs-edit'></i></span>
                                                                            <span className="table-btn del-table-data" aria-label="deleteSalesModal" onClick={(e) => handleModalWData(e, {endpoint: "sales", id: sales.id})}><i className='bx bx-trash'></i></span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            
                                                        ):""
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="table-end d-flex justify-content-between">
                                                <p className="table-data-capt" id="tableCaption"></p>
                                                <ul className="basic-pagination" id="paginationBtnRender"></ul>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                         
            {/* </main> */}

            {showModal === "salesDetailModal" ? 
                (
                    <SalesDetailModal show={showModal === "salesDetailModal" ? true : false} onHide={handleCloseModal} data={showModal == "salesDetailModal" ? salesListObj : ""} />
                )
             : showModal === "returnOrderModal" ? 
                (
                    <ReturnOrderModal show={showModal === "returnOrderModal" ? true : false} onHide={handleCloseModal} />
                )
              : showModal === "roEditModal" ? 
                (
                    <EditReturnOrderModal show={showModal === "roEditModal" ? true : false} data={showModal == "roEditModal" ? salesListObj : ""} onHide={handleCloseModal} />
                )
             : showModal === "salesEditModal" ?
                (
                    <SalesEditModal show={showModal === "salesEditModal" ? true : false} onHide={handleCloseModal} data={showModal == "salesEditModal" ? salesListObj : ""} />
                )
             : showModal === "cancelSalesModal" ?
                (
                    <ConfirmModal show={showModal === "cancelSalesModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "cancelSalesModal" ? salesListObj : ""} 
                        msg={"Yakin untuk membatalkan order ini?"}
                        returnValue={(value) => {setCantCanceled(value);console.log(value)}}
                    />
                )
            : showModal === "roCancelModal" ?
                (
                    <ConfirmModal show={showModal === "roCancelModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "roCancelModal" ? salesListObj : ""} 
                        msg={"Yakin untuk membatalkan pengembalian ini?"}
                    />
                )
            : showModal === "warningCancelModal" ?
                (
                    <ConfirmModal show={showModal === "warningCancelModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "warningCancelModal" ? salesListObj : ""} 
                        msg={
                            <p style={{marginBottom: 0}}>
                                Tidak dapat membatalkan order ini karena hanya satu-satunya order di invoice dan terdapat pembayaran yang belum penuh.<br />
                                Coba hapus pembayaran yang terkait terlebih dahulu lalu coba hapus ulang order ini
                            </p>
                        }
                        returnValue={(value) => {setCantCanceled(value)}}
                    />
                )

             : showModal === "existInvOrderModal" ?
                (
                    <ConfirmModal show={showModal === "existInvOrderModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "existInvOrderModal" ? salesListObj : ""} 
                        msg={
                            <p style={{marginBottom: 0}}>
                                Ada invoice dengan pelanggan yang sama, mau ditambahkan ke invoice?
                            </p>
                        }
                        returnValue={(value) => {setMergeOrderInv(value)}}
                    />
                )
            : showModal === "confirmationModal" ?
                (
                    <ConfirmModal show={showModal === "confirmationModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "confirmationModal" ? salesListObj : ""}  
                        msg={modalMsg}
                        returnValue={(confirm) => {setConfirm(confirm)}}
                    />
                )
             : showModal === "addDiscount" ?
                (
                    <DiscountModal show={showModal === "addDiscount" ? true : false} onHide={handleCloseModal} totalCart={salesEndNote ? salesEndNote.subtotal : 0} returnVal={(val) => {setSalesDisc(val)}} />
                )
             : showModal === "createPayment" ?
                (
                    <CreatePayment 
                        show={showModal === "createPayment" ? true : false} 
                        onHide={handleCloseModal} 
                        source={'order'}
                        totalCart={showModal === "createPayment" && salesEndNote ? salesEndNote.grandtotal : ""} 
                        returnValue={(paymentData) => {setPaidData(paymentData)}} 
                    />
                )
            
              : showModal === "viewReasonReturn" ? 
                (
                    <ModalTextContent 
                        show={showModal === "viewReasonReturn" ? true : false} 
                        onHide={handleCloseModal} 
                        data={showModal === "viewReasonReturn" ? salesListObj : null} 
                    />
                )
                : showModal === "viewReturnMethod" ? 
                (
                    <ModalTextContent 
                        show={showModal === "viewReturnMethod" ? true : false} 
                        onHide={handleCloseModal} 
                        data={showModal === "viewReturnMethod" ? salesListObj : null} 
                    />
                )
            : ""
            }

            {/* toast area */}
            {/* <ToastContainer className="p-3 custom-toast">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                    <Toast.Body>{toastContent.msg}</Toast.Body>
                </Toast>
            </ToastContainer> */}
            <Toast ref={toast} />
            <Toast
            ref={toastUpload}
            content={({ message }) => (
                <section
                className="flex p-3 gap-3 w-full shadow-2 fadeindown"
                style={{
                    borderRadius: "10px",
                    backgroundColor: "#262626",
                    color: "#ffffff",
                }}
                >
                <i className="bx bx-cloud-upload" style={{ fontSize: 24 }}></i>
                <div className="flex flex-column gap-3 w-full">
                    <p className="m-0 font-semibold text-base text-white">
                    {message.summary}
                    </p>
                    <p className="m-0 text-base text-700">{message.detail}</p>
                    <div className="flex flex-column gap-2">
                    <ProgressBar value={progress} showValue="false"></ProgressBar>
                    <label className="text-right text-xs text-white">
                        {progress}% uploaded...
                    </label>
                    </div>
                </div>
                </section>
            )}
            ></Toast>
        </>
    )
}