import React, { useEffect, useRef, useState } from "react";
import { Collapse, Modal } from "react-bootstrap";
import { Toast } from "primereact/toast";
import { useForm, useController } from "react-hook-form";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
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

export default function SalarySettingModal({ show, onHide, data, returnAct }) {
  const axiosPrivate = useAxiosPrivate();
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
      name: data.rowData?.name,
      status_uang_rokok: data.action == "insert" ? true : data.rowData?.is_active,
      salary_type: data.rowData?.salary_type,
      salary_amount: data.rowData?.salary_amount,
      salary_amount_formated: "0",
      start_date: data.rowData?.dob,
      end_date: data.rowData?.dob,
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [statusSwitch, setStatusSwitch] = useState(false);
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
  const [selectedEndDate, setSelectedEndDate] = useState(
    data.rowData?.end_date ? new Date(data.rowData?.end_date) : null
  );
  const [selectedStartDate, setSelectedStartDate] = useState(data.rowData?.start_date ? new Date(data.rowData.start_date) : null);
  const [selectedDepartmentDate, setSelectedDepartmentDate] = useState(data.rowData?.department_histories[0]?.date ? new Date(data.rowData.department_histories[0].date) : null);
  const [ defaultAvatar, setDefaultAvatar ] = useState(data.img ? data.img : null)

  const femaleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183325/Avatar_1_hhww7p.jpg`;
  const maleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183333/Avatar_2_zebyeg.jpg`;

  const handleAvatar = (e) => {
    if(e.target.value == 'female' && e.target.checked){
        setDefaultAvatar(femaleAvatar);
        setValue('img',femaleAvatar);
    } else if(e.target.value == 'male' && e.target.checked){
        setDefaultAvatar(maleAvatar);
        setValue('img',maleAvatar);
    } else {
        reset('img'); 
        setDefaultAvatar(null);
    }
  };

  const fetchCustById = () => {
    FetchApi.fetchCustByID(data.id)
      .then((data) => {
        // console.log(data[0].name)
        setEmployeeData(data);
      })
      .catch((error) => {
        setToastContent({ variant: "danger", msg: "Failed to update" });
        setShowToast(true);
      });
  };

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
  // },[]);
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
    await axiosPrivate.get("/employee/all")
    .then((response) => {
      setEmployeeData(response.data);
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

  const fetchInsertSalarySett = async(employeeData) =>{
    const body = JSON.stringify(employeeData);
    await axiosPrivate.post("/salary-setting", body)
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil menyimpan pengaturan gaji",
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
        detail: "Gagal menyimpan pengaturan gaji",
        life: 3000,
      });
    })
  };

  const fetchUpdateEmployee = async(employeeData) => {
    const body = JSON.stringify(employeeData);
    await axiosPrivate.put("/employee/update", body, {params: {id: data.rowData.employee_id}})
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil memperbarui karyawan",
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
        detail: "Gagal memperbarui karyawan",
        life: 3000,
      });
    })
  };

  const onSubmit = async(formData) => {
    if(data.action == "insert"){
      const salary = {
        salary: {...formData}
      }
      salary.salary.now_active = true;
      fetchInsertSalarySett(salary);
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
        setValue('employee_id', e.employee_id);
        setValue('name', e.name);
        setOpenPopup(false);
        clearErrors("name");
    }
    
  const handleKeyDown = (e) => {
    if(e){
      setEmployee(null);
      // setOrdersByCust(null);
      // setCheckAll(false);
      // setChoosedOrder([]);
      // checkboxSingle.current = [];
    }
  }

  useEffect(() => {
    fetchAllEmployee();
  },[]);

  useEffect(() => {
    if(employeeData){
      setLoading(false);
    }
  },[employeeData]);

  if(isLoading){
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
          <Modal.Title>{data.action == "insert" ? "tambah" : "ubah"} pengaturan gaji karyawan</Modal.Title>
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
                            }) : ""
                        }
                    </div>   
                </div>
                </div>
                <div className="col-lg-12 col-sm-12 col-12">
                  <Collapse in={chooseEmployee != null}>
                    <div className="modal-table-wrap">

                    </div>
                  </Collapse>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <InputWSelect
                    label={"tipe gaji"}
                    name="salary_type"
                    selectLabel="Pilih tipe gaji"
                    options={dataStatic.salaryType}
                    optionKeys={["id", "type"]}
                    value={(selected) => {setValue("salary_type", selected.value);getValues("salary_type") !== "" && clearErrors('salary_type')}}
                    // defaultValue={data.rowData?.department_histories[0]?.department_id ?? ""}
                    // defaultValueKey={"type"}
                    register={register}
                    require={true}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <InputGroup
                    label="Jumlah gaji"
                    groupLabel="Rp"
                    type="text"
                    position="left"
                    name="salary_amount_formated"
                    mask={"currency"}
                    returnValue={(value) => {
                      setValue("salary_amount", value.origin)
                      setValue("salary_amount_formated", value.formatted)
                    }}
                    defaultValue={getValues('salary_amount') ? Number(getValues('salary_amount')) : "0"}
                    require={true}
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <InputWLabel
                    label="mulai tanggal"
                    type="date"
                    name="start_date"
                    defaultValue={selectedStartDate}
                    onChange={(e) => {
                      setSelectedStartDate(e.value);
                      setValue("start_date", e.value);
                    }}
                    register={register}
                    require={true}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <InputWLabel
                    label="berakhir tanggal"
                    type="date"
                    name="end_date"
                    defaultValue={selectedEndDate}
                    minDate={selectedStartDate}
                    onChange={(e) => {
                      setSelectedEndDate(e.value);
                      setValue("end_date",e.value);
                    }}
                    register={register}
                    require={true}
                    errors={errors}
                  />
                </div>
                <div className="mt-3" style={{textAlign: 'left'}}>
                  <label className="mb-1">Status uang rokok</label>
                  <InputWLabel 
                    label={statusSwitch ? 'disimpan' : 'tidak disimpan'}
                    type={'switch'}
                    name={'status_uang_rokok'}
                    style={{alignItems:'center'}}
                    onChange={(e) => {setValue('status_uang_rokok', e.target.checked);setStatusSwitch(e.target.checked)}}
                    register={register}
                    require={false}
                    errors={errors}
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
            simpan
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
