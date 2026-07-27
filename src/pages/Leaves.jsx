import React, { useState, useEffect, useRef, useReducer } from 'react';
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
import FetchApi from '../assets/js/fetchApi.js';
import {
    Accordion, Col, Collapse, Dropdown, Form, Row,
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
// import FetchAPI from '../assets/js/FetchAPI.js';

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
import LoadingGif from '../assets/images/loading.gif';

// Import Swiper styles
import 'swiper/css';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { Skeleton } from 'primereact/skeleton';
import LeavesModal from '../elements/Modal/LeavesModal.jsx';
import LeaveTypesModal from '../elements/Modal/LeaveTypesModal.jsx';

export default function Leaves({ handleSidebar, showSidebar }) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    const [lazyLoading, setLazyLoading] = useState(false);

    const toast = useRef(null);
    const toastUpload = useRef(null);
    const [progress, setProgress] = useState(0);
    const mobileSearchInput = useRef(null);
    const [mobileSearchMode, setMobileSearchMode] = useState(false);
    const [openTab, setOpenTab] = useState('leavesTab');
    const [salesListObj, setSalesList] = useState(null);
    const [showModal, setShowModal] = useState("");
    const [modalMsg, setModalMsg] = useState("");
    const [filterCust, setFilteredCust] = useState([]);
    const [filterProd, setFilteredProd] = useState([]);
    const [custData, setCustData] = useState(null);
    const [allProdData, setAllProd] = useState(null);
    const [leaveTypes, setLeavesType] = useState(null);
    // const [leaveTypes, setLeavesType] = useState(null);
    const [chooseCust, setCust] = useState("");
    // const [stateAddSalesTab, setStateAddSalesTab] = useState(false);
    const [confirmVal, setConfirm] = useState(false);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: {
            global: { value: '', matchMode: FilterMatchMode.CONTAINS }
        }
    });
    const [totalRecord, setTotalRecord] = useState(10);
    const [leavesData, setLeavesData] = useState(null || []);
    const [leavesDataView, setLeavesDataView] = useState(null || []);
    const [showToast, setShowToast] = useState(false);
    const [cantCanceled, setCantCanceled] = useState(false);
    const [toastContent, setToastContent] = useState({ variant: "", msg: "", title: "" });
    const [salesItems, setSalesItems] = useState([]);

    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");
    const [salesFiltersMobile, setSalesFiltersMobile] = useState(null);
    const [refetch, setRefetch] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [deleteLT, setConfirmDelLT] = useState(false);

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
        formState: { errors },
    } = useForm({
        defaultValues: {
            customer_id: '',
            order_date: new Date(),
            ship_date: new Date(),
            order_type: ''
        }
    });

    const onPage = (event) => {
        setLazyState(event);
    };
    const onPageView = (event) => {
        let _lazyState;
        _lazyState = { ...lazyState };
        _lazyState.first = event.first;
        _lazyState.page = event.page;
        setLazyState(_lazyState);
    }; 


    const fetchAllCust = async () => {
        await axiosPrivate.get("/pure-customers")
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

    const fetchAllLeaveType = async () => {
        await axiosPrivate.get("/leave-types/all")
            .then(response => {
                setLeavesType(response.data);
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

    const fetchInsertSales = async (body, deliveryModel) => {
        salesItems.map(e => {
            e.discount_prod_rec = e.discount;
        });

        let bodyData = JSON.stringify({
            sales: body,
            order_items: salesItems,
            delivery: deliveryModel,
            paidData: paidData ? paidData : null,
            guest_mode: guestMode
        });
        // let deliveryBody;
        await axiosPrivate.post("/sales/write", bodyData)
            .then(resp => {
                console.log(resp.data)
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Order baru berhasil dibuat",
                    life: 3500,
                });
                // // check if customer has order credit with order id null
                // axiosPrivate.get(`/orders-credit/available/${resp.data.customer_id}`)
                // .then(resp1 => {
                //     if(resp1.data.length > 0){
                //         // update order credits => order id to current order id
                //         const order_credit_id = resp1.data[0].order_credit_id;
                //         const order_id = JSON.stringify({order_id: resp.data.order_id});
                //         axiosPrivate.patch(`/order-credit/${order_credit_id}`, order_id)
                //         .then(resp2 => {
                //             toast.current.show({
                //                 severity: "success",
                //                 summary: "Sukses",
                //                 detail: "order kredit ditambahkan",
                //                 life: 3500,
                //             });

                //         })
                //         .catch(err2 => {
                //             toast.current.show({
                //                 severity: "error",
                //                 summary: "Failed",
                //                 detail: `Failed to update order credit`,
                //                 life: 3000,
                //             });
                //         })
                //     }
                // })
                // .catch(err1 => {
                //     console.error('something error in order credit');
                // })

                // salesItems.map(e => {
                //     e.order_id = resp.data.order_id;
                //     e.discount_prod_rec = e.discount;
                // });

                // if(resp.data.order_type == 'delivery' && deliveryModel.courier_id !== "" || deliveryModel.courier_id){
                //     let delivery = {
                //         order_id: resp.data.order_id,
                //         courier_id: deliveryModel.courier_id,
                //         courier_name: deliveryModel.courier_name,
                //         delivery_address: deliveryModel.delivery_address,
                //         ship_date: deliveryModel.ship_date
                //     }
                //     deliveryBody = JSON.stringify(delivery);
                // } 
                if (resp.data.order_credit && resp.data.order_credit.length > 0) {
                    setCurrOrderCredit(resp.data.order_credit[0].return_order.refund_total);
                }

                setCurrentOrder(resp.data.order);
                setDiscVal(resp.data.order.order_discount ? Number(resp.data.order.order_discount) : 0);
                // updateTotalSalesCust(resp.data);
                reset();
                setResetInputWSelect(true);
                setValue('order_type', '');
                setSalesItems([]);
                // setAddOrderItem(true);
                if (resp.data.checkInv) {
                    axiosPrivate.get("/inv/check", { params: { custid: resp.data.order.customer_id, ispaid: false, type: "bayar nanti" } })
                        .then(resp2 => {
                            if (resp2.data && resp2.data.length > 0) {
                                let orderId = JSON.parse(resp2.data[0].order_id);
                                let newOrderId = [...orderId, resp.data.order.order_id];
                                let totalPayment = 0;

                                if (resp2.data[0].payments && resp2.data[0].payments.length > 0) {
                                    totalPayment = resp2.data[0].payments.reduce((prev, curr) => prev + Number(curr.amount_paid), 0);
                                }

                                let modelInv = {
                                    order_id: JSON.stringify(newOrderId),
                                    subtotal: Number(resp2.data[0].subtotal) + Number(data.subtotal),
                                    amount_due: Number(resp2.data[0].amount_due) + Number(data.grandtotal) + (currOrderCredit ? Number(currOrderCredit) : 0),
                                    total_discount: Number(resp2.data[0].total_discount) + Number(discVal),
                                    // remaining_payment: Number(resp.data[0].remaining_payment) + Number(data.grandtotal),
                                    remaining_payment: (Number(resp2.data[0].remaining_payment) + Number(data.grandtotal) + (currOrderCredit ? Number(currOrderCredit) : 0)) - totalPayment,
                                };
                                setExistInv({ invId: resp2.data[0].invoice_id, invData: modelInv });
                                setSalesList({ endpoint: 'inv', action: 'warning', items: { ...resp2.data[0] } });
                                setShowModal("existInvOrderModal");
                            }

                            // fetchAllSales();
                            // fetchAllRO();
                            // refetch
                            setRefetch(true);
                            resp.data.customer_id && fetchDetailedCust(resp.data.customer_id);
                        })
                        .catch(err => {
                            toast.current.show({
                                severity: "error",
                                summary: "Failed",
                                detail: `Failed to check invoice`,
                                life: 3000,
                            });
                        })
                } else {
                    // fetchAllSales();
                    // fetchAllRO();
                    setRefetch(true);
                    !guestMode && fetchDetailedCust(resp.data.customer_id);
                }

                if (resp.data.delivery) {
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Delivery created",
                        life: 3500,
                    });
                }
                // return fetchInsertMultipleOrderItem(resp.data.order_id, salesItems);            
            })
            // .then(orderItemResp => {
            //     if(deliveryBody){
            //         fetchCreateDelivery(deliveryBody);
            //     }

            // })
            .catch(error => {
                console.log(error)
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: `Failed to add new data: ${error}`,
                    life: 3000,
                });
            })
    };

    const fetchDelLeaveType = async(id) => {
        await axiosPrivate.delete(`/leave-type/del/${id}`)
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Berhasil menghapus jenis cuti",
                life: 1500,
            });
            setShowModal(""); //change to refecth leave types data
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal menghapus jenis cuti",
                life: 3000,
            });
        })
    };

    const handleModalWData = (e, dataToSend, leavesDataProd) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "salesDetailModal":
                data = {
                    origin: dataToSend,
                    // items: leavesDataProd != null ? JSON.parse(leavesDataProd) : leavesDataProd
                }
                setSalesList(dataToSend);
                setShowModal("salesDetailModal");
                break;
            case "salesEditModal":
                // items: leavesDataProd != null ? JSON.parse(leavesDataProd) : leavesDataProd
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

    const handleModal = (e, modalData) => {
        switch (e.currentTarget.ariaLabel) {
            case 'addLeaves':
                setModalData(modalData);
                setShowModal("addLeaves");
                break;
            case 'addLeaveTypes':
                setModalData(modalData);
                setShowModal("addLeaveTypes");
                break;
            case 'editLeaveType':
                setModalData(modalData);
                setShowModal("editLeaveType");
                break;
            case 'confirmDelLT':
                setModalData(modalData);
                setModalMsg(`Yakin ingin menghapus jenis cuti ini?`);
                setShowModal("confirmDelLT");
                break;
            case 'createPayment':
                let data = {
                    action: 'insert',
                    guest_mode: guestMode
                }
                setSalesList(data);
                setShowModal("createPayment");
                break;
            case 'returnOrderModal':
                setShowModal("returnOrderModal");
                break;
        }
    }

    const handleClick = (e) => {
        switch (e.target.id) {
            case "leavesTab":
                setOpenTab("leavesTab");
                break;
            case "attendanceTab":
                setOpenTab("attendanceTab");
                break;
            case "leaveTypesTab":
                setOpenTab("leaveTypesTab");
                break;
        }
    };

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if (refToThis.current
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
        }, [ref])

    };
    handleClickSelect(refToThis);
    handleClickSelect(refToProd);
    handleClickSelect(refToCourier);

    const handleAutoComplete = (custName) => {
        if (custData && custName !== "") {
            let filteredCust = custData.filter(item => item.name.includes(custName.toLowerCase()));
            if (filteredCust.length === 0) {
                setOpenPopup(false);
                setFilteredCust(filteredCust);
            } else {
                setOpenPopup(true);
                setFilteredCust(filteredCust);
            }
        }
        else if (custName || custName === "") {
            setOpenPopup(true);
            setFilteredCust(custData);
        }
        else {
            setOpenPopup(false);
            setFilteredCust("error db");
            setToastContent({ variant: "danger", msg: "Database failed" });
            setShowToast(true);
        }
    };

    const handleChooseCust = (e) => {
        setCust(e);
        setValue('customer_id', e.customer_id);
        setValue('name', e.name);
        setOpenPopup(false);
    }

    const handleFilterCust = () => {
        handleAutoComplete(getValues('name'));
        setCust(null);
    }

    const handleKeyDown = (e) => {
        if (e) {
            setCust(null);
        }
    }

    useEffect(() => {
        if (!chooseCust) {
            setValue('customer_id', '');
        } else {
            clearErrors("name");
        }
    }, [chooseCust]);


    const handleEdit = (val, idx) => {
        let duplicate = [...salesItems];
        duplicate[idx].quantity = val;
        setSalesItems(duplicate);

    }

    const delSalesItems = (idx) => {
        salesItems.splice(idx, 1);
        handleUpdateEndNote();
    }

    const handleCloseModal = () => {
        setShowModal("");
    }

    const onSubmitSales = (formData, e) => {
        if (!salesItems || salesItems.length < 1) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Tambahkan produk terlebih dahulu",
                life: 3500,
            });
        } else {
            let objStr;
            let grandQty = 0;
            let subtotal = 0;

            if (paidData) {
                objStr = [...salesItems];

                objStr.forEach((e) => {
                    subtotal += Number(e.sell_price) * e.quantity
                    grandQty += Number(e.quantity)
                });

                let forming = {
                    order_date: formData.order_date,
                    order_type: formData.order_type,
                    note: formData.note,
                    source: 'main',
                    subtotal: salesEndNote ? salesEndNote.subtotal : null,
                    grandtotal: salesEndNote ? salesEndNote.grandtotal : null,
                    order_discount: discVal,
                }

                !guestMode ? forming.customer_id = formData.customer_id : forming.guest_name = formData.name;

                let deliveryModel = null;
                if (delivSwitch) {
                    deliveryModel = {
                        courier_id: formData.courier_id,
                        courier_name: formData.courier_name,
                        ship_date: formData.ship_date,
                        delivery_address: formData.delivery_address,
                    }
                }

                if (formData.order_type == "walk-in") {
                    forming.shipped_date = formData.order_date;
                }

                if (paidData.payment_type == "lunas") {
                    let modified = {
                        ...forming,
                        order_status: "completed",
                        payment_type: paidData.payment_type,
                        is_complete: true,
                    }
                    fetchInsertSales(modified, deliveryModel);

                } else if (paidData.payment_type == "sebagian") {
                    let modified = {
                        ...forming,
                        order_status: "pending",
                        payment_type: paidData.payment_type,
                        is_complete: false,
                    }
                    fetchInsertSales(modified, deliveryModel);
                    // fetchInvStatusCust(false, e.customer_id, paidData.payment_type);
                } else if (paidData.payment_type == "bayar nanti") {
                    if (Number(chooseCust.total_debt) > Number(chooseCust.debt_limit) && !confirmVal) {
                        let send = { endpoint: "sales", action: 'warning', data: forming };

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
        if (confirmVal) {
            handleSubmit(onSubmitSales, onError)();
            setShowModal("");
        }
    }, [confirmVal])

    const onError = (errors, e) => {
        if (!guestMode && getValues('name') != "" && errors.customer_id) {
            setError("name", { type: 'required', message: 'Pilih pelanggan yang benar!' });
        }
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "There is an error with required field",
            life: 3500,
        });
    }

    useEffect(() => {
        // fetchAllSales();
        // fetchAllCanceledSales();
        //     // fetchAllCourier();
        //     // fetchCustType();
        //     // fetchStatus();
        fetchAllCust();
        fetchAllLeaveType();
        // fetchAllRO();
    }, [])

    useEffect(() => {
        if (refetch) {
            // fetchAllSales();
            // fetchAllCourier();
            // // fetchCustType();
            // // fetchStatus();
            // fetchAllCust();
            // fetchAllRO();
            lazyLoad();  //sales data
            lazyLoadCanceled(); //sales canceled
            setShowModal("");
            setRefetch(false);
        }
    }, [refetch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(globalFilterValue);
        }, 500); // 500ms delay

        return () => clearTimeout(timer); // Cleanup and clear timer if user types again
    }, [globalFilterValue]);

    useEffect(() => {
        let _lazyState;
        _lazyState = { ...lazyState };

        _lazyState.filters.global.value = debouncedTerm;
        _lazyState.first = 0; // CRITICAL: Reset pagination view to page 1 for new searches
        _lazyState.page = 1;
        setLazyState(_lazyState);

    }, [debouncedTerm]);

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
                            aria-label="allSales"
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
                        aria-label="addLeaves"
                        onClick={(e) =>
                            handleModal(e, {
                                action: "insert",
                            })
                        }
                    >
                        <i className="bx bx-plus"></i>
                        Cuti Karyawan
                    </button>
                    {/* cuti karyawan modal */}
                    <LeavesModal
                        show={showModal === "addLeaves" ? true : false}
                        onHide={handleCloseModal}
                        data={showModal === "addLeaves" ? modalData : ""}
                        returnAct={(act) => 
                        act == true ? setRefetch(true) 
                        : act == "empty" ? setRefetch("empty")
                        : setRefetch(false)
                        }
                    />
                </div>
            </div>
        );
    };
    const tableHeaderLeaveTypes = (e) => {
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
                            aria-label="allSales"
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
                        aria-label="addLeaveTypes"
                        onClick={(e) =>
                            handleModal(e, {
                                action: "insert",
                            })
                        }
                    >
                        <i className="bx bx-plus"></i>
                        jenis cuti
                    </button>
                    
                </div>
            </div>
        );
    };

    const formatedNumber = (rowData) => {
        return (
            <span>{Number(rowData.day_of_tolerance)}</span>
        )
    };

    const empWithImg = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="user-img">
          <img
            src={
              rowData.employee.img && rowData.employee.img != ""
                ? rowData.employee.img
                : "../src/assets/images/Avatar 2.jpg"
            }
            alt=""
          />
        </span>
        {rowData.employee.name}
      </div>
    );
  };

    const clearFilter = () => {
        setMobileSearchMode(false);
        const _lazyState = { ...lazyState };
        _lazyState.filters.global.value = '';
        _lazyState.first = 0;
        _lazyState.page = 1;
        setLazyState(_lazyState);
    };

    const onFilterSales = (event) => {
        event['first'] = 0;
        setLazyState(event);
    };

    const onGlobalFilterChange = (e) => {
        setActiveSearch(e.currentTarget.ariaLabel);
        setGlobalFilterValue(e.target.value);
    };

    const formatedGrandtotal = (rowData) => {
        return (
            <NumberFormat intlConfig={{
                value: rowData.grandtotal,
                locale: "id-ID",
                style: "currency",
                currency: "IDR",
            }} />
        )
    };

    const formatedRefundtotal = (rowData) => {
        return (
            <NumberFormat intlConfig={{
                value: rowData.refund_total,
                locale: "id-ID",
                style: "currency",
                currency: "IDR",
            }} />
        )
    };

    const viewReturnMethod = (rowData) => {
        return (
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

    const customerOrGuestName = (rowData) => {
        return <span>{rowData.customer ? rowData.customer.name : rowData.guest_name}</span>;
    };

    const customerOrGuest = (rowData) => {
        return <span>{rowData.customer_id ? rowData.customer_id : "-"}</span>;
    };

    const formatedReturnDate = (rowData) => {
        return <span>{ConvertDate.convertToFullDate(rowData.return_date, "/")}</span>;
    };

    const onRowClick = ({ data, index }) => {
        data.invoice ?
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Tidak dapat mengubah order jika sudah masuk invoice",
                life: 3000,
            })
            : handleModalWData({ currentTarget: { ariaLabel: "salesEditModal" } }, { endpoint: "sales", id: data.order_id, action: 'update', ...data })
    }

    const actionCell3 = (rowData, rowIndex) => {
        return (
            <div style={{ display: "inline-flex" }}>
                <span
                    className="table-btn edit-table-data"
                    aria-label="editLeaveType"
                    onClick={(e) => {
                        handleModal(e, {
                            id: rowData.leave_type_id,
                            action: "update",
                            rowData,
                        });
                    }}
                >
                    <i className="bx bxs-edit"></i>
                </span>
                <span
                    className="table-btn del-table-data"
                    aria-label="confirmDelLT"
                    onClick={(e) =>
                        handleModal(e, {
                            endpoint: "LT",
                            id: rowData.leave_type_id,
                            action: "delete",
                        })
                    }
                >
                    <i className="bx bx-trash"></i>
                </span>
                
            </div>
           
        );
    };

    const statusCell = (rowData) => {
        return (
            <span className={`badge badge-${rowData.order_status == "completed" ? 'success'
                : rowData.order_status == "pending" ? "secondary"
                    : rowData.order_status == "in-delivery" ? "warning"
                        : rowData.order_status == "canceled" ? "danger"
                            : rowData.order_status == "confirmed" ? "primary"
                                : ""} light`}
            >
                {
                    rowData.order_status == "completed" ? 'selesai'
                        : rowData.order_status == "pending" ? 'pending'
                            : rowData.order_status == "in-delivery" ? 'in-delivery'
                                : rowData.order_status == "canceled" ? 'batal'
                                    : rowData.order_status == "confirmed" ? 'dikonfirmasi'
                                        : ""
                }
            </span>
        )
    };

    const invoiced = (rowData) => {

        return (
            rowData.invoice ?
                (
                    <span className="verified-inv">
                        <i className='bx bx-check-shield' ></i>
                    </span>
                ) : (
                    <span className="unverified-inv">
                        <i className='bx bx-shield-x'></i>
                    </span>
                )
        )
    }

    const returnStatusCell = (rowData) => {
        return (
            <span className={`badge badge-${rowData.status == "dikonfirmasi" ? 'success'
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
        return (
            <span className={`badge badge-${rowData.payment_type == "bayar nanti" ? 'danger'
                : rowData.payment_type == "lunas" ? "primary"
                    : rowData.payment_type == "sebagian" ? "warning"
                        : ""} light`}
            >
                {rowData.payment_type}
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
            <span className={`badge badge-${option == "completed" ? 'success'
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
                style={{ width: '100%' }}
            />
        )
    };


    const emptyStateHandler = () => {
        return (
            <div style={{ width: '100%', textAlign: 'center', padding: '1rem 0' }}>
                <img src={EmptyState} style={{ width: '145px', height: '150px' }} />
                <p style={{ marginBottom: ".3rem" }}>No result found</p>
            </div>
        )
    };

    // list setting
    const orderTemplate = (rowData, index) => {
        return (
            <div key={rowData.product_id} >
                <Swiper slidesPerView={'auto'} style={{ width: '100%', height: 'auto' }}>
                    <SwiperSlide style={{ width: '100%' }}>
                        <div className='flex flex-column xl:align-items-start gap-1'
                            style={{
                                backgroundColor: '#ffffff',
                                padding: '1rem',
                                boxShadow: '1px 1px 7px #9a9acc1a',
                                borderRadius: '9px',
                                position: 'relative',
                                width: '100%',
                                minHeight: '125px'
                            }}
                            aria-label="custDetailModal"
                            onClick={(e) => handleModal(e, rowData)}
                        >

                            <div className="flex align-items-center gap-3"
                                style={{
                                    textTransform: 'capitalize',
                                }}
                            >
                                <span className="user-img" style={{ marginRight: 0 }}>
                                    <img
                                        src={
                                            rowData.img ? rowData.img
                                                : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                                        }
                                        alt=""
                                    />
                                </span>
                                <div className='flex flex-column' style={{ width: '80%' }}>
                                    <div className='mb-1'>
                                        <p style={{ marginBottom: 0, fontSize: 14, fontWeight: 600, maxWidth: '130px' }}>{`${rowData.product_name} ${rowData.variant}`}</p>
                                        <p style={{ marginBottom: 0, fontSize: 11, color: '#7d8086', maxWidth: '130px' }}>
                                            <NumberFormat intlConfig={{
                                                value: rowData.sell_price,
                                                locale: "id-ID",
                                                style: "currency",
                                                currency: "IDR",
                                            }}
                                            />
                                        </p>
                                        {rowData.discProd != 0 ?
                                            (
                                                <p style={{ marginBottom: 0, fontSize: 11, color: '#7d8086', maxWidth: '130px' }}>
                                                    -<NumberFormat intlConfig={{
                                                        value: rowData.discProd,
                                                        locale: "id-ID",
                                                        style: "currency",
                                                        currency: "IDR",
                                                    }}
                                                    />
                                                </p>

                                            ) : ''}
                                        {/* <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{`Disc: ${rowData.discProd}`}</p> */}
                                    </div>
                                    <div className="order-qty-btn">
                                        <QtyButton
                                            min={1}
                                            max={999}
                                            name={`qty-product`}
                                            id="qtyItem"
                                            value={rowData.quantity}
                                            returnValue={(e) => { handleEdit(e, index); handleUpdateEndNote() }}
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
                            <div style={{ position: 'absolute', right: 16, bottom: 60 }}>
                                <div style={{ textAlign: 'center', marginBottom: '.3rem', fontSize: '15px', fontWeight: 600 }}>
                                    <NumberFormat intlConfig={{
                                        value: (rowData.sell_price * rowData.quantity) - (rowData.discProd),
                                        locale: "id-ID",
                                        style: "currency",
                                        currency: "IDR",
                                    }}
                                    />
                                </div>

                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide style={{ width: '70px' }}>
                        <div className='mobile-swiper-content-right danger' onClick={() => { delSalesItems(index) }}>
                            <i className='bx bx-trash'></i>
                        </div>
                    </SwiperSlide>
                </Swiper>

            </div>
        );
    };

    const itemTemplate = (rowData, index) => {
        return (
            <div className="col-12" key={rowData.order_id} style={{ position: 'relative' }}>
                <div className='flex flex-column xl:align-items-start gap-2 static-shadow'
                    style={{
                        backgroundColor: '#F8F9FD',
                        padding: '1rem',
                        boxShadow: '1px 1px 7px #9a9acc1a',
                        borderRadius: '9px',
                        position: 'relative'
                    }}
                    aria-label="salesEditModal"
                    onClick={(e) => handleModalWData(e, { endpoint: "sales", id: rowData.order_id, action: 'update', ...rowData })}
                >

                    <div className="flex align-items-center gap-3"
                        style={{
                            textTransform: 'capitalize',
                            paddingBottom: '.75rem',
                            borderBottom: '1px solid rgba(146, 146, 146, .2509803922)'
                        }}
                    >
                        <div className="user-img" style={{ marginRight: 0 }}>
                            <img
                                src={
                                    rowData.img ? rowData.img
                                        : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                                }
                                alt=""
                            />
                        </div>
                        <div style={{ width: '80%' }}>
                            <p style={{ marginBottom: 0, fontSize: 15, fontWeight: 600 }}>{rowData.order_id}</p>
                            <p style={{ marginBottom: 0, fontSize: 13, color: '#7d8086' }}>{ConvertDate.LocaleStringDate(rowData.order_date)}</p>
                            <div className='flex flex-row gap-2' style={{ fontSize: 13, marginTop: '.5rem' }}>
                                <span className={`badge badge-${rowData.order_type == "walk-in" ? 'primary'
                                    : rowData.order_type == "delivery" ? "warning"
                                        : ""} light`}
                                >
                                    {
                                        rowData.order_type
                                    }
                                </span>
                                <span className={`badge badge-${rowData.order_status == "completed" ? 'success'
                                    : rowData.order_status == "pending" ? "secondary"
                                        : rowData.order_status == "in-delivery" ? "warning"
                                            : rowData.order_status == "canceled" ? "danger"
                                                : rowData.order_status == "confirmed" ? "primary"
                                                    : ""} light`}
                                >
                                    {
                                        rowData.order_status == "completed" ? 'selesai'
                                            : rowData.order_status == "pending" ? 'pending'
                                                : rowData.order_status == "in-delivery" ? 'in-delivery'
                                                    : rowData.order_status == "canceled" ? 'batal'
                                                        : rowData.order_status == "confirmed" ? 'dikonfirmasi'
                                                            : ""
                                    }
                                </span>
                                {rowData.invoice ?
                                    (
                                        <span className="verified-inv">
                                            <i className='bx bx-check-shield'></i>
                                        </span>
                                    ) : (
                                        <span className="unverified-inv">
                                            <i className='bx bx-shield-x'></i>
                                        </span>
                                    )
                                }

                            </div>
                        </div>
                    </div>
                    <div className="flex flex-column gap-1"
                        style={{
                            textTransform: 'capitalize',
                        }}
                    >
                        <div className="flex flex-row justify-content-between">
                            <p style={{ marginBottom: 0, fontSize: 14, color: '#7d8086' }}>Pelanggan:</p>
                            <p style={{ marginBottom: 0, fontSize: 14, color: '#7d8086' }}>{rowData.customer_id ? `${rowData.customer?.name}` : `guest.name (non-member)`}</p>
                        </div>
                        <div className="flex flex-row justify-content-between">
                            <p style={{ marginBottom: 0, fontSize: 14, color: '#7d8086' }}>Total order:</p>
                            <p style={{ marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right' }}>
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
                            <p style={{ marginBottom: 0, fontSize: 14, color: '#7d8086' }}>Tipe pembayaran:</p>
                            <p style={{ marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right' }}>
                                <span className={`badge badge-${rowData.payment_type == "bayar nanti" ? 'danger'
                                    : rowData.payment_type == "lunas" ? "primary"
                                        : rowData.payment_type == "sebagian" ? "warning"
                                            : ""} light`}
                                >
                                    {rowData.payment_type}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <Dropdown drop={index == custData.length - 1 ? "up" : "down"} style={{ position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem' }}>
                    <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                    <Dropdown.Menu align={"end"}>
                        <Dropdown.Item eventKey="1" as="button"
                            aria-label="salesEditModal"
                            onClick={(e) => handleModalWData(e, { endpoint: "sales", id: rowData.order_id, action: 'update', ...rowData })}
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
                                    items: { ...rowData }
                                }
                            )}
                        >
                            <i className='bx bx-trash'></i> Batalkan order
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
    };

    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((sales, index) => {
            return itemTemplate(sales, index);
        });


        return (
            <>
                <div className="grid gap-1">{list}</div>
            
            </>
        );
    };

    const lazyLoad = async () => {
        setLazyLoading(true);

        const queryParams = {
            first: lazyState.first,
            rows: lazyState.rows,
            sortField: lazyState.sortField,
            sortOrder: lazyState.sortOrder,
            globalFilter: lazyState.filters.global.value
        };
        await axiosPrivate.get("/leaves/lazy-all", {
            params: {
                ...queryParams
            }
        })
            .then(response => {
                setTotalRecord(response.data.totalData);
                setLeavesData(response.data.rows);
                setLeavesDataView(response.data.rows);
                setLazyLoading(false);
            })
            .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Error when get sales data",
                    life: 3000,
                });
                return [];
            }
            )
    }

    useEffect(() => {
        if (cantCanceled) {
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
            // fetchAllSales();
        }
    }, [cantCanceled]);

    useEffect(() => {
        lazyLoad();
    }, [lazyState]);

    useEffect(() => {
        // if (leavesData && allProdData && custData && courierList && roData) {
        if (allProdData && custData) {
            // setStateAddSalesTab(true);
        }
    }, [
        // leavesData,
        allProdData,
        custData,
        // courierList, 
        // roData
    ]
    );

    useEffect(() => {
        if (deleteLT) {
            fetchDelLeaveType(modalData.id);
        }
    }, [deleteLT]);

    // if (isLoading) {
    //     return;
    // }

    return (
        <>
            {/* <Sidebar show={isClose} /> */}
            {/* <main className={`main-content ${showSidebar ? "active" : ""}`}>
                <Header onClick={() => handleSidebar((p) => !p)} /> */}
            <div className="container-fluid">
                <div className="row mt-4">
                    <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                        <div className="basic-tabs">
                            <div className="tabs">
                                <div className={`tab-indicator ${openTab === "leavesTab" ? "active" : ""}`}
                                    id='leavesTab'
                                    onClick={(e) => { setGlobalFilterValue(""); handleClick(e); clearFilter() }}
                                >
                                    <span className="tab-title">Cuti karyawan</span>
                                </div>
                                <div className={`tab-indicator ${openTab === "attendanceTab" ? "active" : ""}`}
                                    id='attendanceTab'
                                    onClick={(e) => { setGlobalFilterValue(""); handleClick(e); clearFilter() }}
                                >
                                    <span className="tab-title">Absensi Karyawan </span>
                                </div>
                                <div className={`tab-indicator ${openTab === "leaveTypesTab" ? "active" : ""}`}
                                    id='leaveTypesTab'
                                    onClick={(e) => { setGlobalFilterValue(""); handleClick(e); clearFilter() }}
                                >
                                    <span className="tab-title">Jenis cuti</span>
                                </div>
                            </div>
                            <div className="tabs-content" style={openTab === "leavesTab" ? { display: "block" } : { display: "none" }}>
                                <div className="card card-table add-on-shadow" style={{paddingTop: 0}}>
                                    {!isMobile && !isMediumScr ?
                                        (
                                            <DataTable
                                                className="p-datatable"
                                                value={leavesData}
                                                size="normal"
                                                removableSort
                                                onRowClick={onRowClick}
                                                // stripedRows
                                                // selectionMode={"checkbox"}
                                                // selection={selectedSales}
                                                // onSelectionChange={(e) => {
                                                //     setSelectedSales(e.value);
                                                // }}
                                                dataKey="emp_leave_id"
                                                style={{ marginTop: '1.5rem' }}
                                                tableStyle={{ minWidth: "50rem" }}
                                                filters={lazyState.filters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "employee_id",
                                                    "leave_type",
                                                    "start_date",
                                                    "end_date",
                                                    "status",
                                                    "approved_by",
                                                ]}

                                                emptyMessage={emptyStateHandler}
                                                onFilter={onFilterSales}
                                                header={tableHeader}
                                                paginator
                                                lazy
                                                // loading={}
                                                first={lazyState.first}
                                                // onPage={(e) => dispatch({ type: "onPage", payload: e })}
                                                onPage={onPage}
                                                totalRecords={totalRecord}
                                                rows={10}
                                                stripedRows
                                            >
                                                <Column
                                                    selectionMode="multiple"
                                                    headerStyle={{ width: "3.5rem" }}
                                                ></Column>
                                                <Column
                                                    field="employee_id"
                                                    header="Karyawan"
                                                    sortable
                                                    severity
                                                    body={empWithImg}
                                                    headerStyle={primeTableHeaderStyle}
                                                    bodyStyle={primeTableBodyStyle}
                                                    style={{ textTransform: "capitalize" }}
                                                ></Column>
                                                <Column
                                                    field="leave_type"
                                                    header="jenis cuti"
                                                    filter
                                                    headerStyle={primeTableHeaderStyle}
                                                    showFilterMenu={false}
                                                    filterMenuStyle={{ width: '100%' }}
                                                    filterPlaceholder={"order type"}
                                                    bodyStyle={primeTableBodyStyle}
                                                    style={{ textTransform: 'capitalize' }}
                                                ></Column>
                                                <Column
                                                    field="start_date"
                                                    header="mulai"
                                                    body={formatedOrderDate}
                                                    dataType='date'
                                                    filter
                                                    headerStyle={primeTableHeaderStyle}
                                                    bodyStyle={{ fontSize: 14 }}
                                                    filterPlaceholder="Type a date"
                                                    style={{ textTransform: "capitalize" }}
                                                ></Column>
                                                <Column
                                                    field="end_date"
                                                    header="berakhir"
                                                    body={formatedOrderDate}
                                                    dataType='date'
                                                    filter
                                                    headerStyle={primeTableHeaderStyle}
                                                    bodyStyle={{ fontSize: 14 }}
                                                    filterPlaceholder="Type a date"
                                                    style={{ textTransform: "capitalize" }}
                                                ></Column>
                                                <Column
                                                    field="status"
                                                    header="status"
                                                    body={statusCell}
                                                    bodyStyle={primeTableBodyStyle}
                                                    filter
                                                    headerStyle={primeTableHeaderStyle}
                                                    showFilterMenu={false}
                                                    filterMenuStyle={{ width: '100%' }}
                                                    filterElement={statusRowFilter}
                                                    style={{ textTransform: "capitalize" }}
                                                ></Column>
                                                 <Column
                                                    field="approved_by"
                                                    header="disetujui oleh"
                                                    sortable
                                                    severity
                                                    headerStyle={primeTableHeaderStyle}
                                                    bodyStyle={primeTableBodyStyle}
                                                    style={{ textTransform: "capitalize" }}
                                                ></Column>
                                                <Column
                                                    field=""
                                                    header="aksi"
                                                    headerStyle={primeTableHeaderStyle}
                                                    body={(rowData, rowIndex) => actionCell(rowData, rowIndex)}
                                                    style={{ textTransform: "capitalize" }}
                                                ></Column>
                                            </DataTable>
                                        ) :
                                        (
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
                                                <div className="flex flex-column gap-2" style={{ width: "100%" }}>
                                                    <div className="flex gap-3 align-items-center mb-4" style={{ width: "100%" }}>
                                                        <div className="input-group-right" style={{ width: "100%" }}>
                                                            {mobileSearchMode ?
                                                                (
                                                                    <span className="input-group-icon input-icon-right"
                                                                        onClick={() => {
                                                                            setGlobalFilterValue("");
                                                                            clearFilter();
                                                                            setMobileSearchMode(false);
                                                                            mobileSearchInput.current.focus();
                                                                        }}
                                                                    >
                                                                        <i className='bx bx-x'></i>
                                                                    </span>
                                                                ) : (
                                                                    <span className="input-group-icon input-icon-right">
                                                                        <i className="zwicon-search"></i>
                                                                    </span>
                                                                )
                                                            }
                                                            <input
                                                                ref={mobileSearchInput}
                                                                type="text"
                                                                className="form-control input-w-icon-right"
                                                                aria-label='allSales'
                                                                value={globalFilterValue}
                                                                onChange={onGlobalFilterChange}
                                                                // value={mobileFilterValue}
                                                                // onChange={(e) => mobileFilterFunc(e, "mainData")}
                                                                placeholder="Keyword Search"
                                                                onKeyDown={() => setMobileSearchMode(true)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <DataView
                                                    value={leavesDataView}
                                                    dataKey='order_id'
                                                    paginator
                                                    totalRecords={totalRecord}
                                                    paginatorPosition='bottom'
                                                    lazy
                                                    first={lazyState.first}
                                                    rows={10}
                                                    onPage={onPageView}
                                                    listTemplate={listTemplate}
                                                    loading={lazyLoading}
                                                    style={{ marginTop: '.5rem' }}
                                                />
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="tabs-content" style={openTab === "attendanceTab" ? { display: "block" } : { display: "none" }}>
                                <div className="card card-table add-on-shadow">
                                    {/* {!isMobile && !isMediumScr ?
                                        (
                                            <div className="mt-4">
                                                <DataTable
                                                    className="p-datatable"
                                                    value={roData}
                                                    size="normal"
                                                    removableSort
                                                    dataKey="order_id"
                                                    tableStyle={{ minWidth: "50rem" }}
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
                                                    filters={lazyStateRO.filters}
                                                    lazy
                                                    first={lazyLoadingRO.first}
                                                    totalRecords={totalRecordRO}
                                                    onPage={onPageRO}
                                                    loading={lazyLoadingRO}
                                                    rows={10}
                                                >
                                                    <Column
                                                        selectionMode="multiple"
                                                        headerStyle={{ width: "3.5rem" }}
                                                    ></Column>
                                                    <Column
                                                        field="return_order_id"
                                                        header="RO ID"
                                                        sortable
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="order_id"
                                                        header="Order ID"
                                                        sortable
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="return_date"
                                                        header="tanggal pengembalian"
                                                        body={formatedReturnDate}
                                                        dataType='date'
                                                        sortable
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="customer.customer_id"
                                                        header="ID Pelanggan"
                                                        sortable
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="customer.name"
                                                        header="pelanggan"
                                                        sortable
                                                        sheaderStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="refund_total"
                                                        header="total pengembalian"
                                                        body={formatedRefundtotal}
                                                        sortable
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="return_method"
                                                        header="Metode pengembalian"
                                                        body={viewReturnMethod}
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field="status"
                                                        header="status"
                                                        sortable
                                                        showFilterMenu={false}
                                                        filterMenuStyle={{ width: '100%' }}
                                                        filterPlaceholder={"order type"}
                                                        body={returnStatusCell}
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                    <Column
                                                        field=""
                                                        header="aksi"
                                                        body={(rowData, rowIndex) => returnOrderActionCell(rowData, rowIndex)}
                                                        headerStyle={primeTableHeaderStyle}
                                                        bodyStyle={primeTableBodyStyle}
                                                        style={{ textTransform: "capitalize" }}
                                                    ></Column>
                                                </DataTable>
                                            </div>
                                        ) :
                                        (
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
                                                        <i className="bx bx-plus"></i>
                                                        pengembalian
                                                    </button>
                                                </div>
                                                <div className="flex flex-column gap-2" style={{ width: "100%" }}>
                                                    <div className="flex gap-3 align-items-center mb-4" style={{ width: "100%" }}>
                                                        <div className="input-group-right" style={{ width: "100%" }}>
                                                            {mobileSearchMode ?
                                                                (
                                                                    <span className="input-group-icon input-icon-right"
                                                                        onClick={() => {
                                                                            setGlobalFilterValue("");
                                                                            clearFilter();
                                                                            setMobileSearchMode(false);
                                                                            mobileSearchInput.current.focus();
                                                                        }}
                                                                    >
                                                                        <i className='bx bx-x'></i>
                                                                    </span>
                                                                ) : (
                                                                    <span className="input-group-icon input-icon-right">
                                                                        <i className="zwicon-search"></i>
                                                                    </span>
                                                                )
                                                            }
                                                            <input
                                                                ref={mobileSearchInput}
                                                                type="text"
                                                                className="form-control input-w-icon-right"
                                                                aria-label='roSales'
                                                                value={globalFilterValue}
                                                                onChange={onGlobalFilterChange}
                                                                placeholder="Keyword Search"
                                                                onKeyDown={() => setMobileSearchMode(true)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <DataView 
                                                    value={roData} 
                                                    dataKey='ro_id' 
                                                    listTemplate={listROTemplate} 
                                                    paginator 
                                                    paginatorPosition='bottom' 
                                                    rows={10} 
                                                    style={{ marginTop: '.5rem' }} 
                                                    emptyMessage=' '
                                                    lazy
                                                    totalRecords={totalRecordRO} 
                                                    first={lazyStateRO.first}
                                                    onPage={onPageViewRO}
                                                    loading={lazyLoadingRO}
                                                />
                                            </>
                                        )
                                    } */}
                                </div>
                            </div>
                            <div className="tabs-content" style={openTab === "leaveTypesTab" ? { display: "block" } : { display: "none" }}>
                                <div className="card card-table add-on-shadow" style={{paddingTop: 0}}>
                                    {!isMobile && !isMediumScr ? 
                                    (
                                    <div className="mt-4">
                                        <DataTable
                                            className="p-datatable"
                                            value={leaveTypes}
                                            size="normal"
                                            removableSort
                                            dataKey="category_id"
                                            tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                            filterDisplay='menu'
                                            // globalFilterFields={[
                                            //     "category_name",
                                            // ]}
                                            emptyMessage={emptyStateHandler}
                                            // onFilter={(e) => setProdFilters(e.filters)}
                                            header={tableHeaderLeaveTypes}
                                            paginator
                                            // totalRecords={totalRecordLeaveTypes}
                                            rows={25}
                                        >
                                        <Column
                                            header="#"
                                            body={(data, options) => options.rowIndex + 1}
                                        ></Column>
                                        <Column
                                            field="leave_type_name"
                                            header="jenis cuti"
                                            // sortable
                                            bodyStyle={primeTableBodyStyle}
                                            headerStyle={primeTableHeaderStyle}
                                            // body={cellWithImg}
                                            style={{ textTransform: "uppercase" }}
                                        ></Column>
                                        <Column
                                            field="day_of_tolerance"
                                            header="toleransi hari"
                                            // sortable
                                            // bodyStyle={primeTableBodyStyle}
                                            // headerStyle={primeTableHeaderStyle}
                                            body={formatedNumber}
                                            // style={{ textTransform: "uppercase" }}
                                        ></Column>
                                        <Column
                                            field="status"
                                            header="status"
                                        ></Column>
                                        <Column
                                            field=""
                                            header="aksi"
                                            body={(rowData, rowIndex) => actionCell3(rowData, rowIndex)}
                                            style={{ textTransform: "uppercase" }}
                                            bodyStyle={primeTableBodyStyle}
                                            headerStyle={primeTableHeaderStyle}
                                        ></Column>
                                        </DataTable>
                                    </div>
                                    ):(
                                        <>
                                        <div
                                            className="wrapping-table-btn flex flex-end gap-3"
                                            style={{ width: "100%", height: "inherit"}}
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
                                                aria-label="addCategoryModal"
                                                onClick={(e) =>
                                                    handleModal(e, {
                                                        endpoint: "category",
                                                        action: "insert",
                                                    })
                                                }
                                            >
                                                <i className="bx bx-plus"></i>
                                                kategori
                                            </button>
                                        </div>
                                        <DataView value={leaveTypes} listTemplate={listTemplate} style={{marginTop: '.5rem'}} />         
                                        </>
                                    )}
                                </div>


                                {/* leavetypes modal */}

                            </div>
                        </div>
                    </div>
                </div>
            </div >
            {/* </main> */}

            {
            showModal === "warningCancelModal" ?
            (
                <ConfirmModal show={showModal === "warningCancelModal" ? true : false} onHide={handleCloseModal}
                    data={showModal === "warningCancelModal" ? salesListObj : ""}
                    msg={
                        <p style={{ marginBottom: 0 }}>
                            Tidak dapat membatalkan order ini, karena hanya satu-satunya order di invoice dan terdapat pembayaran yang belum penuh.<br />
                            Coba hapus pembayaran yang terkait terlebih dahulu lalu coba lagi.
                        </p>
                    }
                    returnValue={(value) => { setCantCanceled(value) }}
                />
            )
            : showModal === "confirmDelLT" ?
                (
                    <ConfirmModal show={showModal === "confirmDelLT" ? true : false} onHide={handleCloseModal}
                        data={showModal === "confirmDelLT" ? modalData : ""}
                        msg={modalMsg}
                        returnValue={(confirm) => { setConfirmDelLT(confirm) }}
                    />
                )
            : ""
            }

            {/* cuti karyawan modal */}
            <LeaveTypesModal
                show={showModal === "addLeaveTypes" || showModal == "editLeaveType" ? true : false}
                onHide={handleCloseModal}
                data={showModal === "addLeaveTypes" || showModal == "editLeaveType" ? modalData : ""}
                returnAct={(act) => 
                act == true ? setRefetch(true) 
                : act == "empty" ? setRefetch("empty")
                : setRefetch(false)
                }
            />

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