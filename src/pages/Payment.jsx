import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../parts/Sidebar.jsx";
import Header from "../parts/Header.jsx";
import { DataTable } from "primereact/datatable";
import { primeTableBodyStyle, primeTableHeaderStyle } from '../assets/js/primeStyling.js';
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import useAxiosPrivate from "../hooks/useAxiosPrivate.js";
import { CustomSelect } from "../elements/CustomSelect/index.jsx";
import NumberFormat from "../elements/Masking/NumberFormat.jsx";
import DropzoneFile from "../elements/DropzoneFile/index.jsx";
import SalesDetailModal from "../elements/Modal/salesDetailModal.jsx";
import SalesEditModal from "../elements/Modal/SalesEditModal.jsx";
import ConfirmModal from "../elements/Modal/ConfirmModal.jsx";
import InputWLabel from "../elements/Input/InputWLabel.jsx";
import CustomToggle from "../elements/Custom/CustomToggle.jsx";
import { Dropdown } from "react-bootstrap";
import ConvertDate from "../assets/js/ConvertDate.js";
import InvoiceModal from "../elements/Modal/InvoiceModal.jsx";
import ModalTextContent from "../elements/Modal/ModalTextContent.jsx";
import FetchApi from "../assets/js/fetchApi.js";
import EmptyState from "../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import CreatePayment from "../elements/Modal/CreatePaymentModal.jsx";
import InvoicePayment from "../elements/Modal/InvoicePayment.jsx";
import useMediaQuery from "../hooks/useMediaQuery.js";
import { DataView } from "primereact/dataview";


