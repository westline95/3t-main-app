import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../parts/Sidebar.jsx";
import Header from "../parts/Header.jsx";
import { DataTable } from "primereact/datatable";
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
import ConvertDate from "../assets/js/convertFullDate.js";
import InvoiceModal from "../elements/Modal/InvoiceModal.jsx";
import ModalTextContent from "../elements/Modal/ModalTextContent.jsx";
import FetchApi from "../assets/js/fetchApi.js";
import EmptyState from "../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import CreatePayment from "../elements/Modal/CreatePaymentModal.jsx";
import InvoicePayment from "../elements/Modal/InvoicePayment.jsx";


export default function Payment() {
  const [isClose, setClose] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allPayment, setAllPayment] = useState(null);
  const [openTab, setOpenTab] = useState("payListTab");
  const [invListObj, setInvList] = useState(null);
  const [showModal, setShowModal] = useState("");
  const [ paymentFilters, setPaymentFilters ] = useState(null);
  const [ globalFilterValue, setGlobalFilterValue ] = useState("");
  const [ totalRecords, setTotalRecords ] = useState(0);
  const [ selectedPayment, setSelectedPayment ] = useState(null);

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
      case "deleteInvModal":
        data = {
          origin: invListData,
          items: InvRef != null ? JSON.parse(InvRef) : InvRef,
        };
        setInvList(data);
        setShowModal("deleteInvModal");
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
    }
  };

  const handleCloseModal = () => {
    setShowModal("");
  };
  
  useEffect(() => {
    if (allPayment) {
      setIsLoading(false);
    }
  }, [allPayment]);

  useEffect(() => {
    fetchAllPayment();
  }, []);


  if (isLoading) {
    return;
  }
 
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
    let _filters = { ...invFilters };

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
        invoice_id: {
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
                <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                    aria-label="addInvPayment"
                    onClick={handleModal}
                >
                    <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                    Add payment manually
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
        as={CustomToggle}
        id="dropdown-custom-components"
      ></Dropdown.Toggle>

      <Dropdown.Menu align={"end"}>
        <Dropdown.Item
          eventKey="1"
          as="button"
          aria-label="editInvModal"
          onClick={(e) =>
            handleModal(e, rowData.payment_id)
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
              id: rowData.payment_id,
            })
          }
        >
          <i className="bx bx-trash"></i>{" "}
          Delete payment
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
    );
  };

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
                          header="payment Number"
                          sortable
                          bodyStyle={{ textTransform: "capitalize" }}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="invoice_id"
                          header="invoice Number"
                          sortable
                          bodyStyle={{ textTransform: "capitalize" }}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                         <Column
                          field="payment_ref"
                          header="ref"
                          sortable
                          bodyStyle={{ textTransform: "capitalize" }}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                            field="payment_date"
                            header="date"
                            body={formatedPaymentDate}
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
                            field="customer_id"
                            header="customer id"
                            sortable
                            bodyStyle={{ textTransform: "capitalize" }}
                            style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                            field="amount_paid"
                            header="amount paid"
                            // filter 
                            // showFilterMenu={false}
                            // filterMenuStyle={{ width: '100%' }}
                            body={formatedAmountPaid}
                            sortable
                            // filterPlaceholder={"order type"}
                            bodyStyle={{ textTransform: 'capitalize' }}
                            style={{ textTransform: 'uppercase' }}
                        ></Column>
                        <Column
                          field="note"
                          header="note"
                          body={paymentNote}
                          bodyStyle={{textTransform: 'capitalize'}}
                          filter
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="payment_method"
                          header="method"
                          body={paymentMethod}
                          bodyStyle={{textTransform: 'capitalize'}}
                          filter
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
        ) : showModal === "addPaymentModal" ? 
        (
          <CreatePayment
            show={showModal === "addPaymentModal" ? true : false} 
            onHide={handleCloseModal} 
            source={'invoice'}
            totalCart={showModal === "addPaymentModal" && invListObj ? invListObj.items.remaining_payment : ""} 
            data={invListObj}
            returnValue={(paymentData) => {setPaidData(paymentData);console.log(paymentData)}} 
          />
        ) : 
        showModal === "addInvPayment" ?
          (
            <InvoicePayment 
                show={showModal === "addInvPayment" ? true : false} 
                onHide={handleCloseModal} 
            />
          )
      : (
        ""
      )}
      <Toast ref={toast} />
      {/* <SalesDetailModal show={showModal === "salesDetailModal" ? true : false} onHide={handleCloseModal} data={showModal === "salesDetailModal" ? salesListObj : ""} /> */}
      {/* <ConfirmModal show={showModal === "deleteSalesModal" ? true : false} onHide={handleCloseModal} data={showModal === "deleteSalesModal" ? salesListObj : ""} /> */}
    </>
  );
}
