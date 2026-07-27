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
import QtyButton from "../QtyButton";
import { DataView } from "primereact/dataview";
import useMediaQuery from "../../hooks/useMediaQuery";
import NumberFormat from "../Masking/NumberFormat";
import { Swiper, SwiperSlide } from "swiper/react";
import EditDelivGroupListModal from "./EditDelivGroupListModal";
import dataStatic from "../../assets/js/dataStatic";

import EmptyState from "../../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function DeliveryGroupReturnListModal({
  show,
  onHide,
  data,
  multiple,
  stack,
  returnAct,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isMediumScr = useMediaQuery(
    "(min-width: 768px) and (max-width: 1024px)"
  );

  const axiosPrivate = useAxiosPrivate();
  let locale = "id-ID";
  const formatedNumber = new Intl.NumberFormat(locale);

  const toast = useRef(null);
  const toastUpload = useRef(null);
  const refToThis = useRef(null);
  const refToProd = useRef(null);
  const [progress, setProgress] = useState(0);
  const [dg, setDG] = useState(null);
  const [filterProd, setFilteredProd] = useState([]);
  const [allProdData, setAllProd] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [openPopupProduct, setOpenPopupProduct] = useState(false);
  const [openPopupEmployee, setOpenPopupEmployee] = useState(false);
  const [filterName, setFilteredName] = useState([]);
  const [chooseProd, setProd] = useState(null);
  const [paidData, setPaidData] = useState(null);
  const [salesEndNote, setSalesEndNote] = useState(null);
  const [salesDisc, setSalesDisc] = useState(null);
  const [discVal, setDiscVal] = useState(0);
  const [salesItems, setSalesItems] = useState([]);
  const [choosedSession, setChoosedSession] = useState(null);
  const [openMiniCard, setOpenMiniCard] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
  } = useForm();
  const [chooseEmployee, setEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [targetKey, setTarget] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [controlUiBtn, setControlUiBtn] = useState(false);
  const [toastContent, setToastContent] = useState({
    variant: "",
    msg: "",
    title: "",
  });
  const [deliveryGroupProductReturn, setDeliveryGroupProductReturn] = useState(null);
  // const [deliveryGroupProductReturn, setDeliveryGroupProductReturn] = useState(
  //   () => {
  //     if (
  //       data.rowData.DeliveryGroupItemsProduct &&
  //       data.rowData.DeliveryGroupItemsProduct.length > 0
  //     ) {
  //       return data.rowData.DeliveryGroupItemsProduct;
  //     } else {
  //       return [];
  //     }
  //   }
  // );

  // const [dgLogs, setDGLogs] = useState(() => {
  //   if (
  //     data?.rowData?.delivery_group_log &&
  //     data?.rowData?.delivery_group_log?.length > 0
  //   ) {
  //     let setdata = {...data?.rowData?.delivery_group_log}
  //     return setdata;
  //   } else {
  //     return null;
  //   }
  // });
  const [dgLogs, setDGLogs] = useState(null);
  const [dgLogsOG, setDGLogsOG] = useState(null);
  const [dgLogItemsOG, setDGLogItemsOG] = useState(null);
  
  // const [dgLogItems, setDGLogItems] = useState(() => {
  //   if (
  //     data?.rowData?.delivery_group_log &&
  //     data?.rowData?.delivery_group_log?.length > 0
  //   ) {
  //     let setdata = [...data?.rowData?.delivery_group_log.delivery_group_log_items];
  //     return setdata;
  //   } else {
  //     return null;
  //   }
  // });
  const [dgLogItems, setDGLogItems] = useState(null);
  const [insertMode, setInsertMode] = useState(false);
  const [editing, onEditing] = useState(false);
  const [qtyVal, setQtyVal] = useState(0);

  const [isLoading, setLoading] = useState(true);
  const [sendTarget, setSendTarget] = useState(null);

  const femaleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183325/Avatar_1_hhww7p.jpg`;
  const maleAvatar = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1749183333/Avatar_2_zebyeg.jpg`;

  const handleAvatar = (e) => {
    if (e.target.value == "female" && e.target.checked) {
      setDefaultAvatar(femaleAvatar);
      setValue("img", femaleAvatar);
    } else if (e.target.value == "male" && e.target.checked) {
      setDefaultAvatar(maleAvatar);
      setValue("img", maleAvatar);
    } else {
      reset("img");
      setDefaultAvatar(null);
    }
  };

  const fetchDG = async () => {
    await axiosPrivate
      .get("/delivery-group/by", {
        params: { id: data.id },
      })
      .then((resp) => {
        setDG(resp.data);
        console.log(resp.data.delivery_group_items)
        setSalesItems(resp.data.delivery_group_items);
        setEmployee(resp.data.employee_id);
        setValue("checkedby_employee_name", resp.data.employee.name);
        setValue("checkedby_employee_id", resp.data.employee_id);
        setValue(
          "delivery_group_date",
          new Date(resp.data?.delivery_group_date)
        );
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Error when get delivery group data by id",
          life: 3000,
        });
      });
  };

  const fetchAllEmployee = async () => {
    await axiosPrivate
      .get("/employee/all")
      .then((response) => {
        setEmployeeData(response.data);
        // setTotalRecords(response.data.length);
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

  const handleClickSelect = (ref) => {
    useEffect(() => {
      const handleClickOutside = (evt) => {
        if (
          refToThis.current &&
          // && !ref.current.contains(evt.target)
          evt.target.className !== "res-item" &&
          evt.target.className !== "popup-element"
        ) {
          setOpenPopupEmployee(false);
          setOpenPopupProduct(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };
  handleClickSelect(refToThis);
  handleClickSelect(refToProd);

  const handleChooseProd = (e) => {
    setProd(e);
    setValue(
      "delivProduct",
      e.variant !== "" ? e.product_name + " " + e.variant : e.product_name
    );
    setValue("product_id", e.product_id);
    setOpenPopupProduct(false);
  };

  const handleAutoCompleteProd = (product) => {
    if (allProdData && product !== "") {
      let filteredProd = allProdData.filter((item) =>
        item.fullProdName.includes(product.toLowerCase())
      );
      if (filteredProd.length === 0) {
        setOpenPopupProduct(false);
        setFilteredProd(filterProd);
        setError("delivProduct", {
          type: "required",
          message: "Product name error!",
        });
      } else {
        setOpenPopupProduct(true);
        setFilteredProd(filteredProd);
        clearErrors("delivProduct");
      }
    } else if (product || product === "") {
      setOpenPopupProduct(true);
      setFilteredProd(allProdData);
    } else {
      setOpenPopupProduct(false);
      setFilteredProd("error db");
      setToastContent({ variant: "danger", msg: "Database failed" });
      setShowToast(true);
    }
  };

  const handleSearchProd = () => {
    handleAutoCompleteProd(getValues("delivProduct"));
    setProd(null);
  };

  const keyDownSearchProd = (e) => {
    if (e) {
      setProd(null);
    }
  };

  const handleAutoComplete = (employeeName) => {
    if (employeeData && employeeName !== "") {
      let filteredEmployee = employeeData.filter((item) =>
        item.name.includes(employeeName.toLowerCase())
      );
      if (filteredEmployee.length === 0) {
        setOpenPopupEmployee(false);
        setFilteredName(filteredEmployee);
        setError("checkedby_employee_name", {
          type: "required",
          message: "Customer name error!",
        });
      } else {
        setOpenPopupEmployee(true);
        setFilteredName(filteredEmployee);
        clearErrors("checkedby_employee_name");
      }
    } else if (!employeeName || employeeName === "") {
      setOpenPopupEmployee(true);
      setFilteredName(employeeData);
      setError("checkedby_employee_name", {
        type: "required",
        message: "This field is required!",
      });
    } else {
      setOpenPopupEmployee(false);
      setFilteredName("error db");
      setToastContent({ variant: "danger", msg: "Database failed" });
      setShowToast(true);
    }
  };

  const handleFilterName = (e) => {
    handleAutoComplete(getValues("checkedby_employee_name"));
  };

  const handleChooseEmployee = (e) => {
    setEmployee(e);

    setValue("checkedby_employee_id", e.employee_id);
    setValue("checkedby_employee_name", e.name);
    setOpenPopupEmployee(false);
    clearErrors("checkedby_employee_name");
  };

  const handleKeyDown = (e) => {
    if (e) {
      setEmployee(null);
    }
  };

  useEffect(() => {
    if (!chooseProd) {
      setValue("product_id", "");
    } else {
      clearErrors("delivGroupProducts");
    }
  }, [chooseProd]);

  useEffect(() => {
    if (!chooseEmployee) {
      setValue("checkedby_employee_id", "");
    } else {
      clearErrors("delivGroupEmployee");
    }
  }, [chooseEmployee]);

  const handleEdit = (val, idx) => {
    let duplicate = [...salesItems];
    duplicate[idx].quantity = val;
    setSalesItems(duplicate);
    // handleUpdateEndNote(duplicate);
    // setDeliveryGroupProductReturn(duplicate);
  };

  const handleUpdateEndNote = () => {
    if (salesItems && salesItems.length > 0) {
      let totalQty = 0;
      let subtotal = 0;
      
     salesItems.forEach((e) => {
        totalQty += Number(e.quantity) ? Number(e.quantity) : 0;
        subtotal += Number(e.quantity) ? (Number(e.quantity) * Number(e.product.sell_price)) : 0;
      });

      let endNote = {
        ...salesEndNote,
        totalQty: totalQty,
        subtotal: subtotal,
      };

      setSalesEndNote(endNote);
    } else {
      setSalesEndNote({
        totalQty: 0,
        subtotal: 0,
      });
    }
  };

  const delSalesItems = (idx) => {
    salesItems.splice(idx, 1);
    handleUpdateEndNote();
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
      setValue("delivProduct", "");
      handleUpdateEndNote();
    }
    setQtyVal(0);
  };

  // useEffect(() => {
  //   if (editMode) {
  //     handleUpdateEndNote(dgLogs?.delivery_group_log_items);
  //   }
  // }, [editMode]);

  const orderTemplate = (rowData, index) => {
    return (
      <div key={rowData.product_id}>
        <Swiper
          slidesPerView={"auto"}
          style={{ width: "100%", height: "auto" }}
        >
          <SwiperSlide style={{ width: "100%" }}>
            <div
              className="flex flex-column xl:align-items-start gap-1"
              style={{
                backgroundColor: "#ffffff",
                padding: "1rem",
                boxShadow: "1px 1px 7px #9a9acc1a",
                borderRadius: "9px",
                position: "relative",
                width: "100%",
                minHeight: "125px",
              }}
              // aria-label="custDetailModal"
              // onClick={(e) => handleModal(e, rowData)}
            >
              <div
                className="flex align-items-center gap-3"
                style={{
                  textTransform: "capitalize",
                }}
              >
                <span className="user-img" style={{ marginRight: 0 }}>
                  <img
                    src={
                      rowData.img
                        ? rowData.img
                        : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                    }
                    alt=""
                  />
                </span>
                <div className="flex flex-column" style={{ width: "80%" }}>
                  <div className="mb-1">
                    <p
                      style={{
                        marginBottom: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        maxWidth: "130px",
                      }}
                    >{`${rowData.product_name} ${rowData.variant}`}</p>
                    <p
                      style={{
                        marginBottom: 0,
                        fontSize: 11,
                        color: "#7d8086",
                        maxWidth: "130px",
                      }}
                    >
                      <NumberFormat
                        intlConfig={{
                          value: rowData.sell_price,
                          locale: "id-ID",
                          style: "currency",
                          currency: "IDR",
                        }}
                      />
                    </p>
                    {rowData.discProd != 0 ? (
                      <p
                        style={{
                          marginBottom: 0,
                          fontSize: 11,
                          color: "#7d8086",
                          maxWidth: "130px",
                        }}
                      >
                        -
                        <NumberFormat
                          intlConfig={{
                            value: rowData.discProd,
                            locale: "id-ID",
                            style: "currency",
                            currency: "IDR",
                          }}
                        />
                      </p>
                    ) : (
                      ""
                    )}
                    {/* <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{`Disc: ${rowData.discProd}`}</p> */}
                  </div>
                  <div className="order-qty-btn">
                    <QtyButton
                      min={1}
                      max={999}
                      name={`qty-product`}
                      id="qtyItem"
                      value={rowData.quantity}
                      returnValue={(e) => {
                        handleEdit(e, index, rowData);
                      }}
                      size={100}
                    />
                  </div>

                  {/* <div className='flex flex-row gap-2' style={{fontSize: 13, marginTop: '.5rem'}}>
                            <span className={`badge badge-${
                                rowData.order_type == "walk-in" ? 'primary'
                                : rowData.order_type == "delivery" ? "warning" 
                                : ""} light`}
                            >
                                {
                                    rowData.order_type
                                }                                                                                
                            </span>
                            <span className={`badge badge-${
                                rowData.order_status == "completed" ? 'success'
                                : rowData.order_status == "pending" ? "secondary" 
                                : rowData.order_status == "in-delivery" ? "warning" 
                                : rowData.order_status == "canceled" ? "danger" 
                                : ""} light`}
                            >
                                {
                                    rowData.order_status == "completed" ? 'completed'
                                    : rowData.order_status == "pending" ? 'pending'
                                    : rowData.order_status == "in-delivery" ? 'in-delivery'
                                    : rowData.order_status == "canceled" ? 'canceled'
                                    : ""
                                }                                                                                
                            </span>
                            
                        </div> */}
                </div>
              </div>
              <div style={{ position: "absolute", right: 16, bottom: 60 }}>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: ".3rem",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  <NumberFormat
                    intlConfig={{
                      value:
                        rowData.sell_price * rowData.quantity -
                        rowData.discProd,
                      locale: "id-ID",
                      style: "currency",
                      currency: "IDR",
                    }}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide style={{ width: "70px" }}>
            <div
              className="mobile-swiper-content-right danger"
              onClick={() => {
                delSalesItems(index);
              }}
            >
              <i className="bx bx-trash"></i>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    );
  };

  const orderListTemplate = (items) => {
    if (!items || items.length === 0) return null;

    let list = items.map((order, index) => {
      return orderTemplate(order, index);
    });

    return (
      <>
        <div className="order-list-mobile">
          <div
            className="w-full"
            style={{
              // position:'relative',
              backgroundColor: "#F8F9FD",
              padding: ".9rem",
              borderRadius: "7px",
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: ".7rem",
              maxHeight: "418px",
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            {list}
          </div>

          {salesEndNote ? (
            <div className="w-full order-cost-wrap">
              <div className="order-cost-items">
                <p className="cost-text">{`items (${salesEndNote?.totalQty})`}</p>
                <p className="cost-price">
                  <NumberFormat
                    intlConfig={{
                      value: salesEndNote?.subtotal,
                      locale: "id-ID",
                      style: "currency",
                      currency: "IDR",
                    }}
                  />
                </p>
              </div>
              <div className="order-cost-total mt-2">
                <p className="order-cost-total-text">total</p>
                <p className="order-cost-total-price">
                  <NumberFormat
                    intlConfig={{
                      value: salesEndNote.grandtotal,
                      locale: "id-ID",
                      style: "currency",
                      currency: "IDR",
                    }}
                  />
                </p>
              </div>
              {/* <div className="order-cost-total">
            <p className="order-cost-total-text">Metode pembayaran</p>
            <div>
                <span style={{textTransform: 'capitalize', fontWeight: 500, marginRight: '.7rem', fontSize:14}}>{`${paidData ?  paidData.payment_type : ""}`}</span>
                <span className="edit-table-data" aria-label="createPayment" onClick={handleModal}>
                    <i className='bx bx-plus'></i>
                </span>
            </div>
        </div> */}
              <div className="order-cost-total">
                <p className="order-cost-total-text">Total bayar</p>
                <p className="order-cost-total-text">
                  <NumberFormat
                    intlConfig={{
                      value: paidData ? paidData.amountOrigin : 0,
                      locale: "id-ID",
                      style: "currency",
                      currency: "IDR",
                    }}
                  />
                </p>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </>
    );
  };

  const fetchGetDG = async () => {
    await axiosPrivate
      .get("/delivery-group/by/dgid-admin", {
        params: { id: data.delivery_group_id },
      })
      .then((resp) => {
        setValue("dg_employee", resp.data?.employee?.name);
        setValue("delivery_group_id", resp.data?.delivery_group_id);
        setValue("delivery_group_date",  new Date(resp.data?.delivery_group_date).toLocaleString("id-ID").replaceAll(".", ":") ?? "");
        
        if (resp.data.delivery_group_log) {
          setValue("employee_name_checked", resp.data?.delivery_group_log?.employee?.name);
          setValue("employee_id_checked", resp.data?.delivery_group_log?.checkedby_employee_id);
          setValue("log_notes", resp.data?.delivery_group_log?.notes);

          let setdata = {...resp.data.delivery_group_log};
          let setdataItems = [...resp.data.delivery_group_log.delivery_group_log_items];
          setDGLogs(setdata);
          setSalesItems(setdataItems);
          setDGLogItems(setdataItems);
          setDGLogItemsOG(setdataItems);
        } else {
          if(resp.data.DeliveryGroupItemsProduct && resp.data.DeliveryGroupItemsProduct?.length > 0){
            setSalesItems(resp.data.DeliveryGroupItemsProduct);
          } else {
            setSalesItems(null);
          }
        }
        
        if(resp.data.DeliveryGroupItemsProduct && resp.data.DeliveryGroupItemsProduct?.length > 0){
          setDeliveryGroupProductReturn(resp.data.DeliveryGroupItemsProduct);
        } else {
          setDeliveryGroupProductReturn([]);
        }
             
      })
      .catch((err) => {
        setControlUiBtn(false);
        toast.current.show({
          severity: "error",
          summary: "Gagal",
          detail: "Gagal melakukan sinkronisasi data",
          life: 3000,
        });
      });
  };

  const fetchUpdateDG = async (delivery_groups) => {
    const body = JSON.stringify(delivery_groups);

    await axiosPrivate
      .put("/edit/delivery-group", body, {
        params: {
          id: data.id,
        },
      })
      .then((resp) => {
        toast.current.show({
          severity: "success",
          summary: "Sukses",
          detail: "Berhasil mengubah pengantaran grup",
          life: 1500,
        });

        setTimeout(() => {
          return returnAct(true);
        }, 1500);
      })
      .catch((err) => {
        setControlUiBtn(false);
        toast.current.show({
          severity: "error",
          summary: "Gagal",
          detail: "Gagal mengubah pengantaran grup",
          life: 3000,
        });
      });
  };

  const fetchInsertDGLogs = async (bodyData) => {
    await axiosPrivate
      .post("/add/dg-logs", bodyData)
      .then((resp) => {
        toast.current.show({
          severity: "success",
          summary: "Sukses",
          detail: "Berhasil mencatat log pengantaran",
          life: 3000,
        });
        // setInsertMode(false);
        // fetchGetDG();
        setTimeout(() => {
          return returnAct(true);
        }, 1500);
      })
      .catch((err) => {
        err.status == 404
          ? toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "log untuk pengantaran ini sudah ada!",
              life: 1500,
            })
          : toast.current.show({
              severity: "error",
              summary: "Gagal",
              detail: "Gagal mencatat log pengantaran",
              life: 1500,
            });
      });
    setControlUiBtn(false);
  };
  
  const fetchUpdateDGLogs = async (bodyData) => {
    await axiosPrivate
      .put("/update/dg-logs", bodyData)
      .then((resp) => {
        toast.current.show({
          severity: "success",
          summary: "Sukses",
          detail: "Berhasil memperbarui log pengantaran",
          life: 3000,
        });
        // setEditMode(false);
        setTimeout(() => {
          return returnAct(true);
        }, 1500);
      })
      .catch((err) => {
        err.status == 404
          ? toast.current.show({
              severity: "error",
              summary: "Error",
              detail: "log id tidak ditemukan!",
              life: 1500,
            })
          : toast.current.show({
              severity: "error",
              summary: "Gagal",
              detail: "Gagal memperbarui log pengantaran",
              life: 1500,
            });
      });
    setControlUiBtn(false);
  };

  const onError = (err) => {
    setControlUiBtn(false);
    console.log(err);
  };

  const onSubmit = async (formData) => {
    if(!dgLogs){
      let dg_logs = {
        delivery_group_id: data.delivery_group_id,
        checkedby_employee_id: formData.checkedby_employee_id,
        total_item_return: Number(salesEndNote.totalQty),
        total_value_return: Number(salesEndNote.subtotal),
        status: 1,
        notes: formData.notes,
      };
  
      const dg_log_items = deliveryGroupProductReturn.map((item) => {
        let newFormat = {
          product_id: item.product_id,
          sell_price: Number(item.product.sell_price),
          quantity: Number(item.quantity),
        };
        return newFormat;
      });
  
      let sendData = JSON.stringify({ dg_logs, dg_log_items });
      fetchInsertDGLogs(sendData);
    } else {
      let dg_logs = {
        dg_log_id: dgLogs.dg_log_id,
        delivery_group_id: dgLogs.delivery_group_id,
        checkedby_employee_id: formData.employee_id_checked,
        total_item_return: Number(salesEndNote.totalQty),
        total_value_return: Number(salesEndNote.subtotal),
        status: 1,
        notes: formData.log_notes,
      };
  
      const dg_log_items = dgLogs.delivery_group_log_items.map((item) => {
        let newFormat = {
          dg_log_item_id: item.dg_log_item_id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
        };
        return newFormat;
      });
      // console.log({ dg_logs, dg_log_items })
      let sendData = JSON.stringify({ dg_logs, dg_log_items });
      fetchUpdateDGLogs(sendData);
    }

  };

  const handleCancel = () => {
    reset();
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleModal = (e) => {
    switch (e.currentTarget.ariaLabel) {
      case "editDGList":
        setShowModal("editDGList");
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (data) {
      fetchGetDG();
      fetchAllEmployee();
    }
  }, []);

  useEffect(() => {
    if(salesItems){
      handleUpdateEndNote();
    }
  },[salesItems])

  useEffect(() => {
    if(data.action == "update"){
      if (salesItems && dgLogs && dgLogItems) {
        setLoading(false);
      } 
    } else {
      setLoading(false);
    }
  }, [salesItems, dgLogs, dgLogItems]);

  useEffect(() => {
    if (refetch) {
      fetchDG();
      setShowModal("");
      setRefetch(false);
    }
  }, [refetch]);

  const ClearToast = () => {
      toast.current.clear();
  };

  useEffect(() => {
    if(!isLoading){
      if(multiple === true){
        document.querySelectorAll(".modal-backdrop").forEach((e,idx) => {
            e.style.zIndex = 1055 + (idx * stack);
        })
        document.querySelectorAll(".modal").forEach((e,idx) => {
            e.style.zIndex = 1056 + (idx * stack);
        })
      }
    } else {
      return;
    }
  },[show, isLoading])


  return (
    <>
      <Modal
        size={isMediumScr || isMobile ? "fullscreen" : "xl"}
        show={show}
        onHide={() => {
          handleCancel();
          onHide();
        }}
        scrollable={true}
        centered={true}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {!dgLogs ? "input" : "ubah"} barang kembali: pengantaran
            harian
          </Modal.Title>
          {/* {dgLogs &&
          (
          <div className="modal-btn-wrap d-flex gap-2">
            <button
              type="button"
              className="btn btn-warning btn-w-icon"
              onClick={() => {
                  setEditMode((p) => !p);
              }}
            >
              <i className="bx bx-pencil"></i>Edit data
            </button>
          </div>
          )
          } */}
        </Modal.Header>
        <Modal.Body>
          {dgLogs ? (
            <>
              <div className="row gy-2">
                <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                  <InputWLabel
                    label="ID pengantaran"
                    type="text"
                    name="delivery_group_id"
                    require={false}
                    register={register}
                    errors={errors}
                    disabled={true}
                    textStyle={"capitalize"}
                    autoComplete={"off"}
                    defaultValue={getValues("delivery_group_id")}
                  />
                </div>
                <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                  <InputWLabel
                    label="diantar oleh"
                    type="text"
                    name="dg_employee"
                    require={false}
                    register={register}
                    errors={errors}
                    disabled={true}
                    textStyle={"capitalize"}
                    autoComplete={"off"}
                    defaultValue={getValues("dg_employee")}
                  />
                </div>
                <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                  <InputWLabel
                    label={"tanggal & waktu"}
                    type="text"
                    name={"delivery_group_date"}
                    require={false}
                    register={register}
                    errors={errors}
                    disabled={true}
                    defaultValue={getValues("delivery_group_date")}
                  />
                </div>
                {/* start: this is helper */}
                <InputWLabel
                  type="text"
                  name="employee_id_checked"
                  require={true}
                  register={register}
                  errors={errors}
                  display={false}
                />
                {/* end: helper for validate */}
                <div className={"col-lg-8 col-sm-12 col-12"}>
                  <InputWLabel
                    label="dicek oleh"
                    type="text"
                    name="employee_name_checked"
                    // placeholder="Search employee name..."
                    // onChange={handleFilterName}
                    // onFocus={handleFilterName}
                    // onKeyDown={handleKeyDown}
                    defaultValue={getValues("employee_name_checked")}
                    // disabled={editMode ? false : true}   
                    require={true}
                    register={register}
                    errors={errors}
                    textStyle={"capitalize"}
                    autoComplete={"off"}
                  />
                </div>
                <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                  <InputWLabel
                    label="catatan"
                    as="textarea"
                    name="log_notes"
                    require={false}
                    // disabled={editMode ? false : true}   
                    register={register}
                    errors={errors}
                    textStyle={"capitalize"}
                    autoComplete={"off"}
                  />
                </div>
              </div>
              <div className="table-responsive mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" aria-label="product desc">
                        produk
                      </th>
                      <th scope="col" aria-label="product variant">
                        varian
                      </th>
                      <th scope="col" aria-label="qty">
                        qty kembali
                      </th>
                      <th scope="col" aria-label="qty">
                        harga satuan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesItems ? salesItems.map((item, idx) => {
                      let maxItem = deliveryGroupProductReturn?.findIndex(({product_id}) => item.product_id == product_id);
                        return (
                            <tr key={idx}>
                              <td
                                className="data-img"
                                style={{ textTransform: "capitalize" }}
                              >
                                <span className="user-img">
                                  <img src={item.product.img} alt="prod-img" />
                                </span>
                                {item.product.product_name}
                              </td>
                              <td>{item.product.variant}</td>
                              <td>
                                <QtyButton
                                  min={1} 
                                  max={maxItem >= 0 && Number(deliveryGroupProductReturn[maxItem]?.total_item)} 
                                  name={`qty-product`} 
                                  id="qtyItem" 
                                  value={Number(item.quantity)} 
                                  width={'130px'} 
                                  returnValue={(val, maxAlert) => {
                                    if(maxAlert){
                                      toast.current.show({
                                        severity: "error",
                                        summary: "Error",
                                        detail: "Sudah mencapai maksimum stok!",
                                        life: 1500,
                                      });
                                    } else {
                                      ClearToast();
                                      // handleUpdateEndNote(dgLogs?.delivery_group_log_items);
                                    }
                                    handleEdit(val,idx);handleUpdateEndNote()
                                  }} 
                                />
                              </td>
                              <td>
                                <NumberFormat
                                  intlConfig={{
                                    value: item.sell_price,
                                    locale: "id-ID",
                                    style: "currency",
                                    currency: "IDR",
                                  }}
                                />
                              </td>
                            </tr>
                          );
                      })
                    : ""}
                    <tr className="endnote-row">
                      <td
                        colSpan="2"
                        className="endnote-row-title"
                        style={{ fontWeight: 600 }}
                      >
                        items
                      </td>
                      <td colSpan="5" style={{ fontWeight: 600 }}>
                        {Number(salesEndNote.totalQty)}
                        {/* {Number(dgLogs.total_item_return)} */}
                      </td>
                    </tr>
                    <tr className="endnote-row">
                      <td
                        colSpan="3"
                        className="endnote-row-title"
                        style={{ fontWeight: 600 }}
                      >
                        subtotal
                      </td>
                      <td colSpan="2" style={{ fontWeight: 600 }}>
                        <NumberFormat
                          intlConfig={{
                            value: salesEndNote.subtotal,
                            // value: dgLogs.total_value_return,
                            locale: "id-ID",
                            style: "currency",
                            currency: "IDR",
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) :  (
            <>
              <form style={{ height: "100%" }}>
                <div
                  className="add-prod-detail-wrap"
                  style={{ flexDirection: "column", gap: "1rem" }}
                >
                  <div className="row gy-2">
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                      <InputWLabel
                        label="ID pengantaran"
                        type="text"
                        name="delivery_group_id"
                        require={false}
                        register={register}
                        errors={errors}
                        disabled={true}
                        textStyle={"capitalize"}
                        autoComplete={"off"}
                        defaultValue={getValues("delivery_group_id")}
                      />
                    </div>
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                      <InputWLabel
                        label="diantar oleh"
                        type="text"
                        name="dg_employee"
                        require={false}
                        register={register}
                        errors={errors}
                        disabled={true}
                        textStyle={"capitalize"}
                        autoComplete={"off"}
                        defaultValue={getValues("dg_employee")}
                      />
                    </div>
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                      <InputWLabel
                        label={"tanggal & waktu"}
                        type="text"
                        name={"delivery_group_date"}
                        require={false}
                        register={register}
                        errors={errors}
                        disabled={true}
                        defaultValue={getValues("delivery_group_date")}
                      />
                    </div>
                    {/* start: this is helper */}
                    <InputWLabel
                      type="text"
                      name="checkedby_employee_id"
                      require={true}
                      register={register}
                      errors={errors}
                      display={false}
                    />
                    {/* end: helper for validate */}
                    <div className={"col-lg-8 col-sm-12 col-12"}>
                      <InputWLabel
                        label="dicek oleh"
                        type="text"
                        name="checkedby_employee_name"
                        placeholder="Search employee name..."
                        onChange={handleFilterName}
                        onFocus={handleFilterName}
                        onKeyDown={handleKeyDown}
                        require={true}
                        register={register}
                        errors={errors}
                        textStyle={"capitalize"}
                        autoComplete={"off"}
                      />
                      {/* popup autocomplete */}
                      <div
                        className="popup-element"
                        aria-expanded={openPopupEmployee}
                        ref={refToThis}
                      >
                        {filterName && filterName.length > 0 ? (
                          filterName.map((e, idx) => {
                            return (
                              <div
                                key={`employee-${idx}`}
                                className="res-item"
                                onClick={() =>
                                  handleChooseEmployee({
                                    ...e,
                                  })
                                }
                              >
                                {e.name}
                              </div>
                            );
                          })
                        ) : (
                          <div className="res-item">Tidak ada data</div>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                      <InputWLabel
                        label="catatan"
                        as="textarea"
                        name="notes"
                        require={false}
                        register={register}
                        errors={errors}
                        textStyle={"capitalize"}
                        autoComplete={"off"}
                      />
                    </div>
                  </div>
                </div>
              </form>
              <div className="table-responsive mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" aria-label="product desc">
                        produk
                      </th>
                      <th scope="col" aria-label="product variant">
                        varian
                      </th>
                      <th scope="col" aria-label="qty">
                        qty
                      </th>
                      <th scope="col" aria-label="qty">
                        harga satuan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesItems &&
                    salesItems.length > 0
                      ? salesItems.map((item, idx) => {
                          return (
                            <tr key={idx}>
                              <td
                                className="data-img"
                                style={{ textTransform: "capitalize" }}
                              >
                                <span className="user-img">
                                  <img src={item.product.img} alt="prod-img" />
                                </span>
                                {item.product.product_name}
                              </td>
                              <td>{item.product.variant}</td>
                              <td>
                                <QtyButton
                                  min={0}
                                  max={item.total_item}
                                  name={`qty-product`}
                                  id="qtyItem"
                                  width={"150px"}
                                  value={
                                    item.quantity ? Number(item.quantity) : 0
                                  }
                                  returnValue={(val, maxAlert) => {
                                    if(maxAlert){
                                      toast.current.show({
                                        severity: "error",
                                        summary: "Error",
                                        detail: "Sudah mencapai maksimum stok!",
                                        life: 1500,
                                      });
                                    } else {
                                      ClearToast();
                                      // handleUpdateEndNote(dgLogs?.delivery_group_log_items);
                                    }
                                    handleEdit(val,idx);
                                  }} 
                                />
                              </td>
                              <td>
                                <NumberFormat
                                  intlConfig={{
                                    value: item.product.sell_price,
                                    locale: "id-ID",
                                    style: "currency",
                                    currency: "IDR",
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })
                      : ""}
                    {salesItems &&
                    salesItems.length > 0 &&
                    salesEndNote ? (
                      <>
                        <tr className="endnote-row">
                          <td colSpan="2" className="endnote-row-title">
                            items
                          </td>
                          <td colSpan="5">{salesEndNote.totalQty}</td>
                        </tr>
                        <tr className="endnote-row">
                          <td colSpan="2" className="endnote-row-title">
                            subtotal
                          </td>
                          <td colSpan="2" style={{ fontWeight: 500 }}>
                            <NumberFormat
                              intlConfig={{
                                value: salesEndNote.subtotal,
                                locale: "id-ID",
                                style: "currency",
                                currency: "IDR",
                              }}
                            />
                          </td>
                        </tr>
                      </>
                    ) : (
                      ""
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* {dgLogs && !editMode ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                handleCancel();
                onHide();
              }}
            >
              tutup
            </button>
          ) : insertMode || editMode ? ( */}
              {/* <> */}
                <button
                  type="button"
                  className="btn btn-secondary light"
                  onClick={() => {
                    handleCancel();
                    onHide();
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
                    // onSubmit();
                    handleSubmit(onSubmit, onError)();
                  }}
                >
                  {controlUiBtn ? "Loading..." : "submit"}
                </button>
              {/* </>
          
          ) :''
          } */}
        </Modal.Footer>
      </Modal>

      {showModal == true ? (
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
      ) : showModal == "editDGList" ? (
        <EditDelivGroupListModal
          show={showModal === "editDGList" ? true : false}
          onHide={handleClose}
          multiple={true}
          stack={2}
          data={showModal === "editDGList" ? salesItems : ""}
          returnAct={(act) => (act ? setRefetch(true) : setRefetch(false))}
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
