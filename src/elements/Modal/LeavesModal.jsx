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

export default function LeavesModal({ show, onHide, data, returnAct }) {
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
  const [ chooseEmployee, setEmployee] = useState(null);
  const [ leave_types, setLeaveTypes ] = useState([]);
  const [ defaultData, setDefault ] = useState(data?.rowData ? {...data.rowData} : null);
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
  const [custCategory, setCustCategory] = useState("");
  const [custTypeData, setCustType] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [tomorrowStartDate, setTomorrowStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  // const [resetInputWSelect, setResetInputWSelect] = useState(false);
  // const [selectedDepartmentDate, setSelectedDepartmentDate] = useState(data.rowData?.department_histories[0]?.date ? new Date(data.rowData.department_histories[0].date) : null);
  const [ currSalarySetting, setCurrSalarySetting ] = useState(null)
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
    trigger,
    formState: { errors },
  } = useForm({
        defaultValues: {
          employee_id: data.rowData?.employee_id,
          name: data.rowData?.employee?.name,
          leave_type_id: data.rowData?.leave_type_id,
          leave_type_name: data.rowData?.leave_type.leave_type_name,
          start_date: data.rowData?.start_date ? new Date(data.rowData.start_date) : null,
          end_date: data.rowData?.end_date ? new Date(data.rowData.end_date) : null,
          status: data.rowData?.status,
        },
  });

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
        console.log(response.data)
        // const fiteredNoBaseSalary = response.data.filter(({salary_settings}) => salary_settings.length == 0);
        setEmployeeData(response.data);
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
        console.log(response.data)
        setLeaveTypes(response.data);
        // let dupe = [...response.data];
        // response.data.map((e, idx) => {
        //     dupe[idx].fullProdName = e.product_name + " " + e.variant;
        // })
        // setAllProd(response.data);
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

  const fetchInsertLeave = async(leaveData) =>{
    const body = JSON.stringify(leaveData);
    await axiosPrivate.post("http://localhost:5056/leaves/new", body)
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil menambahkan cuti karyawan",
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
        detail: "Gagal menambahkan cuti karyawan",
        life: 3000,
      });
    })
  };

  const fetchUpdateLeave = async(leaveData) => {
    const body = JSON.stringify(leaveData);
    await axiosPrivate.put("http://localhost:5056/leaves/update", body, {params: {id: data.rowData.emp_leave_id}})
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil memperbarui cuti",
        life: 1500,
      });

      setTimeout(() => {
        setControlUiBtn(false);
        return returnAct(true);
      }, 1500);
    })
    .catch(err => {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal memperbarui cuti",
        life: 3000,
      });
    })
  };

  const onSubmit = async(formData) => {
    if(data.action == "insert"){
      setControlUiBtn(false);
      const leaves = {
        ...formData,
        approved_by: auth.name,
        status: "in-leave".toLowerCase()
      }
      fetchInsertLeave(leaves);
    } else if (data.action == "update"){
      setControlUiBtn(false);
      const leaves = {
        ...formData,
        approved_by: auth.name,
      }
      fetchUpdateLeave(leaves);
    } else {
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
      let filtered = employeeData.filter(item => item.name.includes(employeeName.toLowerCase()));
      if(filtered.length === 0){
        setOpenPopup(false);
        setFilteredName(filtered);
        setError("name", { type: 'required', message: "Employee name error!" });
      } else {
        setOpenPopup(true);
        setFilteredName(filtered);
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
  };

  const add1dayAfter = (startDate) => {
    let tomorrow = new Date(startDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
  }

  useEffect(() => {
    if(selectedStartDate){
      let tomorrow = add1dayAfter(selectedStartDate);
      setTomorrowStartDate(tomorrow);
    }
  },[selectedStartDate])

  useEffect(() => {
    if(data && data?.action == "update"){
      setSelectedStartDate(new Date(data.rowData?.start_date)); 
      setSelectedEndDate(new Date(data.rowData?.end_date)); 
    }
  },[data])

  useEffect(() => {
    if(data){
      fetchAllEmployee();
      fetchAllLeaveType();
    }
  },[]);

  useEffect(() => {
    if (leave_types && employeeData) {
      setLoading(false);
    }
  }, [leave_types, employeeData]);

  if (isLoading) {
    return;
  }

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
          <Modal.Title>{data.action == "insert" ? "tambah" : "ubah"} cuti karyawan</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <form>
              <div className="row gy-2">
                <div className="col-lg-12 col-sm-12 col-12">
                  <div style={{position:'relative'}}>
                    <InputWLabel 
                        label="nama karyawan" 
                        type="text"
                        name="name" 
                        placeholder="Search employee name..." 
                        onChange={handleFilterName}
                        onFocus={handleFilterName}
                        onKeyDown={handleKeyDown}
                        require={true}
                        register={register}
                        errors={errors} 
                        textStyle={'capitalize'}
                        autoComplete={"off"}
                    />
                    {/* popup autocomplete */}
                    <div className="popup-element" aria-expanded={openPopup} ref={refToThis}>
                        {filterName && filterName.length > 0 ? 
                            filterName.map((e,idx) => {
                              return (
                                    <div key={`employee-${idx}`} className="res-item" onClick={() => 
                                        handleChooseEmployee({ 
                                          ...e
                                    })}>{e.name}</div>
                                )
                            }) : (
                              <div className="res-item">Tidak ada data</div>
                            )
                        }
                    </div>   
                  </div>
                </div>
                <div className="col-lg-12 col-sm-12 col-12">
                  <InputWSelect
                    label={"jenis cuti"}
                    name={"leave_type_name"}
                    selectLabel="Pilih jenis cuti"
                    options={leave_types}
                    optionKeys={["leave_type_id", "leave_type_name"]}
                    defaultValue={getValues('leave_type_name')}
                    defaultValueKey={"leave_type_name"}
                    value={(selected) => {
                      setValue('leave_type_name', selected.value);
                      setValue("leave_type_id", selected.id);
                      selected.value != "" ? clearErrors("leave_type_name") : null;
                      // setResetInputWSelect(false);
                    }}
                    // resetController={resetInputWSelect}
                    defaultValue={getValues("leave_type_name")}
                    defaultValueKey={"leave_type_name"}
                    register={register}
                    require={true}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <InputWLabel
                    label="Mulai tanggal"
                    type="date"
                    name={'start_date'}
                    onChange={(e) => {
                      setSelectedStartDate(e.value); 
                      // ^^--helper for detect change in start date => able to set min date in end date to tomorrow //to avoid conflict between add and edit action
                      setValue("start_date", e.value);
                      setSelectedEndDate(null); 
                    }}
                    register={register}
                    require={true}
                    errors={errors}
                    defaultValue={selectedStartDate}
                  />
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <InputWLabel
                    label="berakhir tanggal"
                    type="date"
                    name="end_date"
                    minDate={tomorrowStartDate}
                    onChange={(e) => {
                      setValue("end_date", e.value);
                      setSelectedEndDate(e.value);
                    }}
                    disabled={getValues("start_date") == null ? true : false}
                    register={register}
                    require={true}
                    errors={errors}
                    defaultValue={selectedEndDate}
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