export default function Payment() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

  const mobileSearchInput = useRef(null);
  const [isClose, setClose] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allPayment, setAllPayment] = useState(null);
  const [openTab, setOpenTab] = useState("payListTab");
  const [invListObj, setInvList] = useState(null);
  const [deletePayment, setDeletePayment] = useState(false);
  const [showModal, setShowModal] = useState("");
  const [ paymentFilters, setPaymentFilters ] = useState(null);
  const [ globalFilterValue, setGlobalFilterValue ] = useState("");
  const [ totalRecords, setTotalRecords ] = useState(0);
  const [ selectedPayment, setSelectedPayment ] = useState(null);
  const [ paidData, setPaidData ] = useState(null);
  const [ mobileSearchMode, setMobileSearchMode ] = useState(false);
  const [ mobileFilterValue, setMobileFilterValue ] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const toast = useRef(null);

  const fetchAllPayment = async () => {
    await axiosPrivate.get("/payment/all")
      .then((resp) => {
        setAllPayment(resp.data);
        setTotalRecords(resp.data.length);
      })
      .catch((err) => {
        toast.current.show({
            severity: "error",
            summary: "Failed",
            detail: "Error when get payment data!",
            life: 3000,
        });
      });
  };

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

  const fetchEditPayment = async() => {
    if(paidData){
      let paymentModel = {
        payment_date: paidData.payment_date,
        change: Number(paidData.change),
        ref: paidData.payment_ref,
        note: paidData.note,
        amount_paid: Number(paidData.amountOrigin),
        payment_method: paidData.payment_method,
        invoice_id: paidData.originData.invoice_id
      }
  
      await axiosPrivate.patch(`/payment/minor-update?id=${paidData.originData.payment_id}`, paymentModel)
      .then(res => {
        fetchAllPayment();
        fetchDetailedCust(paidData.originData.customer_id);

        toast.current.show({
          severity: "success",
          summary: "Sukses",
          detail: "Data pembayaran diperbarui",
          life: 1200,
        });
      })
      .catch(err => {
        toast.current.show({
          severity: "error",
          summary: "Gagal",
          detail: "Gagal memperbarui data pembayaran",
          life: 3000,
        });
      })
    }
  }

  const fetchDeletePayment = async() =>{
    await axiosPrivate.delete(`/payment/del?id=${invListObj.id}`)
    .then(res => {
      fetchAllPayment();
      fetchDetailedCust(invListObj.items.customer_id);

      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Data pembayaran dihapus",
        life: 1200,
      });
    })
    .catch(err => {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menghapus data pembayaran",
        life: 3000,
      });
    })
  }

  const handleClick = (e) => {
    switch (e.target.id) {
      case "payListTab":
        setOpenTab("payListTab");
        break;
    }
  };

  const returnSelectVal = (val) => {};

  const handleModal = (e, invData, InvRef) => {
    let data;
    switch (e.currentTarget.ariaLabel) {
      case "viewInvModal":
        // data = {
        //   origin: invData.id,
        //   items: invData.items,
        // };
        setInvList(invData);
        setShowModal("viewInvModal");
        break;
      case "invEditModal":
        data = {
          origin: invListData,
          items: InvRef != null ? JSON.parse(InvRef) : InvRef,
        };
        setInvList(data);
        setShowModal("invEditModal");
        break;
      case "deletePaymentModal":
        setInvList(invData);
        setShowModal("deletePaymentModal");
        break;
      case "viewPayRef":
        data = {
          textContent: invData,
          title: "Payment Reference",
        };
        setInvList(data);
        setShowModal("viewPayRef");
        break;
      case "viewPayNote":
        data = {
          textContent: invData,
          title: "Payment Note",
        };
        setInvList(data);
        setShowModal("viewPayNote");
        break;
       case "addInvPayment":
        setShowModal("addInvPayment");
        break;
      case "editPaymentModal":
        data = {
            id: invData.id, 
            items: invData.items,
            action: 'update',
            source: 'payment'
        }
        setInvList(data);
        setShowModal("editPaymentModal");
        break;
    }
  };

  const handleCloseModal = () => {
    setShowModal("");
  };

 
 
  const emptyStateHandler = () => {
    return (
    <div style={{width: '100%', textAlign: 'center'}}>
        <img src={EmptyState} style={{width: '165px', height: '170px'}}  />
        <p style={{marginBottom: ".3rem"}}>No result found</p>
    </div>
    )
  };

  const clearFilter = () => {
    initFilters();
  };
    
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...paymentFilters };

    _filters["global"].value = value;

    setPaymentFilters(_filters);
    setGlobalFilterValue(value);
  };

  const initFilters = () => {
    setPaymentFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        payment_id: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        'invoice.invoice_number': {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        payment_date: {
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
        amount_paid: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        payment_method: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
    });
    setGlobalFilterValue("");
  };

 
  
  const tableHeader = (rowData) => {
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
                <div
                    className="selected-row-stat"
                    style={{
                    height: "inherit",
                    display:
                        setSelectedPayment && setSelectedPayment.length > 0 ? "block" : "none",
                    }}
                >
                    {/* <p className="total-row-selected"></p>
                    <button
                    type="button"
                    className=" btn btn-danger btn-w-icon"
                    style={{ height: "100%" }}
                    onClick={selectedToDelete}
                    >
                    <i className="bx bx-trash" style={{ fontSize: "24px" }}></i>Delete
                    selected row
                    </button> */}
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
                <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                    aria-label="addInvPayment"
                    onClick={handleModal}
                >
                    <i className="bx bx-plus" style={{ marginTop: -2.25 }}></i>
                    pembayaran
                </button>
            </div>
        </div>
    );
  };

  const formatedPaymentDate = (rowData) => {
    return <span>{ConvertDate.convertToFullDate(rowData.payment_date, "/")}</span>;
  };

  const formatedAmountPaid = (rowData) => {
    return(
      <NumberFormat intlConfig={{
          value: rowData.amount_paid, 
          locale: "id-ID",
          style: "currency", 
          currency: "IDR",
      }} />
    )
  };

  const paymentMethod = (rowData) => {
    return(
      <span className={`badge badge-${
          rowData.payment_method == "cash" ?  "success" : "primary"} light`}
      >{rowData.payment_method}</span>

    )
  };

  const paymentNote = (rowData) => {
    return(
      <p className="view-note" aria-label="viewPayNote" onClick={(e) => { 
        let data = {
            textContent: rowData.note, 
            title: "Payment note"
        }
        setInvList(data);
        setShowModal("viewPayNote");
      }}>View note</p>
    )
  }
  
  const selectedToDelete = () => {
    const getOnlyID = selectedPayment.map(e => {
      return e.payment_id
    });
    setCustObj({
      endpoint: "customer",
      id: getOnlyID,
      action: "delete",
    });
    setShowModal("confirmModal");
  };

  const actionCell = (rowData, rowIndex) => {
    return (
      <Dropdown
        drop={
          rowIndex == allPayment.length - 1
            ? "up"
            : "down"
        }
      >
      <Dropdown.Toggle
        as={CustomToggle.CustomToggle1}
        id="dropdown-custom-components"
      ></Dropdown.Toggle>

      <Dropdown.Menu align={"end"}>
        <Dropdown.Item
          eventKey="1"
          as="button"
          aria-label="editPaymentModal"
          onClick={(e) => {
            e.stopPropagation();
            handleModal(e, {id: rowData.invoice_id, items:{...rowData}})
          }}
        >
          <i className="bx bxs-edit"></i> Ubah
          pembayaran
        </Dropdown.Item>
        <Dropdown.Item
          eventKey="1"
          as="button"
          aria-label="deletePaymentModal" onClick={(e) => {
              e.stopPropagation();
              handleModal(e, {endpoint: "payment", action: 'delete' , id: rowData.payment_id, items: rowData});
          }}
        >
          <i className="bx bx-trash"></i>
          Hapus pembayaran
        </Dropdown.Item>
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
    <div className="col-12" key={index} 
      style={{position:'relative'}} 
      // aria-label="viewInvModal" onClick={(e) => handleModal(e, {id: rowData.invoice_id, items: rowData})}
    >
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
            <span className="user-img" style={{marginRight: 0,}}>
            {
              rowData.payment_method == "cash" ? 
              (
                <i className='bx bx-money'></i>
              ): rowData.payment_method == "transfer" ? 
              (
                <i className='bx bx-credit-card' ></i>
              ): "?"

            }
            </span>
            <div style={{width: '80%'}}>
                <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600, textTransform: 'uppercase'}}>{rowData.payment_id}</p>
                <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{ConvertDate.LocaleStringDate(rowData.payment_date)}</p>
                <div className='flex flex-row flex-wrap gap-2' style={{fontSize: 13, marginTop: '.5rem'}}>
                    <span className={`badge badge-primary light`} style={{textTransform: 'uppercase'}}>
                        {rowData.invoice.invoice_number}
                    </span>
                    {
                      rowData.invoice.receipt ?
                      (
                        <span className={`badge badge-success light`}
                        >{rowData.invoice.receipt.receipt_id}</span>
                      ):''
                    }
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
                <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Bayar:</p>
                <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086', textAlign: 'right'}}>
                    <NumberFormat intlConfig={{
                        value: rowData.amount_paid, 
                        locale: "id-ID",
                        style: "currency", 
                        currency: "IDR",
                    }} 
                    />
                </p>
            </div>
            {/* <div className="flex flex-row justify-content-between">
                <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Metode:</p>
                <span className={`badge badge-${
                    rowData.payment_method == "cash" ? 'success'
                    : rowData.payment_method == "transfer"? "primary"
                    : ""} light`}
                >
                    {rowData.payment_method }                                                                                
                </span>
            </div> */}
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
                <Dropdown.Item eventKey="1" as="button" 
                  aria-label="editPaymentModal"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModal(e, {id: rowData.invoice_id, items:{...rowData}})
                  }}
                >
                    <i className='bx bxs-edit'></i>Ubah pembayaran
                </Dropdown.Item> 
                <Dropdown.Item eventKey="2" as="button" 
                  aria-label="deletePaymentModal" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModal(e, {endpoint: "payment", action: 'delete' , id: rowData.payment_id, items: rowData});
                  }}
                >
                    <i className='bx bx-trash'></i>Hapus pembayaran
                </Dropdown.Item> 
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
  
  useEffect(() => {
    fetchAllPayment();
    initFilters();
  }, []);
  
  useEffect(() => {
    fetchEditPayment();
  }, [paidData]);

  useEffect(() => {
    if(deletePayment){
      fetchDeletePayment();
    }
  },[deletePayment])
  
  useEffect(() => {
    if (allPayment) {
      setIsLoading(false);
    }
  }, [allPayment]);


  if (isLoading) {
    return;
  }

  return (
    <>
      {/* <main className={`main-content ${isClose ? "active" : ""}`}>
        <Header onClick={() => (isClose ? setClose(false) : setClose(true))} /> */}
        <div className="container-fluid">
          <div className="row mt-4">
            <div className="col-lg-12 col-sm-12 col-md-12 col-12">
              <div className="basic-tabs">
                <div className="tabs">
                  <div
                    className={`tab-indicator ${
                      openTab === "payListTab" ? "active" : ""
                    }`}
                    id="payListTab"
                    onClick={(e) => handleClick(e)}
                  >
                    <span className="tab-title">payment list</span>
                  </div>
                </div>
                <div
                  className="tabs-content"
                  style={
                    openTab === "payListTab"
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <div className="card card-table add-on-shadow">
                    {/* <div className="wrapping-table-btn">
                      <span className="selected-row-stat">
                        <p className="total-row-selected"></p>
                        <button
                          type="button"
                          className=" btn btn-danger btn-w-icon"
                        >
                          <i className="bx bx-trash"></i>Delete selected row
                        </button>
                      </span>
                      <button type="button" className="btn btn-light light">
                        <i className="bx bx-filter-alt"></i>
                      </button>
                      <button type="button" className="btn btn-light light">
                        <i className="bx bx-printer"></i>
                      </button>
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-primary btn-w-icon dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bx bx-download"></i> export
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="#">
                              PDF (.pdf)
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Microsoft Excel (.xlsx)
                            </a>
                          </li>
                        </ul>
                      </div>
                      <button
                        type="button"
                        className=" btn btn-primary btn-w-icon"
                      >
                        <i className="bx bxs-file-plus"></i> import
                      </button>
                    </div>
                    <p className="card-title">filter</p>
                    <div className="filter-area">
                      <div className="table-search">
                        <div className="input-group-right">
                          <span className="input-group-icon input-icon-right">
                            <i className="zwicon-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control input-w-icon-right"
                            placeholder="Search customer..."
                          />
                        </div>
                      </div>
                    </div> */}
                  {!isMobile && !isMediumScr ?
                  (
                    <div className="mt-4">
                        <DataTable
                            className="p-datatable"
                            value={allPayment}
                            size="normal"
                            removableSort
                            // stripedRows
                            selectionMode={"checkbox"}
                            // selection={setSelectedPayment}
                            // onSelectionChange={(e) => {
                            //     setSelected(e.value);
                            // }}
                            dataKey="payment_id"
                            tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                            filters={paymentFilters}
                            filterDisplay='menu'
                            globalFilterFields={[
                                "payment_id",
                                "payment_date",
                                "customer.name",
                                "customer_id",
                                "amount_paid",
                                "payment_method",
                            ]}
                            
                            emptyMessage={emptyStateHandler}
                            onFilter={(e) => setPaymentFilters(e.filters)}
                            header={tableHeader}
                            paginator
                            totalRecords={totalRecords}
                            rows={50}
                        >
                        <Column
                          selectionMode="multiple"
                          headerStyle={{ width: "3.5rem" }}
                        ></Column>
                        <Column
                          field="payment_id"
                          header="ID pembayaran"
                          sortable
                          bodyStyle={primeTableBodyStyle}
                          headerStyle={primeTableHeaderStyle}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="invoice_id"
                          header="ID invoice"
                          sortable
                          bodyStyle={primeTableBodyStyle}
                            headerStyle={primeTableHeaderStyle}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                         <Column
                          field="payment_ref"
                          header="ref"
                          sortable
                          bodyStyle={primeTableBodyStyle}
                            headerStyle={primeTableHeaderStyle}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                            field="payment_date"
                            header="tanggal"
                            body={formatedPaymentDate}
                            dataType='date'
                            filter 
                            filterPlaceholder="Type a date"
                            style={{ textTransform: "uppercase" }}
                            bodyStyle={primeTableBodyStyle}
                            headerStyle={primeTableHeaderStyle}
                        ></Column>
                        <Column
                            field="customer.name"
                            header="pelanggan"
                            filter 
                            filterPlaceholder="Search by customer name"
                            style={{ textTransform: "uppercase" }}
                            bodyStyle={primeTableBodyStyle}
                            headerStyle={primeTableHeaderStyle}
                        ></Column>
                        <Column
                            field="customer_id"
                            header="ID pelanggan"
                            sortable
                            bodyStyle={primeTableBodyStyle}
                            headerStyle={primeTableHeaderStyle}
                            style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                            field="amount_paid"
                            header="Jumlah"
                            // filter 
                            // showFilterMenu={false}
                            // filterMenuStyle={{ width: '100%' }}
                            body={formatedAmountPaid}
                            sortable
                            // filterPlaceholder={"order type"}
                            bodyStyle={primeTableBodyStyle}
                            headerStyle={primeTableHeaderStyle}
                            style={{ textTransform: 'uppercase' }}
                        ></Column>
                        <Column
                          field="note"
                          header="note"
                          body={paymentNote}
                          bodyStyle={primeTableBodyStyle}
                          headerStyle={primeTableHeaderStyle}
                          filter
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="payment_method"
                          header="metode"
                          body={paymentMethod}
                          bodyStyle={primeTableBodyStyle}
                          headerStyle={primeTableHeaderStyle}
                          filter
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
                          aria-label="addInvPayment"
                          onClick={handleModal}
                      >
                          <i className="bx bx-plus"></i>
                          pembayaran
                      </button>
                    </div>
                    <DataView value={allPayment} listTemplate={listTemplate} style={{marginTop: '.5rem'}} emptyMessage='No data' />       
                  </>
                  )
                  }
                    {/* <div className="table-responsive mt-4">
                      <table
                        className="table"
                        id="advancedTablesWFixedHeader"
                        data-table-search="true"
                        data-table-sort="true"
                        data-table-checkbox="true"
                      >
                        <thead>
                          <tr>
                            <th scope="col">
                              <input
                                className="form-check-input checkbox-primary checkbox-all"
                                type="checkbox"
                              />
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="invoice-number"
                            >
                              Payment ID
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="invoice-create-date"
                            >
                              Invoice number
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="category"
                            >
                              ref
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="category"
                            >
                              Payment Date
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="variant"
                            >
                              Customer Name
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="sub variant"
                            >
                              Customer ID
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="qty"
                            >
                              Amount Paid
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="category"
                            >
                              note
                              <span className="sort-icon"></span>
                            </th>
                            <th>
                              Method
                              <span className="sort-icon"></span>
                            </th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c
                            ? allPayment.map((payment, idx) => {
                              console.log(payment.customer)
                                return (
                                  <tr key={`inv-list- ${idx}`}>
                                    <th scope="row">
                                      <input
                                        className="form-check-input checkbox-primary checkbox-single"
                                        type="checkbox"
                                        value=""
                                      />
                                    </th>
                                    <td>{payment.payment_id}</td>
                                    <td>{payment.invoice_id}</td>
                                    <td><p className="view-note" aria-label="viewPayRef" onClick={(e) => handleModal(e, payment.payment_ref)}>View ref</p></td>
                                    <td>
                                      {ConvertDate.convertToFullDate(
                                        payment.payment_date,
                                        "/"
                                      )}
                                    </td>
                                    <td style={{ textTransform: "capitalize" }}>
                                      {payment.customer.name}
                                    </td>
                                    <td>{payment.customer.customer_id}</td>
                                    <td>
                                      <NumberFormat
                                        intlConfig={{
                                          value: payment.amount_paid,
                                          locale: "id-ID",
                                          style: "currency",
                                          currency: "IDR",
                                        }}
                                      />
                                    </td>
                                    <td><p className="view-note" aria-label="viewPayNote" onClick={(e) => handleModal(e, payment.note)}>View notes</p></td>
                                    <td style={{ textTransform: "capitalize" }}>
                                      <span
                                        className={`badge badge-${
                                          payment.payment_method == "cash"
                                            ? "success"
                                            : "warning"
                                        } light`}
                                      >
                                        {payment.payment_method}
                                      </span>
                                    </td>
                                    <td>
                                      <Dropdown
                                        drop={
                                          idx == allPayment.length - 1
                                            ? "up"
                                            : "down"
                                        }
                                      >
                                        <Dropdown.Toggle
                                          as={CustomToggle}
                                          id="dropdown-custom-components"
                                        ></Dropdown.Toggle>

                                        <Dropdown.Menu align={"end"}>
                                          <Dropdown.Item
                                            eventKey="1"
                                            as="button"
                                            aria-label="editInvModal"
                                            onClick={(e) =>
                                              handleModal(e, payment.payment_id)
                                            }
                                          >
                                            <i className="bx bxs-edit"></i> Edit
                                            payment
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            eventKey="1"
                                            as="button"
                                            aria-label="deleteInvModal"
                                            onClick={(e) =>
                                              handleModal(e, {
                                                endpoint: "payment",
                                                id: payment.payment_id,
                                              })
                                            }
                                          >
                                            <i className="bx bx-trash"></i>{" "}
                                            Delete payment
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </td>
                                  </tr>
                                );
                              })
                            : ""}
                        </tbody>
                      </table>
                      <div className="table-end d-flex justify-content-between">
                        <p className="table-data-capt" id="tableCaption"></p>
                        <ul
                          className="basic-pagination"
                          id="paginationBtnRender"
                        ></ul>
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

      {showModal === "viewInvModal" ? (
        <InvoiceModal
          show={showModal === "viewInvModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "viewInvModal" ? invListObj : null}
        />
      ) : showModal === "viewSalesRef" ? (
        <ModalTextContent
          show={showModal === "viewSalesRef" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "viewSalesRef" ? invListObj : null}
        />
      ) : showModal === "viewPayRef" ? 
        (
          <ModalTextContent 
            show={showModal === "viewPayRef" ? true : false} 
            onHide={handleCloseModal} 
            data={showModal === "viewPayRef" ? invListObj : null} 
          />
        )
         : showModal === "viewPayNote" ? 
        (
          <ModalTextContent 
            show={showModal === "viewPayNote" ? true : false} 
            onHide={handleCloseModal} 
            data={showModal === "viewPayNote" ? invListObj : null} 
          />
        ) : showModal === "editPaymentModal" ? 
        (
          <CreatePayment
            show={showModal === "editPaymentModal" ? true : false} 
            onHide={handleCloseModal} 
            source={'invoice'}
            totalCart={showModal === "editPaymentModal" && invListObj ? invListObj.items.remaining_payment : ""} 
            data={invListObj}
            returnValue={(paymentData) => {setPaidData(paymentData)}} 
          />
        ) : 
        showModal === "addInvPayment" ?
          (
          <InvoicePayment 
            show={showModal === "addInvPayment" ? true : false} 
            onHide={handleCloseModal} 
          />
          )
      : showModal === "deletePaymentModal" ?
        (
        <ConfirmModal show={showModal === "deletePaymentModal" ? true : false} onHide={handleCloseModal} 
          data={showModal === "deletePaymentModal" ? invListObj : ""} 
          msg={
            <p style={{marginBottom: 0}}>
              Yakin ingin menghapus pembayaran ini?
            </p>
          }
          returnValue={(confirmVal) => {setDeletePayment(confirmVal)}}
        />
        ) 
      :""}
      <Toast ref={toast} />
      {/* <SalesDetailModal show={showModal === "salesDetailModal" ? true : false} onHide={handleCloseModal} data={showModal === "salesDetailModal" ? salesListObj : ""} /> */}
      {/* <ConfirmModal show={showModal === "deleteSalesModal" ? true : false} onHide={handleCloseModal} data={showModal === "deleteSalesModal" ? salesListObj : ""} /> */}
    </>
  );
}
