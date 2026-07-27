import React, { useCallback, useEffect, useRef, useState } from "react";
import { Collapse, Modal } from "react-bootstrap";
import { Toast } from "primereact/toast";
import { useForm, useController } from "react-hook-form";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import FetchApi from "../../assets/js/fetchApi";
import User from "../../assets/images/Avatar 1.jpg";
import { CustomSelect } from "../CustomSelect";
import ConvertDate from "../../assets/js/ConvertDate";
import ConfirmModal from "./ConfirmModal";
import InputWLabel from "../Input/InputWLabel";
import InputGroup from "../Input/InputGroup";
import InputWSelect from "../Input/InputWSelect";
import DropzoneFile from "../DropzoneFile";
import dataStatic from "../../assets/js/dataStatic";
import NumberFormat from "../Masking/NumberFormat";

export default function LeaveTypesModal({ show, onHide, data, returnAct }) {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  let locale = "id-ID";
  const formatedNumber = new Intl.NumberFormat(locale);

  const toast = useRef(null);
  const toastUpload = useRef(null);
  const refToThis = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [ openPopup, setOpenPopup ] = useState(false);
  const [ filterName, setFilteredName ] = useState([]);
  const [ chooseEmployee, setEmployee ] = useState(null);
  const [ dayOfTol, setDayOfTol ] = useState(0);
  
  
  const [ leave_types, setLeaveTypes ] = useState([]);
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    getValues,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      leave_type_name: data?.rowData?.leave_type_name,
      day_of_tolerance: data?.rowData?.day_of_tolerance,
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [statusRokok, setStatusRokok ] = useState(false);
  const [targetKey, setTarget] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [controlUiBtn, setControlUiBtn] = useState(false);
  const [toastContent, setToastContent] = useState({
    variant: "",
    msg: "",
    title: "",
  });
  const [employeeData, setEmployeeData] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);
  const [ defaultAvatar, setDefaultAvatar ] = useState(data.img ? data.img : null)
  const [ currSalarySetting, setCurrSalarySetting ] = useState(null)

  // const fetchCustType = async() => {
  //     await axiosPrivate.get("/types")
  //     .then((response) => {
  //         setCustType(response.data);
  //         console.log(response.data)
  //     })
  //     .catch((error) => {
  //         console.error(error)
  //         setToastContent({
  //         variant: "danger",
  //         msg: "Error when get customer data!",
  //         });
  //         setShowToast(true);
  //     });
  // };

  // useEffect(() => {
  //     if(data){
  //         fetchCustType();
  //     }
  // },[])

  const returnSelectVal = (selected) => {
    setOrderTypeTmp(selected);
  };

  const handleUpdate = () => {
    setShowModal(true);
  };

  const onError = () => {
    setControlUiBtn(false);
    console.log(errors);
  };

  const fetchAllEmployee = async () => {
    await axiosPrivate.get("/employee/all/active", {params: {
      active: true
    }})
    .then((response) => {
      if(response.data && response.data.length > 0){
        const fiteredNoBaseSalary = response.data.filter(({salary_settings}) => salary_settings.length == 0);
        setEmployeeData(fiteredNoBaseSalary);
      } else {
        // setEmployeeData(null);
        return returnAct("empty");
      }
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

  const fetchAllLeaveType = async () => {
    await axiosPrivate.get("/leave-types/all")
      .then(response => {
        setLeaveTypes(response.data);
      })
      .catch(error => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Error when get leave type data",
          life: 3000,
        });
      })
    }

  const fetchInsertLeaveType = async(leaveTypesData) =>{
    const body = JSON.stringify(leaveTypesData);
    await axiosPrivate.post("/leave-type/new", body)
    .then(resp => {
      console.log(resp)
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil menambah jenis cuti",
        life: 1500,
      });
      
      setTimeout(() => {
        setControlUiBtn(false);
        return returnAct(true);
      }, 1500);
    })
    .catch(err => {
      setControlUiBtn(false);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menambah jenis cuti!",
        life: 3000,
      });
    })
  };

  const fetchUpdateLeaveType = async(leaveTypesData) => {
    const body = JSON.stringify(leaveTypesData);
    await axiosPrivate.patch(`/leave-type/${data.id}`, body)
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil memperbarui jenis cuti",
        life: 1500,
      });

      setTimeout(() => {
        setControlUiBtn(false);
        return returnAct(true);
      }, 1500);
    })
    .catch(err => {
      setControlUiBtn(false);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal memperbarui jenis cuti",
        life: 3000,
      });
    })
  };

  const onSubmit = async(formData) => {
    if(data.action == "insert"){
      const leaveTypes = {
        ...formData
      }      
      fetchInsertLeaveType(leaveTypes);
    } else {
      const leaveTypes = {
        ...formData
      }  
      fetchUpdateLeaveType(leaveTypes);
    }
  }

  const handleCancel = () => {
    if (data) {
      reset();
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

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

  const handleAutoComplete = (employeeName) => {
    if(employeeData && employeeName !== ""){
      let filteredCust = employeeData.filter(item => item.name.includes(employeeName.toLowerCase()));
      if(filteredCust.length === 0){
        setOpenPopup(false);
        setFilteredName(filteredCust);
        setError("name", { type: 'required', message: "Customer name error!" });
      } else {
        setOpenPopup(true);
        setFilteredName(filteredCust);
        clearErrors("name");
      }
    } else if(!employeeName || employeeName === ""){
        setOpenPopup(true);
        setFilteredName(employeeData);
        setError("name", { type: 'required', message: "This field is required!" })
    } else {
        setOpenPopup(false);
        setFilteredName("error db");
        setToastContent({variant:"danger", msg: "Database failed"});
        setShowToast(true);
    }
  }

  const handleFilterName = (e) => {
    handleAutoComplete(getValues('name'));
  }  

  const handleChooseEmployee = (e) => {
    setEmployee(e);
    console.log(e)
    if(e.salary_settings && e.salary_settings.length > 0){
      setCurrSalarySetting(e.salary_settings[0]);
    }
    
    setValue('employee_id', e.employee_id);
    setValue('name', e.name);
    setOpenPopup(false);
    clearErrors("name");
  }
    
  const handleKeyDown = (e) => {
    if(e){
      setEmployee(null);
      setCurrSalarySetting(null);
      // setOrdersByCust(null);
      // setCheckAll(false);
      // setChoosedOrder([]);
      // checkboxSingle.current = [];
    }
  }

  const handleChangeInputNumber = (e) => {
    const newValue = e.target.value === '' ? '' : Number(e.target.value);
    setDayOfTol(newValue);
  };

  useEffect(() => {
    if (data && data.action == "update") {
      setValue("leave_type_name", data.rowData?.leave_type_name);
      setValue("day_of_tolerance", Number(data.rowData?.day_of_tolerance));
    }
  }, [data])

  return (
    <>
      <Modal
        size="md"
        show={show}
        onHide={() => {
          onHide();
          handleCancel();
        }}
        scrollable={true}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data.action == "insert" ? "tambah" : "ubah"} jenis cuti</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <form>
              <div className="row gy-2">
                <div className="col-lg-12 col-sm-12 col-12">
                  <div style={{position:'relative'}}>
                    <InputWLabel 
                        label="Jenis cuti" 
                        type="text"
                        name="leave_type_name" 
                        placeholder="nama jenis cuti..." 
                        require={true}
                        register={register}
                        errors={errors} 
                        textStyle={'capitalize'}
                        autoComplete={"off"}
                    />   
                  </div>
                </div>
                <div className="col-lg-12 col-sm-12 col-12">
                  <InputWLabel 
                    label="toleransi hari" 
                    type="number"
                    minimum={1}
                    name="day_of_tolerance" 
                    placeholder="1" 
                    require={true}
                    register={register}
                    errors={errors} 
                    textStyle={'capitalize'}
                    autoComplete={"off"}
                  />   
                  </div>
              </div>
            </form>
          </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary light"
            onClick={() => {
              onHide();
              handleCancel();
            }}
          >
            batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={controlUiBtn}
            onClick={() => {
              setControlUiBtn(true);
              handleSubmit(onSubmit, onError)();
            }}
          >
            {controlUiBtn ? 'Loading...' : 'simpan'}
          </button>
        </Modal.Footer>
      </Modal>

      {showModal ? (
        <ConfirmModal
          show={showModal}
          onHide={handleClose}
          data={showModal === true && sendTarget ? sendTarget : ""}
          resetControl={reset}
          multiple={true}
          stack={1}
          msg={"Are you sure to make changes for this data?"}
          returnValue={(value) => setTarget(value)}
        />
      ) : (
        ""
      )}

      {/* toast area */}
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

// const NotFound = () => {
//   const toast2 = useRef(null);

//   const callToast = (e) => {
//     console.log(e)
//     e.current?.show({
//       severity: "error",
//       summary: "Not Found",
//       detail: "Tidak ada data karyawan, tambahkan data karyawan terlebih dahulu!",
//       life: 1500,
//     });

//   }
    
//   return (
    
//     )
// }
