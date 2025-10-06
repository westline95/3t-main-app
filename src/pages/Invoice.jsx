import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';
import { DataTable } from 'primereact/datatable';
import { primeTableBodyStyle, primeTableHeaderStyle } from '../assets/js/primeStyling.js';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { CustomSelect } from '../elements/CustomSelect';
import NumberFormat from '../elements/Masking/NumberFormat';
import DropzoneFile from '../elements/DropzoneFile';
import SalesDetailModal from '../elements/Modal/salesDetailModal';
import SalesEditModal from '../elements/Modal/SalesEditModal';
import ConfirmModal from '../elements/Modal/ConfirmModal';
import InputWLabel from '../elements/Input/InputWLabel';
import CustomToggle from '../elements/Custom/CustomToggle';
import { Dropdown } from 'react-bootstrap';
import ConvertDate from '../assets/js/ConvertDate.js';
import InvoiceModal from '../elements/Modal/InvoiceModal.jsx';
import ModalTextContent from '../elements/Modal/ModalTextContent.jsx';
import FetchApi from '../assets/js/fetchApi.js';
import CreateInv from '../elements/Modal/CreateInvModal.jsx';
import CreatePayment from '../elements/Modal/CreatePaymentModal.jsx';
import InputWSelect from '../elements/Input/InputWSelect.jsx';
import EmptyState from "../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import EditInv from '../elements/Modal/EditInvModal.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { DataView } from 'primereact/dataview';
import dataStatic from '../assets/js/dataStatic.js';
import ReceiptModal from '../elements/Modal/ReceiptModal.jsx';

