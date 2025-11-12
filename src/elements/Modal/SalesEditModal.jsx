import React, { useEffect, useState , useRef} from 'react';
import { Modal, Form } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';

import User from "../../assets/images/Avatar 1.jpg";
import NumberFormat from '../Masking/NumberFormat';
import InputWLabel from '../Input/InputWLabel';
import InputWSelect from '../Input/InputWSelect';
import DiscountModal from './DiscModal';
import ConfirmModal from './ConfirmModal';
import QtyButton from '../QtyButton';
import CreatePayment from './CreatePaymentModal';
import FetchApi from '../../assets/js/fetchApi.js';
import { useForm } from 'react-hook-form';
import ConvertDate from '../../assets/js/ConvertDate.js';
import dataStatic from '../../assets/js/dataStatic.js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { DataView } from 'primereact/dataview';
import useMediaQuery from '../../hooks/useMediaQuery.js';

export default function SalesEditModal({show, onHide, data}) {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const toast = useRef(null);
    const toastUpload = useRef(null);
    const orderCardLeft = useRef(null);

    const [ showToast, setShowToast ] = useState(false);
    const [ isLoading, setLoading ] = useState(true);
    const [ editMode, setEditMode ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ salesById, setSalesById ] = useState(null);
    const [ custData, setCustData ] = useState(null);
    const [ salesItems, setSalesItems ] = useState([]);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ filterProd, setFilteredProd ] = useState([]);
    const [ allProdData, setAllProd ] = useState(null);
    const [ openPopupProd, setOpenPopupProd ] = useState(false);
    const [ allStatus, setStatusList ] = useState(dataStatic.orderStatusList);
    const [ qtyVal, setQtyVal ] = useState(0);
    const [ addedValue, setAddedValue ] = useState(null);
    const [ showModal, setShowModal ] = useState(null);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ chooseCust, setCust] = useState("");
    const [ chooseProd, setProd] = useState(null);
    const [ salesEndNote, setSalesEndNote ] = useState(null);
    const [ orderDetail, setOrderdetail ] = useState(null);
    const [ orderData, setOrderData ] = useState(null);
    const [ discVal, setDiscVal] = useState(0);
    const [ totalDiscProd, setTotalDiscProd] = useState(0);
    const [ salesDisc, setSalesDisc] = useState({discType: "nominal", value: data ? data.order_discount : 0});
    const [ sendTarget, setSendTarget ] = useState(null);
    const [ cantCanceled, setCantCanceled ] = useState(false);
    const [ paymentData, setPaymentData ] = useState(null);
    const [ orderStatus, setOrderStatus ] = useState(null);

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
            customer_id: data?.customer?.customer_id,
            name: data.customer.name,
            order_date: data.order_date ? new Date(data.order_date) : null,
            order_type: data.order_type
        }
    });

    const handleModal = (e) => {
        switch (e.currentTarget.ariaLabel) {
            case 'addDiscount':
                setShowModal("addDiscount");
                break;
            case 'createPayment':
                setShowModal("createPayment");
                break;
            case 'cancelSales':
                let dataToSend = {
                    endpoint: "sales", 
                    id: data.order_id, 
                    action: 'canceled',
                    items: {...data}
                }
                setSendTarget(dataToSend);
                setShowModal("cancelSalesModal");
                break;
        }
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }
    
    const fetchStatus = () => {
        FetchApi.fetchStatus()
            .then(result => {
                setStatusList(result);
            })
            .catch(error => {
                setToastContent({variant:"danger", msg: "Error when get status data!"});
                setShowToast(true);
            }
        )
    };

    const fetchAllProd = async() => {
        await axiosPrivate.get("/products")
        .then(resp => {
            let dupe = [...resp.data];
            resp.data.map((e, idx) => {
                dupe[idx].fullProdName = e.product_name + " " + e.variant;
            })
            setAllProd(dupe);
        })
        .catch(error => {
            // setToastContent({variant:"danger", msg: "Error when get products data!"});
            // setShowToast(true);

            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when get products data",
                life: 3000,
            });
        })
    };

    const fetchAllCust = async () => {
        await axiosPrivate.get("/customers")
        .then(resp => {
            setCustData(resp.data);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when get customer data",
                life: 3000,
            });
        }
        )
    };

    const fetchOrderItemByOrder = async () => {
        await axiosPrivate.get("/order-item/order", { params: {id: data.id} })
        .then(resp => {
            let modifiedOrderDetail = resp.data.map((e,idx) => {
                let obj = {
                    product_id: e.product_id,
                    product_name: e.product.product_name,
                    product_cost: e.product.product_cost,
                    img: e.product.img,
                    quantity: e.quantity,
                    sell_price: e.sell_price,
                    variant: e.product.variant,
                    discount: e.discount_prod_rec
                };
                return obj;
            })
            setOrderdetail(modifiedOrderDetail);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when get order items data",
                life: 3000,
            });
        })
    };
    
    const fetchSalesByID = async () => {
        await axiosPrivate.get("/sales/by",{
            params: {
                id: data.id
            }
        })
        .then(resp => {
            // console.log(resp.data[0])
            // console.log(data)
            setOrderData(resp.data[0]);
            
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when get order data",
                life: 3000,
            });
        })
    };
    

    const handleAutoComplete = (custName) => {
        if(custData && custName !== ""){
            let filteredCust = custData.filter(item => item.name.includes(custName.toLowerCase()));
            if(filteredCust.length === 0){
                setOpenPopup(false);
                setFilteredCust(filteredCust);
            } else {
                setOpenPopup(true);
                setFilteredCust(filteredCust);
            }
        } else if(custName || custName === ""){
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
        if(allProdData && product !== ""){
            let filteredProd = allProdData.filter(item => item.fullProdName.includes(product.toLowerCase()));
            if(filteredProd.length === 0){
                setOpenPopupProd(false);
                setFilteredProd(filterProd);
            } else {
                setOpenPopupProd(true);
                setFilteredProd(filteredProd);
                clearErrors("salesProduct");
            }
        }
         else if(product || product === ""){
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
        if(e){
            setCust(null);
            setValue('customer_id', '');
        }
    }

    const handleFilterCust = () => {
        handleAutoComplete(getValues('name'));
        setCust(null);
    }    

    const handleChooseCust = (e) => {
        setCust(e);
        setValue('customer_id', e.customer_id);
        setValue('name', e.name);
        setOpenPopup(false);
    }

    const handleChooseProd = (e) => {
        setProd(e);
        setValue('salesProduct', e.variant !== "" ? e.product_name + " " + e.variant : e.product_name);
        setOpenPopupProd(false);
    };
    
    const keyDownSearchProd = (e) => {
        if(e){
            setProd(null);
        }
    }

    const handleSearchProd = () => {
        handleAutoCompleteProd(getValues('salesProduct'));
        setProd(null);
    }

    const addToSalesData = () => {
        if(qtyVal !== 0) {
            let tmpArr = [];
            let prodObjDupe = {...chooseProd};
            prodObjDupe.quantity = qtyVal;
            if(orderDetail.length === 0 ){
                tmpArr.push(prodObjDupe);
                setOrderdetail(tmpArr);
            } else {
                tmpArr = [...orderDetail];
                let findDuplicateIdx = orderDetail.findIndex((e =>  e.product_id == prodObjDupe.product_id))
                if(findDuplicateIdx >= 0){
                    tmpArr[findDuplicateIdx].quantity = tmpArr[findDuplicateIdx].quantity + prodObjDupe.quantity;
                } else {
                    tmpArr.push(prodObjDupe);
                }
                setOrderdetail(tmpArr);
            }
            setProd(null);
            setQtyVal(0);
            setValue('salesProduct', "");
        } else {
            setToastContent({variant:"danger", msg: "Add product quantity first!"});
            setShowToast(true);
        }
    }
    
    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(refToThis.current 
                    && !ref.current.contains(evt.target) 
                    && evt.target.className !== "res-item" 
                    && evt.target.className !== "popup-element") {
                    setOpenPopup(false);
                    setOpenPopupProd(false);
                } 
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        },[ref])
        
    };
    handleClickSelect(refToProd);
    handleClickSelect(refToThis);

    const handleEdit = (val, idx) => {
        let duplicate = [...orderDetail];
        duplicate[idx].quantity = val;
        setOrderdetail(duplicate);
    }

    const onSubmitSales = (formData) => {
        // validate id FOCUS ON ID!!!!!
        if(!orderDetail || orderDetail.length < 1) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please add product first",
                life: 3500,
            });
        } else {
            let grandQty = 0;
            let subtotal = 0;
            let objStr  = salesItems.length > 0 ? JSON.stringify([...salesItems]) : JSON.stringify([]);
           
            let order = {
                ...formData,
                subtotal: Number(salesEndNote.subtotal),
                order_discount: Number(salesEndNote.order_discount),
                grandtotal: Number(salesEndNote.grandtotal),
                updatedAt: new Date()
            }
            delete order.salesProduct;
            delete order.name;
            
            let orderItems = orderDetail.map((e) => {
                let obj ={
                    order_id: data.id,
                    product_id: e.product_id,
                    quantity: Number(e.quantity),
                    sell_price: Number(e.sell_price),
                    discount_prod_rec: Number(e.discount)
                };
                return obj;
            })

            let orderData = {
                order: order,
                order_items: orderItems
            }


            let dataToSend = {
                id: data.id,
                endpoint: data.endpoint,
                action: data.action,
                data: orderData,
                old_data: data

            };
            setSendTarget(dataToSend);
            setShowModal("confirmModal");
            console.log(dataToSend)
       }
    };

    const onError = (errors) => {
        if(getValues('name') != "" && errors.customer_id){
            setError("name", { type: 'required', message: 'Choose customer name correctly!' });
        }
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "There is an error with required field",
            life: 3500,
        });
    };

    const delSalesItems = (idx) => {
        orderDetail.splice(idx, 1);
        handleUpdateEndNote();
    }

    const handleUpdateEndNote = () => {
        if(orderDetail && orderDetail.length > 0){
            let totalQty = 0;
            let subtotal = 0;
            let discount = 0;
            let allDiscProd = 0;
            
            orderDetail.forEach(e => {
                totalQty += Number(e.quantity);
                subtotal += (e.quantity*Number(e.sell_price)) - (e.quantity*Number(e.discount));
                allDiscProd += (e.quantity*Number(e.discount));
                e.discProd = e.quantity*Number(e.discount);
            });
            
            discount = salesDisc ? salesDisc.discType === "percent" ? 
                subtotal*salesDisc.value/100 
                : salesDisc.discType === "nominal" ? salesDisc.value
                : 0 
             : 0;


            setDiscVal(discount);
            setTotalDiscProd(allDiscProd);

            // if(paidData && paidData.payment_type == "paid"){
            //     if(paidData.amountOrigin < (subtotal - discount)){
            //         setPaidData(null);
            //     }
            // } else if(paidData && paidData.payment_type == "partial"){
            //     if(paidData.amountOrigin >= (subtotal - discount)){
            //         setPaidData(null);
            //     }
            // }
            
            let endNote = {
                ...salesEndNote,
                totalQty: totalQty,
                subtotal: subtotal,
                order_discount: discount,
                grandtotal: (subtotal - discount),
                // remaining_payment: 
                //     paidData ? 
                //     paidData.payment_type == "paid" ? 0 
                //     : paidData.payment_type == "unpaid" ? (subtotal - discount)
                //     : paidData.payment_type == "partial" ? (subtotal - discount) - paidData.amountOrigin
                //     : (subtotal - discount) : (subtotal - discount)
            }
            setSalesEndNote(endNote);
        } else {
            // setPaidData(null);
            setSalesDisc(null);
            setSalesEndNote(null);
        }
    };

    const checkEditPermit = async() => {
        await axiosPrivate.get("/ro/by", { params: { id: data.order_id }})
        .then(resp => {
            if(resp.data.length > 0){
                setEditMode(false);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Tidak dapat mengedit data ini karena terdapat pengajuan pengembalian barang!",
                    life: 3500,
                });
            } else {
                setEditMode((p) => !p);
            }
        })
        .catch(err => {

        })
    }

     const orderTemplate = (rowData, index) => {
        return (
            <div key={rowData.product_id} >
                <Swiper slidesPerView={'auto'} style={{width:'100%', height:'auto'}} allowSlideNext={editMode ? true:false}>
                    <SwiperSlide style={{width: '100%', height:'inherit'}}>
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
                            aria-label="custDetailModal"
                            onClick={(e) => handleModal(e, rowData)}
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
                                            disabled={editMode ? false : true}
                                        />

                                    </div>
                                </div>

                            </div>
                            <div style={{position:'absolute',right:24, bottom: 60}}>
                                <div style={{textAlign:'center', marginBottom:'.3rem', fontSize:14, fontWeight: 600}}>
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
                    <SwiperSlide style={{width: '70px', height:'auto'}}>
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
        // const totalItem = items.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.quantity), 0);
        // console.log(salesEndNote)
        return (
            <>
            <div className='order-list-mobile'>
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
                <div className='w-full order-cost-wrap'>
                    <div className="order-cost-items">
                        <p className="cost-text">{`items (${salesEndNote.totalQty})`}</p>
                        <p className="cost-price">
                            <NumberFormat intlConfig={{
                                value: salesEndNote.subtotal, 
                                locale: "id-ID",
                                style: "currency", 
                                currency: "IDR",
                            }}
                            />
                        </p>
                    </div>
                    <div className="order-cost-addon">
                        <p className="cost-addon-text">Diskon order</p>
                        <span className="d-flex gap-2">
                            {salesDisc && salesDisc.discType == "percent" ?
                            (
                                <>
                                <NumberFormat intlConfig={{
                                    value: salesDisc ? (salesDisc.value*Number(salesEndNote.subtotal)/100) : "0", 
                                    locale: "id-ID",
                                    style: "currency", 
                                    currency: "IDR",
                                }}
                                />
                                <span>{`(${salesDisc.value}%)`}</span>
                                </>
                            ) : 
                            (
                                <NumberFormat intlConfig={{
                                    value: salesDisc.value, 
                                    locale: "id-ID",
                                    style: "currency", 
                                    currency: "IDR",
                                }} 
                                />
                            )
                            }
                            {editMode ? 
                                (
                                    <span className="order-sett" aria-label='addDiscount' onClick={(e) => handleModal(e)}>
                                        <i className="bx bx-cog"></i>
                                    </span>
                                ):""
                            }
                        </span>
                    </div>
                    <div className="order-cost-total">
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
                </div>
            </div>
            </>
        );
    };

    useEffect(() => {
        if(!chooseCust){
            // if(getValues('customer_id') = ""){
            //     setValue('customer_id', '');

            // }
        } else {
            clearErrors("name");
        }
    },[chooseCust]);
    
    useEffect(() => {
        if(!chooseProd){
            setValue('product_id', '');
        } else {
            clearErrors("salesProduct");
        }
    },[chooseProd]);
    
    useEffect(() => {
        if(salesDisc || orderDetail){
            if(orderDetail && orderDetail.length > 0) {
                handleUpdateEndNote();
            } 
        }
    },[salesDisc, orderDetail]);


    useEffect(() => {
        setAddedValue(null)
    },[addedValue])

    useEffect(() => {
        if(data){
            fetchAllProd();
            // fetchStatus();
            fetchAllCust();
            fetchSalesByID();
            fetchOrderItemByOrder();
        } 
    },[])

    useEffect(() => {
       if(orderDetail && allProdData && custData && orderData){
           setLoading(false);

        //    setValue('name', orderData.customer.name);
       } 
   },[orderDetail, allProdData, custData, orderData]);

    useEffect(() => {
        if(cantCanceled){
            let sendData = {
                id: data.id, 
                endpoint: 'content',
                action: 'info',
                items: data.items
            }
            setSendTarget(sendData);
            setShowModal("");
            setShowModal("warningCancelModal");
        }
    },[cantCanceled])

    if(isLoading){
        return;
    }

    return(
        <>
        <Modal dialogClassName={isMobile || isMediumScr ? 'modal-fullscreen' : 'modal-xl'} show={show} onHide={onHide} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>sales edit {data !== "" ? `: ${data.id}` : ""}</Modal.Title>
                <span style={{textTransform: 'capitalize'}} 
                  className={`badge badge-${
                    data.payment_type == "bayar nanti" ? 'danger'
                    : data.payment_type == "lunas"? "primary"
                    : data.payment_type == "sebagian"? "warning"
                    :""
                } light mx-2`}
                >
                    {data.payment_type}                                                                                
                </span>
                <div className="modal-btn-wrap d-flex gap-2">
                    <button type="button" className="btn btn-warning btn-w-icon" onClick={checkEditPermit}><i className='bx bx-pencil'></i>Edit order</button>
                    <button type="button" className={`btn btn-danger btn-w-icon ${editMode ? 'disabled' : ''}`} aria-label='cancelSales' onClick={handleModal}><i className='bx bx-trash'></i>cancel order</button>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="modal-btn-wrap-mobile flex flex-row md:row-gap-3">
                    <button type="button" className="btn btn-warning btn-w-icon" onClick={checkEditPermit}><i className='bx bx-pencil'></i>Edit order</button>
                    <button type="button" className={`btn btn-danger btn-w-icon ${editMode ? 'disabled' : ''}`} aria-label='cancelSales' onClick={handleModal}><i className='bx bx-trash'></i>cancel order</button>
                </div>
                <form autoComplete='off'>
                    <div className="row xl:gap-0 lg:gap-0 md:gap-0 sm:row-gap-2 mb-4">
                        <div className="col-lg-3 col-sm-12 col-md-6 col-6">
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

                            <div style={{position:'relative'}}>
                                <InputWLabel 
                                    label="nama pelanggan" 
                                    type="text"
                                    name="name" 
                                    textStyle={'capitalize'}   
                                    onChange={handleFilterCust}
                                    onFocus={() => handleAutoComplete(getValues('name'))}
                                    onKeyDown={handleKeyDown}
                                    require={true}
                                    register={register}
                                    errors={errors}     
                                    disabled={editMode ? false : true}                   
                                />
                                {/* popup autocomplete */}
                                <div className="popup-element" aria-expanded={openPopup} ref={refToThis}>
                                    {filterCust && filterCust.length > 0 ? 
                                        filterCust.map((e,idx) => {
                                            return (
                                                <div key={`cust-${idx}`} className="res-item" onClick={() => 
                                                    handleChooseCust({ 
                                                        ...e
                                                    })}>{e.name}</div>
                                            )
                                        }) : ""
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 col-md-6 col-6">
                            <InputWLabel 
                                label="tanggal" 
                                type="date"
                                name="order_date"
                                onChange={(e) => setValue('order_date', e.value)}
                                require={true}
                                register={register}
                                errors={errors}
                                defaultValue={getValues("order_date")}
                                disabled={editMode ? false : true}  
                            />
                        </div>
                        {/* <div className="col-lg-3 col-sm-6 col-md-6 col-6">
                            <InputWSelect
                                label={'Sales status'}
                                name="order_status_id"
                                selectLabel="Select sales status"
                                options={allStatus ? allStatus : null}
                                optionKeys={["id", "status"]}
                                value={(selected) => {
                                    // setEditStatus(selected);
                                    setValue('order_status_id', selected.id);
                                    setValue('order_status', selected.value);
                                    selected.value != "" ? clearErrors("order_status_id") : null;
                                }}
                                defaultValue={data.order_status ? data.order_status  : ''}
                                require={true}
                                register={register}
                                errors={errors}
                                // watch={watch('salesStatusId')}
                            />
                        </div> */}
                        <div className="col-lg-3 col-sm-6 col-md-6 col-6">
                            <InputWSelect
                                label={'tipe order'}
                                name="order_type"
                                selectLabel="Select order type"
                                options={dataStatic.orderTypeList}
                                optionKeys={["id", "type"]}
                                defaultValue={getValues('order_type')}
                                defaultValueKey={"type"}
                                value={(selected) => {
                                    setValue('order_type', selected.value);
                                    selected.value != "" ? clearErrors("order_type") : null;
                                }}
                                require={true}
                                register={register}
                                errors={errors}
                                disabled={data.delivery ? true : editMode ? false : true}  
                            />
                        </div>
                        
                        <div className="col-lg-3 col-sm-12 col-md-6 col-6">
                            <InputWSelect
                                label={'Status'}
                                name="order_status"
                                selectLabel="Select order status"
                                options={dataStatic.orderStatusList}
                                optionKeys={["id", "type"]}
                                defaultValue={data.order_status}
                                defaultValueKey={"type"}
                                value={(selected) => {setOrderStatus(selected.value);setValue('order_status', selected.value);}}
                                require={true}
                                register={register}
                                errors={errors}
                                disabled={editMode ? false : true} 
                                // width={"220px"}
                            />
                        </div>
                        <div className="col-lg-3 col-sm-12 col-md-12 col-6">
                            <InputWLabel 
                                label="catatan" 
                                as="textarea"
                                name="note"
                                defaultValue={orderData.note ? orderData.note : ""}
                                require={false}
                                register={register}
                                errors={errors} 
                                disabled={editMode ? false : true}  
                            />
                        </div>
                    </div>
                </form>
                {/* <div className="row gy-1 mt-1"> */}
                    {/* <div className="col-lg-12 col-sm-12 col-md-12 col-12 mt-3 mb-4"> */}
                    <div className="flex sm:flex-column md:flex-row lg:flex-row xl:flex-row xl:gap-0 lg:gap-0 md:gap-0 sm:gap-0 sm:flex-wrap add-product-control" >
                        <div className="col-lg-6 col-sm-12 col-md-6">
                            <InputWLabel 
                                label="add product"
                                type="text"
                                name="salesProduct" 
                                placeholder="Search product name..." 
                                onChange={handleSearchProd}
                                onFocus={handleSearchProd}
                                onKeyDown={keyDownSearchProd}
                                style={{width: 'inherit', textTransform:'capitalize'}}
                                register={register}
                                require={false}
                                errors={errors}
                                autoComplete={"off"}
                                disabled={editMode ? false : true}  
                            />
                            {/* popup autocomplete */}
                            <div className="popup-element" aria-expanded={openPopupProd} ref={refToProd}>
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
                        <div className="col-lg-6 col-sm-12 col-md-6">
                            <div className='flex sm:flex-row lg:flex-row gap-3'>
                                {/* <div> */}
                                    {/* <Form.Label className="mb-1">qty</Form.Label> */}
                                    <QtyButton 
                                        min={0} 
                                        max={999} 
                                        name={`qty-add-product`} 
                                        width={isMobile ? "100%":"180px"} 
                                        returnValue={(e) => setQtyVal(e)}
                                        value={qtyVal} 
                                        disabled={editMode ? false : true}  
                                        label={"qty"}
                                    />
                                {/* </div> */}
                                {/* <div className='align-self-end'> */}
                                    <div className={`btn btn-primary ${editMode ? "" : "disabled"} qty-add-btn align-self-end`} onClick={addToSalesData}><i className="bx bx-plus"></i></div>
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                    {/* </div> */}

                    <div className="order-list-table table-responsive mt-3">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>product</th>
                                    <th>qty</th>
                                    <th>price</th>
                                    <th>discount</th>
                                    <th>total</th>
                                    <th>action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetail !== null ? 
                                    orderDetail.map((e, idx) => (
                                        <tr key={`sales-data-${idx}`}>
                                            <td className="data-img" style={{textTransform: 'capitalize'}}>
                                                <span className="product-img">
                                                    <img src={e.img} alt={e.product_name} />
                                                </span> {`${e.product_name} ${e.variant}`}
                                            </td>
                                            <td> 
                                                {
                                                    editMode ?
                                                    (
                                                        <QtyButton
                                                            min={1} 
                                                            max={999} 
                                                            name={`qty-product`} 
                                                            id="qtyItem" 
                                                            value={Number(e.quantity)} 
                                                            width={'130px'} 
                                                            returnValue={(val) => {handleEdit(val,idx);handleUpdateEndNote()}} 
                                                        />
                                                    ) : Number(e.quantity)
                                                }
                                                
                                            </td>
                                            <td>
                                                <NumberFormat intlConfig={{
                                                    value: e.sell_price,
                                                    locale: "id-ID",
                                                    style: "currency",
                                                    currency: "IDR",
                                                }} />
                                            </td>
                                            <td>
                                                <NumberFormat intlConfig={{
                                                    value: e.quantity*e.discount,
                                                    locale: "id-ID",
                                                    style: "currency",
                                                    currency: "IDR",
                                                }} />
                                            </td>
                                            <td>
                                                <NumberFormat intlConfig={{
                                                    value: (e.sell_price*e.quantity) - (e.quantity*e.discount),
                                                    locale: "id-ID",
                                                    style: "currency",
                                                    currency: "IDR",
                                                }} />
                                            </td>
                                            <td>
                                            {editMode ? 
                                                (
                                                <span className="table-btn del-table-data" aria-label='callDeleteModal' 
                                                     onClick={() =>  delSalesItems(idx)}>
                                                        <i className='bx bx-trash'></i>
                                                </span>
                                                ):""
                                            }
                                            </td>
                                        </tr>
                                    )) 
                                : ""}

                                {/* endnote */}
                                {salesEndNote ?
                                <>
                                <tr className="endnote-row">
                                    <td colSpan="1" className="endnote-row-title">items</td>
                                    <td colSpan="5">{Number(salesEndNote.totalQty)}</td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="4" className="endnote-row-title">subtotal</td>
                                    <td colSpan="2" style={{fontWeight: 500}}>
                                        <NumberFormat intlConfig={{
                                            value: salesEndNote.subtotal, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                            }} 
                                        />
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="4" className="endnote-row-title">discount</td>
                                    <td colSpan="2" style={{fontWeight: 500}}>
                                        {salesDisc && salesDisc.discType == "percent" ?
                                            (
                                                <>
                                                <NumberFormat 
                                                    intlConfig={{
                                                        value: salesDisc ? (salesDisc.value*Number(salesEndNote.subtotal)/100) : "0", 
                                                        locale: "id-ID",
                                                        style: "currency", 
                                                        currency: "IDR",
                                                    }}
                                                    style={{marginRight: '2rem'}}
                                                />
                                                <span>{`(${salesDisc.value}%)`}</span>
                                                </>
                                            ) : 
                                            (
                                                <NumberFormat 
                                                    intlConfig={{
                                                        value: salesDisc.value, 
                                                        locale: "id-ID",
                                                        style: "currency", 
                                                        currency: "IDR",
                                                    }} 
                                                    style={{marginRight: '2rem'}}
                                                />
                                            )
                                        }
                                        {editMode ? 
                                            (
                                                <span className="endnote-row-action">
                                                    <span className="table-btn edit-table-data" aria-label='addDiscount' onClick={(e) => handleModal(e)}>
                                                        <i className='bx bx-cog'></i>
                                                    </span>
                                                </span>
                                            ):""
                                        }
                                       
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="4" className="endnote-row-title">total</td>
                                    <td colSpan="2">
                                        <NumberFormat intlConfig={{
                                            value: salesEndNote.grandtotal, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                            }} 
                                        />
                                    </td>
                                </tr>
                                {/* <tr className="endnote-row">
                                    <td colSpan="4" className="endnote-row-title">paid</td>
                                    <td colSpan="2">
                                        <NumberFormat intlConfig={{
                                            value: salesEndNote.totalPayment, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                            }} 
                                        />
                                        <span className="endnote-row-action">
                                            <span className="table-btn edit-table-data" aria-label="createPayment" onClick={handleModal}>
                                                <i className='bx bx-cog'></i>
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                                <tr className="endnote-row">
                                    <td colSpan="4" className="endnote-row-title">remaining payment</td>
                                    <td colSpan="2">
                                        <NumberFormat intlConfig={{
                                            value: salesEndNote.remainingPayment, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                            }} 
                                        />
                                        <span className="endnote-row-action">
                                            <span className="table-btn edit-table-data" aria-label="addedPayment" onClick={handleModal}>
                                                <i className='bx bx-plus'></i>
                                            </span>
                                        </span>

                                    </td>
                                </tr> */}
                                </>
                                : ""}
                                
                            </tbody>
                        </table>
                    </div>

                    <DataView value={orderDetail} listTemplate={orderListTemplate}  ></DataView>
                {/* </div> */}

                
            </Modal.Body>
            <Modal.Footer>
                {editMode ? (
                    <button type="button" className="btn btn-primary" onClick={handleSubmit(onSubmitSales, onError)}>Save</button>
                ):(
                    <button type="button" className="btn btn-primary" onClick={onHide}>OK</button>
                )}
            </Modal.Footer>

        </Modal>


        {/* modal area */}
        {showModal === "addDiscount" ?
        (
            <DiscountModal 
                show={showModal === "addDiscount" ? true : false} 
                onHide={handleCloseModal} 
                totalCart={salesEndNote ? salesEndNote.subtotal : 0} 
                returnVal={(val) => setSalesDisc(val)} 
                multiple={true}
                stack={1}
            />
        )
        : showModal === "createPayment" ?
        (
            <CreatePayment 
                show={showModal === "createPayment" ? true : false} 
                onHide={handleCloseModal} 
                totalCart={data?.grandTotal}
                multiple={true}
                stack={1} 
                returnValue={(paymentData) => {setPaymentData(paymentData)}}
            />
        )
        : showModal === "confirmModal" ? 
        (
            <ConfirmModal 
                show={showModal === "confirmModal" ? true : false} 
                onHide={handleCloseModal} 
                data={showModal === "confirmModal" && sendTarget ? sendTarget : ""} 
                multiple={true} 
                stack={1} 
                msg={"Yakin untuk mengubah order ini?"}
                // returnValue={(value) => setTarget(value)}
            />
        )
        : showModal === "cancelSalesModal" ?
        (
            <ConfirmModal 
                show={showModal === "cancelSalesModal" ? true : false} 
                onHide={handleCloseModal} 
                data={showModal === "cancelSalesModal" && sendTarget ? sendTarget : ""} 
                msg={"Yakin untuk membatalkan order ini?"}
                multiple={true} 
                stack={1} 
                returnValue={(value) => setCantCanceled(value)}
            />
        )
        : showModal === "warningCancelModal" ?
        (
            <ConfirmModal show={showModal === "warningCancelModal" ? true : false} onHide={handleCloseModal} 
                data={showModal === "warningCancelModal" && sendTarget ? sendTarget : ""} 
                msg={
                    <p style={{marginBottom: 0}}>
                        Tidak dapat membatalkan order ini karena hanya satu-satunya order di invoice dan terdapat pembayaran yang belum penuh.<br />
                        Coba hapus pembayaran yang terkait terlebih dahulu lalu coba hapus ulang order ini
                    </p>
                }
                returnValue={(value) => {setCantCanceled(value)}}
            />
        )
        :""
                
        }

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
    )
}