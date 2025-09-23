import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
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

export default function AddEmployeeModal({ show, onHide, data, returnAct }) {
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: data.rowData?.name,
      gender: data.rowData?.gender,
      phonenumber: data.rowData?.phonenumber,
      is_active: data.action == "insert" ? true : data.rowData?.is_active,
      img: data.action == "insert" ? "" : data.rowData?.img,
      debt_limit: data.rowData?.debt_limit,
      debt_limit_formated: "0",
      address: data.rowData?.address,
      dob: data.rowData?.dob,
      position: data.rowData?.department_histories[0]?.position,
      date: data.rowData?.department_histories[0]?.date ? new Date(data.rowData.department_histories[0].date) : "",
      // hired_date: data.rowData?.hired_date ? new Date(data.rowData.hired_date) : ""
    },
  });

    console.log(getValues())
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
  const [custData, setCustData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [sendTarget, setSendTarget] = useState(null);
  const [selectedDob, setSelectedDob] = useState(
    data.rowData?.dob ? new Date(data.rowData?.dob) : null
  );
  const [selectedHiredDate, setSelectedHiredDate] = useState(data.rowData?.hired_date ? new Date(data.rowData.hired_date) : null);
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

  const onError = () => {
    setControlUiBtn(false);
    console.log(errors);
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

  const onSubmit = async(formData) => {
    setProgress(0);
    let employeeData = {
      employee: {
        name: formData.name,
        dob: formData.dob,
        phonenumber: formData.phonenumber,
        is_active: formData.is_active,
        address: formData.address,
        hired_date: formData.hired_date,
        gender: formData.gender,
        debt_limit: formData.debt_limit,
        img: formData.img
      },
      department_history: {
        department_id: formData.department_id,
        date: formData.date,
        now_active: true,
        position: formData.position
      }
    }
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
          employeeData.employee.img = res.data;
          setProgress(100);
          toastUpload.current.clear();
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Sucessfully upload image",
            life: 3000,
          });

          if(data.action == "insert"){
            fetchInsertEmployee(employeeData);
          }
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
      if(data.action == "insert"){
        fetchInsertEmployee(employeeData);
      } else {
        let updateEmployeeData = {
          employee: {
            name: formData.name,
            dob: formData.dob,
            phonenumber: formData.phonenumber,
            is_active: formData.is_active,
            address: formData.address,
            hired_date: formData.hired_date,
            gender: formData.gender,
            debt_limit: formData.debt_limit,
            img: formData.img
          },
          department_history: {
            date: formData.date,
            position: formData.position
          },
          department_history_id: data.rowData.department_histories[0].department_history_id
        }
        // checking if department changed
        if(formData.department_id !== data.rowData.department_histories[0].department_id){
          // update employee then make new row department history 
          updateEmployeeData.exist = false;
          updateEmployeeData.department_history.department_id = formData.department_id;
          updateEmployeeData.department_history.employee_id = data.rowData.employee_id;
          updateEmployeeData.department_history.now_active = true;
          
        } else {
          // update employee then update department history
          updateEmployeeData.exist = true;
        }
        // fetch
        fetchUpdateEmployee(updateEmployeeData);
      }
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
  console.log(data)

  return (
    <>
      <Modal
        size="xl"
        show={show}
        onHide={() => {
          onHide();
          handleCancel();
        }}
        scrollable={true}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data.action == "insert" ? "tambah" : "ubah"} data karyawan</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <form>
              <div
                className="add-prod-area mt-4 mb-4"
                style={{ gap: "2.5rem" }}
              >
                <div className="add-prod-img-wrap">
                  <label className="mb-1">Foto karyawan</label>
                  <DropzoneFile
                    name="img"
                    defaultValue={!getValues('img') ? defaultAvatar : getValues('img')}
                    require={false}
                    register={register}
                    error={errors}
                    // returnValue={(value) => setValue('img', value)}
                  />
                  <div className="mt-3" style={{textAlign: 'center'}}>
                    <label className="mb-1">Status karyawan</label>
                    <InputWLabel 
                      label={statusSwitch ? 'aktif' : 'tidak aktif'}
                      type={'switch'}
                      name={'is_active'}
                      style={{alignItems:'center'}}
                      onChange={(e) => {setValue('is_active', e.target.checked);setStatusSwitch(e.target.checked)}}
                      register={register}
                      require={false}
                      errors={errors}
                    />
                  </div>
                </div>
                <div className="add-prod-detail-wrap" style={{flexDirection: 'column', gap: '1rem'}}>
                  <div className="row gy-2">
                    <p className="modal-section-title">profil</p>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="nama karyawan"
                        type="text"
                        name="name"
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
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputGroup
                        label="nomor telepon"
                        groupLabel="+62"
                        type="text"
                        position="left"
                        name="phonenumber"
                        mask="phone"
                        defaultValue={getValues('phonenumber')}
                        require={true}
                        register={register}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputGroup
                        label="limit hutang"
                        groupLabel="Rp"
                        type="text"
                        position="left"
                        name="debt_limit_formated"
                        mask={"currency"}
                        returnValue={(value) => {
                          setValue("debt_limit", value.origin)
                          setValue("debt_limit_formated", value.formatted)
                        }}
                        defaultValue={getValues('debt_limit') ? Number(getValues('debt_limit')) : "0"}
                        require={true}
                        register={register}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="tanggal rekrut"
                        type="date"
                        name="hired_date"
                        defaultValue={selectedHiredDate}
                        onChange={(e) => {
                          setSelectedHiredDate(e.value);
                          setValue("hired_date", e.value);
                        }}
                        register={register}
                        require={false}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="tanggal lahir"
                        type="date"
                        name="dob"
                        defaultValue={selectedDob}
                        onChange={(e) => {
                          setSelectedDob(e.value);
                          setValue("dob",e.value);
                        }}
                        register={register}
                        require={false}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <label className="mb-1">jenis kelamin</label>
                      <div className="d-flex form-check-control">
                        <InputWLabel
                          type="customRadio"
                          label="perempuan"
                          value="female"
                          name="gender"
                          require={false}
                          register={register}
                          error={errors}
                          onChange={handleAvatar}
                        />
                        <InputWLabel
                          type="customRadio"
                          label="laki-laki"
                          value="male"
                          name="gender"
                          require={false}
                          register={register}
                          error={errors}
                          onChange={handleAvatar}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="alamat"
                        as="textarea"
                        name="address"
                        // defaultValue={data ? data.address : ''}
                        register={register}
                        require={false}
                        errors={errors}
                      />
                    </div>
                  </div>
                  <div className="row gy-2">
                    <p className="modal-section-title">penempatan</p>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWSelect
                        label={"departemen"}
                        name="department"
                        selectLabel="Pilih penempatan departemen"
                        options={data.department}
                        optionKeys={["department_id", "department_name"]}
                        value={(selected) => {setValue("department_id", selected.id);setValue("department", selected.value);getValues("department") !== "" && clearErrors('department')}}
                        defaultValue={data.rowData?.department_histories[0]?.department_id ?? ""}
                        defaultValueKey={"department_id"}
                        register={register}
                        require={true}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="tanggal masuk departemen"
                        type="date"
                        name="date"
                        defaultValue={selectedDepartmentDate}
                        onChange={(e) => {
                          setSelectedDepartmentDate(e.value);
                          setValue("date",e.value);
                        }}
                        register={register}
                        require={true}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="posisi"
                        type="text"
                        name="position"
                        placeholder="kurir"
                        require={true}
                        register={register}
                        errors={errors}
                        textStyle={"capitalize"}
                      />
                    </div>
                  </div>
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
