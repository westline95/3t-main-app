import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Toast } from "primereact/toast";
import { useForm, useController, Controller } from "react-hook-form";
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
import axios from "axios";

export default function CreateEmployeeAcc({ show, onHide, data, returnAct }) {
  const axiosPrivate = useAxiosPrivate();
  let locale = "id-ID";
  const formatedNumber = new Intl.NumberFormat(locale);

  const toast = useRef(null);
  const toastUpload = useRef(null);
  const [progress, setProgress] = useState(0);

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
      user_name: data.rowData?.name,
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [statusSwitch, setStatusSwitch] = useState(true);
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
  const [custData, setCustData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [sendTarget, setSendTarget] = useState(null);
  const [selectedDob, setSelectedDob] = useState(
    data.rowData?.dob ? new Date(data.rowData?.dob) : null
  );
  const [selectedHiredDate, setSelectedHiredDate] = useState(data.rowData?.hired_date ? new Date(data.rowData.hired_date) : null);
  // const [selectedDepartmentDate, setSelectedDepartmentDate] = useState(data.rowData?.department_histories[0]?.date ? new Date(data.rowData.department_histories[0].date) : null);
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
        setCustData(data);
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

  const fetchInsertEmployee = async(employeeData) =>{
    const body = JSON.stringify(employeeData);
    await axiosPrivate.post("/employee", body)
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil menambahkan karyawan",
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
        detail: "Gagal menambahkan karyawan",
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

  const onError = (error) => {
    setControlUiBtn(false);
  };

  const onSubmit = async(formData) => {    
    if(formData.user_pass_confirm !== formData.user_pass){
      setError("user_pass_confirm", {type: "required",message: "Kata sandi tidak cocok"})
      setControlUiBtn(false);
       toast.current.show({
           severity: "error",
           summary: "Gagal",
           detail: "Kata sandi tidak cocok",
           life: 3000,
         });
    } else {
      setControlUiBtn(false);
      let userEmployeeAcc = {
       user: {
         user_name: formData.user_name,
         user_mail: formData.user_mail,
         user_pass: formData.user_pass,
         role: "staff"
       },
       employee_id: data.id
     }
     const body = JSON.stringify(userEmployeeAcc);
     axiosPrivate.post("/employee/account", body)
     .then((res) => {
         toast.current.show({
           severity: "success",
           summary: "Sukses",
           detail: "Berhasil membuat akun karyawan",
           life: 1500,
         });
         
         setTimeout(() => {
           return returnAct(true);
         }, 1500);
     })
     .catch((err) => {
       setControlUiBtn(false);
       if(err.status == 400){
         toast.current.show({
           severity: "error",
           summary: "Gagal",
           detail: "Email sudah terdaftar",
           life: 3000,
         });
       } else {
         toast.current.show({
           severity: "error",
           summary: "Failed",
           detail: "Failed to create employee account",
           life: 3000,
         });
       }
       
     });
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

  // useEffect(() => {
  //     if(custTypeData){
  //         setLoading(false);
  //     }
  // },[custTypeData]);

  // if(isLoading){
  //     return;
  // }

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
          <Modal.Title>buat akun karyawan</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <form>
              <div
                className="add-prod-area mt-2 mb-2"
                style={{ gap: "2.5rem" }}
              >
                <div className="add-prod-detail-wrap" style={{flexDirection: 'column', gap: '1rem'}}>
                  {/* <div className="row gy-3"> */}
                    {/* <p className="modal-section-title">profil</p> */}
                    {/* <div className="col-lg-12 col-sm-12 col-12"> */}
                      <InputWLabel
                        label="nama pengguna"
                        type="text"
                        name="user_name"
                        placeholder="John doe"
                        // onChange={(val) => setValue('name',val)}
                        // defaultValue={data ? data.name : ""}
                        // value={data.name}
                        // control={control}
                        require={true}
                        register={register}
                        errors={errors}
                        disabled={true}
                        // rules={{
                        //     require: true,
                        // }}
                      />
                    {/* </div> */}
                    {/* <div className="col-lg-6 col-sm-6 col-12"> */}
                      <InputWLabel
                        label="email"
                        type="email"
                        name="user_mail"
                        placeholder="John doe"
                        // onChange={(val) => setValue('name',val)}
                        // defaultValue={data ? data.name : ""}
                        // value={data.name}
                        // control={control}
                        require={true}
                        register={register}
                        errors={errors}
                        // rules={{
                        //     require: true,
                        // }}
                      />
                    {/* </div> */}
                    {/* <div className="col-lg-6 col-sm-6 col-12"> */}
                      <InputWLabel
                        name="user_pass"
                        label="kata sandi"
                        type="text"
                        // onChange={(val) => setValue('name',val)}
                        // defaultValue={data ? data.name : ""}
                        // value={data.name}
                        // control={control}
                        require={true}
                        register={register}
                        errors={errors}
                        // rules={{
                        //     require: true,
                        // }}
                      />
                    {/* </div> */}
                    <div className="col-lg-12 col-sm-12 col-12">
                      <InputWLabel
                        name="user_pass_confirm"
                        label="konfirmasi kata sandi"
                        type="text"
                        onChange={() => watch("user_pass_confirm") !== watch("user_pass") ?
                                        setError("user_pass_confirm", {type: "required",message: "Kata sandi tidak cocok"})
                                        : clearErrors("user_pass_confirm")
                        }
                        require={true}
                        register={register}
                        errors={errors}
                      />
                    </div>
                    
                  {/* </div> */}
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
            {controlUiBtn ? "Loading..." : "buat akun"}
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
