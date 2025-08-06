import React, { useEffect, useState } from "react";
import { Modal, Toast, ToastContainer } from "react-bootstrap";
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

export default function CustEditModal({ show, onHide, data }) {
  const axiosPrivate = useAxiosPrivate();
  let locale = "id-ID";
  const formatedNumber = new Intl.NumberFormat(locale);

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
      name: data.name,
      gender: data.gender,
      phonenumber: data.phonenumber,
      email: data.email,
      img: data.img,
      debt_limit: data.debt_limit,
      debt_limit_formated: formatedNumber.format(data.debt_limit),
      address: data.address,
      dob: data.dob
    },
  });

    
  const [showModal, setShowModal] = useState(false);
  const [targetKey, setTarget] = useState("");
  const [showToast, setShowToast] = useState(false);
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
    data?.dob ? data.dob : null
  );
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

  const returnSelectVal = (selected) => {
    setOrderTypeTmp(selected);
  };

  const handleUpdate = () => {
    setShowModal(true);
  };

  const onError = () => {
    console.log(errors);

    setToastContent({
      variant: "danger",
      msg: "Required field can't be blank!",
    });
    setShowToast(true);
  };

  const onSubmit = (formData) => {
    setShowModal(true);

    // const getMatch = custTypeData.find(({ id }) => id === custCategory);
    // const duplicate = {...getMatch}

    let newData = { ...formData };
    let dataToSend = {
      id: data.id,
      endpoint: data.endpoint,
      action: data.action,
      data: newData,
    };
    setSendTarget(dataToSend);
  };

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
          <Modal.Title>edit customer detail</Modal.Title>
        </Modal.Header>
        {data ? (
          <Modal.Body>
            <form>
              <div
                className="add-prod-area mt-4 mb-4"
                style={{ gap: "2.5rem" }}
              >
                <div className="add-prod-img-wrap">
                  <label className="mb-1">customer image</label>
                  {/* <div className="dropzone-file active">
                                    <span className="dropzone-btn" onclick="removeImg(this)">
                                        <i className='bx bx-x'></i>
                                    </span>
                                    <div className="preview-area">
                                        <span className="add-img-btn">
                                            <i className='bx bx-plus'></i>
                                        </span>
                                        <input type="file" className="form-control custom-input-file"
                                            accept=".jpg, .jpeg, .png" id="prodImg" onchange="dropzoneFile(this)" />
                                        <img src={User} alt="" />
                                        <p className="file-info">No Files Selected</p>
                                    </div>
                                </div> */}
                  <DropzoneFile
                    name="img"
                    defaultValue={defaultAvatar}
                    require={false}
                    register={register}
                    error={errors}
                    // returnValue={(value) => setValue('img', value)}
                  />
                </div>
                <div className="add-prod-detail-wrap">
                  <div className="row gy-3">
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="customer name"
                        type="text"
                        name="name"
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
                        label="phonenumber"
                        groupLabel="+62"
                        type="text"
                        position="left"
                        name="phonenumber"
                        // defaultValue={data ? data.phonenumber : ''}
                        require={true}
                        register={register}
                        errors={errors}
                      />
                    </div>
                    {/* <div className="col-lg-4 col-sm-6 col-12">
                                        <InputWSelect
                                            label="customer type" 
                                            name="custTypeId"
                                            selectLabel="Select customer type"
                                            options={custTypeData ? custTypeData : []}
                                            optionKeys={['cust_type_id', 'type']}
                                            value={(selected) => {
                                                setCustCategory(selected);
                                                setValue("custTypeId", selected.id);
                                                selected.value != "" ? clearErrors("custTypeId"):null;
                                            }}
                                            defaultValue={data.custTypeId ? data.custTypeId : ""}
                                            register={register}
                                            require={true}
                                            errors={errors}
                                            // watch={watch('custTypeId')}
                                        />
                                    </div> */}
                    <div className="col-lg-3 col-sm-3 col-12">
                      <label className="mb-1">gender</label>
                      <div className="d-flex form-check-control">
                        <InputWLabel
                          type="customRadio"
                          label="female"
                          value="female"
                          name="gender"
                          require={false}
                          register={register}
                          error={errors}
                          onChange={handleAvatar}
                        />
                        <InputWLabel
                          type="customRadio"
                          label="male"
                          value="male"
                          name="gender"
                          require={false}
                          register={register}
                          error={errors}
                          onChange={handleAvatar}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-3 col-12">
                      <InputWLabel
                        label="date of birth"
                        type="date"
                        name="dob"
                        defaultValue={selectedDob}
                        onChange={(e) => {
                          setSelectedDob(e.value);
                        }}
                        register={register}
                        require={false}
                        errors={errors}
                      />
                    </div>

                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="email"
                        type="email"
                        name="email"
                        // defaultValue={data ? data.email : ''}
                        register={register}
                        require={false}
                        errors={errors}
                      />
                    </div>
                    <div className="col-lg-6 col-sm-6 col-12">
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
                    {/* <div className="col-lg-6 col-sm-6 col-12">
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
                                        <label className="mb-1">country</label>
                                        <CustomSelect 
                                            options={["Select country", "Indonesia"]}
                                            defaultValue={1}
                                            selectedOption={returnSelectVal} 
                                        /> 
                                    </div>
                                    <div className="col-lg-6 col-sm-6 col-12">
                                        <label className="mb-1">province</label>
                                        <CustomSelect 
                                            options={["Select province", "North Sumatera"]}
                                            defaultValue={1}
                                            selectedOption={returnSelectVal} 
                                        /> 
                                    </div>
                                    <div className="col-lg-6 col-sm-6 col-12">
                                        <label className="mb-1">city</label>
                                        <CustomSelect 
                                            options={["Select city", "Medan"]}
                                            defaultValue={1}
                                            selectedOption={returnSelectVal} 
                                        /> 
                                    </div>
                                    <div className="col-lg-6 col-sm-3 col-6">
                                        <label className="mb-1">postal code</label>
                                        <input type="text" className="form-control" value={data.postalCode} style={{width: "100%"}} /> 
                                    </div> */}
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel
                        label="address"
                        as="textarea"
                        name="address"
                        // defaultValue={data ? data.address : ''}
                        register={register}
                        require={false}
                        errors={errors}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Modal.Body>
        ) : (
          ""
        )}

        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary light"
            onClick={() => {
              onHide();
              handleCancel();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit(onSubmit, onError)}
          >
            Save
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
      <ToastContainer className="p-3 custom-toast">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastContent.variant}
        >
          <Toast.Body>{toastContent.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
