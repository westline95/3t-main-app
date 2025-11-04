import React, { useState, useEffect, useRef } from 'react';
import { Controller, get, useController, useForm } from 'react-hook-form';
import Sidebar from '../parts/Sidebar.jsx';
import Header from '../parts/Header.jsx';
import { CustomSelect } from '../elements/CustomSelect/index.jsx';
import NumberFormat from '../elements/Masking/NumberFormat.jsx';
import DropzoneFile from '../elements/DropzoneFile/index.jsx';
import SalesDetailModal from '../elements/Modal/salesDetailModal.jsx';
import SalesEditModal from '../elements/Modal/SalesEditModal.jsx';
import ConfirmModal from '../elements/Modal/ConfirmModal.jsx';
import InputWLabel from '../elements/Input/InputWLabel.jsx';
import InputWSelect from '../elements/Input/InputWSelect.jsx';
import FetchApi from '../assets/js/fetchApi.js';
import { Accordion, Col, Dropdown, Form, Row, 
    // Toast, ToastContainer 
} from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { primeTableBodyStyle, primeTableHeaderStyle } from '../assets/js/primeStyling.js';
import { Column } from 'primereact/column';
import { Dropdown as PrimeDropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import dataStatic from '../assets/js/dataStatic.js';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

import AutoComplete from '../elements/AutoComplete/index.jsx';
import QtyButton from '../elements/QtyButton/index.jsx';
import DiscountModal from '../elements/Modal/DiscModal.jsx';
import CreatePayment from '../elements/Modal/CreatePaymentModal.jsx';
import ConvertDate from '../assets/js/ConvertDate.js';
import CustomToggle from '../elements/Custom/CustomToggle.jsx';
import EmptyState from "../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import ModalTextContent from '../elements/Modal/ModalTextContent.jsx';
import DeliveryGroupListModal from '../elements/Modal/DeliveryGroupListModal.jsx';
import DelivGroupsModal from '../elements/Modal/DelivGroupsModal.jsx';
import useAuth from '../hooks/useAuth.js';
import DeliveryGroupListReportModal from '../elements/Modal/DeliveryGroupListReporModal.jsx';
import WriteDelivGroupItemsModal from '../elements/Modal/WriteDelivGroupItemsModal.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { DataView } from 'primereact/dataview';

export default function DeliveryEmployee({handleSidebar, showSidebar}){
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    const { auth } = useAuth();

    const toast = useRef(null);
    const toastUpload = useRef(null);
    const mobileSearchInput = useRef(null);

    const [mobileSearchMode, setMobileSearchMode] = useState(false);
    const [mobileFilterValue, setMobileFilterValue] = useState("");
    const [progress, setProgress] = useState(0);
    const [ isLoading, setLoading ] = useState(true);
    const [ isClicked, setClicked ] = useState(false);
    const [ isClickedProd, setClickedProd ] = useState(false);
    const [ isClose, setClose ] = useState(false);
    const [ salesData, setSalesData ] = useState();
    const [ openTab, setOpenTab ] = useState('deliveryGroupListTab');
    const [ modalData, setModalData ] = useState(null);
    const [ showModal, setShowModal ] = useState("");
    const [ modalMsg, setModalMsg ] = useState("");
    const [ statusFilter, setStatusFilter ] = useState(null);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ filterProd, setFilteredProd ] = useState([]);
    const [ salesDataArr, setSalesDataArr ] = useState([]);
    const [ custData, setCustData ] = useState(null);
    const [ openDropdown, setopenDropdown] = useState(false);
    const [ custTypeData, setCustType ] = useState(null);
    const [ statusCode, setStatusCode ] = useState(null);
    const [ allProdData, setAllProd ] = useState(null);
    const [ chooseCust, setCust] = useState("");
    const [ chooseProd, setProd] = useState(null);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ openPopupProd, setOpenPopupProd ] = useState(false);
    const [ confirmVal, setConfirm ] = useState(false);
    const [ dupeDelivData, setDupeDelivData ] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [ salesComplete, setSalesComplete ] = useState(null);
    const [ salesCanceled, setSalesCanceled ] = useState(null);
    const [ deliveryList, setDeliveryList ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ qtyVal, setQtyVal ] = useState(0);
    const [ salesItems, setSalesItems] = useState([]);
    const refToThis = useRef(null);
    const refToProd = useRef(null);
    // const [ salesPaid, setSalesPaid] = useState({payType: 0, val: 0});
    const [ salesPaid, setSalesPaid] = useState({payType: 0, val: 0});
    const [ salesDisc, setSalesDisc] = useState(null);
    const [ discVal, setDiscVal] = useState(0);
    const [ totalDiscProd, setTotalDiscProd] = useState(0);
    const [ paidData, setPaidData] = useState(null);
    const [ salesEndNote, setSalesEndNote] = useState(null);
    const [ existInv, setExistInv] = useState(false);
    const [ currentOrder, setCurrentOrder] = useState(null);
    const [ addOrderItem, setAddOrderItem] = useState(false);
    const [ dgCanceled, setDGCanceled] = useState(false);
    const [ refetch, setRefetch] = useState(false);
    const [ addInvID, setAddInvID] = useState(false);
    const [ selectedSales, setSelectedSales ] = useState(null);
    const [ salesFilters, setSalesFilters ] = useState(null);
    const [ dg, setDG ] = useState(null);
    const [ globalFilterValue, setGlobalFilterValue ] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const [orderStatus] = useState(dataStatic.orderStatus);
    
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
            order_date: new Date().toString()
        }
    });

    const fetchAllDelivery = async () => {
        await axiosPrivate.get("/delivery/all")
            .then(response => {
                setSalesData(response.data);
                setDupeDelivData(response.data);
                setTotalRecords(response.data.length);

                // filtering
                let tmp = [...response.data];
                const mainFilter = ['pending', 'loading', 'on the way', 'delivered', 'failed'];
                let getMain = tmp.filter(e => mainFilter.includes(e.delivery_status));
                // let getComplete = tmp.filter(e => e.order_status === "completed");
                // let getCanceled = tmp.filter(e => e.order_status === "canceled");
                setDeliveryList(getMain);

                // setSalesComplete(getComplete);
                // setSalesCanceled(getCanceled);
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
                    detail: "New invoice is created",
                    life: 3000,
                });
                setTimeout(() => {
                    window.location.reload();
                },1200)
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to create new receipt",
                    life: 3000,
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
                    },1500)
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

    const fetchInsertInv = async (body) => {
        let bodyData = JSON.stringify(body);
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
                axiosPrivate.put("/sales", invoiceID, { params: {id: currentOrder.order_id}})
                    .then(updateResp => {
                        toast.current.show({
                            severity: "success",
                            summary: "Success",
                            detail: "Successfully update sales",
                            life: 3000,
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
                                    life: 3000,
                                });
                            }
                        } else {
                            if(resp.data.payment_type == "sebagian"){
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
                                },1200)
                            }
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

    const fetchInsertMultipleOrderItem =  async (body, resetForm) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/order-item/writes", bodyData)
          .then(resp => {
                reset();
                setValue('order_type', '');
                setSalesItems([]);
                // get all sales to update front
                fetchAllSales();

                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Successfully insert order item",
                    life: 3000,
                });

                // run to invoice
                setAddOrderItem(true);
        })
        .catch(error => {
            setAddOrderItem(false);
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add order items",
                life: 3000,
            });
        })
    };

    const fetchInsertSales = async (body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/sales/write", bodyData)
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Successfully add new data",
                    life: 3000,
                });


                salesItems.map(e => {
                    e.order_id = resp.data.order_id;
                    e.discount_prod_rec = e.discount;
                });
               
                fetchInsertMultipleOrderItem(salesItems);
                setCurrentOrder(resp.data);
              
            })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to add new sales",
                    life: 3000,
                });
          })
    };

    const fetchAllDG = async() =>{
        await axiosPrivate.get("/delivery-group/by/emp", {params: {emp_id: auth.staff_id}})
        .then(resp => {
            console.log(resp.data)
            setDG(resp.data);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal mendapatkan data delivery group",
                life: 3000,
            });
        })
    }

   
    const handleClick = (e) => {
        switch(e.target.id) {
            case "deliveryListTab":
                setOpenTab("deliveryListTab");
            break;
            case "deliveryGroupListTab":
                setOpenTab("deliveryGroupListTab");
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

    const handleModalWData = (e, data) => {
        switch (e.currentTarget.ariaLabel) {
            case "salesDetailModal":
                setModalData(data);
                setShowModal("salesDetailModal");
                break;
            case "delivEditModal":
                    // items: salesDataProd != null ? JSON.parse(salesDataProd) : salesDataProd
                setModalData(data);
                setShowModal("delivEditModal");
                break;
            case "cancelDelivModal":
               
                setModalData(data);
                // console.log(data)
                setShowModal("cancelDelivModal");
                break;
            case "custTypeModal":
                setShowModal("custTypeModal");
                break;
            case "createDelivGroups":
                setShowModal("createDelivGroups");
                setModalData(data);
                break;
            case "editDelivGroups":
                setShowModal("editDelivGroups");
                setModalData(data);
                break;
            case "viewDGList":
                setShowModal("viewDGList");
                setModalData(data);
                break;
            case "confirmModal":
                setShowModal("confirmModal");
                setModalData(data);
                break;
            case "writeDelivGroupsReport":
                setShowModal("writeDelivGroupsReport");
                setModalData(data);
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
    
    const handleChooseProd = (e) => {
        setProd(e);
        setValue('salesProduct', e.variant !== "" ? e.product_name + " " + e.variant : e.product_name);
        setValue('product_id', e.product_id);
        setOpenPopupProd(false);
    }

    const addToSalesData = () => {
        if(qtyVal !== 0) {
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
            setQtyVal(0);
            setValue('salesProduct', "");
            handleUpdateEndNote();
        } else {
            setToastContent({variant:"danger", msg: "Add product quantity first!"});
            setShowToast(true);
        }
    }

    const handleFilterCust = () => {
        handleAutoComplete(getValues('name'));
        setCust(null);
    }    

    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
        }
    }
    
    const keyDownSearchProd = (e) => {
        if(e){
            setProd(null);
        }
    }
    
    const handleSearchProd = () => {
        handleAutoCompleteProd(getValues('salesProduct'));
        setProd(null);
    }

    useEffect(() => {
        if(!chooseCust){
            setValue('customer_id', '');
        } else {
            clearErrors("name");
        }
    },[chooseCust]);
    
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

            if(paidData && paidData.payment_type == "lunas"){
                if(paidData.amountOrigin < (subtotal - discount)){
                    setPaidData(null);
                }
            } else if(paidData && paidData.payment_type == "sebagian"){
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
                    paidData.payment_type == "lunas" ? 0 
                    : paidData.payment_type == "bayar nanti" ? (subtotal - discount)
                    : paidData.payment_type == "sebagian" ? (subtotal - discount) - paidData.amountOrigin
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
                if(salesItems.length > 0){
                    objStr  = [...salesItems];

                    objStr.forEach((e) => {
                        subtotal += Number(e.sell_price)*e.quantity
                        grandQty += Number(e.quantity)
                    });
                } 
                
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

                if(e.order_type == "walk-in"){
                    forming.shipped_date = formData.order_date;
                }

                if(paidData.payment_type == "lunas"){
                    let modified = {
                        ...forming,
                        order_status: "completed",
                        payment_type: paidData.payment_type,
                        is_complete: true, 
                    }
                    fetchInsertSales(modified);

                } else if(paidData.payment_type == "sebagian") {
                    let modified = {
                        ...forming,
                        order_status: "pending",
                        payment_type: paidData.payment_type,
                        is_complete: false, 
                    }
                    fetchInsertSales(modified);
                    // fetchInvStatusCust(false, e.customer_id, paidData.payment_type);
                } else if(paidData.payment_type == "bayar nanti"){
                    if(Number(chooseCust.total_debt) > Number(chooseCust.debt_limit) && !confirmVal){
                        let send = {endpoint: "sales", action: 'warning', data:forming};
                        let formatNumber = new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        })
                        setModalData(send);
                        setModalMsg(`Pelanggan ini sudah mencapai limit!`);
                        setShowModal('confirmationModal');
    
                    } else {
                        let modified = {
                            ...forming,
                            order_status: "pending",
                            payment_type: paidData.payment_type,
                            is_complete: false, 
                        }
                        fetchInsertSales(modified);
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
        if(statusFilter && statusFilter !== null && statusFilter !== ""){
            const getMatch = salesData.filter(({ delivery_status }) => delivery_status === statusFilter);
            setDupeDelivData(getMatch);
        } else {
            setDupeDelivData(salesData);
        }
    },[statusFilter])

    const tableHeader = () => {
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
                    name="delivery_status"
                    selectLabel="Select delivery status"
                    options={[{id: 1, type: "pending"},{id: 2, type: "loading"},{id: 3, type: "on the way"},{id: 4, type: "delivered"}, {id: 5, type: 'failed'}]}
                    optionKeys={["id", "type"]}
                    value={(selected) => setStatusFilter(selected.value)}
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
                <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                    aria-label="createInvModal"
                    onClick={(e) =>
                        handleModal(e, {
                            endpoint: "custType",
                            action: "insert",
                        })
                    }
                >
                    <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                    Pengantaran
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
                value: rowData.total_value, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };

    const formatedOrderDate = (rowData) => {
        return <span>{ConvertDate.convertToFullDate(rowData.ship_date, "/")}</span>;
    };
    
    const dgDateBody = (rowData) => {
        return <span>{ConvertDate.convertToFullDate(rowData.delivery_group_date, "/")}</span>;
    };

    const formatedNumberQty = (rowData) => {
        return <span>{Number(rowData.total_item)}</span>;
    };

    const actionCell = (rowData, rowIndex) => {
        return (
            <Dropdown drop={rowIndex == salesData.length - 1 ? "up" : "down"}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>

                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="handleBg"  as="button" aria-label="delivEditModal" 
                        onClick={(e) => handleModalWData(e, {endpoint: "delivery", id: rowData.delivery_id, action: 'update', ...rowData})}
                    >
                        <i className='bx bxs-edit'></i> Edit delivery
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="handleBg" as="button" aria-label="cancelDelivModal" onClick={(e) => handleModalWData(
                        e, 
                        {
                            endpoint: "delivery", 
                            id: rowData.delivery_id, 
                            action: 'canceled',
                            data: {...rowData}
                        })}>
                        <i className='bx bx-trash'></i> Cancel delivery
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    const actionCellDG = (rowData) => {
    return (
      <div style={{ display: "inline-flex" }}>
        <span
          className="table-btn detail-table-data"
          aria-label="viewDGList"
          onClick={(e) => handleModalWData(e, rowData)}
        >
          <i className="bx bx-show"></i>
        </span>
        <span
          className="table-btn edit-table-data"
          aria-label="writeDelivGroupsReport"
          onClick={(e) => {
            rowData.status == 2 ?
            handleModalWData(e, {
              id: rowData.delivery_group_id,
              employee_id: rowData.employee_id,
              delivery_group_date: rowData.delivery_group_date,
              action: "insert",
            })
            : toast.current.show({
                    severity: "error",
                    summary: "Forbidden",
                    detail: rowData.status == 3 &&  "Tidak dapat mengubah data pengantaran yang sudah dibatalkan",
                    life: 3000,
                });
          }}
        >
          <i className="bx bxs-edit"></i>
        </span>
      </div>
    );
  };

    const statusCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.delivery_status == "delivered" ? 'success'
                : rowData.delivery_status == "pending" ? "secondary" 
                : rowData.delivery_status == "loading" ? "warning" 
                : rowData.delivery_status == "on the way" ? "primary" 
                : rowData.delivery_status == "canceled" ? "danger" 
                : ""} light`}
            >
                {rowData.delivery_status}                                                                                
            </span>
        )
    };
    
    const statusDGCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.delivery_group_report ? 
                rowData.delivery_group_report?.report_status == 0 ? "warning"
                : rowData.delivery_group_report?.report_status == 1 ? "success"
                : "danger" : "secondary"
            } light`}
            >
                {
                    rowData.delivery_group_report ? 
                        rowData.delivery_group_report?.report_status == 0 ? "laporan sedang ditinjau"
                        : rowData.delivery_group_report?.report_status == 1 ? "laporan telah disetujui"
                        : "laporan ditolak" 
                    : "laporan belum dibuat"
                }                                                                                
            </span>
        )
    };
    const statusDeliveryCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.delivery_group?.status != 4 ? "warning"
                : "success"
            }`}
            >
                {
                    rowData.delivery_group?.status != 4 ? "dalam progress" : "selesai"
                }                                                                                
            </span>
        )
    };

    const paymentTypeCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.payment_type == "bayar nanti" ? 'danger'
                : rowData.payment_type == "lunas"? "primary"
                : rowData.payment_type == "sebagian"? "warning"
                : ""} light`}
            >
                {rowData.payment_type }                                                                                
            </span>
        )
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

    const deliveryAddress = (rowData) => {
        return(
            <p className="view-note" aria-label="viewDelivAddr" onClick={(e) => { 
                let data = {
                    textContent: rowData.delivery_address, 
                    title: "Delivery address"
                }
                setModalData(data);
                setShowModal("viewDelivAddr");
            }}>View address</p>
        )
    }
    

    const emptyStateHandler = () =>{
        return (
        <div style={{width: '100%', textAlign: 'center'}}>
            <img src={EmptyState} style={{width: '165px', height: '170px'}}  />
            <p style={{marginBottom: ".3rem"}}>No result found</p>
        </div>
        )
    }

    const mobileFilterFunc = (e) => {
        setMobileFilterValue(e.target.value);
        e.target.value == "" ? setMobileSearchMode(false):setMobileSearchMode(true)
    }

    const itemTemplate = (rowData, index) => {
        return (
        <div className="col-12" key={index} style={{position:'relative'}} 
            aria-label="viewDGList"
            onClick={(e) => handleModalWData(e, rowData)}
        >
            <div className='flex flex-column xl:align-items-start gap-2 static-shadow'
                style={{
                    backgroundColor: '#F8F9FD',
                    padding: '1rem',
                    boxShadow: '1px 1px 7px #9a9acc1a',
                    borderRadius: '9px',
                    position:'relative'
                }}
                // aria-label="salesEditModal" 
                // onClick={(e) => handleModalWData(e, {endpoint: "sales", id: rowData.order_id, action: 'update', ...rowData})}
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
                    rowData.employee?.img ? rowData.employee?.img
                        : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                    }
                    alt=""
                />
                </span>
                <div style={{width: '80%'}}>
                    <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600}}>{rowData.delivery_group_id}</p>
                    <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{ConvertDate.LocaleStringDate(rowData.delivery_group_date)}</p>
                    <div className='flex flex-row gap-2' style={{fontSize: 13, marginTop: '.5rem'}}>
                        <span className={`badge badge-${
                            rowData.delivery_group_report ? 
                            rowData.delivery_group_report?.report_status == 0 ? "warning"
                            : rowData.delivery_group_report?.report_status == 1 ? "success"
                            : "danger" : "secondary"
                        } light`}
                        >
                            {
                                rowData.delivery_group_report ? 
                                    rowData.delivery_group_report?.report_status == 0 ? "laporan sedang ditinjau"
                                    : rowData.delivery_group_report?.report_status == 1 ? "laporan telah disetujui"
                                    : "laporan ditolak" 
                                : "laporan belum dibuat"
                            }                                                                                
                        </span>
                        <span className={`badge badge-${
                            rowData.delivery_group_report ? 
                            rowData.delivery_group_report?.report_status == 0 ? "warning"
                            : rowData.delivery_group_report?.report_status == 1 ? "success"
                            : "danger" : "secondary"
                        } light`}
                        >
                            {
                                rowData.delivery_group_report ? 
                                    rowData.delivery_group_report?.report_status == 0 ? "menunggu konfirmasi"
                                    : rowData.delivery_group_report?.report_status == 1 ? "selesai"
                                    : "dibatalkan" 
                                : "ditunda"
                            }                                                                                
                        </span>
                        {/* <span className={`badge badge-${
                            rowData.delivery_group_report ? "success" 
                            : rowData.delivery_group_report?.report_status == 0 ? "warning"
                            : "danger"
                        } light`}
                        >
                            {
                                rowData.delivery_group_report ? "selesai" 
                                : rowData.delivery_group_report?.report_status == 0 ? "menunggu konfirmasi"
                                : "dalam proses"
                            }                                                                                
                        </span> */}
                        {/* {rowData.invoice ?
                            (
                            <span className="verified-inv">
                                <i className='bx bx-check-shield'></i>
                            </span>
                            ):(
                            <span className="unverified-inv">
                                <i className='bx bx-shield-x'></i>
                            </span>
                            )
                        } */}
                        
                    </div>
                </div>
            </div>
            <div className="flex flex-column gap-1" 
                style={{
                    textTransform: 'capitalize', 
                }}
            >
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Karyawan:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>{rowData.employee?.name}</p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total item:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        {Number(rowData.total_item)}
                    </p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total nilai:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        <NumberFormat intlConfig={{
                            value: rowData.total_value, 
                            locale: "id-ID",
                            style: "currency", 
                            currency: "IDR",
                        }} 
                        />
                    </p>
                </div>
                {/* <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Tipe pembayaran:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        <span className={`badge badge-${
                            rowData.payment_type == "bayar nanti" ? 'danger'
                            : rowData.payment_type == "lunas"? "primary"
                            : rowData.payment_type == "sebagian"? "warning"
                            : ""} light`}
                        >
                            {rowData.payment_type }                                                                                
                        </span>
                    </p>
                </div> */}
            </div>
            </div>
            <Dropdown drop={dg.length == 1 ? "down" : index == dg.length - 1 ? "up" : "down"}  style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="1" as="button" 
                        // aria-label="salesEditModal" 
                        // onClick={(e) => handleModalWData(e, {endpoint: "sales", id: rowData.order_id, action: 'update', ...rowData})}
                    >
                        <i className='bx bx-show'></i> Lihat data
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="1" as="button" 
                        aria-label="writeDelivGroupsReport"
                        onClick={(e) => {
                            e.stopPropagation();
                            rowData.status == 2 ?
                                handleModalWData(e, {
                                    id: rowData.delivery_group_id,
                                    employee_id: rowData.employee_id,
                                    delivery_group_date: rowData.delivery_group_date,
                                    action: "insert",
                                })
                            : toast.current.show({
                                severity: "error",
                                summary: "Forbidden",
                                detail: rowData.status == 3 &&  "Tidak dapat mengubah data pengantaran yang sudah dibatalkan",
                                life: 3000,
                            });
                        }}
                    >
                       <i className='bx bxs-edit'></i> Tulis laporan
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
        );
    };
    
    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((sales, index) => {
            return itemTemplate(sales, index);
        });

        return (
        <>
        <div className="flex flex-column gap-2" style={{ width: "100%" }}>
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
                        <i className='bx bx-x'></i>
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
            </div>
        </div>
        <div className="grid gap-1">{list}</div>
        </>
        );
    };

    useEffect(() => {
        if(refetch){
            fetchAllDG();
            setShowModal("");
            setRefetch(false);
        }
    }, [refetch]);

    useEffect(() => {
        fetchAllDelivery();
        fetchAllCust();
        fetchAllProd();
        fetchAllDG();
    },[])

    useEffect(() => {
        if(salesData && allProdData && custData && dg){
            setLoading(false);
        } 
    },[salesData, allProdData, custData, dg]);

    useEffect(() => {
        initFilters();
    }, []);
    
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
                                    <div className={`tab-indicator ${openTab === "deliveryGroupListTab" ? "active" : ""}`}  
                                        id='deliveryGroupListTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">list pengantaran</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "deliveryListTab" ? "active" : ""}`}  
                                        id='deliveryListTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">delivery list</span>
                                    </div>
                                    {/* <div className={`tab-indicator ${openTab === "addSalesTab" ? "active" : ""}`} 
                                        id='addSalesTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">add sales data</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "completeTab" ? "active" : ""}`} 
                                        id='completeTab' 
                                        onClick={(e) => handleClick(e)}>
                                        <span className="tab-title">completed order</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "returnTab" ? "active" : ""}`} 
                                        id='returnTab' 
                                        onClick={(e) => handleClick(e)}>
                                        <span className="tab-title">return order</span>
                                    </div>
                                    <div className={`tab-indicator ${openTab === "canceledTab" ? "active" : ""}`} 
                                        id='canceledTab' 
                                        onClick={(e) => handleClick(e)}>
                                        <span className="tab-title">canceled order</span>
                                    </div> */}
                                </div>
                                <div className="tabs-content" style={openTab === "deliveryListTab" ? {display: "block"} : {display: "none"}}>
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
                                         <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={deliveryList}
                                                size="normal"
                                                removableSort
                                                // stripedRows
                                                // selectionMode={"checkbox"}
                                                // selection={selectedSales}
                                                // onSelectionChange={(e) => {
                                                //     setSelectedSales(e.value);
                                                // }}
                                                dataKey="delivery_id"
                                                tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                                filters={salesFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "delivery_id",
                                                    "order_id",
                                                    "tracking_number",
                                                    "ship_date",
                                                    "courier_id",
                                                    "courier_name",
                                                    "order.customer.name",
                                                    "delivery_status",
                                                    "shipped_date",
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
                                                field="delivery_id"
                                                header="ID Pengiriman"
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="order_id"
                                                header="ID Order"
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="tracking_number"
                                                header="Nomor Resi"
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="ship_date"
                                                header="Tanggal Pengiriman"
                                                body={formatedOrderDate}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                field="courier_id"
                                                header="ID Kurir"
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="courier_name"
                                                header="Kurir"
                                                filter 
                                                filterPlaceholder="Search by courier name"
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                             <Column
                                                field="order.customer.name"
                                                header="Pelanggan"
                                                filter 
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                field="delivery_address"
                                                header="alamat"
                                                filter 
                                                showFilterMenu={false}
                                                filterMenuStyle={{ width: '100%' }}
                                                filterPlaceholder={"order type"}
                                                body={deliveryAddress}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: 'uppercase' }}
                                            ></Column>
                                            <Column
                                                field="delivery_status"
                                                header="status"
                                                body={statusCell}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                filter
                                                showFilterMenu={false} 
                                                filterMenuStyle={{ width: '100%' }}
                                                filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="aksi"
                                                body={(rowData, rowIndex) => actionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            </DataTable>
                                        </div>
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
                                                    {dupeDelivData ? 
                                                        ( 
                                                            dupeDelivData.map((sales, idx) => {
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
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="delivEditModal" onClick={(e) => handleModalWData(e, {endpoint: "sales", id: sales.order_id, action: 'update', ...sales})}>
                                                                                        <i className='bx bxs-edit'></i> Edit sales
                                                                                    </Dropdown.Item>
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="cancelDelivModal" onClick={(e) => handleModalWData(
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
                                <div className="tabs-content" style={openTab === "deliveryGroupListTab" ? {display: "block"} : {display: "none"}}>
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
                                        {!isMobile && !isMediumScr ? 
                                        (
                                        <div className="mt-4">
                                            <div className="flex justify-content-between" style={{ width: "100%", paddingTop: 16, paddingBottom: 32 }}>
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
                                                        name="delivery_status"
                                                        selectLabel="Select delivery status"
                                                        options={[{id: 1, type: "pending"},{id: 2, type: "loading"},{id: 3, type: "on the way"},{id: 4, type: "delivered"}, {id: 5, type: 'failed'}]}
                                                        optionKeys={["id", "type"]}
                                                        value={(selected) => setStatusFilter(selected.value)}
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
                                                
                                                </div>
                                            </div>
                                            <DataTable
                                                className="p-datatable"
                                                value={dg}
                                                size="normal"
                                                removableSort
                                                // stripedRows
                                                // selectionMode={"checkbox"}
                                                // selection={selectedSales}
                                                // onSelectionChange={(e) => {
                                                //     setSelectedSales(e.value);
                                                // }}
                                                dataKey="delivery_group_id"
                                                tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                                filters={salesFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "delivery_group_id",
                                                    "employee_id",
                                                    "delivery_group_date",
                                                    "total_item",
                                                    "total_value",
                                                    "status",
                                                    "employee.name",
                                                ]}
                                                
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setSalesFilters(e.filters)}
                                                // header={tableHeader}
                                                paginator
                                                totalRecords={totalRecords}
                                                rows={50}
                                            >
                                            {/* <Column
                                                selectionMode="multiple"
                                                headerStyle={{ width: "3.5rem" }}
                                            ></Column> */}
                                            <Column
                                                field="delivery_group_id"
                                                header="ID Pengantaran"
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="delivery_group_date"
                                                header="tanggal"
                                                sortable
                                                body={dgDateBody}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="employee.name"
                                                header="ditugaskan"
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="total_item"
                                                header="jumlah barang"
                                                body={formatedNumberQty}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                field="status"
                                                header="status pengantaran"
                                                body={statusDeliveryCell}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                filter
                                                showFilterMenu={false} 
                                                filterMenuStyle={{ width: '100%' }}
                                                filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field="status"
                                                header="status laporan"
                                                body={statusDGCell}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                filter
                                                showFilterMenu={false} 
                                                filterMenuStyle={{ width: '100%' }}
                                                filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="aksi"
                                                body={(rowData, rowIndex) => actionCellDG(rowData)}
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            </DataTable>
                                            
                                        </div>
                                        ):(
                                        <>
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
                                                    // aria-label="viewInvModal"
                                                    // onClick={(e) =>
                                                    //     handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                                                    // }
                                                >
                                                    <i className="bx bx-show"></i> PDF (.pdf)
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    eventKey="1"
                                                    as="button"
                                                    // aria-label="editInvModal"
                                                    // onClick={(e) => handleModal(e, inv.invoice_id)}
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
                                        <DataView value={dg} listTemplate={listTemplate} style={{marginTop: '.5rem'}} />
                                        </>
                                        )}
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
                                                    {dupeDelivData ? 
                                                        ( 
                                                            dupeDelivData.map((sales, idx) => {
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
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="delivEditModal" onClick={(e) => handleModalWData(e, {endpoint: "sales", id: sales.order_id, action: 'update', ...sales})}>
                                                                                        <i className='bx bxs-edit'></i> Edit sales
                                                                                    </Dropdown.Item>
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="cancelDelivModal" onClick={(e) => handleModalWData(
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
                            </div>
                        </div>
                    </div>
                </div>                         
            {/* </main> */}

            {showModal === "salesDetailModal" ? 
            (
                <SalesDetailModal show={showModal === "salesDetailModal" ? true : false} onHide={handleCloseModal} data={showModal == "salesDetailModal" ? modalData : ""} />
            )
            : showModal === "delivEditModal" ?
            (
                <SalesEditModal show={showModal === "delivEditModal" ? true : false} onHide={handleCloseModal} data={showModal == "delivEditModal" ? modalData : ""} />
            )
            : showModal === "cancelDelivModal" ?
            (
                <ConfirmModal show={showModal === "cancelDelivModal" ? true : false} onHide={handleCloseModal} 
                    data={showModal === "cancelDelivModal" ? modalData : ""} 
                    msg={"Are you sure want to delete this data?"}
                />
            )
            : showModal === "confirmationModal" ?
            (
                <ConfirmModal show={showModal === "confirmationModal" ? true : false} onHide={handleCloseModal} 
                    data={showModal === "confirmationModal" ? modalData : ""}  
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
            : showModal === "viewDelivAddr" ? 
            (
                <ModalTextContent 
                    show={showModal === "viewDelivAddr" ? true : false} 
                    onHide={handleCloseModal} 
                    data={showModal === "viewDelivAddr" ? modalData : null} 
                />
            )
            : showModal === "createDelivGroups" || showModal === "editDelivGroups" ? 
            (
                <DelivGroupsModal
                    show={showModal === "createDelivGroups" || "editDelivGroups" ? true : false}
                    onHide={handleCloseModal}
                    data={showModal === "createDelivGroups" || "editDelivGroups" ? modalData : ""}
                    returnAct={(act) => 
                    act ? setRefetch(true) 
                    : setRefetch(false)
                    }
                />
            )
            : showModal === "viewDGList" ?
            (
                <DeliveryGroupListModal
                    show={showModal === "viewDGList" ? true : false} 
                    onHide={handleCloseModal} 
                    data={showModal === "viewDGList" ? modalData : null} 
                    
                    returnAct={(act) => 
                        act ? setRefetch(true) 
                        : setRefetch(false)
                    }
                    // callModal={(modal, data) => handleModal(modal, data)}
                />
            )
            : showModal === "confirmModal" ?
            (
                <ConfirmModal 
                    show={showModal === "confirmModal" ? true : false} 
                    onHide={handleCloseModal} 
                    data={showModal === "confirmModal" && modalData ? modalData : ""} 
                    msg={modalMsg}
                    multiple={true} 
                    stack={1} 
                    returnValue={(value) => setRefetch(value)}
                />
            )
            // : showModal === "writeDelivGroupsReport" ?
            // (
            //     <DeliveryGroupListReportModal 
            //         show={showModal === "writeDelivGroupsReport" ? true : false} 
            //         onHide={handleCloseModal} 
            //         data={showModal === "writeDelivGroupsReport" && modalData ? modalData : ""} 
            //         // msg={modalMsg}
            //         multiple={true} 
            //         stack={1} 
            //         returnValue={(value) => setRefetch(value)}
            //     />
            // )
            : showModal === "writeDelivGroupsReport" ?
            (
                <WriteDelivGroupItemsModal
                    show={showModal === "writeDelivGroupsReport" ? true : false}
                    onHide={handleCloseModal}
                    data={showModal === "writeDelivGroupsReport" ? modalData : ""}
                    returnAct={(act) => 
                        act ? setRefetch(true) 
                        : setRefetch(false)
                    }
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