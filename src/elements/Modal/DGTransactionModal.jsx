import React, { useEffect, useState, useRef } from "react";
import { Modal, Form } from "react-bootstrap";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import useAxiosPrivate from "../../hooks/useAxiosPrivate.js";

import User from "../../assets/images/Avatar 1.jpg";
import NumberFormat from "../Masking/NumberFormat.jsx";
import InputWLabel from "../Input/InputWLabel.jsx";
import InputWSelect from "../Input/InputWSelect.jsx";
import DiscountModal from "./DiscModal.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import QtyButton from "../QtyButton/index.jsx";
import CreatePayment from "./CreatePaymentModal.jsx";
import FetchApi from "../../assets/js/fetchApi.js";
import { useForm } from "react-hook-form";
import ConvertDate from "../../assets/js/ConvertDate.js";
import dataStatic from "../../assets/js/dataStatic.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { DataView } from "primereact/dataview";
import useMediaQuery from "../../hooks/useMediaQuery.js";
import { parse } from "dotenv";

export default function DGTransactionModal({ show, onHide, data, returnValue, stack, multiple }) {
 

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isMediumScr = useMediaQuery(
    "(min-width: 768px) and (max-width: 1024px)"
  );

  const toast = useRef(null);
  const toastUpload = useRef(null);
  const orderCardLeft = useRef(null);

  const [showToast, setShowToast] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [toastContent, setToastContent] = useState({
    variant: "",
    msg: "",
    title: "",
  });
  const [salesById, setSalesById] = useState(null);
  const [custData, setCustData] = useState(null);
  const [salesItems, setSalesItems] = useState([]);
  const [filterCust, setFilteredCust] = useState([]);
  const [filterProd, setFilteredProd] = useState(null);
  const [allProdData, setAllProd] = useState(null);
  const [openPopupProd, setOpenPopupProd] = useState(false);
  const [allStatus, setStatusList] = useState(dataStatic.orderStatusList);
  const [qtyVal, setQtyVal] = useState(0);
  const [childQtyVal, setChildQtyVal] = useState(0);
  const [addedValue, setAddedValue] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [chooseCust, setCust] = useState("");
  const [chooseProd, setProd] = useState(null);
  const [salesEndNote, setSalesEndNote] = useState(null);
  const [paidData, setPaidData] = useState(null);
  const [orderDetail, setOrderdetail] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [discVal, setDiscVal] = useState(0);
  const [totalDiscProd, setTotalDiscProd] = useState(0);
  const [salesDisc, setSalesDisc] = useState({
    discType: "nominal",
    value: data ? data.order_discount : 0,
  });
  const [sendTarget, setSendTarget] = useState(null);
  const [cantCanceled, setCantCanceled] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  const axiosPrivate = useAxiosPrivate();

  const refToProd = useRef(null);
  const refToThis = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    getValues,
    setFocus,
    setError,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer_id: data.customer_id ? data.customer_id : '',
      name: data.name ? data.name : data.guest_name,
      // order_date: data.order_date ? new Date(data.order_date) : null,
      // order_type: data.order_type
    },
  });

  const handleModal = (e) => {
    let dataToSend;
    switch (e.currentTarget.ariaLabel) {
      case "addDiscount":
        setShowModal("addDiscount");
        break;
      case "createPayment":
        dataToSend = {
          // id: data.order_id,
          items: {
            payment_date: data.delivery_group_date
          },
        };
        setSendTarget(dataToSend);
        setShowModal("createPayment");
        break;
      case "cancelSales":
        dataToSend = {
          endpoint: "sales",
          id: data.order_id,
          action: "canceled",
          items: { ...data },
        };
        setSendTarget(dataToSend);
        setShowModal("cancelSalesModal");
        break;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fetchStatus = () => {
    FetchApi.fetchStatus()
      .then((result) => {
        setStatusList(result);
      })
      .catch((error) => {
        setToastContent({
          variant: "danger",
          msg: "Error when get status data!",
        });
        setShowToast(true);
      });
  };

  const fetchAllProdByDG = async () => {
    await axiosPrivate
      .get("/delivery-group/by", {
        params: {
          id: data.delivery_group_id,
        },
      })
      .then((resp) => {
        setAllProd(resp.data.delivery_group_items);
        let getDeliveryGroupItems = resp.data.delivery_group_items;
        getDeliveryGroupItems.map((e, idx) => {
          e.fullProdName = e.product?.product_name + " " + e.product?.variant;
        });
        setFilteredProd(getDeliveryGroupItems);
      })
      .catch((error) => {
        // setToastContent({variant:"danger", msg: "Error when get products data!"});
        // setShowToast(true);

        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error when get products data",
          life: 3000,
        });
      });
  };

  const fetchAllCust = async () => {
    await axiosPrivate
      .get("/customers")
      .then((resp) => {
        setCustData(resp.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error when get customer data",
          life: 3000,
        });
      });
  };

  const handleAutoComplete = (custName) => {
    if (custData && custName !== "") {
      let filteredCust = custData.filter((item) =>
        item.name.includes(custName.toLowerCase())
      );
      if (filteredCust.length === 0) {
        setOpenPopup(false);
        setFilteredCust(filteredCust);
      } else {
        setOpenPopup(true);
        setFilteredCust(filteredCust);
      }
    } else if (custName || custName === "") {
      setOpenPopup(true);
      setFilteredCust(custData);
    } else {
      setOpenPopup(false);
      setFilteredCust("error db");
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error with customer data",
        life: 3000,
      });
    }
  };

  const handleAutoCompleteProd = (product) => {
    if (filterProd && product !== "") {
      let filteredProd = filterProd.filter((item) =>
        item.fullProdName.includes(product.toLowerCase())
      );
      if (filteredProd.length === 0) {
        setOpenPopupProd(false);
        setFilteredProd(filterProd);
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
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error with product data",
        life: 3000,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e) {
      setCust(null);
      setValue("customer_id", "");
    }
  };

  const handleFilterCust = () => {
    handleAutoComplete(getValues("name"));
    setCust(null);
  };

  const handleChooseCust = (e) => {
    setCust(e);
    setValue("customer_id", e.customer_id);
    setValue("name", e.name);
    setOpenPopup(false);
  };

  const handleChooseProd = (e) => {
    setProd(e);
    setValue(
      "salesProduct",
      e.variant !== "" ? e.product_name + " " + e.variant : e.product_name
    );
    setOpenPopupProd(false);
  };

  const keyDownSearchProd = (e) => {
    if(e) {
      setProd(null);
    }
    !openPopupProd && setOpenPopupProd(true);
  };

  const handleSearchProd = () => {
    handleAutoCompleteProd(getValues("salesProduct"));
    setProd(null);
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
      let prodObjDupe = {...chooseProd};
      console.log(qtyVal)
      prodObjDupe.quantity = qtyVal;

      if (salesItems.length === 0) {
        // setChildQtyVal(qtyVal);
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
          setChildQtyVal(tmpArr[findDuplicateIdx].quantity);
        } else {
          // setChildQtyVal(qtyVal);
          tmpArr.push(prodObjDupe);
        }
        setSalesItems(tmpArr);
      }
      // setPaidData(null);
      setProd(null);
      setQtyVal(0);
      setValue("salesProduct", "");
      handleUpdateEndNote();
    }
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

  const handleEdit = (val, idx) => {
    let duplicate = [...salesItems];
    duplicate[idx].quantity = val;
    setSalesItems(duplicate);
  };

  const onSubmit = () => {
    // validate id FOCUS ON ID!!!!!
    if (!salesItems || salesItems.length < 1) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Tambahkan minimal satu produk!",
        life: 3500,
      });
    } else if(!paymentData) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Tambahkan informasi pembayaran",
        life: 3500,
      });
    } else {
      const formData = getValues();
      // let grandQty = 0;
      // let subtotal = 0;
      // let objStr =
      //   salesItems.length > 0
      //     ? JSON.stringify([...salesItems])
      //     : JSON.stringify([]);

      // let order = {
      //   ...formData,
      //   subtotal: Number(salesEndNote.subtotal),
      //   grandtotal: Number(salesEndNote.grandtotal),
      //   updatedAt: new Date(),
      // };
      // delete order.salesProduct;
      // delete order.name;

      // let orderItems = salesItems.map((e) => {
      //   let obj = {
      //     customer_id: formData.customer_id,
      //     guest_name: formData.guest_name,
      //     order_date: data.delivery_group_date,

      //     product_id: e.product_id,
      //     quantity: Number(e.quantity),
      //     sell_price: Number(e.sell_price),
      //     disc_prod_rec: Number(e.discount),
      //   };
      //   return obj;
      // });
      const dgReportListStorage = localStorage.getItem(`form-${data.delivery_group_id}`);
     
      let parsed = JSON.parse(dgReportListStorage);

      let dgReportList = {
        ...formData,
        origin: data,
        items: salesItems,
        cost_detail: salesEndNote,
        payment: paymentData
      };

      let dgReportListArr = [];
      let dgListItem;
      salesItems.map((item, idx) => {
        dgListItem = {
          customer_id: formData.customer_id ? Number(formData.customer_id) : null,
          guest_name : formData.customer_id ? '' : formData.name,
          order_date: data.delivery_group_date,
          order_type: 'delivery',
          order_status: Number(paymentData.amountOrigin) == 0 ? 'pending' 
                        : Number(paymentData.amountOrigin) < Number(paymentData.pay_amount) ? 'pending'
                        : Number(paymentData.amountOrigin) >= Number(paymentData.pay_amount) ? 'completed'
                        : 'pending',
          source: 'delivery_group',
          shipped_date: data.delivery_group_date,
          payment_type: Number(paymentData.amountOrigin) == 0 ? 'bayar nanti' 
                        : Number(paymentData.amountOrigin) < Number(paymentData.pay_amount) ? 'sebagian'
                        : Number(paymentData.amountOrigin) >= Number(paymentData.pay_amount) ? 'lunas'
                        : 'bayar nanti',
          subtotal: (Number(item.quantity)*Number(item.sell_price))-(Number(item.quantity)*Number(item.discProd)),
          grandtotal: (Number(item.quantity)*Number(item.sell_price))-(Number(item.quantity)*Number(item.discProd)),
          note: formData.note,
          is_complete: paymentData.amountOrigin == 0 ? false 
          : Number(paymentData.amountOrigin) < Number(paymentData.pay_amount) ? false
          : Number(paymentData.amountOrigin) >= Number(paymentData.pay_amount) ? true
          : false,
          order_discount: 0,
          payment_date: paymentData.payment_date,
          amount_paid: Number(paymentData.amountOrigin),
          payment_method: 'cash',
          payment_note: paymentData.note,
        }  

        dgListItem.product_id = Number(item.product_id);
        dgListItem.quantity = Number(item.quantity);
        dgListItem.sell_price = Number(item.sell_price);
        dgListItem.disc_prod_rec = Number(item.discProd);

        dgReportListArr.push(dgListItem);
      });
      // console.log(dgReportListArr)
      // const sendStringify = JSON.stringify(dgReportListArr);
      if(dgListItem){
        if(!dgReportListStorage) {
          let tmpArr = [];
          tmpArr[data.index] = dgReportListArr;
          localStorage.setItem(`form-${data.delivery_group_id}`, JSON.stringify(tmpArr));
        } else {
          let tmpArr = [...parsed];
          tmpArr[data.index] = dgReportListArr;
          localStorage.setItem(`form-${data.delivery_group_id}`, JSON.stringify(tmpArr));

      }
        // dgReportListArr.map((item, idx) => {
        //   parsed.map((parseitem, index) => {
        //     if(item.customer_id){
        //       if(item.customer_id === parseitem.customer_id){
        //         if(item.product_id === parseitem.product_id){
        //           findDuplicateIdx.push(index);
        //         }
        //       }
        //     } else {
        //       if(item.customer_id === parseitem.customer_id){
        //         if(item.product_id === parseitem.product_id){
        //           findDuplicateIdx.push(index);
        //         }
        //       }
        //     }
        //   })
        // })
        // console.log(findDuplicateIdx)
      }

      

      if(returnValue){
        return returnValue(dgReportList);
      }

      // let dataToSend = {
      //   id: data.id,
      //   endpoint: data.endpoint,
      //   action: data.action,
      //   data: orderData,
      //   old_data: data,
      // };
      // setSendTarget(dataToSend);
      // setShowModal("confirmModal");
    }
  };

  const onError = (errors) => {
    // if (getValues("name") != "" && errors.customer_id) {
    //   setError("name", {
    //     type: "required",
    //     message: "Choose customer name correctly!",
    //   });
    // }
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "There is an error with required field",
      life: 3500,
    });
  };

  const handleUpdateEndNote = () => {
    if (salesItems && salesItems.length > 0) {
      let totalQty = 0;
      let subtotal = 0;
      let allDiscProd = 0;

      salesItems.forEach((e) => {
        totalQty += e.quantity;
        subtotal += (e.quantity * Number(e.sell_price)) - (e.quantity * Number(e.discProd));
        allDiscProd += e.quantity * Number(e.discProd);
      });

      if (paidData && paidData.payment_type == "lunas") {
        if (paidData.amountOrigin < subtotal) {
          setPaidData(null);
        }
      } else if (paidData && paidData.payment_type == "sebagian") {
        if (paidData.amountOrigin >= subtotal) {
          setPaidData(null);
        }
      }

      let endNote = {
        ...salesEndNote,
        totalQty: totalQty,
        grandtotal: subtotal,
        discProd: allDiscProd,
        remaining_payment: paidData
          ? paidData.payment_type == "lunas"
            ? 0
            : paidData.payment_type == "bayar nanti"
              ? subtotal
              : paidData.payment_type == "sebagian"
                ? subtotal - paidData.amountOrigin
                : subtotal
          : subtotal,
      };

      setSalesEndNote(endNote);
    } else {
      setPaidData(null);
      setSalesDisc(null);
      setSalesEndNote(null);
    }
  };

  const delSalesItems = (idx) => {
    salesItems.splice(idx, 1);
    handleUpdateEndNote();
  };

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
              aria-label="custDetailModal"
              onClick={(e) => handleModal(e, rowData)}
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
                      max={Number(rowData.max_qty)}
                      name={`qty-product`}
                      value={rowData.quantity}
                      returnValue={(e) => {
                        handleEdit(e, index);
                        handleUpdateEndNote();
                      }}
                      size={100}
                    />
                  </div>
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
                        (rowData.sell_price * rowData.quantity) -
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
              {/* <div className="order-cost-items">
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
              </div> */}
              {/* <div className="order-cost-addon">
                <p className="cost-addon-text">Diskon order</p>
                <span className="d-flex gap-2">
                  {salesDisc && salesDisc.discType == "percent" ? (
                    <>
                      <NumberFormat
                        intlConfig={{
                          value: salesDisc
                            ? (salesDisc.value *
                                Number(salesEndNote?.subtotal)) /
                              100
                            : "0",
                          locale: "id-ID",
                          style: "currency",
                          currency: "IDR",
                        }}
                      />
                      <span>{`(${salesDisc?.value}%)`}</span>
                    </>
                  ) : salesDisc && salesDisc.discType != "percent" ? (
                    <NumberFormat
                      intlConfig={{
                        value: salesDisc?.value,
                        locale: "id-ID",
                        style: "currency",
                        currency: "IDR",
                      }}
                    />
                  ) : (
                    "Rp 0"
                  )}
                  <span
                    className="order-sett"
                    aria-label="addDiscount"
                    onClick={(e) => handleModal(e)}
                  >
                    <i className="bx bx-cog"></i>
                  </span>
                </span>
              </div> */}
              <div className="order-cost-total mt-2">
                <p className="order-cost-total-text">{`total transaksi (${salesEndNote?.totalQty} ${salesEndNote?.totalQty > 1 ? 'items' :'item'})`}</p>
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
              <div className="order-cost-total">
                <p className="order-cost-total-text">Total bayar</p>
                <p className="order-cost-total-text">
                  {paymentData ?  
                  (
                    <>
                      <NumberFormat
                        intlConfig={{
                          value: paymentData.amountOrigin,
                          locale: "id-ID",
                          style: "currency",
                          currency: "IDR",
                        }}
                      />
                      <span
                        className="edit-table-data"
                        style={{marginLeft: 8}}
                        aria-label="createPayment"
                        onClick={handleModal}
                      >
                        <i className="bx bx-plus"></i>
                      </span>
                    </>

                  ):(
                  <button
                    type="button"
                    className="add-btn btn btn-primary light btn-w-icon form-support-btn"
                    aria-label="createPayment" 
                    onClick={handleModal}
                  >
                    <i className="bx bx-plus"></i>
                    info pembayaran
                  </button>
                  )}
                  
                 
                </p>
              </div>
              <div className="order-cost-total">
                <p className="order-cost-total-text">
                  {
                    paymentData ? 
                      paymentData.amountOrigin-salesEndNote.grandtotal < 0 ?  
                        'sisa pembayaran' 
                        : 'kembali'
                    : 'sisa pembayaran'
                  }
                </p>
                <p className="order-cost-total-text">
                  <NumberFormat
                    intlConfig={{
                      value: paymentData ? 
                              paymentData.amountOrigin-salesEndNote.grandtotal < 0 ?  
                                Math.abs(paymentData.amountOrigin-salesEndNote.grandtotal) 
                                : Math.abs(salesEndNote.grandtotal-paymentData.amountOrigin)
                              : 0,
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

  useEffect(() => {
    if (!chooseCust) {
      // if(getValues('customer_id') = ""){
      //     setValue('customer_id', '');
      // }
    } else {
      clearErrors("name");
    }
  }, [chooseCust]);

  useEffect(() => {
    if (!chooseProd) {
      setValue("product_id", "");
    } else {
      clearErrors("salesProduct");
    }
  }, [chooseProd]);

  useEffect(() => {
    if (salesDisc || salesItems) {
      if (salesItems && salesItems.length > 0) {
        handleUpdateEndNote();
      }
    }
  }, [salesDisc, salesItems]);

  useEffect(() => {
    setAddedValue(null);
  }, [addedValue]);

  useEffect(() => {
    if (data) {
      fetchAllProdByDG();
      // fetchStatus();
      // fetchAllCust();
      // fetchSalesByID();
      // fetchOrderItemByOrder();
    }
  }, []);

 

  // useEffect(() => {
  //   if(chooseProd){
  //     qtyVal > 0 && setQtyVal(Number(chooseProd.max_qty))
  //   }
  // },[chooseProd]);

  useEffect(() => {
    if (cantCanceled) {
      let sendData = {
        id: data.id,
        endpoint: "content",
        action: "info",
        items: data.items,
      };
      setSendTarget(sendData);
      setShowModal("");
      setShowModal("warningCancelModal");
    }
  }, [cantCanceled]);

  

  useEffect(() => {
    if(multiple === true){
      document.querySelectorAll(".modal-backdrop").forEach((e,idx) => {
        e.style.zIndex = 1055 + (idx * stack);
      })
      document.querySelectorAll(".modal").forEach((e,idx) => {
        e.style.zIndex = 1056 + (idx * stack);
      })
    }
  },[show]);

  //  useEffect(() => {
  //   if (allProdData) {
  //     setLoading(false);
  //   }
  // }, [allProdData]);

  // if (isLoading) {
  //   return;
  // }
  
  return (
    <>
      <Modal
        dialogClassName={
          isMobile || isMediumScr ? "modal-fullscreen" : "modal-xl"
        }
        show={show}
        onHide={onHide}
        scrollable={true}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>tambah transaksi</Modal.Title>
          {/* <span style={{textTransform: 'capitalize'}} 
                  className={`badge badge-${
                    data.payment_type == "bayar nanti" ? 'danger'
                    : data.payment_type == "lunas"? "primary"
                    : data.payment_type == "sebagian"? "warning"
                    :""
                } light mx-2`}
                >
                    {data.payment_type}                                                                                
                </span> */}
        </Modal.Header>
        <Modal.Body>
          <form autoComplete="off">
            <div className="row xl:gap-0 lg:gap-0 md:gap-0 sm:row-gap-2 mb-4">
              <div className="col-lg-3 col-sm-12 col-md-12 col-12">
                {/* start: this is helper */}
                <InputWLabel
                  type="text"
                  name="customer_id"
                  require={true}
                  register={register}
                  errors={errors}
                  display={false}
                />
                {/* end: helper for validate */}

                <div style={{ position: "relative" }}>
                  <InputWLabel
                    label="nama pelanggan"
                    type="text"
                    name="name"
                    textStyle={"capitalize"}
                    // onChange={handleFilterCust}
                    // onFocus={() => handleAutoComplete(getValues('name'))}
                    // onKeyDown={handleKeyDown}
                    require={true}
                    register={register}
                    errors={errors}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="col-lg-3 col-sm-12 col-md-12 col-12">
                <InputWLabel
                  label="catatan"
                  as="textarea"
                  name="note"
                  // defaultValue={orderData.note ? orderData.note : ""}
                  require={false}
                  register={register}
                  errors={errors}
                  // disabled={editMode ? false : true}
                />
              </div>
            </div>
          </form>

          <div className="add-product-control mt-3 mb-4">
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
                              product_id: e.product?.product_id,
                              product_name: e.product?.product_name,
                              variant: e.product?.variant,
                              max_qty: e.quantity,
                              img: e.product?.img,
                              product_cost: e.product?.product_cost,
                              sell_price: Number(e.product?.sell_price),
                              discProd: Number(e.disc_prod_rec),
                            })
                          }
                        >
                          {e.fullProdName}
                        </div>
                      );
                    })
                  : ""}
              </div>
            </div>

            <div className="qty-add-btn-group">
              {/* <div> */}
              {/* <Form.Label className="mb-1">qty</Form.Label> */}
              <QtyButton
                min={0}
                max={chooseProd ? Number(chooseProd.max_qty) : 999}
                name={`qty-add-product`}
                width={"180px"}
                value={qtyVal}
                returnValue={(e) => {setQtyVal(e)}}
                // disabled={editMode ? false : true}
                label={"qty"}
              />
              {/* </div> */}
              {/* <div className='align-self-end'> */}
              <button
                className={`btn btn-primary qty-add-btn`}
                onClick={(e) => {
                  e.preventDefault();
                  addToSalesData();
                }}
              >
                <i className="bx bx-plus"></i>
              </button>
              {/* </div> */}
            </div>
          </div>

          {!isMobile && !isMediumScr ? (
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
                    <th scope="col" aria-label="product price">
                      harga
                    </th>
                    <th scope="col" aria-label="product price">
                      diskon
                    </th>
                    <th scope="col" aria-label="total">
                      total
                    </th>
                    <th scope="col" aria-label="action">
                      aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesItems && salesItems.length > 0
                    ? salesItems.map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <td
                              className="data-img"
                              style={{ textTransform: "capitalize" }}
                            >
                              <span className="user-img">
                                <img src={item.img} alt="prod-img" />
                              </span>
                              {item.product_name}
                            </td>
                            <td>{item.variant}</td>
                            <td>
                              <QtyButton
                                min={1}
                                max={salesItems.quantity}
                                name={`qty-product`}
                                id="qtyItem"
                                value={item.quantity}
                                returnValue={(e) => {
                                  handleEdit(e, idx);
                                  handleUpdateEndNote();
                                }}
                                width={"150px"}
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
                            <td>
                              <NumberFormat
                                intlConfig={{
                                  value: item.discProd,
                                  locale: "id-ID",
                                  style: "currency",
                                  currency: "IDR",
                                }}
                                v
                              />
                            </td>
                            <td>
                              <NumberFormat
                                intlConfig={{
                                  value:
                                    (Number(item.quantity) *
                                      Number(item.sell_price)) -
                                    (Number(item.quantity) *
                                      Number(item.discProd)),
                                  locale: "id-ID",
                                  style: "currency",
                                  currency: "IDR",
                                }}
                              />
                            </td>
                            <td>
                              <span
                                className="table-btn del-table-data"
                                onClick={() => {
                                  delSalesItems(idx);
                                }}
                              >
                                <i className="bx bx-trash"></i>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    : ""}
                  {salesItems && salesItems.length > 0 && salesEndNote ? (
                    <>
                      <tr className="endnote-row">
                        <td colSpan="2" className="endnote-row-title">
                          items
                        </td>
                        <td colSpan="4">{salesEndNote.totalQty}</td>
                      </tr>
                      <tr className="endnote-row">
                        <td colSpan="5" className="endnote-row-title">
                          total
                        </td>
                        <td colSpan="2">
                          <NumberFormat
                            intlConfig={{
                              value: salesEndNote.grandtotal,
                              locale: "id-ID",
                              style: "currency",
                              currency: "IDR",
                            }}
                          />
                        </td>
                      </tr>
                      <tr className="endnote-row">
                        <td colSpan="5" className="endnote-row-title">
                          informasi pembayaran
                        </td>
                        <td colSpan="2">
                          <NumberFormat
                            intlConfig={{
                              value: paymentData ? paymentData.amountOrigin : 0,
                              locale: "id-ID",
                              style: "currency",
                              currency: "IDR",
                            }}
                          />
                          {/* <span
                            style={{
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >{`${paymentData ? "edit pembayaran" : ""}`}</span> */}
                          <span className="endnote-row-action">
                            <span
                              className="table-btn edit-table-data"
                              aria-label="createPayment"
                              onClick={handleModal}
                            >
                              <i className="bx bx-plus"></i>
                              {/* {`${paymentData ? "Edit pembayaran" : ""}`} */}
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr className="endnote-row">
                        <td colSpan="5" className="endnote-row-title">
                          {
                            paymentData ? 
                              paymentData.amountOrigin-salesEndNote.grandtotal < 0 ?  
                                'sisa pembayaran' 
                                : 'kembali'
                            : 'sisa pembayaran'
                          }
                        </td>
                        <td colSpan="2">
                          <NumberFormat
                            intlConfig={{
                              value: paymentData ? 
                                      paymentData.amountOrigin-salesEndNote.grandtotal < 0 ?  
                                        Math.abs(paymentData.amountOrigin-salesEndNote.grandtotal) 
                                        : Math.abs(salesEndNote.grandtotal-paymentData.amountOrigin)
                                    : 0,
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
          ) : (
            <DataView
              value={salesItems}
              listTemplate={orderListTemplate}
              emptyMessage=" "
            ></DataView>
          )}
        </Modal.Body>
        <Modal.Footer>
            <button type="button" className="btn btn-secondary light" onClick={onHide}>
              batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
            >
              Submit
            </button>
        </Modal.Footer>
      </Modal>

      {/* modal area */}
      {showModal === "addDiscount" ? (
        <DiscountModal
          show={showModal === "addDiscount" ? true : false}
          onHide={handleCloseModal}
          totalCart={salesEndNote ? salesEndNote.subtotal : 0}
          returnVal={(val) => setSalesDisc(val)}
          multiple={true}
          stack={1}
        />
      ) : showModal === "createPayment" ? (
        <CreatePayment
          show={showModal === "createPayment" ? true : false}
          source={'delivery_group'}
          data={showModal === "createPayment" && sendTarget ? sendTarget : ""}
          onHide={handleCloseModal}
          totalCart={salesEndNote?.grandtotal}
          multiple={true}
          stack={2}
          returnValue={(paymentData) => {
            setPaymentData(paymentData);
          }}
        />
      ) : showModal === "confirmModal" ? (
        <ConfirmModal
          show={showModal === "confirmModal" ? true : false}
          onHide={handleCloseModal}
          data={showModal === "confirmModal" && sendTarget ? sendTarget : ""}
          multiple={true}
          stack={1}
          msg={"Yakin untuk mengubah order ini?"}
          // returnValue={(value) => setTarget(value)}
        />
      ) : showModal === "cancelSalesModal" ? (
        <ConfirmModal
          show={showModal === "cancelSalesModal" ? true : false}
          onHide={handleCloseModal}
          data={
            showModal === "cancelSalesModal" && sendTarget ? sendTarget : ""
          }
          msg={"Yakin untuk membatalkan order ini?"}
          multiple={true}
          stack={1}
          returnValue={(value) => setCantCanceled(value)}
        />
      ) : showModal === "warningCancelModal" ? (
        <ConfirmModal
          show={showModal === "warningCancelModal" ? true : false}
          onHide={handleCloseModal}
          data={
            showModal === "warningCancelModal" && sendTarget ? sendTarget : ""
          }
          msg={
            <p style={{ marginBottom: 0 }}>
              Tidak dapat membatalkan order ini karena hanya satu-satunya order
              di invoice dan terdapat pembayaran yang belum penuh.
              <br />
              Coba hapus pembayaran yang terkait terlebih dahulu lalu coba hapus
              ulang order ini
            </p>
          }
          returnValue={(value) => {
            setCantCanceled(value);
          }}
        />
      ) : (
        ""
      )}

      {/* toast area */}
      {/* <ToastContainer className="p-3 custom-toast">
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                <Toast.Body>{toastContent.msg}</Toast.Body>
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
