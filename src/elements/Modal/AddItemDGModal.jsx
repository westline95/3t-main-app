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
import useMediaQuery from "../../hooks/useMediaQuery";
import QtyButton from "../QtyButton";

export default function AddItemDGModal({ show, onHide, data, returnAct }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isMediumScr = useMediaQuery(
    "(min-width: 768px) and (max-width: 1024px)"
  );

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
  const [selectedHiredDate, setSelectedHiredDate] = useState(
    data.rowData?.hired_date ? new Date(data.rowData.hired_date) : null
  );
  const [selectedDepartmentDate, setSelectedDepartmentDate] = useState(
    data.rowData?.department_histories[0]?.date
      ? new Date(data.rowData.department_histories[0].date)
      : null
  );

  const [allProdData, setAllProd] = useState(null);

  // popup needs
  const refToProd = useRef(null);
  const [openPopupProd, setOpenPopupProd] = useState(false);
  const [filterProd, setFilteredProd] = useState([]);
  const [chooseProd, setProd] = useState(null);

  const [qtyVal, setQtyVal] = useState(0);
  const [salesItems, setSalesItems] = useState([]);
  const [ paidData, setPaidData] = useState(null);
  const [ salesEndNote, setSalesEndNote] = useState(null);

  const returnSelectVal = (selected) => {
    setOrderTypeTmp(selected);
  };

  const handleUpdate = () => {
    setShowModal(true);
  };

  // fetch all customer
  const fetchAllCust = async () => {
    await axiosPrivate
      .get("/customers")
      .then((response) => {
        setCustData(response.data);
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

  // fetch all prod
  const fetchAllProd = async () => {
    await axiosPrivate
      .get("/products")
      .then((response) => {
        let dupe = [...response.data];
        response.data.map((e, idx) => {
          dupe[idx].fullProdName = e.product_name + " " + e.variant;
        });
        setAllProd(response.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Error when get product data",
          life: 3000,
        });
      });
  };

  // popup needs
  const handleAutoCompleteProd = (product) => {
    if (allProdData && product !== "") {
      let filteredProd = allProdData.filter((item) =>
        item.fullProdName.includes(product.toLowerCase())
      );
      if (filteredProd.length === 0) {
        setOpenPopupProd(false);
        setFilteredProd(filterProd);
        setError("salesProduct", {
          type: "required",
          message: "Product name error!",
        });
      } else {
        setOpenPopupProd(true);
        setFilteredProd(filteredProd);
        clearErrors("salesProduct");
      }
    } else if (product || product === "") {
      setOpenPopupProd(true);
      setFilteredProd(allProdData);
    } else {
      setOpenPopupProd(false);
      setFilteredProd("error db");
      setToastContent({ variant: "danger", msg: "Database failed" });
      setShowToast(true);
    }
  };

  const handleChooseProd = (e) => {
    setProd(e);
    setValue(
      "salesProduct",
      e.variant !== "" ? e.product_name + " " + e.variant : e.product_name
    );
    setValue("product_id", e.product_id);
    setOpenPopupProd(false);
  };

  const handleClickSelect = (ref) => {
    useEffect(() => {
      const handleClickOutside = (evt) => {
        if (
          refToProd.current &&
          !ref.current.contains(evt.target) &&
          evt.target.className !== "res-item" &&
          evt.target.className !== "popup-element"
        ) {
          setOpenPopupProd(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };
  handleClickSelect(refToProd);

  const handleSearchProd = () => {
    handleAutoCompleteProd(getValues("salesProduct"));
    setProd(null);
  };

  const keyDownSearchProd = (e) => {
    if (e) {
      setProd(null);
    }
  };
  // end of popup needs

  const handleUpdateEndNote = () => {
    if (salesItems && salesItems.length > 0) {
      let totalQty = 0;
      let subtotal = 0;
      let discount = 0;
      let allDiscProd = 0;

      salesItems.forEach((e) => {
        totalQty += e.quantity;
        subtotal +=
          e.quantity * Number(e.sell_price) - e.quantity * Number(e.discount);
        allDiscProd += e.quantity * Number(e.discount);
        e.discProd = e.quantity * Number(e.discount);
      });

      if (paidData && paidData.payment_type == "lunas") {
        if (paidData.amountOrigin < subtotal - discount) {
          setPaidData(null);
        }
      } else if (paidData && paidData.payment_type == "sebagian") {
        if (paidData.amountOrigin >= subtotal - discount) {
          setPaidData(null);
        }
      }

      let endNote = {
        ...salesEndNote,
        totalQty: totalQty,
        subtotal: subtotal,
        order_discount: discount,
        grandtotal: subtotal - discount,
        remaining_payment: paidData
          ? paidData.payment_type == "lunas"
            ? 0
            : paidData.payment_type == "bayar nanti"
              ? subtotal - discount
              : paidData.payment_type == "sebagian"
                ? subtotal - discount - paidData.amountOrigin
                : subtotal - discount
          : subtotal - discount,
      };

      setSalesEndNote(endNote);
    } else {
      setPaidData(null);
      setSalesEndNote(null);
    }
  };

  const addToSalesData = () => {
    if (qtyVal === 0 && !chooseProd) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Tambah produk dan kuantitas terlebih dahulu!",
        life: 3000,
      });
    } else if (chooseProd && qtyVal == 0) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Kuantitas tidak boleh 0",
        life: 3000,
      });
    } else if (!chooseProd && qtyVal !== 0) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Produk tidak boleh kosong!",
        life: 3000,
      });
    } else {
      let tmpArr = [];
      let prodObjDupe = { ...chooseProd };
      prodObjDupe.quantity = qtyVal;
      if (salesItems.length === 0) {
        tmpArr.push(prodObjDupe);
        setSalesItems(tmpArr);
      } else {
        tmpArr = [...salesItems];
        let findDuplicateIdx = salesItems.findIndex(
          (e) => e.product_id == prodObjDupe.product_id
        );
        if (findDuplicateIdx >= 0) {
          tmpArr[findDuplicateIdx].quantity =
            tmpArr[findDuplicateIdx].quantity + prodObjDupe.quantity;
        } else {
          tmpArr.push(prodObjDupe);
        }
        setSalesItems(tmpArr);
      }
      // setPaidData(null);
      setProd(null);
      setValue("salesProduct", "");
      handleUpdateEndNote();
    }
  };

  const onError = () => {
    setControlUiBtn(false);
    console.log(errors);
  };

  const onSubmit = async (formData) => {};

  const handleCancel = () => {
    if (data) {
      reset();
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  useEffect(() => {
    fetchAllCust();
    fetchAllProd();
  }, []);

  useEffect(() => {
    if (custData && allProdData) {
      setLoading(false);
    }
  }, [custData, allProdData]);

  if (isLoading) {
    return;
  }

  return (
    <>
      <Modal
        size={isMobile || isMediumScr ? "fullscreen" : "xl"}
        show={show}
        onHide={() => {
          onHide();
          handleCancel();
        }}
        scrollable={true}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {data.action == "insert" ? "tambah" : "ubah"} data pengantaran
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            {/* <div className="add-prod-detail-wrap" style={{flexDirection: 'column', gap: '1rem'}}> */}
            <div className="row gy-2">
              <p className="modal-section-title">Pelanggan 1</p>
              <div className="col-lg-4 col-md-6 col-sm-12">
                <InputWLabel
                  label="tambah produk"
                  type="text"
                  name="salesProduct"
                  placeholder="cari nama produk..."
                  onChange={handleSearchProd}
                  onFocus={handleSearchProd}
                  onKeyDown={keyDownSearchProd}
                  style={{ width: "inherit", textTransform: "capitalize" }}
                  register={register}
                  require={false}
                  errors={errors}
                  autoComplete={"off"}
                  // disabled={editMode ? false : true}
                />
                {/* popup autocomplete */}
                <div
                  className="popup-element"
                  aria-expanded={openPopupProd}
                  ref={refToProd}
                >
                  {filterProd && filterProd.length > 0
                    ? filterProd.map((e, idx) => {
                        return (
                          <div
                            key={`product-${e.product_id}`}
                            className="res-item"
                            onClick={() =>
                              handleChooseProd({
                                product_id: e.product_id,
                                product_name: e.product_name,
                                variant: e.variant,
                                img: e.img,
                                product_cost: e.product_cost,
                                sell_price: e.sell_price,
                                discount: e.discount,
                              })
                            }
                          >
                            {e.variant !== ""
                              ? e.product_name + " " + e.variant
                              : e.product_name}
                          </div>
                        );
                      })
                    : ""}
                </div>
              </div>

              <div className="qty-add-btn-group">
                <div>
                  <Form.Label className="mb-1">jumlah</Form.Label>
                  <QtyButton
                    min={0}
                    max={999}
                    name={`qty-add-product`}
                    width={"180px"}
                    returnValue={(e) => setQtyVal(e)}
                    value={qtyVal}
                    // disabled={editMode ? false : true}
                    label={"qty"}
                  />
                </div>
                <div className="align-self-end">
                  <button
                    className={`btn btn-primary qty-add-btn`}
                    onClick={(e) => {
                      e.preventDefault();
                      addToSalesData();
                    }}
                  >
                    <i className="bx bx-plus"></i>
                  </button>
                </div>
              </div>
              {/* <div className="col-lg-5 col-sm-5 col-5">
                      <button type="button" className="add-btn btn btn-primary light btn-w-icon form-support-btn" 
                        // aria-label="createInvModal"
                        // onClick={(e) =>
                        //   handleModal(e, {
                        //     endpoint: "custType",
                        //     action: "insert",
                        //   })
                        // }
                      >
                        <i className="bx bx-plus"></i>
                        item
                      </button>
                    </div> */}
              <div className="col-lg-6 col-sm-6 col-12">
                {/* <InputGroup
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
                      /> */}
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                {/* <InputGroup
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
                      /> */}
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                {/* <InputWLabel
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
                      /> */}
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                {/* <InputWLabel
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
                      /> */}
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                {/* <label className="mb-1">jenis kelamin<span className="required-label">*</span></label>
                      <div className="d-flex form-check-control">
                        <InputWLabel
                          type="customRadio"
                          label="perempuan"
                          value="female"
                          name="gender"
                          require={true}
                          register={register}
                          errors={errors}
                          onChange={handleAvatar}
                        />
                        <InputWLabel
                          type="customRadio"
                          label="laki-laki"
                          value="male"
                          name="gender"
                          require={true}
                          register={register}
                          errors={errors}
                          onChange={handleAvatar}
                        />
                      </div>
                      {errors ? errors["gender"] && <span className="field-msg-invalid">{errors["gender"].message}</span>: ""} */}
              </div>
              <div className="col-lg-6 col-sm-6 col-12">
                {/* <InputWLabel
                        label="alamat"
                        as="textarea"
                        name="address"
                        // defaultValue={data ? data.address : ''}
                        register={register}
                        require={false}
                        errors={errors}
                      /> */}
              </div>
            </div>
            {/* </div> */}
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
            {controlUiBtn ? "Loading..." : "simpan"}
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
