import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../parts/Sidebar.jsx";
import Header from "../parts/Header.jsx";
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
import { primeTableBodyStyle, primeTableHeaderStyle } from '../assets/js/primeStyling.js';

import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { ProgressSpinner } from "primereact/progressspinner";
import { useForm, useController, Controller } from "react-hook-form";
import CustDetailModal from "../elements/Modal/CustDetailModal.jsx";
import CustEditModal from "../elements/Modal/CustEditModal.jsx";
import ConfirmModal from "../elements/Modal/ConfirmModal.jsx";
import CustTypeModal from "../elements/Modal/CustTypeModal.jsx";
import { CustomSelect } from "../elements/CustomSelect/index.jsx";
import DropzoneFile from "../elements/DropzoneFile/index.jsx";
import convertFullDate from "../assets/js/ConvertDate.js";
import FetchApi from "../assets/js/fetchApi.js";
import InputWLabel from "../elements/Input/InputWLabel.jsx";
import InputWSelect from "../elements/Input/InputWSelect.jsx";
import InputGroup from "../elements/Input/InputGroup.jsx";
import useAxiosPrivate from "../hooks/useAxiosPrivate.js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CustomToggle from "../elements/Custom/CustomToggle.jsx";
import NumberFormat from "../elements/Masking/NumberFormat.jsx";
import { DataView } from "primereact/dataview";
import { classNames } from "primereact/utils";
import { Menu } from "primereact/menu";
import AddEmployeeModal from "../elements/Modal/AddEmployee.jsx";
import ConvertDate from "../assets/js/ConvertDate.js";
import EmployeeDetailModal from "../elements/Modal/EmployeeDetailModal.jsx";
import SalarySettingModal from "../elements/Modal/SalarySettingModal.jsx";