export default function Invoice({handleSidebar, showSidebar}){
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const mobileSearchInput = useRef(null);
    const [ isLoading, setLoading ] = useState(true);
    const [ refetch, setRefetch ] = useState(false);
    const [ isClose, setClose ] = useState(false);
    const [ deleteInv, setDeleteInv ] = useState(false);
    const [ invData, setInvData ] = useState(null);
    const [ receiptData, setReceiptData ] = useState(null);
    const [ openTab, setOpenTab ] = useState('invListTab');
    const [ invListObj, setInvList ] = useState(null);
    const [ showModal, setShowModal ] = useState("");
    const [ paidData, setPaidData ] = useState(null);

    const [ invFilters, setInvFilters ] = useState(null);
    const [ receiptFilters, setReceiptFilters ] = useState(null);
    const [ totalRecords, setTotalRecords ] = useState(0);
    const [ receiptTotalRecords, setReceiptTotalRecords ] = useState(0);
    const [ globalFilterValue, setGlobalFilterValue ] = useState("");
    const [ globalFilterValueReceipt, setGlobalFilterValueReceipt ] = useState("");
    const [ selectedInvoice, setSelectedInv ] = useState(null);
    const [ mobileSearchMode, setMobileSearchMode ] = useState(false);
    const [ mobileFilterValue, setMobileFilterValue ] = useState("");

    const axiosPrivate = useAxiosPrivate();
    const toast = useRef(null);
    

    const handleClick = (e) => {
        switch(e.target.id) {
            case "invListTab":
                setOpenTab("invListTab");
            break;
            case "receiptListTab":
                setOpenTab("receiptListTab");
            break;
        }
    };

    const returnSelectVal = (val) => {

    }

    const handleModal = (e, invData, InvRef) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "createInvModal":
                setShowModal("createInvModal");
                break;
            case "viewInvModal":
                // e.stopPropagation();
                data = {
                    id: invData.id, 
                    items: invData.items
                }
                setInvList(invData);
                setShowModal("viewInvModal");
                break;
            case "viewReceiptModal":
                // e.stopPropagation();
                data = {
                    id: invData.id, 
                    items: invData.items
                }
                setInvList(invData);
                setShowModal("viewReceiptModal");
            break;
            case "editInvModal":
                 data = {
                    id: invData.id, 
                    items: invData.items
                }
                setInvList(invData);
                setShowModal("editInvModal");
                break;
            case "deleteInvModal":
                setInvList(invData);
                setShowModal("deleteInvModal");
                break;
            case "viewSalesRef":
                let parseSalesRef = JSON.parse(invData).join(", ");
                data = {
                    textContent: parseSalesRef, 
                    title: "Sales references"
                }
                setInvList(data);
                setShowModal("viewSalesRef");
                break;
             case "addPaymentModal":
                data = {
                    id: invData.id, 
                    items: invData.items,
                    action: 'insert'
                }
                setInvList(data);
                setShowModal("addPaymentModal");
                break;
        }
    }

    const handleCloseModal = () => {
        setShowModal("");
    }

    const fetchAllInv = async () => {
        await axiosPrivate.get("/inv")
        .then(resp => {
            // default sort: descending by createdAt
            let invoices;
            if(resp.data.length > 1){
                invoices = resp.data.sort((a, b) => {
                    let invDateA = new Date(a.createdAt);
                    let invDateB = new Date(b.createdAt);
                    // Compare 
                    if (invDateA > invDateB) return -1;
                    if (invDateA < invDateB) return 1;
                    return 0;
                })

            } else {
                invoices = resp.data;
            }
            // filter invoice status whch not canceled
            const activeInv = invoices.filter(({status}) => status !== 'canceled');
            setInvData(activeInv);
            setTotalRecords(activeInv.length);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get invoice data!",
                life: 3000,
            });
        })
    };

    const fetchAllReceipt = async() => {
        await axiosPrivate.get("/receipt/all")
            .then(resp => {
                setReceiptData(resp.data);
                setReceiptTotalRecords(resp.data.length);
            })
            .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Error when get receipt data!",
                    life: 3000,
                });
            }
        )
    };

    const fetchDeletePayment = async (payment_id) => {
        await axiosPrivate.delete("/payment/del", { params: { id: payment_id } })
        .then(resp => {

        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add payment",
                life: 3000,
            });
        })
    };

    const fetchUpdateSalesReceipt = async(receiptID, orderIDs) => {
        if(orderIDs){
            await axiosPrivate.patch(`/sales/receipt?id=${orderIDs}`, receiptID)
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New receipt is created",
                    life: 3500,
                });

            })
            .catch(err => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to create new receipt",
                    life: 3500,
                });
            })
        }
    }

    const fetchInsertreceipt = async (body, orderIDs) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/receipt/write", bodyData)
          .then(resp => {
                if(resp.data){
                    const receiptID = JSON.stringify({receipt_id: resp.data.receipt_id})
                    // update order->receipt_id
                    fetchUpdateSalesReceipt(receiptID, orderIDs)
                }
                // setTimeout(() => {
                //     window.location.reload();
                // },1700)
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

    const fetchUpdateOrderStatus =  async(reqURL) => {
        let orderStatus = JSON.stringify({ order_status: "completed", is_complete: true });
        // check order type first
        await axiosPrivate.get(`/sales/by?id=${reqURL}`)
        .then(resp => {
            if(resp.data.order_type != "delivery"){
                // if not delivery a.k.a walk-in / dine in then update order_status to completed if invoice is paid true
                axiosPrivate.patch(`/sales/update/status?id=${reqURL}`, orderStatus)
                .then(resp => {
                    fetchAllInv();
                    fetchAllReceipt();
                    
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Successfully add payment",
                        life: 3000,
                    });

                })
                .catch(err => {
                    throw new Error("error while updating order_status");
                })
            }
            
        })
        .catch(err => {
            throw new Error("There will be an error for updating order_status");
        })
        
    };

    const updateTotalDebtCust = async(paymentModel) => {
        let oldTotalDebt = Number(invListObj.items.customer?.total_debt);
        let updateTotalDebt = (oldTotalDebt - paymentModel.amount_paid) <= 0 ? 0 : (oldTotalDebt - paymentModel.amount_paid);

        await axiosPrivate.patch(`/customer/debt/${paymentModel.customer_id}/${updateTotalDebt}`)
        .then((resp) => {
            if(resp.data){
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Data pelanggan diperbarui",
                    life: 1700,
                });
            }
        })
        .catch((err) => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Data pelanggan gagal diperbarui",
                life: 3000,
            });
        })
    }

    
    const fetchDetailedCust = async(custID) => {
        await axiosPrivate.get(`/customer/detail?custid=${custID}`)
        .then(resp => {
            const sales = resp.data.sales ? resp.data.sales[0] : null;
            const debt = resp.data.debt ? resp.data.debt[0] : null;

            const updt_total_sales = (sales && sales.total_sales_grandtotal ? Number(sales.total_sales_grandtotal) : 0) 
            - (sales && sales.return_refund ? Number(sales.return_refund) : 0)
            + (sales && sales.orders_credit_uncanceled ? Number(sales.orders_credit_uncanceled.total) : 0);
            
            const orderBBNotInv = debt && debt.total_debt_grandtotal ? Number(debt.total_debt_grandtotal) : 0;
            const orderReturn = debt && debt.return_refund ? Number(debt.return_refund) : 0;
            const orderPartialRemain = debt && debt.partial_sisa ? Number(debt.partial_sisa.sisa) : 0;
            const orderInvRemain = debt && debt.hutang_invoice ? Number(debt.hutang_invoice.sisa_hutang) : 0;
            const orderCreditUncomplete = debt && debt.orders_credit_uncomplete ? Number(debt.orders_credit_uncomplete.total) : 0;

            const updt_total_debt = (orderBBNotInv+orderPartialRemain+orderInvRemain+orderCreditUncomplete)-orderReturn;
        
            axiosPrivate.patch(`/customer/sales-debt/${custID}/${updt_total_debt}/${updt_total_sales}`)
            .then(resp2 =>{
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Berhasil memperbarui data pelanggan!",
                    life:1200,
                });
            })
            .catch(err2 => {
                console.error(err2);
                toast.current.show({
                    severity: "error",
                    summary: "Fatal Error",
                    detail: "Error saat memperbarui data pelanggan!",
                    life:1200,
                });
            })
        })
        .catch(err => {
            console.error(err);
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal memperbarui data pelanggan!",
                life:1200,
            });
        })
    };

    const fetchInsertPayment = async () => {
        let paymentModel = {
            invoice_id: invListObj.items.invoice_id,
            customer_id: invListObj.items.customer_id,
            amount_paid: paidData.amountOrigin,
            note: paidData.note,
            payment_ref: paidData.payment_ref,
            payment_date: paidData.payment_date,
            payment_method: paidData.payment_method,
        };

        // let invModel = {
        //     remaining_payment: (invListObj.items.remaining_payment - paidData.amountOrigin) <= 0 ? 0 : (invListObj.items.remaining_payment - paidData.amountOrigin),
        //     is_paid: (invListObj.items.remaining_payment - paidData.amountOrigin) <= 0 ? true : false
        // }

        // untuk update order_status
        // let getOrderIds = JSON.parse(invListObj.items.order_id);
        // let reqURL;
        // if(getOrderIds.length > 1){
        //     reqURL = getOrderIds.join("&id=");
        // } else {
        //     reqURL = getOrderIds[0];
        // }

        await axiosPrivate.post("/payment/write", JSON.stringify(paymentModel))
        .then(resp => {
            fetchDetailedCust(paymentModel.customer_id);
            fetchAllInv();
            fetchAllReceipt();
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "SBerhasil menambahkan pembayaran",
                life: 3000,
            });
            // axiosPrivate.patch("/inv/payment", JSON.stringify(invModel), { params: { id: invListObj.items.invoice_id } })
            // .then(resp2 => {
            //     const totalPaid = invListObj.items.payments.length > 0 ? invListObj.items.payments.reduce((prev, curr) => prev + Number(curr.amount_paid),0) : 0;
            //     // if invoice paid then check order_type if not delivery then update order_status to completed
            //     if(invModel.is_paid){
            //         let receiptModel = {
            //             customer_id: invListObj.items.customer_id,
            //             invoice_id: invListObj.items.invoice_id,
            //             total_payment: (totalPaid + paidData.amountOrigin),
            //             change: paidData.change,
            //             receipt_date: new Date()
            //         }

            //         fetchInsertreceipt(receiptModel, reqURL);

            //         fetchUpdateOrderStatus(reqURL);
            //     } else {
            //         fetchAllInv();
            //         toast.current.show({
            //             severity: "success",
            //             summary: "Success",
            //             detail: "Successfully add payment",
            //             life: 3000,
            //         });
            //     }
            // })
            // .catch(err2 => {
            //     // undo inserted payment if invoice detail failed to update
            //     fetchDeletePayment(resp.data.payment_id);
            //     toast.current.show({
            //         severity: "error",
            //         summary: "Failed",
            //         detail: "Error when update invoice payment",
            //         life: 3000,
            //     });
            // })
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add payment",
                life: 3000,
            });
        })
    };

    const deleteSelectedInv = async () => {
        // update sales:invoice_id first
        let orderIds;
        let getOrderId = JSON.parse(invListObj.items?.order_id);
        if(getOrderId.length > 1) {
            orderIds = getOrderId.join("&id=");
        } else {
            orderIds = getOrderId[0];
        }

        if(orderIds){
            let invoiceID = JSON.stringify({invoice_id: null});
            let invoiceIDrelink = JSON.stringify({invoice_id: invListObj.id});
            
            if(invListObj.items.payments.length == 0 && !invListObj.items.is_paid){
                
                // update order:invoice_id to null (unlink)
                await axiosPrivate.patch(`/sales/invs?id=${orderIds}`, invoiceID)
                .then(resp => {
                    // delete inv
                    // axiosPrivate.delete(`/inv`, {params: { id: invListObj.id}})
                    const invStatus = JSON.stringify({status: 0});
                    axiosPrivate.patch(`/inv/status`, invStatus, {params: { id: invListObj.id}})
                    .then(resp2 => {
                        setShowModal("");
                        setTimeout(() => {
                            window.location.reload();
                        },1300)

                        toast.current.show({
                            severity: "success",
                            summary: "Success",
                            detail: "Successfully remove invoice",
                            life: 1300,
                        });
        
                    })
                    .catch(err2 => {
                        // if failed to delete inv but success to update order:invoice_id => undo update
                        axiosPrivate.patch(`/sales/invs?id=${orderIds}`, invoiceIDrelink)
                        .then(resp => {
                            toast.current.show({
                                severity: "error",
                                summary: "Failed",
                                detail: "Failed to delete invoice",
                                life: 3000,
                            });
                        })
                        .catch(err3 => {
                            console.error('error: ' + err3)
                        })
                        toast.current.show({
                            severity: "error",
                            summary: "Failed",
                            detail: "Failed to delete invoice",
                            life: 3000,
                        });
                    })
                    
                })
                .catch(error => {
                    toast.current.show({
                        severity: "error",
                        summary: "Failed",
                        detail: "Failed to delete invoice",
                        life: 3000,
                    });
                })

            } else {
                // unlink first
                // await axiosPrivate.patch(`/sales/invs?id=${orderIds}`, invoiceID)
                // .then(resp => {
                    // just delete inv => not delete but update status invoice to 0
                    // axiosPrivate.delete(`/inv`, {params: { id: invListObj.id}})
                    const invStatus = JSON.stringify({status: 0});
                    await axiosPrivate.patch(`/inv/status`, invStatus, {params: { id: invListObj.id}})
                    .then(resp2 => {
                        setShowModal("");
                        setTimeout(() => {
                            window.location.reload();
                        },1300);
                        
                        toast.current.show({
                            severity: "success",
                            summary: "Success",
                            detail: "Successfully remove invoice",
                            life: 1300,
                        });
        
                    })
                    .catch(err2 => {
                        axiosPrivate.patch(`/sales/invs?id=${orderIds}`, invoiceIDrelink)
                        .then(resp => {
                            toast.current.show({
                                severity: "error",
                                summary: "Failed",
                                detail: "Failed to delete invoice",
                                life: 3000,
                            });
                        })
                        .catch(err3 => {
                            console.error('error: ' + err3)
                        })
                        toast.current.show({
                            severity: "error",
                            summary: "Failed",
                            detail: "Failed to delete invoice",
                            life: 3000,
                        });
                    })
                // })
                // .catch(error => {
                //     toast.current.show({
                //         severity: "error",
                //         summary: "Failed",
                //         detail: "Failed to delete invoice",
                //         life: 3000,
                //     });
                // })
            }

        }
    };

    const emptyStateHandler = () =>{
        return (
        <div style={{width: '100%', textAlign: 'center'}}>
            <img src={EmptyState} style={{width: '165px', height: '170px'}}  />
            <p style={{marginBottom: ".3rem"}}>No result found</p>
        </div>
        )
    };

    const tableHeader = (rowData) => {
        return (
            <div key={'inv-header'} className="flex justify-content-between" style={{ width: "100%" }}>
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
                    <div
                        className="selected-row-stat"
                        style={{
                        height: "inherit",
                        display:
                            selectedInvoice && selectedInvoice.length > 0 ? "block" : "none",
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
                    </div>
                    <InputWSelect
                        name="inv_status"
                        selectLabel="Select invoice status"
                        options={dataStatic.invStatus}
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
                                    // console.log(e)
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
                        Buat invoice
                    </button>
                </div>
            </div>
        );
    };

    const receiptTableHeader = (rowData) => {
        return (
            <div key={'receipt-header'} className="flex justify-content-between" style={{ width: "100%" }}>
                <div className="flex gap-3 align-items-center" style={{ width: "60%" }}>
                    <div className="input-group-right" style={{ width: "40%" }}>
                        <span className="input-group-icon input-icon-right">
                            <i className="zwicon-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control input-w-icon-right"
                            value={globalFilterValueReceipt}
                            onChange={onGlobalFilterReceiptChange}
                            placeholder="Keyword Search"
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-w-icon"
                        style={{ fontWeight: 500 }}
                        onClick={clearFilterReceipt}
                    >
                        <i className="bx bx-filter-alt" style={{ fontSize: "24px" }}></i>
                        Clear filter
                    </button>
                    <div
                        className="selected-row-stat"
                        style={{
                        height: "inherit",
                        display:
                            selectedInvoice && selectedInvoice.length > 0 ? "block" : "none",
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
                    </div>
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
                                    // console.log(e)
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

                    {/* <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                        aria-label="createInvModal"
                        onClick={(e) =>
                            handleModal(e, {
                                endpoint: "custType",
                                action: "insert",
                            })
                        }
                    >
                        <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                        Buat receipt
                    </button> */}
                </div>
            </div>
        );
    };

    const customerOrGuestName = (rowData) => {
        return <span>{rowData.customer ? rowData.customer.name : rowData.guest_name}</span>;
    };
    
    const customerOrGuest = (rowData) => {
        return <span>{rowData.customer_id ? rowData.customer_id : "-"}</span>;
    };

    const formatedInvDate = (rowData, options) => {
        return <span key={options.rowIndex}>{ConvertDate.convertToFullDate(rowData.invoice_date, "/")}</span>;
    };
    
    const formatedReceiptDate = (rowData, options) => {
        return <span key={options.rowIndex}>{ConvertDate.convertToFullDate(rowData.receipt_date, "/")}</span>;
    };

    const formatedTotal = (rowData, options) => {
        return(
            <NumberFormat key={options.rowIndex} intlConfig={{
                value: rowData.total_payment, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };

    const paymentTypeCell = (rowData, options) => {
        return(
            <span key={options.rowIndex} className={`badge badge-${
                rowData.payment_type == "bayar nanti" ? 'danger'
                : rowData.payment_type == "lunas"? "primary"
                : rowData.payment_type == "sebagian"? "warning"
                : ""} light`}
            >
                {rowData.payment_type }                                                                                
            </span>
        )
    };
    
    const isPaidCell = (rowData, options) => {
        return(
            <span key={options.rowIndex} className={`badge badge-${
                rowData.is_paid ? "primary" : "danger"} light`}
            >{rowData.is_paid ? "lunas" : "belum lunas"}</span>
        )
    };

    const invStatus = (rowData, options) => {
        return(
            <span key={options.rowIndex} className={`badge badge-${
                rowData.status == 0 ? "danger" :
                rowData.is_paid ? "success"  : new Date() > new Date(rowData.invoice_due) ?  "danger" : 'warning'} light`}
            >{ rowData.status == 0 ? "canceled" : rowData.is_paid ? "completed" : new Date() > new Date(rowData.invoice_due) ? "due" : 'in-progress'}</span>

        )
    };

    const formatedAmountDue = (rowData, options) => {
        return(
          <NumberFormat key={options.rowIndex} intlConfig={{
              value: rowData.amount_due, 
              locale: "id-ID",
              style: "currency", 
              currency: "IDR",
          }} />
        )
    };
     
    const formatedRemaining = (rowData, options) => {
        return(
          <NumberFormat key={options.rowIndex} intlConfig={{
              value: rowData.remaining_payment, 
              locale: "id-ID",
              style: "currency", 
              currency: "IDR",
          }} />
        )
    };
     
    
    
    const clearFilterReceipt = () => {
        initFiltersReceipt();
    };

    const clearFilter = () => {
        initFilters();
    };
    
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...invFilters };

        _filters["global"].value = value;

        setInvFilters(_filters);
        setGlobalFilterValue(value);
    };
    
    const onGlobalFilterReceiptChange = (e) => {
        const value = e.target.value;
        let _filters = { ...receiptFilters };

        _filters["global"].value = value;

        setReceiptFilters(_filters);
        setGlobalFilterValueReceipt(value);
    };
    
    const initFilters = () => {
        setInvFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            invoice_id: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            invoice_date: {
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

     const initFiltersReceipt = () => {
        setReceiptFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            receipt_id: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            'invoice.invoice_number': {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            receipt_date: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
            },
            customer_id: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
            'customer.name': {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
            },
            total_payment: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
        });
        setGlobalFilterValueReceipt("");
    };
    
    const selectedToDelete = () => {
        const getOnlyID = selectedCusts.map(e => {
            return e.customer_id
        });
        // setCustObj({
        //     endpoint: "customer",
        //     id: getOnlyID,
        //     action: "delete",
        // });
        setShowModal("confirmModal");
    };


    const invActionCell = (rowData, rowIndex) => {
        return (
            <Dropdown key={rowIndex} drop={rowIndex == invData.length - 1 ? "up" : "down"}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="1" as="button" aria-label="viewInvModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.invoice_id, items: rowData})}}>
                        <i className='bx bx-show'></i> Lihat invoice
                    </Dropdown.Item> 
                    {
                        !rowData.is_paid ?
                        (
                            <>
                            <Dropdown.Item eventKey="1" as="button" aria-label="addPaymentModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.invoice_id, items:{...rowData}})}}>
                                <i className='bx bx-money'></i> Tambah pembayaran
                            </Dropdown.Item>
                            {rowData.payment_type == "bayar nanti" ?
                                (
                                <Dropdown.Item eventKey="1" as="button" aria-label="editInvModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.invoice_id, items: rowData})}}>
                                    <i className='bx bxs-edit'></i> Edit invoice
                                </Dropdown.Item>
                                ):''
                            }
                            <Dropdown.Item eventKey="1" as="button" aria-label="deleteInvModal" onClick={(e) => {
                                e.stopPropagation();
                                handleModal(e, {endpoint: "inv", action: 'delete' , id: rowData.invoice_id, items: rowData});
                            }}
                            >
                                <i className='bx bx-trash'></i> Hapus invoice
                            </Dropdown.Item>
                            </>
                        ):""
                    }
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    const receiptActionCell = (rowData, rowIndex) => {
        return (
            <Dropdown key={rowIndex} drop={rowIndex == receiptData.length - 1 ? "up" : "down"}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="1" as="button" aria-label="viewReceiptModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.receipt_id, items: rowData})}}>
                        <i className='bx bx-show'></i> Preview receipt
                    </Dropdown.Item> 
                    {/* <Dropdown.Item eventKey="1" as="button" aria-label="editInvModal" onClick={(e) => handleModal(e, rowData.invoice_id)}>
                        <i className='bx bxs-edit'></i> Edit receipt
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="1" as="button" aria-label="deleteInvModal" onClick={(e) => handleModal(e, {endpoint: "inv", id: rowData.invoice_id})}>
                        <i className='bx bx-trash'></i> Delete receipt
                    </Dropdown.Item> */}
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    // list setting
    const mobileFilterFunc = (e) => {
        setMobileFilterValue(e.target.value);
        e.target.value == "" ? setMobileSearchMode(false):setMobileSearchMode(true)
    }

    const itemTemplate = (rowData, index) => {
        return (
        <div className="col-12" key={rowData.invoice_id} style={{position:'relative'}} aria-label="viewInvModal" onClick={(e) => handleModal(e, {id: rowData.invoice_id, items: rowData})}>
            <div className='flex flex-column xl:align-items-start gap-2'
                style={{
                    backgroundColor: '#F8F9FD',
                    padding: '1rem',
                    boxShadow: '1px 1px 7px #9a9acc1a',
                    borderRadius: '9px',
                    position:'relative'
                }}
                aria-label="salesEditModal" 
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
                    rowData.customer ? rowData.customer.img
                        : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                    }
                    alt=""
                />
                </span>
                <div style={{width: '80%'}}>
                    <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600, textTransform: 'uppercase'}}>{rowData.invoice_number}</p>
                    <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{ConvertDate.LocaleStringDate(rowData.invoice_date)}</p>
                    <div className='flex flex-row gap-2' style={{fontSize: 13, marginTop: '.5rem'}}>
                        <span className={`badge badge-${
                            rowData.payment_type == "bayar nanti" ? 'danger'
                            : rowData.payment_type == "lunas"? "primary"
                            : rowData.payment_type == "sebagian"? "warning"
                            : ""} light`}
                        >
                            {rowData.payment_type }                                                                                
                        </span>
                        <span className={`badge badge-${rowData.is_paid ? "primary" : "danger"} light`}>
                            {rowData.is_paid ? "lunas" : "belum lunas"}
                        </span>
                        <span className={`badge badge-${
                            rowData.status == 0 ? "danger" :
                            rowData.is_paid ? "success"  : new Date() > new Date(rowData.invoice_due) ?  "danger" : 'warning'} light`}
                        >{ rowData.status == 0 ? "canceled" : rowData.is_paid ? "completed" : new Date() > new Date(rowData.invoice_due) ? "due" : 'in-progress'}</span>
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
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Pelanggan:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>{rowData.customer.name}</p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        <NumberFormat intlConfig={{
                            value: rowData.amount_due, 
                            locale: "id-ID",
                            style: "currency", 
                            currency: "IDR",
                        }} 
                        />
                    </p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Sisa:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        <NumberFormat intlConfig={{
                            value: rowData.remaining_payment, 
                            locale: "id-ID",
                            style: "currency", 
                            currency: "IDR",
                        }} 
                        />
                    </p>
                </div>
                {/* <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Sisa:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                       
                    </p>
                </div> */}
            </div>
            </div>
            {/* <Dropdown drop={index == invData.length - 1 ? "up" : "down"} style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}> */}
            <Dropdown drop={"down"} style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"} className='static-shadow'>
                    <Dropdown.Item eventKey="1" as="button" aria-label="viewInvModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.invoice_id, items: rowData})}}>
                        <i className='bx bx-show'></i> Lihat invoice
                    </Dropdown.Item> 
                    {
                        !rowData.is_paid ?
                        (
                            <>
                            <Dropdown.Item eventKey="1" as="button" aria-label="addPaymentModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.invoice_id, items:{...rowData}})}}>
                                <i className='bx bx-money'></i> Tambah pembayaran
                            </Dropdown.Item>
                            {
                                rowData.payment_type == "bayar nanti" ? 
                                (
                                    <Dropdown.Item eventKey="1" as="button" aria-label="editInvModal" onClick={(e) => {
                                        e.stopPropagation();
                                        handleModal(e, {id: rowData.invoice_id, items: rowData})
                                    }}>
                                        <i className='bx bxs-edit'></i> Edit invoice
                                    </Dropdown.Item>

                                ):''
                            }
                            <Dropdown.Item eventKey="1" as="button" aria-label="deleteInvModal" onClick={(e) => {
                                e.stopPropagation();
                                handleModal(e, {endpoint: "inv", action: 'delete' , id: rowData.invoice_id, items: rowData});
                            }}
                            >
                                <i className='bx bx-trash'></i> Hapus invoice
                            </Dropdown.Item>
                            
                            </>
                        ):""
                    }
                </Dropdown.Menu>
            </Dropdown>
        </div>
        );
    };
    
    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((inv, index) => {
            return itemTemplate(inv, index);
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

    const receiptItemTemplate = (rowData, index) => {
        return (
        <div className="col-12" key={rowData.receipt_id} style={{position:'relative'}} aria-label="viewReceiptModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.receipt_id, items: rowData})}}>
            <div className='flex flex-column xl:align-items-start gap-2'
                style={{
                    backgroundColor: '#F8F9FD',
                    padding: '1rem',
                    boxShadow: '1px 1px 7px #9a9acc1a',
                    borderRadius: '9px',
                    position:'relative'
                }}
                aria-label="salesEditModal" 
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
                    rowData.customer.img ? rowData.customer.img
                        : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                    }
                    alt=""
                />
                </span>
                <div style={{width: '80%'}}>
                    <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600, textTransform: 'uppercase'}}>{rowData.receipt_id}</p>
                    <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{ConvertDate.LocaleStringDate(rowData.receipt_date)}</p>
                    <div className='flex flex-row gap-2' style={{fontSize: 13, marginTop: '.25rem', textTransform:'uppercase'}}> 
                        <span className={`badge badge-primary light`}>
                            #{rowData.invoice?.invoice_number}
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
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Pelanggan:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>{rowData.customer.name}</p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total bayar:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        <NumberFormat intlConfig={{
                            value: rowData.total_payment, 
                            locale: "id-ID",
                            style: "currency", 
                            currency: "IDR",
                        }} 
                        />
                    </p>
                </div>
                <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>kembali:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                        <NumberFormat intlConfig={{
                            value: rowData.change, 
                            locale: "id-ID",
                            style: "currency", 
                            currency: "IDR",
                        }} 
                        />
                    </p>
                </div>
                {/* <div className="flex flex-row justify-content-between">
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Sisa:</p>
                    <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                       
                    </p>
                </div> */}
            </div>
            </div>
            {/* <Dropdown drop={index == invData.length - 1 ? "up" : "down"} style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}> */}
            <Dropdown drop={"down"} style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"} className='static-shadow'>
                    <Dropdown.Item eventKey="1" as="button" aria-label="viewReceiptModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.receipt_id, items: rowData})}}>
                        <i className='bx bx-show'></i> Lihat receipt
                    </Dropdown.Item> 
                    {/* {
                        !rowData.is_paid ?
                        (
                            <>
                            <Dropdown.Item eventKey="1" as="button" aria-label="addPaymentModal" onClick={(e) => {e.stopPropagation();handleModal(e, {id: rowData.receipt_id, items:{...rowData}})}}>
                                <i className='bx bx-money'></i> Tambah pembayaran
                            </Dropdown.Item>
                            {
                                rowData.payment_type == "bayar nanti" ? 
                                (
                                    <Dropdown.Item eventKey="1" as="button" aria-label="editInvModal" onClick={(e) => {
                                        e.stopPropagation();
                                        handleModal(e, {id: rowData.invoice_id, items: rowData})
                                    }}>
                                        <i className='bx bxs-edit'></i> Edit invoice
                                    </Dropdown.Item>

                                ):''
                            }
                            
                            </>
                        ):""
                    } */}
                    {/* <Dropdown.Item eventKey="1" as="button" aria-label="deleteInvModal" onClick={(e) => {
                        e.stopPropagation();
                        // rowData.payments?.length > 0 ?
                        //     toast.current.show({
                        //         severity: "error",
                        //         summary: "Restricted",
                        //         detail: "Terdapat pembayaran yang sedang berlangsung",
                        //         life: 3000,
                        //     })
                        // : 
                        handleModal(e, {endpoint: "inv", action: 'delete' , id: rowData.invoice_id, items: rowData});
                    }}
                    >
                        <i className='bx bx-trash'></i> Hapus invoice
                    </Dropdown.Item> */}
                </Dropdown.Menu>
            </Dropdown>
        </div>
        );
    };

    
    const receiptListTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((receipt, index) => {
            return receiptItemTemplate(receipt, index);
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
        fetchAllInv();
        fetchAllReceipt();
    },[]);

    useEffect(() => {
        initFilters();
        initFiltersReceipt();
    }, []);

    useEffect(() => {
        if(paidData && invListObj){
            fetchInsertPayment();
            // console.log(paidData)
        }
    },[paidData]);

    useEffect(() => {
        if(deleteInv){
            console.log(invListObj)
            // check first if there is payment but not full in order related to invoice 
            if(invListObj.items.payments?.length > 0 && !invListObj.items.is_paid){
                // call info modal
                let data = {
                    id: invListObj.id, 
                    endpoint: 'content',
                    action: 'info',
                    items: invListObj.items
                }
                setInvList(data);
                setShowModal("");
                setShowModal("warningDeleteInvModal");
            } else if(invListObj.items.is_paid){
                // delete invoice
                deleteSelectedInv();
            } else if(invListObj.items.payments.length == 0 && !invListObj.items.is_paid){
                // console.log("aaha")
                // delete invoice
                deleteSelectedInv();
            }
        }
    },[deleteInv])

    useEffect(() => {
        if(invData){
            setLoading(false);
        } 
    },[invData]);

    useEffect(() => {
        if(refetch){
            fetchAllInv();
            fetchAllReceipt();
            setShowModal("");
            setRefetch(false);
        } 
    },[refetch]);

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
                                    <div className={`tab-indicator ${openTab === "invListTab" ? "active" : ""}`}  
                                        id='invListTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">invoice list</span>
                                    </div>
                                     <div className={`tab-indicator ${openTab === "receiptListTab" ? "active" : ""}`}  
                                        id='receiptListTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">Receipt list</span>
                                    </div>
                                    
                                </div>
                                <div className="tabs-content" style={openTab === "invListTab" ? {display: "block"} : {display: "none"}}>
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
                                                Create invoice
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
                                            <CustomSelect 
                                                options={["Status", "pending", "paid", "due"]}
                                                // defaultValue={}
                                                id="statusInvFilter"
                                                selectedOption={returnSelectVal} 
                                            /> 
                                        </div> */}
                                        {!isMobile && !isMediumScr ? 
                                        (
                                        <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={invData}
                                                size="normal"
                                                removableSort
                                                // stripedRows
                                                selectionMode={"checkbox"}
                                                // selection={selectedInvoice}
                                                // onSelectionChange={(e) => {
                                                //     setSelectedInv(e.value);
                                                // }}
                                                dataKey="invoice_id"
                                                tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                                filters={invFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "invoice_id",
                                                    "invoice_date",
                                                    "customer.name",
                                                    "customer.customer_id",
                                                    "amount_due",
                                                    "remaining_payment",
                                                    "payment_type",
                                                    "is_paid",
                                                    "invoice_due",
                                                ]}
                                                
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setInvFilters(e.filters)}
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
                                                key={1}
                                                field="invoice_number"
                                                header="nomor invoice"
                                                sortable
                                                bodyStyle={{...primeTableBodyStyle, textTransform:'uppercase'}}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                key={2}
                                                field="invoice_date"
                                                header="tanggal"
                                                body={formatedInvDate}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                key={3}
                                                field="customer.name"
                                                header="pelanggan"
                                                body={customerOrGuestName}
                                                filter 
                                                filterPlaceholder="Search by customer name"
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                             <Column
                                                key={4}
                                                field="customer_id"
                                                header="ID pelanggan"
                                                body={customerOrGuest}
                                                sortable
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                key={5}
                                                field="amount_due"
                                                header="tagihan"
                                                filter 
                                                // showFilterMenu={false}
                                                // filterMenuStyle={{ width: '100%' }}
                                                body={formatedAmountDue}
                                                filterPlaceholder={"order type"}
                                                style={{ textTransform: 'uppercase' }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                key={6}
                                                field="remaining_payment"
                                                header="sisa"
                                                filter 
                                                // showFilterMenu={false}
                                                // filterMenuStyle={{ width: '100%' }}
                                                body={formatedRemaining}
                                                filterPlaceholder={"order type"}
                                                style={{ textTransform: 'uppercase' }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                key={7}
                                                field="payment_type"
                                                header="pembayaran"
                                                body={paymentTypeCell}
                                                style={{ textTransform: "uppercase" }}
                                                filter
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                key={8}
                                                field="is_paid"
                                                header="bayar"
                                                body={isPaidCell}
                                                filter
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                // showFilterMenu={false} 
                                                // filterMenuStyle={{ width: '100%' }}
                                                // filterElement={statusRowFilter}
                                            ></Column>
                                            <Column
                                                key={9}
                                                field="invoice_due"
                                                header="status"
                                                body={invStatus}
                                                filter
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                // showFilterMenu={false} 
                                                // filterMenuStyle={{ width: '100%' }}
                                                // filterElement={statusRowFilter}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                key={10}
                                                field=""
                                                header="aksi"
                                                body={(rowData, rowIndex) => invActionCell(rowData, rowIndex)}
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
                                                    <i className="bx bx-plus"></i>
                                                    Buat invoice
                                                </button>
                                            </div>
                                            <DataView value={invData} listTemplate={listTemplate} style={{marginTop: '.5rem'}} emptyMessage='No data' />       
                                        </>
                                        )
                                        }

                                        {/* <div className="table-responsive mt-4">
                                            <table className="table" id="advancedTablesWFixedHeader" data-table-search="true"
                                                data-table-sort="true" data-table-checkbox="true">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <input className="form-check-input checkbox-primary checkbox-all"
                                                                type="checkbox" />
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="invoice-number">
                                                            Invoice Number
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="invoice-create-date">
                                                            Date
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="category">
                                                            Sales Reference
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="variant">
                                                            Customer Name
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Customer ID
                                                            <span className="sort-icon"></span>
                                                        </th> 
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Amount Due
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Remaining
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Paid
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Status
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invData ? 
                                                        (invData.map((inv, idx) => {
                                                            return (
                                                                <tr key={`inv-list- ${idx}`}>
                                                                    <th scope="row">
                                                                        <input className="form-check-input checkbox-primary checkbox-single" type="checkbox" value="" />
                                                                    </th>
                                                                    <td>{inv.invoice_id}</td>
                                                                    <td>{ConvertDate.convertToFullDate(inv.invoice_date,"/")}</td>
                                                                    <td><p className="view-note" aria-label="viewSalesRef" onClick={(e) => handleModal(e, inv.order_id)}>View sales</p></td>
                                                                    <td style={{textTransform:'capitalize'}}>{inv.customer.name}</td>
                                                                    <td>{inv.customer.customer_id}</td>
                                                                    <td>
                                                                        <NumberFormat intlConfig={{
                                                                            value: inv.amount_due, 
                                                                            locale: "id-ID",
                                                                            style: "currency", 
                                                                            currency: "IDR",
                                                                        }} />
                                                                    </td>
                                                                    <td>
                                                                        <NumberFormat intlConfig={{
                                                                            value: inv.remaining_payment, 
                                                                            locale: "id-ID",
                                                                            style: "currency", 
                                                                            currency: "IDR",
                                                                        }} />
                                                                    </td>
                                                                    <td style={{textTransform:'capitalize'}}>
                                                                        <span className={`badge badge-${inv.payment_type == "paid" ? "primary" : inv.payment_type == "partial" ? "warning" : inv.payment_type == "unpaid" ? "danger": "secondary"} light`}>{inv.payment_type}</span>
                                                                    </td>
                                                                    <td style={{textTransform:'capitalize'}}><span className={`badge badge-${inv.is_paid ? "primary" : "danger"} light`}>{inv.is_paid ? "paid" : "unpaid"}</span></td>
                                                                    <td style={{textTransform:'capitalize'}}><span className={`badge badge-${inv.is_paid ? "success"  : new Date() > new Date(inv.invoice_due) ?  "danger" : 'warning'} light`}>{inv.is_paid ? "completed" : new Date() > new Date(inv.invoice_due) ? "due" : 'in-progress'}</span></td>
                                                                    <td>
                                                                        <Dropdown drop={idx == invData.length - 1 ? "up" : "down"}>
                                                                            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>
                                                                            <Dropdown.Menu align={"end"}>
                                                                                <Dropdown.Item eventKey="1" as="button" aria-label="viewInvModal" onClick={(e) => handleModal(e, {id: inv.invoice_id, items:{...inv}})}>
                                                                                    <i className='bx bx-show'></i> Preview invoice
                                                                                </Dropdown.Item> 
                                                                                {
                                                                                    !inv.is_paid ?
                                                                                    (
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="addPaymentModal" onClick={(e) => handleModal(e, {id: inv.invoice_id, items:{...inv}})}>
                                                                                        <i className='bx bx-money'></i> Add payment
                                                                                    </Dropdown.Item>
                                                                                    ):""
                                                                                }
                                                                                <Dropdown.Item eventKey="1" as="button" aria-label="editInvModal" onClick={(e) => handleModal(e, inv.invoice_id)}>
                                                                                    <i className='bx bxs-edit'></i> Edit invoice
                                                                                </Dropdown.Item>
                                                                                <Dropdown.Item eventKey="1" as="button" aria-label="deleteInvModal" onClick={(e) => handleModal(e, {endpoint: "inv", id: inv.invoice_id})}>
                                                                                    <i className='bx bx-trash'></i> Delete invoice
                                                                                </Dropdown.Item>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })):null
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
                                <div className="tabs-content" style={openTab === "receiptListTab" ? {display: "block"} : {display: "none"}}>
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
                                            <CustomSelect 
                                                options={["Status", "pending", "paid", "due"]}
                                                defaultValue={0}
                                                id="statusInvFilter"
                                                selectedOption={returnSelectVal} 
                                            /> 
                                        </div> */}
                                        {!isMobile && !isMediumScr ?
                                        (
                                        <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={receiptData}
                                                size="normal"
                                                removableSort
                                                // stripedRows
                                                // selectionMode={"checkbox"}
                                                // selection={selectedInvoice}
                                                // onSelectionChange={(e) => {
                                                //     setSelected(e.value);
                                                // }}
                                                dataKey="payment_id"
                                                tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                                filters={receiptFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "receipt_id",
                                                    "invoice.invoice_number",
                                                    "receipt_date",
                                                    "customer.name",
                                                    "customer_id",
                                                    "total_payment",
                                                ]}
                                                
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setReceiptFilters(e.filters)}
                                                header={receiptTableHeader}
                                                paginator
                                                totalRecords={receiptTotalRecords}
                                                rows={50}
                                            >
                                            <Column
                                                key={2}
                                                field="receipt_id"
                                                header="nomor Receipt"
                                                sortable
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                             <Column
                                                key={3}
                                                field="invoice.invoice_number"
                                                header="nomor invoice"
                                                sortable
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={{...primeTableBodyStyle, textTransform: "uppercase"}}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                key={4}
                                                field="receipt_date"
                                                header="tanggal"
                                                body={formatedReceiptDate}
                                                dataType='date'
                                                filter 
                                                filterPlaceholder="Type a date"
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                key={6}
                                                field="customer.name"
                                                header="pelanggan"
                                                body={customerOrGuestName}
                                                filter 
                                                filterPlaceholder="Search by customer name"
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                key={5}
                                                field="customer_id"
                                                header="ID pelanggan"
                                                body={customerOrGuest}
                                                sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                key={7}
                                                field="total_payment"
                                                header="total pembayaran"
                                                // filter 
                                                // showFilterMenu={false}
                                                // filterMenuStyle={{ width: '100%' }}
                                                body={formatedTotal}
                                                sortable
                                                // filterPlaceholder={"order type"}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                style={{ textTransform: 'uppercase' }}
                                            ></Column>
                                            <Column
                                                key={8}
                                                field=""
                                                header="aksi"
                                                body={(rowData, rowIndex) => receiptActionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            </DataTable>
                                        </div>
                                        ):
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
                                                {/* <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                                                    aria-label="createInvModal"
                                                    onClick={(e) =>
                                                        handleModal(e, {
                                                            endpoint: "custType",
                                                            action: "insert",
                                                        })
                                                    }
                                                >
                                                    <i className="bx bx-plus"></i>
                                                    Buat invoice
                                                </button> */}
                                            </div>
                                            <DataView value={receiptData} listTemplate={receiptListTemplate} style={{marginTop: '.5rem'}} emptyMessage='No data' />       
                                        </>
                                        )
                                        }
                                        {/* <div className="table-responsive mt-4">
                                            <table className="table" id="advancedTablesWFixedHeader" data-table-search="true"
                                                data-table-sort="true" data-table-checkbox="true">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <input className="form-check-input checkbox-primary checkbox-all"
                                                                type="checkbox" />
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="invoice-number">
                                                            Receipt Number
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="category">
                                                            invoice number
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="invoice-create-date">
                                                            Date
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="variant">
                                                            Customer Name
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Customer ID
                                                            <span className="sort-icon"></span>
                                                        </th> 
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Amount Paid
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {receiptData ? 
                                                        (receiptData.map((receipt, idx) => {
                                                            return (
                                                                <tr key={`inv-list- ${idx}`}>
                                                                    <th scope="row">
                                                                        <input className="form-check-input checkbox-primary checkbox-single" type="checkbox" value="" />
                                                                    </th>
                                                                    <td>{receipt.receipt_id}</td>
                                                                    <td>{receipt.invoice_id}</td>
                                                                    <td>{ConvertDate.convertToFullDate(receipt.receipt_date,"/")}</td>
                                                                    <td style={{textTransform:'capitalize'}}>{receipt.customer.name}</td>
                                                                    <td>{receipt.customer.customer_id}</td>
                                                                    <td>
                                                                        <NumberFormat intlConfig={{
                                                                            value: receipt.total_payment, 
                                                                            locale: "id-ID",
                                                                            style: "currency", 
                                                                            currency: "IDR",
                                                                        }} />
                                                                    </td>
                                                                    {/* <td><span className={`badge badge-${inv.status === "pending" ? "secondary" : inv.status === "paid" ? "primary" : inv.status === "due" ? "danger" : ""} light`}>{inv.status}</span></td> */}
                                                                    {/* <td>
                                                                        <Dropdown drop={idx == receiptData.length - 1 ? "up" : "down"}>
                                                                            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>

                                                                            <Dropdown.Menu align={"end"}>
                                                                                <Dropdown.Item eventKey="1" as="button" aria-label="viewInvModal" onClick={(e) => handleModal(e, {id: receipt.id, items:{...receipt}})}>
                                                                                    <i className='bx bx-show'></i> View receipt
                                                                                </Dropdown.Item>
                                                                                <Dropdown.Item eventKey="1" as="button">
                                                                                    <i className='bx bx-download'></i> download PDF
                                                                                </Dropdown.Item> 
                                                                                <Dropdown.Item eventKey="1" as="button" aria-label="deleteInvModal" onClick={(e) => handleModal(e, {endpoint: "inv", id: receipt.id})}>
                                                                                    <i className='bx bx-trash'></i> Delete receipt
                                                                                </Dropdown.Item>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    ):null}
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

            {
                showModal === "createInvModal" ?
                (
                    <CreateInv 
                        show={showModal === "createInvModal" ? true : false} 
                        onHide={handleCloseModal} 
                        returnAct={(act) => {
                            act ? setRefetch(true) : setRefetch(false);
                        }}
                    />
                )
                : showModal === "editInvModal" ?
                (
                    <EditInv
                        show={showModal === "editInvModal" ? true : false} 
                        onHide={handleCloseModal} 
                        data={showModal === "editInvModal" ? invListObj : null}
                    />
                )
                : showModal === "viewInvModal" ?
                (
                    <InvoiceModal
                        show={showModal === "viewInvModal" ? true : false} 
                        onHide={handleCloseModal} 
                        data={showModal === "viewInvModal" ? invListObj : null} 
                        callModal={(modal, data) => handleModal(modal, data)}
                    />
                )
                : showModal == "viewReceiptModal" ?
                (
                    <ReceiptModal
                        show={showModal === "viewReceiptModal" ? true : false} 
                        onHide={handleCloseModal} 
                        data={showModal === "viewReceiptModal" ? invListObj : null} 
                        callModal={(modal, data) => handleModal(modal, data)}
                    />
                )
                : showModal === "viewSalesRef" ? 
                (
                    <ModalTextContent 
                        show={showModal === "viewSalesRef" ? true : false} 
                        onHide={handleCloseModal} 
                        data={showModal === "viewSalesRef" ? invListObj : null} 
                    />
                )
                : showModal === "addPaymentModal" ? 
                (
                    <CreatePayment
                        show={showModal === "addPaymentModal" ? true : false} 
                        onHide={handleCloseModal} 
                        source={'invoice'}
                        totalCart={showModal === "addPaymentModal" && invListObj ? invListObj.items.remaining_payment : ""} 
                        data={invListObj}
                        returnValue={(paymentData) => {setPaidData(paymentData);console.log(paymentData)}} 
                        multiple={true}
                        stack={1}
                    />
                ): showModal === "deleteInvModal" ?
                    (
                        <ConfirmModal show={showModal === "deleteInvModal" ? true : false} onHide={handleCloseModal} 
                            data={showModal === "deleteInvModal" ? invListObj : ""} 
                            msg={
                                <p style={{marginBottom: 0}}>
                                    Yakin ingin menghapus invoice ini?<br /> Data yang ada di invoice ini akan berubah.
                                </p>
                            }
                            returnValue={(confirmVal) => {setDeleteInv(confirmVal); console.log(confirmVal)}}
                        />
                    )
                : showModal === "warningDeleteInvModal" ?
                    (
                        <ConfirmModal show={showModal === "warningDeleteInvModal" ? true : false} onHide={handleCloseModal} 
                            data={showModal === "warningDeleteInvModal" ? invListObj : ""} 
                            msg={
                                <p style={{marginBottom: 0}}>
                                    Tidak dapat menghapus invoice ini karena terdapat pembayaran yang belum penuh.<br />
                                    Coba hapus pembayaran yang terkait terlebih dahulu lalu coba lagi.
                                </p>
                            }
                            returnValue={(confirmVal) => setDeleteInv(confirmVal)}
                        />
                    )
                :""
            }
            <Toast ref={toast} />
            {/* <SalesDetailModal show={showModal === "salesDetailModal" ? true : false} onHide={handleCloseModal} data={showModal === "salesDetailModal" ? salesListObj : ""} /> */}
            {/* <ConfirmModal show={showModal === "deleteSalesModal" ? true : false} onHide={handleCloseModal} data={showModal === "deleteSalesModal" ? salesListObj : ""} /> */}
        </>
    )
}