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
import QtyButton from "../QtyButton";
import { DataView } from "primereact/dataview";
import useMediaQuery from "../../hooks/useMediaQuery";
import NumberFormat from "../Masking/NumberFormat";
import { Swiper, SwiperSlide } from "swiper/react";

export default function DelivGroupsModal({ show, onHide, data, returnAct }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

  const axiosPrivate = useAxiosPrivate();
  let locale = "id-ID";
  const formatedNumber = new Intl.NumberFormat(locale);

  const toast = useRef(null);
  const toastUpload = useRef(null);
  const refToThis = useRef(null);
  const refToProd = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ dg, setDG ] = useState(null);
  const [ filterProd, setFilteredProd ] = useState([]);
  const [ allProdData, setAllProd ] = useState(null);
  const [ employeeData, setEmployeeData] = useState(null);
  const [ openPopupProduct, setOpenPopupProduct ] = useState(false);
  const [ openPopupEmployee, setOpenPopupEmployee ] = useState(false);
  const [ filterName, setFilteredName ] = useState([]);
  const [ chooseProd, setProd] = useState(null);
  const [ qtyVal, setQtyVal ] = useState(0);
  const [ paidData, setPaidData] = useState(null);
  const [ salesEndNote, setSalesEndNote] = useState(null);
  const [ salesDisc, setSalesDisc] = useState(null);
  const [ discVal, setDiscVal] = useState(0);
  const [ salesItems, setSalesItems] = useState([]);
  
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
  const [ chooseEmployee, setEmployee] = useState(null);    
  const [showModal, setShowModal] = useState(false);
  const [targetKey, setTarget] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [controlUiBtn, setControlUiBtn] = useState(false);
  const [toastContent, setToastContent] = useState({
    variant: "",
    msg: "",
    title: "",
  });

  const [isLoading, setLoading] = useState(true);
  const [sendTarget, setSendTarget] = useState(null);

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

  const fetchDG = async() => {
    await axiosPrivate.get("/delivery-group/by", {
      params: {id: data.id}
    })
    .then(resp => {
      console.log(resp.data)
      setDG(resp.data);
      setSalesItems(resp.data.delivery_group_items);
      setEmployee(resp.data.employee_id);
      setValue("employeeName", resp.data.employee.name);
      setValue("employee_id", resp.data.employee_id);
      setValue("delivery_group_date", new Date(resp.data?.delivery_group_date));
    })
    .catch(err => {
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Error when get delivery group data by id",
        life: 3000,
      });
    })
  }

  const fetchAllEmployee = async () => {
    await axiosPrivate.get("/employee/all")
    .then((response) => {
      console.log(response.data)
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
    await axiosPrivate.get("/products")
    .then(response => {
      let dupe = [...response.data];
      response.data.map((e, idx) => {
          dupe[idx].fullProdName = e.product_name + " " + e.variant;
      })
      setAllProd(response.data);
    })
    .catch(error => {
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Error when get product data",
        life: 3000,
      });
    })
  }

  const handleClickSelect = (ref) => {
    useEffect(() => {
      const handleClickOutside = (evt) => {
        if(refToThis.current 
          && !ref.current.contains(evt.target) 
          && evt.target.className !== "res-item" 
          && evt.target.className !== "popup-element") {
          setOpenPopupEmployee(false);
          setOpenPopupProduct(false);
        } 
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    },[ref])
          
  };
  handleClickSelect(refToThis);
  handleClickSelect(refToProd);

  const handleChooseProd = (e) => {
    setProd(e);
    setValue('delivProduct', e.variant !== "" ? e.product_name + " " + e.variant : e.product_name);
    setValue('product_id', e.product_id);
    setOpenPopupProduct(false);
  }

  const handleAutoCompleteProd = (product) => {
    if(allProdData && product !== ""){
      let filteredProd = allProdData.filter(item => item.fullProdName.includes(product.toLowerCase()));
      if(filteredProd.length === 0){
        setOpenPopupProduct(false);
        setFilteredProd(filterProd);
        setError("delivProduct", { type: 'required', message: "Product name error!" });
      } else {
        setOpenPopupProduct(true);
        setFilteredProd(filteredProd);
        clearErrors("delivProduct");
      }
    }
    else if(product || product === ""){
      setOpenPopupProduct(true);
      setFilteredProd(allProdData);
    } else {
      setOpenPopupProduct(false);
      setFilteredProd("error db");
      setToastContent({variant:"danger", msg: "Database failed"});
      setShowToast(true);
    }
  }

  const handleSearchProd = () => {
    handleAutoCompleteProd(getValues('delivProduct'));
    setProd(null);
  }

  const keyDownSearchProd = (e) => {
    if(e){
      setProd(null);
    }
  }

  const handleAutoComplete = (employeeName) => {
    if(employeeData && employeeName !== ""){
      let filteredEmployee = employeeData.filter(item => item.name.includes(employeeName.toLowerCase()));
      if(filteredEmployee.length === 0){
        setOpenPopupEmployee(false);
        setFilteredName(filteredEmployee);
        setError("employeeName", { type: 'required', message: "Customer name error!" });
      } else {
        setOpenPopupEmployee(true);
        setFilteredName(filteredEmployee);
        clearErrors("employeeName");
      }
    } else if(!employeeName || employeeName === ""){
        setOpenPopupEmployee(true);
        setFilteredName(employeeData);
        setError("employeeName", { type: 'required', message: "This field is required!" })
    } else {
        setOpenPopupEmployee(false);
        setFilteredName("error db");
        setToastContent({variant:"danger", msg: "Database failed"});
        setShowToast(true);
    }
  }

  const handleFilterName = (e) => {
    handleAutoComplete(getValues('employeeName'));
  }  

  const handleChooseEmployee = (e) => {
    setEmployee(e);
    
    setValue('employee_id', e.employee_id);
    setValue('employeeName', e.name);
    setOpenPopupEmployee(false);
    clearErrors("employeeName");
  }
    
  const handleKeyDown = (e) => {
    if(e){
      setEmployee(null);
    }
  }

  useEffect(() => {
    if(!chooseProd){
      setValue('product_id', '');
    } else {
      clearErrors("delivGroupProducts");
    }
  },[chooseProd]);
  
  useEffect(() => {
    if(!chooseEmployee){
      setValue('employee_id', '');
    } else {
      clearErrors("delivGroupEmployee");
    }
  },[chooseEmployee]);

  const handleEdit = (val, idx) => {
    let duplicate = [...salesItems];
    duplicate[idx].quantity = val;
    setSalesItems(duplicate);     
  }

  const handleUpdateEndNote = () => {
    if(salesItems && salesItems.length > 0){
        let totalQty = 0;
        let subtotal = 0;
        let allDiscProd = 0;
        
        salesItems.forEach(e => {
          let discount = e.discount ? e.discount : e.disc_prod_rec;
            totalQty += e.quantity;
            subtotal += (e.quantity*Number(e.sell_price)) - (e.quantity*Number(discount));
            e.discProd = e.quantity*Number(discount);
        });

        let endNote = {
          ...salesEndNote,
          totalQty: totalQty,
          subtotal: subtotal,
          grandtotal: (subtotal),
        }

        setSalesEndNote(endNote);
    } else {
        setPaidData(null);
        setSalesDisc(null);
        setSalesEndNote(null);
    }
  }

  const delSalesItems = (idx) => {
    salesItems.splice(idx, 1);
    handleUpdateEndNote();
  }

  const addToSalesData = () => {
    if(qtyVal === 0 && !chooseProd){
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Tambah produk dan kuantitas terlebih dahulu!",
            life: 3000,
        });
    } else if(chooseProd && qtyVal == 0){
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Kuantitas tidak boleh 0",
            life: 3000,
        });
    } else if(!chooseProd && qtyVal !== 0){
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Produk tidak boleh kosong!",
            life: 3000,
        });
    } else {
        let tmpArr = [];
        let prodObjDupe = {...chooseProd};
        prodObjDupe.quantity = qtyVal;
        if(salesItems.length === 0){
            tmpArr.push(prodObjDupe);
            setSalesItems(tmpArr);
        } else {
            tmpArr = [...salesItems];
            let findDuplicateIdx = salesItems.findIndex((e =>  e.product_id == prodObjDupe.product_id))
            if(findDuplicateIdx >= 0){
                tmpArr[findDuplicateIdx].quantity = tmpArr[findDuplicateIdx].quantity + prodObjDupe.quantity;
            } else {
                tmpArr.push(prodObjDupe);
            }
            console.log(tmpArr)
            setSalesItems(tmpArr);
        }
        // setPaidData(null);
        setProd(null);
        setValue('delivProduct', "");
        handleUpdateEndNote();
    } 
  }

  useEffect(() => {
    if(salesDisc || paidData ){
      if(salesItems.length > 0) {
        handleUpdateEndNote();
      } else {
        setPaidData(null);
        setSalesDisc(null);
      }
    }
  },[salesDisc, paidData]);

    const orderTemplate = (rowData, index) => {
      return (
      <div key={rowData.product_id} >
        <Swiper slidesPerView={'auto'} style={{width:'100%', height:'auto'}}>
          <SwiperSlide style={{width: '100%'}}>
            <div className='flex flex-column xl:align-items-start gap-1'
                style={{
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    boxShadow: '1px 1px 7px #9a9acc1a',
                    borderRadius: '9px',
                    position:'relative',
                    width:'100%',
                    minHeight:'125px'
                }}
                // aria-label="custDetailModal"
                // onClick={(e) => handleModal(e, rowData)}
            >
            
                <div className="flex align-items-center gap-3" 
                    style={{
                        textTransform: 'capitalize', 
                    }}
                >
                    <span className="user-img" style={{marginRight: 0}}>
                    <img
                        src={
                        rowData.img ? rowData.img
                            : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                        }
                        alt=""
                    />
                    </span>
                    <div className='flex flex-column' style={{width: '80%'}}>
                        <div className='mb-1'>
                            <p style={{marginBottom: 0, fontSize: 14, fontWeight: 600, maxWidth: '130px'}}>{`${rowData.product_name} ${rowData.variant}`}</p>
                                <p style={{marginBottom: 0, fontSize: 11, color: '#7d8086', maxWidth: '130px'}}>
                                <NumberFormat intlConfig={{
                                        value: rowData.sell_price, 
                                        locale: "id-ID",
                                        style: "currency", 
                                        currency: "IDR",
                                    }} 
                                />
                            </p>
                            {rowData.discProd != 0 ?
                            (
                                <p style={{marginBottom: 0, fontSize: 11, color: '#7d8086', maxWidth: '130px'}}>
                                    -<NumberFormat intlConfig={{
                                            value: rowData.discProd, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} 
                                    />
                                </p>

                            ):''}
                            {/* <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{`Disc: ${rowData.discProd}`}</p> */}
                        </div>
                        <div className="order-qty-btn">
                            <QtyButton 
                                min={1} 
                                max={999} 
                                name={`qty-product`} 
                                id="qtyItem" 
                                value={rowData.quantity} 
                                returnValue={(e) => {handleEdit(e,index);handleUpdateEndNote()}} 
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
                <div style={{position:'absolute',right:16, bottom: 60}}>
                    <div style={{textAlign:'center', marginBottom:'.3rem', fontSize:'15px', fontWeight: 600}}>
                        <NumberFormat intlConfig={{
                                value: (rowData.sell_price*rowData.quantity) - (rowData.discProd), 
                                locale: "id-ID",
                                style: "currency", 
                                currency: "IDR",
                            }} 
                        />
                    </div>
                
                </div>
            </div>
          </SwiperSlide>
          <SwiperSlide style={{width: '70px'}}>
            <div className='mobile-swiper-content-right danger' onClick={() => {delSalesItems(index)}}>
              <i className='bx bx-trash'></i>
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
        <div className="w-full" 
          style={{
            // position:'relative', 
            backgroundColor:'#F8F9FD', 
            padding: '.9rem', 
            borderRadius:'7px',
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '.7rem',
            maxHeight: '418px',
            overflowY: 'scroll',
            overflowX: 'hidden'
          }}
        >
          {list}
      </div>

      {salesEndNote ?
      (
      <div className='w-full order-cost-wrap'>
        <div className="order-cost-items">
          <p className="cost-text">{`items (${salesEndNote?.totalQty})`}</p>
          <p className="cost-price">
            <NumberFormat intlConfig={{
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
            <NumberFormat intlConfig={{
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
            <NumberFormat intlConfig={{
              value: paidData ? paidData.amountOrigin : 0, 
              locale: "id-ID",
              style: "currency", 
              currency: "IDR",
            }} 
          />     
          </p>
                                
        </div>
      </div>

      ):''
      }
      </div>
      </>
    );
  };

  const fetchSetDG = async(delivery_groups) => {
    const body = JSON.stringify(delivery_groups);
    await axiosPrivate.post("/add/delivery-group", body)
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil membuat pengantaran grup",
        life: 1500,
      });
         
      setTimeout(() => {
        return returnAct(true);
      }, 1500);
    })
    .catch(err => {
      setControlUiBtn(false)
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal membuat pengantaran grup",
        life: 3000,
      });

    })
  }
  const fetchUpdateDG = async(delivery_groups) => {
    const body = JSON.stringify(delivery_groups);

    await axiosPrivate.put("/edit/delivery-group", body, {
      params: {
        id: data.id
      }
    })
    .then(resp => {
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
    .catch(err => {
      setControlUiBtn(false)
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal mengubah pengantaran grup",
        life: 3000,
      });

    })
  }
  
  const onError = () => {
    setControlUiBtn(false);
    console.error(errors);
  };

  const onSubmit = async(formData) => {
    let delivery_groups = {
      delivery_group: {
        employee_id: formData.employee_id,
        delivery_group_date: new Date(),
        status: 0
      },
      delivery_group_items: salesItems,
    }

    if(data.action == "insert"){
      // delivery_groups.delivery_group_items = salesItems;
      delivery_groups.delivery_group.total_item = salesEndNote.totalQty;
      delivery_groups.delivery_group.total_value = salesEndNote.subtotal;
      // setControlUiBtn(false)
      fetchSetDG(delivery_groups);
    } else {
      if(salesItems.length == 0){
        setControlUiBtn(false)
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Minimal 1 produk ditambahkan",
          life: 3000,
        });
      } else {
        delivery_groups.delivery_group.total_item = salesEndNote.totalQty;
        delivery_groups.delivery_group.total_value = salesEndNote.subtotal;

        salesItems.map(item => {
          item.delivery_group_id = data.id;
          if(item.deliv_group_item_id){
            delete item.deliv_group_item_id;
          }
        });

        setControlUiBtn(false)
        fetchUpdateDG(delivery_groups);
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

  useEffect(() => {
    fetchAllProd();
    fetchAllEmployee();
  },[]);
  
  useEffect(() => {
    if(data && data.action == "update"){
      fetchDG();
    }
  },[data]);

  useEffect(() => {
    if(data && data.action == "update" && dg){
      setLoading(false);
    } else if(allProdData && employeeData && data.action == "insert"){
      setLoading(false);
    }
  },[data, dg, allProdData, employeeData]);

  if(isLoading){
    return;
  }

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
          <Modal.Title>{data.action == "insert" ? "tambah" : "ubah"} pengantaran grup</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <form>
              <div className="add-prod-detail-wrap" style={{flexDirection: 'column', gap: '1rem'}}>
                <div className="row gy-2">
                  {/* start: this is helper */}
                    <InputWLabel 
                      type="text"
                      name="employee_id"
                      require={true}
                      register={register}
                      errors={errors} 
                      display={false}
                    />
                  {/* end: helper for validate */}
                  <div className="col-lg-12 col-sm-12 col-12">
                    <InputWLabel 
                      label="nama karyawan" 
                      type="text"
                      name="employeeName" 
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
                    <div className="popup-element" aria-expanded={openPopupEmployee} ref={refToThis}>
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
                  {/* <div className="col-lg-6 col-sm-6 col-12">
                    <InputWLabel
                      label="tanggal pengantaran"
                      type="date"
                      name="delivery_group_date"
                      defaultValue={getValues("delivery_group_date")}
                      onChange={(e) => {
                        setValue("delivery_group_date", e.value);
                      }}
                      register={register}
                      require={false}
                      errors={errors}
                    />
                  </div> */}
                </div>
                <div className="row gy-2">
                  {/* <p className="modal-section-title">produk</p> */}
                  <div className="add-product-control mb-4" style={{padding: 0, alignItems: 'center'}} >
                    <div className="col-lg-6 col-sm-6 col-12">
                      <InputWLabel 
                          label="tambah produk"
                          type="text"
                          name="delivProduct" 
                          placeholder="cari nama produk..." 
                          onChange={handleSearchProd}
                          onFocus={handleSearchProd}
                          onKeyDown={keyDownSearchProd}
                          style={{width: 'inherit', textTransform:'capitalize'}}
                          register={register}
                          require={false}
                          errors={errors}
                          autoComplete={"off"}
                          // disabled={editMode ? false : true}  
                      />
                      {/* popup autocomplete */}
                      <div className="popup-element" aria-expanded={openPopupProduct} ref={refToProd}>
                        {filterProd && filterProd.length > 0 ? 
                          filterProd.map((e,idx) => {
                            return (
                              <div key={`product-${e.product_id}`} className="res-item" onClick={() =>   
                                handleChooseProd({ 
                                  product_id: e.product_id, 
                                  product_name: e.product_name, 
                                  variant: e.variant, 
                                  img:e.img, 
                                  product_cost: e.product_cost , 
                                  sell_price: e.sell_price,
                                  discount: e.discount
                                })}
                                >{e. variant !== "" ? e.product_name + " " + e.variant : e.product_name}</div>
                            )
                            }) : ""
                          }
                      </div> 
                    </div>
                    <div className='qty-add-btn-group'>
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
                       
                      <button className={`btn btn-primary qty-add-btn`} onClick={(e) => {e.preventDefault();addToSalesData()}}><i className="bx bx-plus"></i></button>
                    </div>
                  </div>
                </div>
                {!isMobile && !isMediumScr?
                  (
                  <div className="table-responsive">
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
                        {salesItems && salesItems.length > 0 ? 
                          salesItems.map((item, idx) => {
                          return(
                          <tr key={idx}>
                              <td className="data-img" style={{textTransform: 'capitalize'}}>
                                  <span className="user-img">
                                      <img src={item.img ? item.img : item.product?.img} alt="prod-img"/>
                                  </span>{item.product_name ? item.product_name : item.product?.product_name}
                              </td>
                              <td>{item.variant ? item.variant : item.product?.variant}</td>
                              <td>
                                  <QtyButton 
                                      min={1} 
                                      max={999} 
                                      name={`qty-product`} 
                                      id="qtyItem" 
                                      value={item.quantity} 
                                      returnValue={(e) => {handleEdit(e,idx);handleUpdateEndNote()}} 
                                      width={'150px'} 
                                  />
                              </td>
                              <td>
                                  <NumberFormat intlConfig={{
                                      value: item.sell_price, 
                                      locale: "id-ID",
                                      style: "currency", 
                                      currency: "IDR",
                                      }} 
                                  />
                              </td>
                              <td>
                                  <NumberFormat intlConfig={{
                                      value: item.discount ? item.discount : item.disc_prod_rec, 
                                      locale: "id-ID",
                                      style: "currency", 
                                      currency: "IDR",
                                      }}                                                                                                                                     v
                                  />
                              </td>
                              <td>
                                {data.action == "insert" ?
                                  <NumberFormat intlConfig={{
                                      value: (Number(item.quantity)*Number(item.sell_price))-(Number(item.quantity)*Number(item.discount)), 
                                      locale: "id-ID",
                                      style: "currency", 
                                      currency: "IDR",
                                      }} 
                                  />
                                  : <NumberFormat intlConfig={{
                                      value: (Number(item.quantity)*Number(item.sell_price))-(Number(item.quantity)*(item.disc_prod_rec ? Number(item.disc_prod_rec) : Number(item.discount))),
                                      locale: "id-ID",
                                      style: "currency", 
                                      currency: "IDR",
                                      }} 
                                  />
                                }
                              </td>
                              <td>
                                  <span className="table-btn del-table-data" onClick={() => {delSalesItems(idx)}}>
                                      <i className='bx bx-trash'></i>
                                  </span>
                              </td>
                          </tr>
                          )
                          })
                        :""}
                        {salesItems && salesItems.length > 0 && salesEndNote ?
                        <>
                        <tr className="endnote-row">
                          <td colSpan="2" className="endnote-row-title">items</td>
                          <td colSpan="4">{salesEndNote.totalQty}</td>
                        </tr>
                        <tr className="endnote-row">
                          <td colSpan="5" className="endnote-row-title">total</td>
                          <td colSpan="2" >
                            <NumberFormat intlConfig={{
                              value: salesEndNote.grandtotal, 
                              locale: "id-ID",
                              style: "currency", 
                              currency: "IDR",
                              }} 
                            />
                          </td>
                        </tr>
                        </>
                        :""}
                      </tbody>
                    </table>
                  </div> 
                  ): 
                  (
                  <DataView value={salesItems} listTemplate={orderListTemplate} emptyMessage=' '></DataView>
                  )
                }
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
            {controlUiBtn ? "Loading..." : "submit"}
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