export default function Employees({handleSidebar, showSidebar}) {
  const toast = useRef(null);
  const toastUpload = useRef(null);
  const mobileSearchInput = useRef(null);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState("");
  const [mobileSearchMode, setMobileSearchMode] = useState(false);
  const [mobileFilterValue, setMobileFilterValue] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [ refetch, setRefetch ] = useState(false);
  const [employeeObj, setEmployeeObj] = useState({});
  const [delEmployee, setDelEmployee] = useState(false);
  const [custFilters, setCustFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [selectedCusts, setSelectedCusts] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const [ defaultAvatar, setDefaultAvatar ] = useState(null);
  const [ totalRecords, setTotalRecords ] = useState(0);

  const femaleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183325/Avatar_1_hhww7p.jpg`;
  const maleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183333/Avatar_2_zebyeg.jpg`;
  const noImg = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`;

  // const {
  //   register,
  //   handleSubmit,
  //   watch,
  //   control,
  //   reset,
  //   setValue,
  //   getValues,
  //   clearErrors,
  //   formState: { errors },
  // } = useForm({
  //   defaultValues: {
  //     name: "",
  //     phonenumber: "",
  //     email: "",
  //     debt_limit_formated: "0",
  //     debtLimit: "",
  //     gender: "",
  //     address: "",
  //     img: "",
  //   },
  //   mode:'onChange'
  // });

  const handleAvatar = (e) => {
    if(e.target.value == 'female' && e.target.checked){
      setDefaultAvatar(femaleAvatar);
      setValue('img', femaleAvatar);

    } else if(e.target.value == 'male' && e.target.checked){
      setDefaultAvatar(maleAvatar);
      setValue('img', maleAvatar);
    } else {
      setDefaultAvatar(noImg);
      setValue('img', noImg);
    }
  };

  const handleModal = (e, data) => {
    switch (e.currentTarget.ariaLabel) {
      case "addEmployee":
        setEmployeeObj(data);
        setShowModal("addEmployee");
        break;
      case "setSalaryModal":
        setEmployeeObj(data);
        setShowModal("setSalaryModal");
        break;
      case "viewEmployeeDetail":
        setEmployeeObj(data);
        setShowModal("viewEmployeeDetail");
        break;
      case "editEmployeeModal":
        setEmployeeObj(data);
        setShowModal("editEmployeeModal");
        break;
      case "confirmModal":
        setEmployeeObj(data);
        setShowModal("confirmModal");
        break;
      case "custTypeModal":
        if (data.action === "insert") {
          setActionModal("insert");
        } else if (data.action === "update") {
          setActionModal("update");
        }
        setEmployeeObj(data);
        setShowModal("custTypeModal");
        break;
    }
  };

  const handleCloseModal = () => {
    setShowModal("");
  };

  const fetchAllDepartment = async() => {
    await axiosPrivate.get("/department/all")
    .then((response) => {
      console.log(response.data);
      setDepartmentData(response.data);
    })
    .catch((error) => {
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Error when get department data",
        life: 3000,
      });
    });
  }

  const fetchAllEmployee = async () => {
    await axiosPrivate.get("/employee/all")
    .then((response) => {
      console.log(response.data);
      setEmployeeData(response.data);
      setTotalRecords(response.data.length);
      // setDupeCustData(response.data);
    })
    .catch((error) => {
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Error when get employee data",
        life: 3000,
      });
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

  const fetchDelEmployee = async() => {
    await axiosPrivate.delete(`/employee/del`, {params: {id: employeeObj.id}})
    .then(resp => {
        toast.current.show({
          severity: "success",
          summary: "Sukses",
          detail: "Data karyawan berhasil dihapus",
          life: 1500,
        });
       
        setRefetch(true);
    })
    .catch(error => {
      console.log(error)
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Error when deleting employee",
        life: 3000,
      });
    })
  }

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
    if (formData.imgDrop && formData.imgDrop.length > 0) {
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
      let newFormData = {...formData};
      fetchInsertCust(newFormData);
    }
  };

  const onError = () => {
    setToastContent({
      variant: "danger",
      msg: "Required field can't be blank!",
    });
    setShowToast(true);
  };

  // useEffect(() => {
  //   fetchAllCust();
  // }, []);

  // useEffect(() => {
  //   // if (custData !== "" && custTypeData) {
  //   //   setLoading(false);
  //   // }
  // }, [custData, custTypeData]);


  // control select filter

  const formatedDateCell = (rowData) => {
    return <span>{convertFullDate.convertToFullDate(rowData.createdAt, "/")}</span>;
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
    setEmployeeObj({
      endpoint: "customer",
      id: getOnlyID,
      action: "delete",
    });
    setShowModal("confirmModal");
  };

  const mobileFilterFunc = (e) => {
    setMobileFilterValue(e.target.value);
    e.target.value == "" ? setMobileSearchMode(false):setMobileSearchMode(true)
  }

  useEffect(() => {
    fetchAllEmployee();
    fetchAllDepartment();
  },[]);

  useEffect(() => {
    if(refetch){
      fetchAllEmployee();
      fetchAllDepartment();
      setShowModal("");
      setRefetch(false);
    } 
  },[refetch]);

   useEffect(() => {
      if(delEmployee){
        fetchDelEmployee(employeeObj.id);
      }
    },[delEmployee]);

  // if (isLoading) {
  //   return;
  // }

  return (
    <>
      <div className="container-fluid">
        <div
          className="wrapping-table-btn mt-4 flex gap-3 justify-content-end"
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
              aria-label="addEmployee"
              onClick={(e) =>
                  handleModal(e, {
                      action: "insert",
                      department: departmentData
                  })
              }
          >
              <i className="bx bx-plus"></i>
              Karyawan
          </button>
          <button type="button" className="add-btn btn btn-primary btn-w-icon" 
              aria-label="setSalaryModal"
              onClick={(e) =>
                  handleModal(e, {
                      action: "insert",
                  })
              }
          >
             <i class='bx bx-money-withdraw'></i>
              Set gaji
          </button>
        </div>
        <div className="profile-card-1-container mt-5">
          {employeeData && employeeData.map((employee, index) => {
            return(
            <div key={index} className="profile-card-1 card" aria-label="viewEmployeeDetail" onClick={(e) => handleModal(e, employee)}>
              <div className="profile-card-1-card-body">
                <div className="wrapping-inline">
                  <div className="profile-img-wrap">
                    <div className="profile-img-frame">
                      <img src={employee.img} />
                    </div>
                  </div>
                  <div className="profile-detail">
                    <p className="name">{employee.name}</p>
                    <p className="sub-detail">{
                      employee.department_histories[0]?.position ? 
                      employee.department_histories[0]?.position : "???"
                    }</p>
                    <div className="badge-wrapping">
                      <span className={`badge badge-${employee.is_active ? 'primary' : 'danger'} light`} style={{borderRadius: 17, textTransform:'capitalize'}}>
                        {employee.is_active ? 'aktif' : 'non-aktif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="profile-card-1-card-stack">
                <div className="card-stack-text-wrap">
                  <p className="card-stack-text">team</p>
                  <p className="card-stack-text">{
                    employee.department_histories[0]?.department?.department_name ? 
                    employee.department_histories[0]?.department?.department_name : "???"
                  }</p>
                </div>
                <div className="card-stack-text-wrap">
                  <p className="card-stack-text">tanggal rekrut</p>
                  <p className="card-stack-text">{ConvertDate.convertToFullDate(employee.hired_date, "/")}</p>
                </div>
                <div className="card-stack-text-wrap">
                  <p className="card-stack-text">Nomor telepon</p>
                  <p className="card-stack-text">{employee.phonenumber}</p>
                </div>
              </div>

              <Dropdown drop={"down"}  style={{position: 'absolute', top: 3, right: 12, padding: '1rem 1rem .5rem 1rem'}}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle2} id="dropdown-custom-components" style={{width: 24}}></Dropdown.Toggle>
                <Dropdown.Menu align={"end"} className="static-shadow">
                  <Dropdown.Item eventKey="1" as="button" aria-label="editEmployeeModal"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModal(e, {
                          id: employee.employee_id,
                          action: "update",
                          rowData: {...employee},
                          department: departmentData
                        });
                      }} 
                    >
                      <i className='bx bxs-edit'></i> Ubah profil
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="1" as="button" aria-label="editEmployeeModal"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModal(e, {
                          id: employee.employee_id,
                          action: "update",
                          rowData: {...employee},
                          department: departmentData
                        });
                      }} 
                    >
                      <i className='bx bxs-edit'></i> Ubah gaji
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="1" as="button" aria-label="confirmModal"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModal(e, {
                        endpoint: "employee",
                        id: employee.employee_id,
                        action: "delete",
                      })
                    }} 
                  >
                    <i className='bx bx-trash'></i> Hapus data
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            )
          })}
        </div>
      </div>
      {/* modal area */}
      
      {showModal === "addEmployee" || showModal == "editEmployeeModal" ? (
        <AddEmployeeModal
          show={showModal === "addEmployee" || "editEmployeeModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "addEmployee" || "editEmployeeModal" ? employeeObj : ""}
          returnAct={(act) => act ? setRefetch(true) : setRefetch(false)}
        />
      ): showModal === "setSalaryModal" ? (
        <SalarySettingModal
          show={showModal === "setSalaryModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "setSalaryModal" ? employeeObj : ""}
          returnAct={(act) => act ? setRefetch(true) : setRefetch(false)}
        />
      )
      : showModal === "viewEmployeeDetail" ? (
        <EmployeeDetailModal
          show={showModal === "viewEmployeeDetail" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "viewEmployeeDetail" ? employeeObj : ""}
        />
      ): showModal === "editCustModal" ? (
        <CustEditModal
          show={showModal === "editCustModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "editCustModal" ? employeeObj : ""}
        />
      ) : showModal === "confirmModal" ? (
        <ConfirmModal
          show={showModal === "confirmModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "confirmModal" ? employeeObj : ""}
          msg={"Yakin ingin menghapus data ini?"}
          returnValue={(value) => {setDelEmployee(value)}}
        />
      ) : showModal === "custTypeModal" ? (
        <CustTypeModal
          show={showModal === "custTypeModal" ? true : false}
          onHide={handleCloseModal}
          action={actionModal}
          data={showModal === "custTypeModal" ? employeeObj : ""}
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
