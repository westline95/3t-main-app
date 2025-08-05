import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../parts/Sidebar";
import Header from "../parts/Header";
// import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { FilterMatchMode, FilterOperator } from "primereact/api";

import {
  // Toast,
  // ToastContainer,
  Accordion,
  Dropdown,
  useAccordionButton,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { ProgressSpinner } from "primereact/progressspinner";
import { useForm, useController } from "react-hook-form";
import CustDetailModal from "../elements/Modal/CustDetailModal";
import CustEditModal from "../elements/Modal/CustEditModal";
import ConfirmModal from "../elements/Modal/ConfirmModal";
import CustTypeModal from "../elements/Modal/CustTypeModal";
import { CustomSelect } from "../elements/CustomSelect";
import DropzoneFile from "../elements/DropzoneFile";
import FriendlyDate from "../elements/Date/FriendlyDate";
import FetchApi from "../assets/js/fetchApi";
import InputWLabel from "../elements/Input/InputWLabel";
import InputWSelect from "../elements/Input/InputWSelect";
import InputGroup from "../elements/Input/InputGroup";
import ConvertDate from "../assets/js/convertFullDate";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CustomToggle from "../elements/Custom/CustomToggle";
import NumberFormat from "../elements/Masking/NumberFormat";
import { DataView } from "primereact/dataview";
import { classNames } from "primereact/utils";
import { Menu } from "primereact/menu";

export default function Customers({handleSidebar, showSidebar}) {
  const getUserRef = useRef(false);
  const toast = useRef(null);
  const toastUpload = useRef(null);
  const mobileMoreOpt = useRef(null);
  const mobileSearchInput = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isClose, setClose] = useState(false);
  const [openTab, setOpenTab] = useState("custTab");
  const [showModal, setShowModal] = useState("");
  const [actionModal, setActionModal] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [toastContent, setToastContent] = useState({
    variant: "",
    msg: "",
    title: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [custData, setCustData] = useState(null);
  const [dupeCustData, setDupeCustData] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [custTypeData, setCustType] = useState(null);
  const [mobileSearchMode, setMobileSearchMode] = useState(false);
  const [mobileFilterValue, setMobileFilterValue] = useState("");
  // const [isLoading, setLoading] = useState(true);
  const [custObj, setCustObj] = useState({});
  const [custID, setCustID] = useState(null);
  const [newCustName, setNewCustName] = useState("");
  const [newCustCategory, setNewCustCategory] = useState("");
  const [custTypeFilter, setCustTypeFilter] = useState("");
  const [custFilters, setCustFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [newCustDob, setNewCustDob] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustDebtLimit, setNewCustDebtLimit] = useState("");
  const [newCustGender, setNewCustGender] = useState("");
  const [newCustCountry, setNewCustCountry] = useState("");
  const [newCustProvince, setNewCustProvince] = useState("");
  const [newCustCity, setNewCustCity] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustZipCode, setNewCustZipCode] = useState("");
  const accordionBtnCustInfo = useAccordionButton(0);
  const [selectedCusts, setSelectedCusts] = useState(null);
  const [rowClick, setRowClick] = useState(true);
  const [users, setUsers] = useState();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const [ defaultAvatar, setDefaultAvatar ] = useState(null);

  const femaleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183325/Avatar_1_hhww7p.jpg`;
  const maleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183333/Avatar_2_zebyeg.jpg`;

  const accordionClick = (eventKey) => {
    useAccordionButton(0);
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phonenumber: "",
      email: "",
      debtLimit: "",
      gender: "",
      address: "",
      img: "",
    },
  });

  const handleAvatar = (e) => {
    if(e.target.value == 'female' && e.target.checked){
      setDefaultAvatar(femaleAvatar);
      setValue('img', femaleAvatar);

    } else if(e.target.value == 'male' && e.target.checked){
      setDefaultAvatar(maleAvatar);
      setValue('img', maleAvatar);
    } else {
      setDefaultAvatar(null); 
      setValue('img', '');
    }
  };

  const handleClick = (e) => {
    switch (e.target.id) {
      case "custTab":
        setOpenTab("custTab");
        break;
      case "addCust":
        setOpenTab("addCust");
        break;
      case "custType":
        setOpenTab("custType");
        break;
    }
  };

  const handleModal = (e, data) => {
    switch (e.currentTarget.ariaLabel) {
      case "custDetailModal":
        setCustObj(data);
        setShowModal("custDetailModal");
        break;
      case "editCustModal":
        setCustObj(data);
        setShowModal("editCustModal");
        break;
      case "confirmModal":
        setCustObj(data);
        setShowModal("confirmModal");
        break;
      case "custTypeModal":
        if (data.action === "insert") {
          setActionModal("insert");
        } else if (data.action === "update") {
          setActionModal("update");
        }
        setCustObj(data);
        setShowModal("custTypeModal");
        break;
    }
  };

  const handleActionModal = (e, data, action) => {
    switch (action) {
      case "insert":
        setCustObj(data);
        setShowModal("custTypeModal");
        setActionModal("insert");
        break;
      case "edit":
        setCustObj(data);
        setShowModal("custTypeModal");
        setActionModal("edit");
        break;
    }
  };

  const handleCloseModal = () => {
    setShowModal("");
  };

  const fetchAllCust = async () => {
    await axiosPrivate
      .get("/customers")
      .then((response) => {
        setCustData(response.data);
        setTotalRecords(response.data.length);
        setDupeCustData(response.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Error when get customer data",
          life: 3000,
        });
      });
  };

  const fetchCustType = () => {
    FetchApi.fetchCustType()
      .then((data) => {
        setCustType(data);
      })
      .catch((error) => {
        setToastContent({
          variant: "danger",
          msg: "Error when get customer type data!",
        });
        setShowToast(true);
      });
  };

  const fetchInsertCust = (custData) => {
    let body = JSON.stringify(custData);
    axiosPrivate
      .post("customer/write", body)
      .then((data) => {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Sucessfully add new customer",
          life: 3000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Failed to add customer",
          life: 3000,
        });
      });
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onSubmit = async (formData) => {
    setProgress(0);
    if (formData.img && formData.img.length > 0) {
      const imgFile = formData.img[0];
      const base64 = await convertBase64(imgFile);

      axiosPrivate
        .post(
          "/api/upload/img",
          { image: base64 },
          {
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              toastUpload.current.show({
                summary: "Uploading your files...",
              });
              setProgress(progress);
            },
          }
        )
        .then((res) => {
          let newFormData = {
            ...formData,
            img: res.data,
          };
          setProgress(100);
          toastUpload.current.clear();
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Sucessfully upload image",
            life: 3000,
          });
          fetchInsertCust(newFormData);
        })
        .catch((err) => {
          setProgress(0);
          toast.current.show({
            severity: "error",
            summary: "Failed",
            detail: "Failed to upload image",
            life: 3000,
          });
        });
    } else {
      fetchInsertCust(formData);
    }
  };

  const onError = () => {
    setToastContent({
      variant: "danger",
      msg: "Required field can't be blank!",
    });
    setShowToast(true);
  };

  useEffect(() => {
    fetchAllCust();

    // fetchCustType();
  }, []);

  useEffect(() => {
    // if (custData !== "" && custTypeData) {
    //   setLoading(false);
    // }
  }, [custData, custTypeData]);

  useEffect(() => {
    reset();
  }, [openTab]);

  // control select filter
  useEffect(() => {
    if (custTypeFilter && custTypeFilter !== "") {
      const getMatch = custData.filter(
        ({ custTypeId }) => custTypeId === custTypeFilter.id
      );
      setDupeCustData(getMatch);
    } else {
      setDupeCustData(custData);
    }
  }, [custTypeFilter]);

  const cellWithImg = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="user-img">
          <img
            src={
              rowData.img && rowData.img != ""
                ? rowData.img
                : "../src/assets/images/Avatar 2.jpg"
            }
            alt=""
          />
        </span>
        {rowData.name}
      </div>
    );
  };

  const actionCellCust = (rowData) => {
    return (
      <div style={{ display: "inline-flex" }}>
        <span
          className="table-btn detail-table-data"
          aria-label="custDetailModal"
          onClick={(e) => handleModal(e, rowData)}
        >
          <i className="bx bx-show"></i>
        </span>
        <span
          className="table-btn edit-table-data"
          aria-label="editCustModal"
          onClick={(e) => {
            handleModal(e, {
              endpoint: "customer",
              id: rowData.customer_id,
              action: "update",
              ...rowData,
            });
          }}
        >
          <i className="bx bxs-edit"></i>
        </span>
        <span
          className="table-btn del-table-data"
          aria-label="confirmModal"
          onClick={(e) =>
            handleModal(e, {
              endpoint: "customer",
              id: [rowData.customer_id],
              action: "delete",
            })
          }
        >
          <i className="bx bx-trash"></i>
        </span>
      </div>
    );
  };

  const formatedDateCell = (rowData) => {
    return <span>{ConvertDate.convertToFullDate(rowData.createdAt, "/")}</span>;
  };
  
  const formatedCurrencySales = (rowData) => {
    return (
      <NumberFormat intlConfig={{
        value: rowData.total_sales, 
        locale: "id-ID",
        style: "currency", 
        currency: "IDR",
      }} />
    )
  };
  
  const formatedCurrencyDebt = (rowData) => {
     return (
      <NumberFormat intlConfig={{
        value: rowData.total_debt, 
        locale: "id-ID",
        style: "currency", 
        currency: "IDR",
      }} />
    )
  };
  
  const formatedCurrencyLimit = (rowData) => {
     return (
      <NumberFormat intlConfig={{
        value: rowData.debt_limit, 
        locale: "id-ID",
        style: "currency", 
        currency: "IDR",
      }} />
    )
  };

  const clearFilter = () => {
    initFilters();
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...custFilters };

    _filters["global"].value = value;

    setCustFilters(_filters);
    setGlobalFilterValue(value);
  };

  const initFilters = () => {
    setCustFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
      },
      customer_id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      debt_limit: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      }, 
      total_sales: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
       total_debt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      // representative: { value: null, matchMode: FilterMatchMode.IN },
      phonenumber: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      createdAt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      // status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      // activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
      // verified: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    setGlobalFilterValue("");
  };

  // const exportCSV = (selectionOnly) => {
  //       dt.current.exportCSV({ selectionOnly });
  //   };

  //   const exportPdf = () => {
  //       import('jspdf').then((jsPDF) => {
  //           import('jspdf-autotable').then(() => {
  //               const doc = new jsPDF.default(0, 0);

  //               doc.autoTable(exportColumns, products);
  //               doc.save('products.pdf');
  //           });
  //       });
  //   };

  //   const exportExcel = () => {
  //       import('xlsx').then((xlsx) => {
  //           const worksheet = xlsx.utils.json_to_sheet(products);
  //           const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  //           const excelBuffer = xlsx.write(workbook, {
  //               bookType: 'xlsx',
  //               type: 'array'
  //           });

  //           saveAsExcelFile(excelBuffer, 'products');
  //       });
  //   };

  //   const saveAsExcelFile = (buffer, fileName) => {
  //       import('file-saver').then((module) => {
  //           if (module && module.default) {
  //               let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  //               let EXCEL_EXTENSION = '.xlsx';
  //               const data = new Blob([buffer], {
  //                   type: EXCEL_TYPE
  //               });

  //               module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  //           }
  //       });
  //   };
  const selectedToDelete = () => {
    const getOnlyID = selectedCusts.map(e => {
      return e.customer_id
    });
    setCustObj({
      endpoint: "customer",
      id: getOnlyID,
      action: "delete",
    });
    setShowModal("confirmModal");
  };

  const custHeader = () => {
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

  const dataviewMoreItems = [
    {
      // label: 'Options',
      items: [
        {
          label: 'Ubah data',
          icon: 'bx bxs-edit',
          command: (e) => {
            console.log(e)
          }
        //   aria-label="editCustModal"
        //   onClick={(e) => {
        //     handleModal(e, {
        //       endpoint: "customer",
        //       id: rowData.customer_id,
        //       action: "update",
        //       ...rowData,
        //     });
        //   }}
        // >
          // <i className="bx bxs-edit"></i>
        },
        {
          label: 'Hapus data',
          icon: 'bx bx-trash'
        }
      ]
    }
  ];

  // list setting
  const itemTemplate = (rowData, index) => {
    return (
      <div className="col-12" key={rowData.id} style={{position:'relative'}}>
        <div className={classNames('flex flex-column xl:align-items-start gap-3')} 
          style={{
            backgroundColor: '#F8F9FD',
            padding: '1.5rem',
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
                paddingBottom: '1rem',
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
              <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600}}>{rowData.name}</p>
              <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{rowData.customer_id}</p>
            </div>
          </div>
          <div className="flex flex-column gap-1" 
              style={{
                textTransform: 'capitalize', 
              }}
          >
            <div className="flex flex-row justify-content-between">
              <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>limit:</p>
              <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>
                <NumberFormat intlConfig={{
                    value: rowData.debt_limit, 
                    locale: "id-ID",
                    style: "currency", 
                    currency: "IDR",
                  }} 
                />
              </p>
            </div>
            <div className="flex flex-row justify-content-between">
              <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total hutang:</p>
              <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>
                <NumberFormat intlConfig={{
                    value: rowData.total_debt, 
                    locale: "id-ID",
                    style: "currency", 
                    currency: "IDR",
                  }} 
                />
              </p>
            </div>
            <div className="flex flex-row justify-content-between">
              <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>Total order:</p>
              <p style={{marginBottom: 0, fontSize: 14, color: '#7d8086'}}>
                <NumberFormat intlConfig={{
                    value: rowData.total_sales, 
                    locale: "id-ID",
                    style: "currency", 
                    currency: "IDR",
                  }} 
                />
              </p>
            </div>
          </div>
        </div>
          <Dropdown drop={index == custData.length - 1 ? "up" : "down"}  style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>
            <Dropdown.Menu align={"end"}>
              <Dropdown.Item eventKey="1" as="button" aria-label="editCustModal"
                  onClick={(e) => {
                    handleModal(e, {
                      endpoint: "customer",
                      id: rowData.customer_id,
                      action: "update",
                      ...rowData,
                    });
                  }} 
                >
                  <i className='bx bxs-edit'></i> Ubah data
              </Dropdown.Item>
              <Dropdown.Item eventKey="1" as="button" aria-label="confirmModal"
                onClick={(e) =>
                  handleModal(e, {
                    endpoint: "customer",
                    id: [rowData.customer_id],
                    action: "delete",
                  })
                } 
              >
                <i className='bx bx-trash'></i> Hapus data
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
      </div>
    );
  };

  const mobileFilterFunc = (e) => {
    setMobileFilterValue(e.target.value);
    e.target.value == "" ? setMobileSearchMode(false):setMobileSearchMode(true)
  }

  const listTemplate = (items) => {
    if (!items || items.length === 0) return null;

    let list = items.map((product, index) => {
        return itemTemplate(product, index);
    });

    return (
      <>
      <div className="flex flex-column gap-2" style={{ width: "100%" }}>
        <div
          className="wrapping-table-btn flex gap-3 justify-content-end"
          style={{ width: "100%", height: "inherit" }}
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


  useEffect(() => {
    initFilters();
  }, []);

  // if (isLoading) {
  //   return;
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
                  <div
                    className={`tab-indicator ${
                      openTab === "custTab" ? "active" : ""
                    }`}
                    id="custTab"
                    onClick={(e) => handleClick(e)}
                  >
                    <span className="tab-title">customers</span>
                  </div>
                  <div
                    className={`tab-indicator ${
                      openTab === "addCust" ? "active" : ""
                    }`}
                    id="addCust"
                    onClick={(e) => handleClick(e)}
                  >
                    <span className="tab-title">add customer</span>
                  </div>
                  {/* <div
                    className={`tab-indicator ${
                      openTab === "custType" ? "active" : ""
                    }`}
                    id="custType"
                    onClick={(e) => handleClick(e)}
                  >
                    <span className="tab-title">customer type</span>
                  </div> */}
                </div>
                <div
                  className="tabs-content"
                  style={
                    openTab === "custTab"
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <div className="card card-table add-on-shadow">
                    {/* <p className="card-title">filter</p>
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
                      <InputWSelect
                        name="custTypeFilter"
                        selectLabel="Select customer type"
                        options={custTypeData ? custTypeData : []}
                        optionKeys={["id", "type"]}
                        value={(selected) => {
                          setCustTypeFilter(selected);
                        }}
                      />
                    </div> */}
                    {/* <div className="mt-4"> */}
                      <DataTable
                        className="p-datatable"
                        value={dupeCustData}
                        size="normal"
                        removableSort
                        // stripedRows
                        selectionMode={"checkbox"}
                        selection={selectedCusts}
                        onSelectionChange={(e) => {
                          setSelectedCusts(e.value);
                        }}
                        dataKey="customer_id"
                        style={{marginTop: '1.5rem' }}
                        tableStyle={{ minWidth: "50rem", fontSize: '14px'}}
                        filters={custFilters}
                        globalFilterFields={[
                          "name",
                          "customer_id",
                          "email",
                          "phonenumber",
                          "createdAt",
                        ]}
                        emptyMessage="No customers found."
                        onFilter={(e) => setCustFilters(e.filters)}
                        header={custHeader}
                        paginator
                        totalRecords={totalRecords}
                        rows={25}
                      >
                        <Column
                          selectionMode="multiple"
                          headerStyle={{ width: "3.5rem" }}
                        ></Column>
                        <Column
                          field="name"
                          header="Customer Name"
                          body={cellWithImg}
                          bodyStyle={{ textTransform: "capitalize" }}
                          style={{ textTransform: "uppercase" }}
                          sortable
                        ></Column>
                        <Column
                          field="customer_id"
                          header="Customer ID"
                          sortable
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="phonenumber"
                          header="phonenumber"
                          sortable
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="debt_limit"
                          header="limit"
                          body={formatedCurrencyLimit}
                          bodyStyle={{textTransform: 'capitalize'}}
                          sortable
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="total_sales"
                          header="Total sales"
                          body={formatedCurrencySales}
                          bodyStyle={{textTransform: 'capitalize'}}
                          sortable
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field="total_debt"
                          header="Total debt"
                          body={formatedCurrencyDebt}
                          bodyStyle={{textTransform: 'capitalize'}}
                          sortable
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                        <Column
                          field=""
                          header="Action"
                          body={actionCellCust}
                          style={{ textTransform: "uppercase" }}
                        ></Column>
                      </DataTable>
                    {/* </div> */}

                    {/* <div className="card" style={{backgroundColor: '#F4FBFE'}}> */}
                    {/* list view */}
                    {/* <div className="card"> */}
                      <DataView value={dupeCustData} listTemplate={listTemplate} style={{marginTop: '.5rem'}} />
                    {/* </div> */}
                  {/* </div> */}
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
                              aria-label="product Name"
                            >
                              customer name
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="category"
                            >
                              customer ID
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="sub variant"
                            >
                              email
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="qty"
                            >
                              phone
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="sku"
                            >
                              created
                              <span className="sort-icon"></span>
                            </th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody id="custListRender">
                          {dupeCustData
                            ? dupeCustData.map((cust, idx) => {
                                return (
                                  <tr key={`cust-list- ${idx}`}>
                                    <th scope="row">
                                      <input
                                        className="form-check-input checkbox-primary checkbox-single"
                                        type="checkbox"
                                        value=""
                                      />
                                    </th>
                                    <td className="data-img" style={{textTransform: 'capitalize'}}>
                                      <span className="user-img">
                                        <img
                                          src="../src/assets/images/Avatar 2.jpg"
                                          alt=""
                                        />
                                      </span>
                                      {cust.name}
                                    </td>
                                    <td>{cust.customer_id}</td>
                                    <td>{cust.email}</td>
                                    <td>{cust.phonenumber}</td>
                                    <td>{ConvertDate.convertToFullDate(cust.createdAt, "/")}</td>
                                    <td>
                                      <span
                                        className="table-btn detail-table-data"
                                        aria-label="custDetailModal"
                                        onClick={(e) => handleModal(e, cust)}
                                      >
                                        <i className="bx bx-show"></i>
                                      </span>
                                      <span
                                        className="table-btn edit-table-data"
                                        aria-label="editCustModal"
                                        onClick={(e) => {
                                          handleModal(e, {
                                            endpoint: "customer",
                                            id: cust.customer_id,
                                            action: "update",
                                            ...cust,
                                          });
                                        }}
                                      >
                                        <i className="bx bxs-edit"></i>
                                      </span>
                                      <span
                                        className="table-btn del-table-data"
                                        aria-label="confirmModal"
                                        onClick={(e) =>
                                          handleModal(e, {
                                            endpoint: "customer",
                                            id: cust.customer_id,
                                            action: "delete",
                                          })
                                        }
                                      >
                                        <i className="bx bx-trash"></i>
                                      </span>
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
                <div
                  className="tabs-content"
                  style={
                    openTab === "addCust"
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <div className="card card-table add-on-shadow">
                    <p className="card-title">Add customer</p>
                    <Accordion
                      defaultActiveKey={["0", "1"]}
                      alwaysOpen
                      className="accordion accordion-w-icon"
                    >
                      <form>
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            <i className="bx bx-info-circle"></i>customer
                            information
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="add-prod-area mt-4 mb-4">
                              <div className="add-prod-img-wrap">
                                <label className="mb-1">customer image</label>
                                <DropzoneFile
                                  name={"img"}
                                  register={register}
                                  require={false}
                                  errors={errors}
                                  defaultValue={defaultAvatar}
                                />
                              </div>
                              <div className="add-prod-detail-wrap">
                                <div className="row sm:gap-2 md:gap-0 md:row-gap-3 lg:gap-4 xl:gap-4">
                                  <div className="col-lg-4 col-sm-12 col-md-6 col-12">
                                    <InputWLabel
                                      label="customer name"
                                      type="text"
                                      name="name"
                                      placeholder="Jane Doe"
                                      register={register}
                                      require={true}
                                      errors={errors}
                                    />
                                  </div>
                                  {/* <div className="col-lg-4 col-sm-6 col-md-6 col-12">
                                    <InputWSelect
                                      label="customer type"
                                      name="custTypeId"
                                      selectLabel="Select customer type"
                                      options={custTypeData ? custTypeData : []}
                                      optionKeys={["cust_type_id", "type"]}
                                      value={(selected) => {
                                        setNewCustCategory(selected);
                                        setValue("custTypeId", selected);
                                        selected.value != ""
                                          ? clearErrors("custTypeId")
                                          : null;
                                      }}
                                      register={register}
                                      require={true}
                                      errors={errors}
                                      // watch={watch('custTypeId')}
                                    />
                                  </div> */}
                                  <div className="col-lg-4 col-sm-12 col-md-6 col-12">
                                    <InputWLabel
                                      label="date of birth"
                                      type="date"
                                      name="dob"
                                      placeholder="26-03-2002"
                                      // defaultValue={""}
                                      register={register}
                                      require={false}
                                      errors={errors}
                                    />
                                  </div>
                                  <div className="col-lg-4 col-sm-12 col-md-6 col-12">
                                    <InputGroup
                                      label="phonenumber"
                                      groupLabel="+62"
                                      type="text"
                                      position="left"
                                      mask={'phone'}
                                      name="phonenumber"
                                      register={register}
                                      require={true}
                                      errors={errors}
                                    />
                                  </div>
                                  <div className="col-lg-4 col-sm-12 col-md-6 col-12">
                                    <InputWLabel
                                      label="email"
                                      type="email"
                                      name="email"
                                      placeholder="janedoe@gmail.com"
                                      register={register}
                                      require={false}
                                      errors={errors}
                                    />
                                  </div>
                                  <div className="col-lg-4 col-sm-12 col-md-6 col-12">
                                    <InputGroup
                                      label="credit/debt limit"
                                      groupLabel="Rp"
                                      type="text"
                                      position="left"
                                      name="debt_limit_formated"
                                      mask={"currency"}
                                      returnValue={(value) =>
                                        setValue("debt_limit", value.origin)
                                      }
                                      require={true}
                                      register={register}
                                      errors={errors}
                                    />
                                  </div>
                                  <div className="col-lg-4 col-sm-12 col-md-6 col-12 sm:mt-2 md:mt-0 lg:mt-0 xl:mt-0">
                                    <label className=" mb-1">Gender</label>
                                    <div className="d-flex form-check-control">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input radio-primary"
                                          type="radio"
                                          value="female"
                                          name="gender"
                                          {...(register != null
                                            ? {
                                                ...register("gender", {
                                                  required: false,
                                                  onChange: handleAvatar
                                                }),
                                              }
                                            : "")}
                                        />
                                        <label className="form-check-label">
                                          Female
                                        </label>
                                      </div>
                                      <div className="form-check">
                                        <input
                                          className="form-check-input radio-primary"
                                          type="radio"
                                          value="male"
                                          name="gender"
                                          {...(register != null
                                            ? {
                                                ...register("gender", {
                                                  required: false,
                                                  onChange: handleAvatar
                                                }),
                                              }
                                            : "")}
                                        />
                                        <label className="form-check-label">
                                          Male
                                        </label>
                                      </div>
                                      {errors
                                        ? errors["gender"]?.type ===
                                            "required" && (
                                            <span className="field-msg-invalid">
                                              This field is required
                                            </span>
                                          )
                                        : ""}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>
                            <i className="bx bx-home-alt"></i>customer address
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="row gy-2 mt-0">
                              {/* <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                <InputWSelect
                                                                    label="country" 
                                                                    name="country"
                                                                    options={["Select country", "Indonesia"]}
                                                                    value={(selected) => setNewCustCountry(selected)}
                                                                    register={register}
                                                                    require={false}
                                                                    errors={errors}
                                                                    defaultValue={0}
                                                                    controller={useController({ name: 'country', control })}
                                                                />
                                                            </div>
                                                            <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                <InputWSelect
                                                                    label="province" 
                                                                    name="province"
                                                                    options={["Select province", "North Sumatera", "Riau"]}
                                                                    value={(selected) => setNewCustProvince(selected)}
                                                                    register={register}
                                                                    require={false}
                                                                    errors={errors}
                                                                    defaultValue={0}
                                                                    controller={useController({ name: 'province', control })}
                                                                />
                                                            </div>
                                                            <div className="col-lg-3 col-sm-6 col-md-6 col-12">
                                                                <InputWSelect
                                                                    label="city" 
                                                                    name="city"
                                                                    options={["Select City", "Medan Kota", "Bagan Batu"]}
                                                                    value={(selected) => setNewCustCity(selected)}
                                                                    register={register}
                                                                    require={false}
                                                                    errors={errors}
                                                                    defaultValue={0}
                                                                    controller={useController({ name: 'city', control })}
                                                                />
                                                            </div>
                                                            <div className="col-lg-2 col-sm-3 col-md-3 col-4">
                                                                <InputWLabel
                                                                    label="postal/zip code"
                                                                    type="text" 
                                                                    name="postalCode" 
                                                                    placeholder="12345" 
                                                                    register={register}
                                                                    require={false}
                                                                    errors={errors}
                                                                />
                                                            </div> */}
                              <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                                <InputWLabel
                                  label="address"
                                  as="textarea"
                                  name="address"
                                  placeholder="your address"
                                  register={register}
                                  require={false}
                                  errors={errors}
                                />
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </form>
                    </Accordion>
                    <div className="wrapping-table-btn mt-5">
                      <button
                        type="button"
                        className="add-btn btn btn-primary btn-w-icon"
                        onClick={handleSubmit(onSubmit, onError)}
                      >
                        <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                        add customer
                      </button>
                    </div>
                  </div>
                </div>
                {/* <div
                  className="tabs-content"
                  style={
                    openTab === "custType"
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <div className="card card-table add-on-shadow">
                    <div className="table-btn-area mb-3">
                      <span className="wrapping-table-btn">
                        <span className="selected-row-stat">
                          <p className="total-row-selected"></p>
                          <button
                            type="button"
                            className=" btn btn-danger btn-w-icon"
                          >
                            <i className="bx bx-trash"></i>Delete selected row
                          </button>
                        </span>
                        <button
                          type="button"
                          className="add-btn btn btn-primary btn-w-icon"
                          data-bs-toggle="modal"
                          aria-label="custTypeModal"
                          onClick={(e) =>
                            handleModal(e, {
                              endpoint: "custType",
                              action: "insert",
                            })
                          }
                        >
                          <i
                            className="bx bx-plus"
                            style={{ marginTop: -3 }}
                          ></i>
                          add customer type
                        </button>
                      </span>
                    </div>
                    <div className="table-responsive mt-4">
                      <table
                        className="table"
                        id="custTypeList"
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
                              aria-label="product Name"
                            >
                              customer type
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="sku"
                            >
                              created
                              <span className="sort-icon"></span>
                            </th>
                            <th
                              scope="col"
                              className="head-w-icon sorting"
                              aria-label="sku"
                            >
                              status
                              <span className="sort-icon"></span>
                            </th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {custTypeData
                            ? custTypeData.map((data, idx) => {
                                return (
                                  <tr key={`custType-${idx}`}>
                                    <th scope="row">
                                      <input
                                        className="form-check-input checkbox-primary checkbox-single"
                                        type="checkbox"
                                        value={data.cust_type_id}
                                      />
                                    </th>
                                    <td style={{ textTransform: "capitalize" }}>
                                      {data.type}
                                    </td>
                                    <td>
                                      {ConvertDate.convertToFullDate(
                                        data.createdAt,
                                        "/"
                                      )}
                                    </td>
                                    <td>
                                      <span
                                        className={`badge badge-${
                                          data.status === true
                                            ? "primary"
                                            : "danger"
                                        } light`}
                                      >
                                        {data.status === true
                                          ? "Open"
                                          : "Close"}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className="table-btn edit-table-data"
                                        aria-label="custTypeModal"
                                        onClick={(e) =>
                                          handleModal(e, {
                                            endpoint: "custType",
                                            action: "update",
                                            ...data,
                                          })
                                        }
                                      >
                                        <i className="bx bxs-edit"></i>
                                      </span>
                                      <span
                                        className="table-btn del-table-data"
                                        aria-label="confirmModal"
                                        onClick={(e) =>
                                          handleModal(e, {
                                            endpoint: "custType",
                                            action: "delete",
                                            ...data,
                                          })
                                        }
                                      >
                                        <i className="bx bx-trash"></i>
                                      </span>
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
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      {/* </main> */}
      {/* modal area */}
      <CustDetailModal
        show={showModal === "custDetailModal" ? true : false}
        onHide={handleCloseModal}
        data={showModal === "custDetailModal" ? custObj : ""}
      />
      {showModal === "editCustModal" ? (
        <CustEditModal
          show={showModal === "editCustModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "editCustModal" ? custObj : ""}
        />
      ) : showModal === "confirmModal" ? (
        <ConfirmModal
          show={showModal === "confirmModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "confirmModal" ? custObj : ""}
          msg={"Are you sure want to permanently remove this data?"}
        />
      ) : showModal === "custTypeModal" ? (
        <CustTypeModal
          show={showModal === "custTypeModal" ? true : false}
          onHide={handleCloseModal}
          action={actionModal}
          data={showModal === "custTypeModal" ? custObj : ""}
        />
      ) : (
        ""
      )}
      {/* end of modal area */}

      {/* toast area */}
      {/* <ToastContainer className="p-3 custom-toast">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={toastContent.delay ? toastContent.delay : 3000}
          autohide={toastContent.autohide ? toastContent.autohide : true}
          bg={toastContent.variant}
        >
          <Toast.Body style={{ fontSize: 16 }}>
            <div className="d-flex custom-toast-content">
              {toastContent.loadingState ? (
                <ProgressSpinner
                  style={{ width: 24, height: 24, marginRight: 12 }}
                />
              ) : (
                ""
              )}
              {toastContent.msg}
            </div>
          </Toast.Body>
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
  );
}
