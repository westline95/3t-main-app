import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, ToastContainer, Collapse, Col, Row } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import InputWLabel from '../Input/InputWLabel';
import InputWSelect from '../Input/InputWSelect';
import { useForm } from 'react-hook-form';
// import FetchApi from '../../assets/js/fetchApi.js';
import ConvertDate from "../../assets/js/ConvertDate.js";
import NumberFormat from '../Masking/NumberFormat.jsx';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import axios from '../../api/axios.js';
import dataStatic from '../../assets/js/dataStatic.js';
import QtyButton from '../QtyButton/index.jsx';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import EmptyState from "../../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import { ListBox } from 'primereact/listbox';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { DataView } from 'primereact/dataview';
import { Swiper,SwiperSlide } from 'swiper/react';


export default function ReturnOrderModal({ show, onHide }){
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    const [ custData, setCustData ] = useState(null);
    const [ selectedOpt, setSelectedOpt ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ chooseCust, setCust] = useState("");
    const [ ordersByCust, setOrdersByCust] = useState(null);
    const [ choosedRow, setChoosedRow] = useState(null);
    const [ choosedRowItem, setChoosedRowItem] = useState(null);
    const [ editableMobile, setEditableMobile] = useState(false);
    const [ choosedRowProduct, setChoosedRowProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ choosedOrderId, setChoosedOrderId ] = useState([]);
    const [ choosedOrder, setChoosedOrder ] = useState([]);
    const [ returnItem, setReturnItem ] = useState([]);
    const [ showToast, setShowToast ] = useState(false);
    const [ checkAll, setCheckAll ] = useState(false);
    const [ orderSum, setOrderSum ] = useState(null);
    const [ totalRecords, setTotalRecords ] = useState(0);
    const [ qtyVal, setQtyVal ] = useState(0);
    const [reasonVal, setReasonVal] = useState(false);
        
    // const [ controlledCheckAll, setControlledCheckAll ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    
    
    const toast = useRef(null);
    const refToThis = useRef(null);
    const checkboxParent = useRef(null);
    const checkboxSingle = useRef([]);
    const axiosPrivate = useAxiosPrivate();
    const {
        getValues,
        setValue,
        setError,
        register,
        handleSubmit,
        formState: { errors },
        clearErrors
    } = useForm({
        defaultValues: {
            name: '',
            return_date: new Date(),
        }
    });

    const [ sevenDaysAdded, set7DaysAdded ] = useState(getValues('invoice_date'));

    const fetchAllCust = async () => {
        await axiosPrivate.get("/customers")
            .then(resp => {
                setCustData(resp.data);
            })
            .catch(error => {
                toast.current.show({
                  severity: "error",
                  summary: "Failed",
                  detail: "Error when get customer data",
                  life: 3000,
                });
            }
        )
    };

    const fetchUpdateSales = async (ids, newInvID) => {
        await axiosPrivate.patch(`/sales/invs?id=${ids}`, newInvID)
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully update sales",
                life: 3000,
            });

            setTimeout(() => {
                window.location.reload();
            },3000)
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to update sales",
                life: 3000,
            });
        })
    }

    const fetchInsertInv = async (body) => {
        let bodyData = JSON.stringify(body);
        // console.log(choosedOrder)
        await axiosPrivate.post("/inv/write", bodyData)
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New invoice is created",
                    life: 3000,
                });

                // update order table => add invoice id
                let invoiceID = JSON.stringify({invoice_id: resp.data.invoice_id});

                if(choosedOrderId.length > 1){
                    let sendReq = choosedOrderId.join("&id=");
                    fetchUpdateSales(sendReq, invoiceID);
                } else {
                    let sendReq = choosedOrderId[0];
                    fetchUpdateSales(sendReq, invoiceID);
                }
            })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add new invoice!",
                life: 3000,
            });
        })
    };
    
    const fetchSumOrder = async (cust_id, pay_type, modelInv) => {
        await axiosPrivate(`sales/summary?id=${cust_id}&paytype=${pay_type}`)
        .then(resp => {
            let newModelInv;
            if(resp.data.length > 0) {

                newModelInv = {
                    ...modelInv,
                    subtotal: resp.data[0].total_subtotal,
                    amount_due: resp.data[0].total_grandtotal,
                    remaining_payment: resp.data[0].total_grandtotal,
                    total_discount: resp.data[0].total_order_disc,
                };
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Not found",
                    life: 3000,
                });
            }
            fetchInsertInv(newModelInv);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get order data!",
                life: 3000,
            });
        })
    };
    
    const fetchSalesbyCust = async () => {
        // await axiosPrivate.get("/sales/cust/available", { params: { 
        //     id: chooseCust.customer_id, 
        // } })
        await axiosPrivate.get(`/sales/ro/filtered?id=${chooseCust.customer_id}`)
        .then(resp => {
            if(resp.data){
                if(resp.data.length > 0){
                    // let filteringOrder = resp.data.filter(({return_order_id}) => return_order_id == null);
                    // if(filteringOrder.length == 0){
                    //     setOrdersByCust(null);
                    //     toast.current.show({
                    //         severity: "error",
                    //         summary: "Gagal",
                    //         detail: "Tidak ada data order yang valid",
                    //         life: 3000,
                    //     });
                    // } else {
                        setOrdersByCust(resp.data);
                    // }
                } else {
                    setOrdersByCust(null);
                    toast.current.show({
                        severity: "error",
                        summary: "Gagal",
                        detail: "Order data tidak ditemukan!",
                        life: 3000,
                    });

                }
            }
        })
        .catch(error => {
            setOrdersByCust(null);
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Order data is empty or not found!",
                life: 3000,
            });
        })
    };

    const fetchDetailedCust = async(custID) => {
        await axiosPrivate.get(`/customer/detail?custid=${custID}`)
        .then(resp => {
            const sales = resp.data.sales ? resp.data.sales[0] : null;
            const debt = resp.data.debt ? resp.data.debt[0] : null;

            const updt_total_sales = (sales && sales.total_sales_grandtotal ? Number(sales.total_sales_grandtotal) : 0) 
            - (sales && sales.return_refund ? Number(sales.return_refund) : 0)
            + (sales && sales.orders_credit_uncanceled ? Number(sales.orders_credit_uncanceled.total) : 0);
            
            const orderBBNotInv = debt && debt.total_debt_grandtotal ? Number(debt.total_debt_grandtotal) : 0;
            const orderPartialRemain = debt && debt.partial_sisa ? Number(debt.partial_sisa.sisa) : 0;
            const orderInvRemain = debt && debt.hutang_invoice ? Number(debt.hutang_invoice.sisa_hutang) : 0;
            const orderCreditUncomplete = debt && debt.orders_credit_uncomplete ? Number(debt.orders_credit_uncomplete.total) : 0;

            const updt_total_debt = orderBBNotInv+orderPartialRemain+orderInvRemain+orderCreditUncomplete;
        
            axiosPrivate.patch(`/customer/sales-debt/${custID}/${updt_total_debt}/${updt_total_sales}`)
            .then(resp2 =>{
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Berhasil memperbarui data pelanggan!",
                    life:1200,
                });
            })
            .catch(err2 => {
                console.error(err2);
                toast.current.show({
                    severity: "error",
                    summary: "Fatal Error",
                    detail: "Error saat memperbarui data pelanggan!",
                    life:1200,
                });
            })
        })
        .catch(err => {
            console.error(err);
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal memperbarui data pelanggan!",
                life:1200,
            });
        })
    };

    const fetchAddReturnOrder = async(ROModel, ROIModel, nextOrderAddOn, custID) => {
        let ROBody = JSON.stringify(ROModel);
        await axiosPrivate.post("/ro", ROBody)
        .then(resp1 => {
            if(resp1.data){
                ROIModel.map(e => {
                    e.return_order_id = resp1.data.return_order_id;
                });
                
                let ROIBody = JSON.stringify(ROIModel);
                
                axiosPrivate.post("/ro-item", ROIBody)
                .then(resp2 => {
                    if(resp2.data.length > 0){

                        let roID = JSON.stringify({return_order_id: resp1.data.return_order_id}); 

                        axiosPrivate.patch(`/sales/update/ro/${resp1.data.order_id}`, roID)
                        .then(resp3 =>{
                            if(resp3.data){
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil menambahkan data pengembalian",
                                    life: 3000,
                                });

                                if(nextOrderAddOn){
                                    // add order credit
                                    nextOrderAddOn.return_order_id = resp1.data.return_order_id;

                                    let nextOrderBody = JSON.stringify(nextOrderAddOn);
                                    axiosPrivate.post("/order-credit", nextOrderBody)
                                    .then(resp4 => {
                                        if(resp4.data){
                                            // setTimeout(() => {
                                            //     window.location.reload();
                                            // },1500);
                                            fetchDetailedCust(custID)

                                            toast.current.show({
                                                severity: "success",
                                                summary: "Sukses",
                                                detail: "order kredit ditambah!",
                                                life: 1500,
                                            });
                                        }
                                    })
                                    .catch(err4 => {
                                        toast.current.show({
                                            severity: "error",
                                            summary: "Gagal",
                                            detail: "Gagal menambahkan order kredit!",
                                            life: 3000,
                                        });
                                    })
                                } else {
                                    // setTimeout(() => {
                                    //     window.location.reload();
                                    // },1500);
                                    fetchDetailedCust(custID);
                                }
                                
                            } else {
                                throw new Error("update sales => return_order_id: no row affected");
                            }
                        })
                        .catch(err3 => {
                            toast.current.show({
                                severity: "error",
                                summary: "Fatal Error",
                                detail: "Error fungsi return order!!",
                                life: 3000,
                            });
                        })
                    } else {
                        throw new Error("insert return order item: no row affected");
                    }
                })
                .catch(err2 => {
                    axiosPrivate.delete(`/ro?id=${resp1.data.return_order_id}`)
                    .then(resp4 => {
                        toast.current.show({
                            severity: "error",
                            summary: "Gagal",
                            detail: "Gagal menambahkan item pengembalian",
                            life: 3000,
                        });
                    })
                    .catch(err4 => {
                        throw new Error("destroy return order: no row affected");
                    })
                    
                })
                
            } else {
                throw new Error("insert return order: no row affected");
            }
        })
        .catch(err1 => {
            if(err1.response.status === 403) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Pengembalian untuk order ini sudah ada!",
                    life: 3000,
                });
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal menambahkan data pengembalian",
                    life: 3000,
                });
            }
           
        })
    };

    const fetchUpdateInv = async(invID, invUpdate) => {
        let invUpdateBody = JSON.stringify(invUpdate);
        await axiosPrivate.put("/inv", invUpdateBody, {params: {id: invID}})
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Berhasil memperbarui invoice",
                life: 3000,
            });
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal memperbarui invoice",
                life: 3000,
            });
        })
    } 

     // handle checkboxes
    const handleChooseOrder = (checked, order) => {
        let dupe = [...choosedOrderId];
        let orders = [...choosedOrder];
        if(checked){
            dupe.push(order.order_id);
            setChoosedOrderId(dupe);
            orders.push(order);
            setChoosedOrder(orders);
        } else {
            let getIndex = choosedOrderId.indexOf(order.order_id);
            if(getIndex < 0) {
                // if not found or empty
                dupe.push(order.order_id)
                setChoosedOrderId(dupe);
            } else {
                // if found
                dupe.splice(getIndex, 1);
                setChoosedOrderId(dupe);
            }
            let filteringOrder = choosedOrder.filter(order => dupe.includes(order.order_id));
            setChoosedOrder(filteringOrder);
        }
    };
    const onSubmit = async (formData) => {
        let roItemModel = [];
        let returnOrderModel = {
            ...formData,
        }
        console.log(formData)
        
        let refundTotal = 0;
        selectedProducts?.map(product => {
            returnOrderModel.order_id = product.order_id;
            refundTotal += (Number(product.returnValue) * Number(product.sell_price)) - (Number(product.returnValue) * Number(product.discount_prod_rec));
            
            let returnOrderItem = {
                item_id: product.item_id,
                quantity: product.returnValue,
                return_value: (Number(product.returnValue) * Number(product.sell_price)) - (Number(product.returnValue) * Number(product.discount_prod_rec)),
                return_item_status: 'pengecekan',
                reason_id: product.reason_id,
                reason: product.reason
            };
            roItemModel.push(returnOrderItem);
        }) ;
        returnOrderModel.refund_total = refundTotal;

        let order_discount_change;
        if(choosedRow.order_items.length == selectedProducts.length){
            let checkMaxQty = [];
            selectedProducts.map(product => {
                if(Number(product.quantity) == product.returnValue){
                    checkMaxQty.push(true);
                } else {
                    checkMaxQty.push(false);
                }
            })
            
            if(checkMaxQty.every(value => value == true)){
                // remove order disc if order selected length with order item length same and return qty is max
                order_discount_change = 0; 
            } 
        }

        // do by method return
        if(formData.return_method_id === 3){
            let toDate = choosedRow.order_date;
            let nextOrderAddOn = {};
            await axiosPrivate.get(`/sales/next?id=${formData.customer_id}&order_date=${toDate}`)
            .then(resp1 => {
                nextOrderAddOn.customer_id = formData.customer_id;
                if(resp1.data.length > 0){
                    let placedOrderToRO;
                    if(resp1.data.length > 1){
                        let findCurrent = resp1.data.findIndex(({order_id}) => returnOrderModel.order_id == order_id);
                        placedOrderToRO = resp1.data[findCurrent+1];
                        nextOrderAddOn.order_id = placedOrderToRO ? placedOrderToRO.order_id : null;
                        
                    } else {
                        nextOrderAddOn.order_id = null;
                    }
                } else {
                    nextOrderAddOn.order_id = null;
                }
                // fetchAddReturnOrder(returnOrderModel, roItemModel, nextOrderAddOn, order_discount_change, formData.customer_id);
                fetchAddReturnOrder(returnOrderModel, roItemModel, nextOrderAddOn, formData.customer_id);
            })
            .catch(err1 => {
                console.error(err1);
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal menambahkan pengembalian",
                    life: 3000,
                });
            })
        } else {
            // fetchAddReturnOrder(returnOrderModel, roItemModel, null, order_discount_change, formData.customer_id);
            fetchAddReturnOrder(returnOrderModel, roItemModel, null, formData.customer_id);
        }
        

        if(choosedRow.invoice){
            let invUpdate={};
            let totalPaid = 0;
            if(choosedRow.invoice.payments){
                totalPaid = choosedRow.invoice.payments.reduce((prevValue, currValue) => prevValue + Number(currValue.amount_paid), 0);
            }

            if(formData.return_method_id == 2 || formData.return_method_id == 1){
                invUpdate = {
                    subtotal: Number(choosedRow.invoice.subtotal) - Number(returnOrderModel.refund_total),
                    amount_due: Number(choosedRow.invoice.amount_due) - Number(returnOrderModel.refund_total),
                    remaining_payment: (Number(choosedRow.invoice.remaining_payment) - Number(returnOrderModel.refund_total)) <= 0 ? 
                                        0 : (Number(choosedRow.invoice.remaining_payment) - Number(returnOrderModel.refund_total)),
                    is_paid: (Number(choosedRow.invoice.remaining_payment) - Number(returnOrderModel.refund_total)) <= 0 ? true : false,
                }
            } else if(formData.return_method_id === 3){
                let amount_due = order_discount_change == 0 ? (Number(choosedRow.invoice.amount_due) + Number(choosedRow.order_discount)) - Number(returnOrderModel.refund_total) : (Number(choosedRow.invoice.amount_due) - (Number(returnOrderModel.refund_total)));
                invUpdate = {
                    subtotal: Number(choosedRow.invoice.subtotal) - Number(returnOrderModel.refund_total),
                    total_discount: Number(choosedRow.invoice.total_discount) - Number(choosedRow.order_discount),
                    amount_due: amount_due,
                    remaining_payment: amount_due - totalPaid,
                    is_paid: amount_due - totalPaid <= 0 ? true : false,
                }

            }
            // console.log(order_discount_change)
            // console.log(invUpdate)
            // console.log("amount due => ", Number(choosedRow.invoice.amount_due))
            // console.log("order disc => ", Number(choosedRow.order_discount))
            // console.log("ro => ", Number(returnOrderModel.refund_total))
            // console.log(invUpdate.amount_due)
            // console.log(totalPaid)
            if(Object.keys(invUpdate).length > 0){
                // fetchUpdateInv(data.ro.order.invoice.invoice_id, invUpdate);
                fetchUpdateInv(choosedRow.invoice.invoice_id, invUpdate);
            } 
        }
    };

    const onError = () => {
        if(errors.return_method){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Pilih metode pengembalian!",
                life: 3000,
            });
        } else if(errors.status){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Pilih status pengembalian!",
                life: 3000,
            });
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

    const handleAutoComplete = (custName) => {
        if(custData && custName !== ""){
            let filteredCust = custData.filter(item => item.name.includes(custName.toLowerCase()));
            if(filteredCust.length === 0){
                setOpenPopup(false);
                setFilteredCust(filteredCust);
                setError("name", { type: 'required', message: "Customer name error!" });
            } else {
                setOpenPopup(true);
                setFilteredCust(filteredCust);
                clearErrors("name");
            }
        } else if(!custName || custName === ""){
            setOpenPopup(true);
            setFilteredCust(custData);
            setError("name", { type: 'required', message: "This field is required!" })
        } else {
            setOpenPopup(false);
            setFilteredCust("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    }

    const add7days = (value) => {
        const invDate = new Date(value);
        invDate.setDate(new Date(value).getDate() + 7);
        set7DaysAdded(invDate);
    }

    const handleChooseCust = (e) => {
        setCust(e);
        setValue('customer_id', e.customer_id);
        setValue('name', e.name);
        setOpenPopup(false);
        clearErrors("name");
    }

    // // handle checkboxes
    // const handleChooseOrder = (checked, order_id) => {
    //     let dupe = [...choosedOrder];
    //     if(checked){
    //         dupe.push(order_id);
    //         setChoosedOrder(dupe);
    //     } else {
    //         let getIndex = choosedOrder.indexOf(order_id);
    //         if(getIndex < 0) {
    //             // if not found or empty
    //             dupe.push(order_id)
    //             setChoosedOrder(dupe);
    //         } else {
    //             // if found
    //             dupe.splice(getIndex, 1);
    //             setChoosedOrder(dupe);
    //         }
    //     }
    // }

    const addCheckboxRef = (checkboxEl) =>{
        if(checkboxEl && !checkboxSingle.current.includes(checkboxEl)){
            checkboxSingle.current.push(checkboxEl);
        }
    }

    const controlledCheckAll = (checkedAll) => {
        if(checkedAll){
            if(checkboxSingle){
                let orders_id = [];
                checkboxSingle.current.forEach(e => {
                    e.checked = true;
                    orders_id.push(e.value);
                });

                let orders = ordersByCust?.filter(order => orders_id.includes(order.order_id));
                setChoosedOrderId(orders_id);
                setChoosedOrder(orders);
            }
        } else {
            if(checkboxSingle){
                checkboxSingle.current.forEach(e => {
                    e.checked = false;
                });
                setChoosedOrderId([]);
                setChoosedOrder([]);
            }
        }
    };

    useEffect(() => {
        if(ordersByCust && choosedOrder){
            if(choosedOrder.length == ordersByCust.length) {
                setCheckAll(true);
            } else {
                setCheckAll(false); 
            }
        }
    },[choosedOrder])
    // end of checkboxes handle

    const handleFilterCust = (e) => {
        handleAutoComplete(getValues('name'));
    }  
    
    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
            setOrdersByCust(null);
            setCheckAll(false);
            setChoosedOrder([]);
            checkboxSingle.current = [];
            setChoosedRow(null);
        }
    }

    // useEffect(() =>{
    //     if(ordersByCust){
    //         setCheckAll(true);
    //         controlledCheckAll(true);
    //     } else {
    //         setChoosedOrder([]);
    //     }
    // },[ordersByCust])

    const handleClickRow = (rowData) => {
        // console.log(rowData)
        setChoosedRow(rowData);
        rowData?.order_items?.map(e => {
            e.returnValue = 0;
            e.reason = null;
        })
        if(rowData.invoice){
            setValue('is_paid', rowData.invoice.is_paid);
        } else  {
            setValue('is_paid', false);
        }
        setChoosedRowItem(rowData.order_items);
        let orderItem = [];
        rowData.order_items?.map(e => {
            let orderItemObj = {
                product_id: e.product_id,
                product_name: e.product?.product_name + " " + e.product?.variant,
            };
            orderItem.push(orderItemObj);
        });
        setChoosedRowProduct(orderItem);
    };

    const emptyStateHandler = () =>{
        return (
            <div style={{width: '100%', textAlign: 'center'}}>
                <img src={EmptyState} style={{width: '165px', height: '170px'}}  />
                <p style={{marginBottom: ".3rem"}}>No result found</p>
            </div>
        )
    };

    const isCellSelectable = (event) => (event.data.field === 'category' && event.data.value === 'Fitness' ? false : true);

    
    const isRowSelectable = (e) => {
        return !e.data.reason && !e.data.returnValue ? e.data.return_order_item ? true : false : true;
    };
    
    const returnReasonEl = (rowData, options) => {
       return(
        <>
            <p key={options.rowIndex}>{rowData.reason}</p>
        {/* <InputWSelect
            // label={'alasan pengembalian'}
            name="reason"
            position={choosedRowItem.length - 1 > 1 ? row.rowIndex == choosedRowItem.length - 1 ? "top" : "bottom" : "bottom"}
            selectLabel="Pilih alasan pengembalian"
            options={dataStatic.returnReasonList}
            optionKeys={["id", "type"]}
            value={(selected) => {
                setValue('reason', selected.value);
                selected.value != "" ? clearErrors("reason") : null;
            }}
            require={false}
            register={register}
            errors={errors}
        /> */}
        {/* <ListBox value={selectedOpt} onChange={(e) => setSelectedOpt(e.value)} options={dataStatic.returnReasonList} optionLabel="type" className="w-full md:w-14rem" /> */}
        {/* <Dropdown value={selectedOpt} onChange={(e) => setSelectedOpt(e.value)} options={dataStatic.returnReasonList} optionLabel="type" 
        placeholder="Pilih alasan pengembalian" className="w-full md:w-7rem" style={{textTransform: 'capitalize', zIndex: 999999999999}} /> */}
        
        </>
       )
    };
    const selectOptEditor = (options) => {
        return(
            <>
        <InputWSelect
            // label={'alasan pengembalian'}
            name="reason"
            // position={choosedRowItem.length - 1 > 1 ? row.rowIndex == choosedRowItem.length - 1 ? "top" : "bottom" : "bottom"}
            selectLabel="Pilih alasan pengembalian"
            options={dataStatic.returnReasonList}
            optionKeys={["id", "type"]}
            value={(selected) => {
                setValue('reason', selected.value);
                setValue('reason_id', selected.id);
                selected.value != "" ? clearErrors("reason") : null;
                options.rowData.reason = selected.value;
                options.rowData.reason_id = selected.id;
            }}
            onChange={(e) => options.editorCallback(e.value)}
            require={false}
            register={register}
            errors={errors}
        />
        {/* <ListBox value={selectedOpt} onChange={(e) => setSelectedOpt(e.value)} options={dataStatic.returnReasonList} optionLabel="type" className="w-full md:w-14rem" /> */}
        {/* <Dropdown value={selectedOpt} onChange={(e) => setSelectedOpt(e.value)} options={dataStatic.returnReasonList} optionLabel="type" 
        placeholder="Pilih alasan pengembalian" className="w-full md:w-7rem" style={{textTransform: 'capitalize', zIndex: 999999999999}} /> */}
        
        </>
       )
    };

    
    const handleReturnOrder = (item) => {
        let dupeReturnItem = [...item];
        let returnItemObj = {
            ...item,
            quantity: Number(qty)
        }
        if(dupeReturnItem.length > 0){
            let findDupe = dupeReturnItem.find(({item_id}) => rowData.item_id == item_id);
            if(findDupe < 0){
                dupeReturnItem.push(returnItemObj);
            } else {
                dupeReturnItem[findDupe] = returnItemObj;
            }
        } else {
            dupeReturnItem.push(returnItemObj);
        }
        setReturnItem(dupeReturnItem);
    };

    const returnQty = (rowData, options) => {
        return(
            <p key={options.rowIndex}>{Number(rowData.returnValue)}</p>
        )
    };

    const qtyEditor = (options) => {
        return(
            <QtyButton min={0} max={options.rowData.quantity} name={`qty-product`} width={"180px"} returnValue={(e) => {setQtyVal(e);options.rowData.returnValue = e}} 
            value={options.rowData.returnValue ? options.rowData.returnValue : qtyVal} onChange={(e) => {options.editorCallback(e.value)}} />
        )
    };

    const rowEditValidator = (data, options) => {
        if(!data.reason && data.returnValue == 0){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Alasan dan jumlah pengembalian tidak boleh kosong!",
                life: 3000,
            });

            return false;
        } else if(!data.reason){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Alasan pengembalian tidak boleh kosong",
                life: 3000,
            });
            return false;
        } else if(data.returnValue == 0){
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Jumlah pengembalian tidak boleh 0!",
                life: 3000,
            });
            return false;
        } else {
            return true;
        }
    }

    const onRowEditComplete = (e) => {
        let { newData, index } = e;
        let _products = [...choosedRowItem];
        let _selected_products =  selectedProducts ? [...selectedProducts] : null;
        _products[index] = newData;

        if(_selected_products){
            _products.map((product, i) => {
                _selected_products.map((selectProd, idx) => {
                    if(product.item_id == selectProd.item_id){
                        _selected_products[idx] = _products[i];
                    }
                })
            })
            setSelectedProducts(_selected_products);
        }
        setChoosedRowItem(_products);
    };
    
    const handleChoosedRO = (data) => {
        const { originalEvent, checked, value } = data
        let _selected_products = selectedProducts ? [...selectedProducts] : null;
        let rowObj = value;
        

        if(!rowObj.reason || rowObj.returnValue === 0){
            originalEvent.target.checked = false;
            if(!rowObj.reason && rowObj.returnValue === 0){
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Alasan dan jumlah pengembalian tidak boleh kosong!",
                    life: 3000,
                });

            } else if(!rowObj.reason){
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Alasan pengembalian tidak boleh kosong",
                    life: 3000,
                });
            } else if(rowObj.returnValue == 0){
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Jumlah pengembalian tidak boleh 0!",
                    life: 3000,
                });
            } 
            return null;
        }

        if(_selected_products){
            if(checked){
                _selected_products.map((selectProd, idx) => {
                    if(rowObj.item_id == selectProd.item_id){
                        _selected_products[idx] = rowObj;
                    } else {
                        _selected_products.push(rowObj); 
                    }
                })
            } else {
                let findIdx = _selected_products.findIndex(({item_id}) => rowObj.item_id == item_id);
                if(findIdx >= 0) {
                    _selected_products.splice(findIdx, 1);
                } 
            }
        } else {
            if(checked){
                _selected_products = [rowObj]; 
            }
        }
        setSelectedProducts(_selected_products);
    };

    const orderTemplate = (rowData, index) => {
        return (
        <div className='card static-shadow' key={index} >
            <Swiper initialSlide={0} slidesPerView={'auto'} preventClicks={false} preventClicksPropagation={false} simulateTouch={false} style={{width:'100%', height:'auto'}}>
                {/* <SwiperSlide style={{width: '70px'}}>
                    <div className='mobile-swiper-content-left warning' onClick={() => {setEditableMobile((p) => !p)}}>
                        <i className='bx bx-pencil'></i>
                    </div>
                </SwiperSlide> */}
                <SwiperSlide style={{width: '100%'}}>
                    <div className='flex flex-column xl:align-items-start gap-3'
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '1rem',
                            boxShadow: '1px 1px 7px #9a9acc1a',
                            borderRadius: '9px',
                            position:'relative',
                            width:'100%',
                            minHeight:'125px'
                        }}
                    >
                    
                        <div className="flex align-items-center gap-3" 
                            style={{
                                textTransform: 'capitalize', 
                            }}
                        >
                            {/* checkbox */}
                            <InputWLabel 
                                type="checkbox"
                                name={`ro_item-${index}`}
                                onChange={(e) => {handleChoosedRO({originalEvent: e, checked: e.target.checked, value: rowData})}} 
                                // disabled={editableData[index].reason ? false : true}
                                register={register}
                                require={false}
                                // errors={errors}
                            />
                            <div className='flex flex-column' style={{width: '80%'}}>
                                <div className='mb-1'>
                                    <p style={{marginBottom: 0, fontSize: 14, fontWeight: 600, maxWidth: '100px'}}>{`${rowData.product.product_name}`}</p>
                                    <p style={{marginBottom: 0, fontSize: 11, color: '#7d8086', maxWidth: '100px'}}>
                                        {`Variant: ${rowData.product.variant}`}
                                    </p>
                                    {/* <p style={{marginBottom: 0, fontSize: 13, color: '#7d8086'}}>{`Disc: ${rowData.discProd}`}</p> */}
                                </div>
                            </div>
                              

                        </div>
                         <div className="return-reason" style={{width:'100%'}}>
                            <InputWSelect
                                // label={'alasan pengembalian'}
                                name={`reason-${index}`}
                                // position={choosedRowItem.length - 1 > 1 ? row.rowIndex == choosedRowItem.length - 1 ? "top" : "bottom" : "bottom"}
                                selectLabel="Alasan pengembalian"
                                options={dataStatic.returnReasonList}
                                optionKeys={["id", "type"]}
                                value={(selected) => {
                                    setValue(`reason-${index}`, selected.value);
                                    setValue(`reason_id-${index}`, selected.id);
                                    // selected.value != "" ? clearErrors("reason") : null;
                                    rowData.reason = selected.value;
                                    rowData.reason_id = selected.id;
                                    // console.log(editableData)
                                    selected.value != null ? setReasonVal(true):setReasonVal(false);
                                }}
                                // disabled={editableMobile ? false : true}
                                // onChange={(e) => editorCallback(e.value)}
                                require={false}
                                register={register}
                                errors={errors}
                            />
                            {/* <Dropdown value={getValues('reason')} onChange={(e) => setValue('reason', e.value)} options={dataStatic.returnReasonList} optionLabel="type" placeholder="Select a reason" 
                                 className="w-full" 
                                /> */}
                           
                            {/* <InputWSelect
                                // label={'alasan pengembalian'}
                                name="reason"
                                // position={choosedRowItem.length - 1 > 1 ? row.rowIndex == choosedRowItem.length - 1 ? "top" : "bottom" : "bottom"}
                                selectLabel="Pilih alasan pengembalian"
                                options={dataStatic.returnReasonList}
                                optionKeys={["id", "type"]}
                                value={(selected) => {
                                    setValue('reason', selected.value);
                                    setValue('reason_id', selected.id);
                                    selected.value != "" ? clearErrors("reason") : null;
                                    options.rowData.reason = selected.value;
                                    options.rowData.reason_id = selected.id;
                                }}
                                onChange={(e) => options.editorCallback(e.value)}
                                require={false}
                                register={register}
                                errors={errors}
                            /> */}
                        </div>
                        <div className='mb-2' style={{position:'absolute',right:16, bottom: 60}}>
                            <div className="order-qty-btn">
                                <QtyButton 
                                    min={0} 
                                    max={Number(rowData.quantity)} 
                                    name={`qty-product-${index}`} 
                                    // id="qtyItem" 
                                    value={rowData.returnValue && rowData.returnValue} 
                                    returnValue={(e) => {rowData.returnValue = e}} 
                                    size={100} 
                                    // disabled={editableMobile ? false : true}
                                />
                            </div>
                            {/* <button type="button" className="btn btn-warning btn-w-icon"><i className='bx bx-pencil'></i>Edit order</button> */}
                        
                        </div>

                    </div>
                </SwiperSlide>
                {/* <SwiperSlide style={{width: '70px'}}>
                    <div className='mobile-swiper-content-right danger' onClick={() => {delSalesItems(index)}}>
                        <i className='bx bx-trash'></i>
                    </div>
                </SwiperSlide> */}
            </Swiper>
            
        </div>
        );
    };
    

    const orderListTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((order, index) => {
            return orderTemplate(order, index, items);
        });

        return (
            <>
            
            <div className="order-list-mobile">
                <p className="card-title mb-3">pilih Pengembalian Produk</p>
                <div className="flex flex-column gap-3">
                    {list}
                </div>
            </div>
            </>
        );
    };
// console.log(selectedProducts)

    useEffect(() => {
        if(chooseCust && chooseCust != ""){
            setChoosedOrder([]);
            setCheckAll(false);
            fetchSalesbyCust();
        }
    },[chooseCust]);
    
    useEffect(() => {
        fetchAllCust();
        add7days(getValues('invoice_date'));
    },[]);

    useEffect(() => {
        if(ordersByCust){
            setIsLoading(false);
        }
    },[ordersByCust])

    useEffect(() => {
        if(isLoading){
            return;
        }
    },[isLoading]);

    return(
        <>
        <Modal dialogClassName={isMobile || isMediumScr ? 'modal-xl' : 'modal-90w'} show={show} onHide={onHide} scrollable={true} centered={true} style={{overflowY:'unset'}}>
            <Modal.Header closeButton>
                <Modal.Title>tambah pengembalian barang</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{height: '100%'}}>
                <form className="row mb-4" style={{gap: isMobile ? '.5rem' : 0}}>
                    <div className="col-lg-3 col-sm-12 col-md-12 col-12">
                        <div style={{position:'relative'}}>
                            <InputWLabel 
                                label="Nama Pelanggan" 
                                type="text"
                                name="name" 
                                placeholder="Ketik nama pelanggan..." 
                                onChange={handleFilterCust}
                                onFocus={handleFilterCust}
                                onKeyDown={handleKeyDown}
                                require={true}
                                register={register}
                                errors={errors} 
                                textStyle={'capitalize'}
                                autoComplete={"off"}
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
                    <div className="col-lg-3 col-sm-12 col-md-12 col-12">
                        <InputWLabel 
                            label={'tanggal pengembalian'}
                            type={'date'}
                            name={'return_date'}
                            require={true}
                            register={register}
                            errors={errors} 
                            defaultValue={getValues('return_date')}
                        />
                    </div>
                    <div className="col-lg-3 col-sm-12 col-md-12 col-12">
                        <InputWSelect
                            label={'metode pengembalian'}
                            name="return_method"
                            selectLabel="Pilih metode pengembalian"
                            options={getValues('is_paid') ? dataStatic.returnMethodWPaidStatus : dataStatic.returnMethod}
                            optionKeys={["id", "type"]}
                            value={(selected) => {
                                setValue('return_method', selected.value);
                                setValue('return_method_id', selected.id);
                                selected.value != "" ? clearErrors("return_method") : null;
                            }}
                            require={true}
                            register={register}
                            errors={errors}
                            disabled={choosedRow ? false : true}
                        />
                    </div>
                    <div className="col-lg-3 col-sm-12 col-md-12 col-12">
                        <InputWSelect
                            label={'Status pengembalian'}
                            name="status"
                            selectLabel="Pilih status pengembalian"
                            options={dataStatic.returnOrderStatus}
                            optionKeys={["id", "type"]}
                            value={(selected) => {
                                setValue('status', selected.value);
                                selected.value != "" ? clearErrors("status") : null;
                            }}
                            require={true}
                            register={register}
                            errors={errors}
                        />
                        
                    </div>
                    {/* <Collapse in={getValues("reason") == "lainnya"}>
                        <div className="col-lg-4 col-sm-6 col-md-6 col-6">
                            <InputWLabel 
                                label={'Tulis alasan'}
                                type={'text'}
                                name={'reason-text'}
                                require={getValues("reason") == "lainnya" ? true : false}
                                register={register}
                                errors={errors} 
                            />
                        </div>
                    </Collapse> */}

                <Collapse in={ordersByCust != null && choosedRow == null}>
                    <div className="modal-table-wrap mt-3">
                        <div className="table-responsive" style={{height: isMobile ? '200px' :'350px'}}>
                            <table className="table" id="salesList" data-table-search="true" data-table-sort="true"
                                data-table-checkbox="true">
                                <thead>
                                    <tr>
                                        {/* <th scope="col">
                                            <input ref={checkboxParent} className="form-check-input checkbox-primary checkbox-all"
                                                type="checkbox" checked={checkAll} 
                                                onChange={(e) => {
                                                    setCheckAll(e.currentTarget.checked);
                                                    controlledCheckAll(e.currentTarget.checked);
                                                }} 
                                            />
                                        </th> */}
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-id">
                                            order id
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-date">
                                            order date
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-id">
                                            customer ID
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="cust-name">
                                            customer name
                                            <span className="sort-icon"></span>
                                        </th>
                                        {/* <th scope="col" className="head-w-icon sorting" aria-label="cust-type">
                                            customer type
                                            <span className="sort-icon"></span>
                                        </th> */}
                                        <th scope="col" className="head-w-icon sorting" aria-label="order-type">
                                            order type
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="total">
                                            total
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="status">
                                            status
                                            <span className="sort-icon"></span>
                                        </th>
                                        <th scope="col" className="head-w-icon sorting" aria-label="payment-type">
                                            type
                                            <span className="sort-icon"></span>
                                        </th>
                                        {/* <th scope="col" aria-label="action">
                                            action
                                        </th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                {ordersByCust?.map((order, idx) => {
                                    return(
                                        <tr className='hover-row' key={`order-${idx}`} style={{textTransform: 'capitalize', cursor:'pointer'}} 
                                            onClick={() => {
                                                if(order.invoice){
                                                    if(!order.invoice?.is_paid){
                                                        handleClickRow(order);        
                                                    } else {
                                                        toast.current.show({
                                                            severity: "error",
                                                            summary: "Error",
                                                            detail: "Tidak dapat mengajukan pengembalian karena invoice telah lunas!",
                                                            life: 3000,
                                                        }) 
                                                    }
                                                } else {
                                                    handleClickRow(order);        
                                                }
                                            }} 
                                        >
                                            {/* <th scope="row">
                                                <input className="form-check-input checkbox-primary checkbox-single"
                                                    type="checkbox" value={order.order_id} ref={addCheckboxRef} 
                                                    onChange={(e) => handleChooseOrder(e.currentTarget.checked, order)}  
                                                />
                                            </th> */}
                                            <td>
                                                {order.order_id}
                                            </td>
                                            <td className="">{ConvertDate.convertToFullDate(order.order_date, "/")}</td>
                                            <td>{order.customer.customer_id}</td>
                                            <td className="data-img">
                                                {order.customer.name}
                                            </td>
                                            {/* <td>
                                                {order.customer.cust_type}
                                            </td> */}
                                            <td>{order.order_type}</td>
                                            <td>
                                                {
                                                <NumberFormat intlConfig={{
                                                    value: order.grandtotal, 
                                                    locale: "id-ID",
                                                    style: "currency", 
                                                    currency: "IDR",
                                                    }} 
                                                />
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    order.order_status == "completed" ? 'success'
                                                    : order.order_status == "pending" ? "secondary" 
                                                    : order.order_status == "in-delivery" ? "warning" 
                                                    : order.order_status == "canceled" ? "danger" 
                                                    : ""} light`}
                                                >
                                                    {
                                                        order.order_status == "completed" ? 'completed'
                                                        : order.order_status == "pending" ? 'pending'
                                                        : order.order_status == "in-delivery" ? 'in-delivery'
                                                        : order.order_status == "canceled" ? 'canceled'
                                                        : ""
                                                    }                                                                                
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    order.payment_type == "bayar nanti" ? 'danger'
                                                    : order.payment_type == "lunas"? "primary"
                                                    : order.payment_type == "sebagian"? "warning"
                                                    : ""} light`}
                                                >
                                                    {order.payment_type }                                                                                
                                                </span>
                                            </td>
                                            {/* <td>
                                                <span className="table-btn detail-table-data" data-bs-toggle="modal"
                                                    data-bs-target="#salesDetail"><i className='bx bx-show'></i></span>
                                            </td> */}
                                        </tr>
                                    )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>

                </Collapse>
                

                {/* {
                    choosedRow ? 
                    (
                    <div className="modal-table-wrap mt-2">
                        <div className="table-responsive" style={{height: 'auto'}}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            order id
                                        </th>
                                        <th scope="col">
                                            order date
                                        </th>
                                        <th scope="col">
                                            customer ID
                                        </th>
                                        <th scope="col">
                                            customer name
                                        </th>
                                        <th scope="col">
                                            order type
                                        </th>
                                        <th scope="col">
                                            total
                                        </th>
                                        <th scope="col">
                                            status
                                        </th>
                                        <th scope="col">
                                            type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{textTransform: 'capitalize'}} > 
                                        <td>
                                            {choosedRow.order_id}
                                        </td>
                                        <td>{ConvertDate.convertToFullDate(choosedRow.order_date, "/")}</td>
                                        <td>{choosedRow.customer.customer_id}</td>
                                        <td className="data-img">
                                            {choosedRow?.customer.name}
                                        </td>
                                        <td>{choosedRow.order_type}</td>
                                        <td>
                                            {
                                            <NumberFormat intlConfig={{
                                                value: choosedRow.grandtotal, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                                }} 
                                            />
                                            }
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                choosedRow.order_status == "completed" ? 'success'
                                                : choosedRow.order_status == "pending" ? "secondary" 
                                                : choosedRow.order_status == "in-delivery" ? "warning" 
                                                : choosedRow.order_status == "canceled" ? "danger" 
                                                : ""} light`}
                                            >
                                                {
                                                    choosedRow.order_status == "completed" ? 'completed'
                                                    : choosedRow.order_status == "pending" ? 'pending'
                                                    : choosedRow.order_status == "in-delivery" ? 'in-delivery'
                                                    : choosedRow.order_status == "canceled" ? 'canceled'
                                                    : ""
                                                }                                                                                
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                choosedRow.payment_type == "unpaid" ? 'danger'
                                                : choosedRow.payment_type == "paid"? "primary"
                                                : choosedRow.payment_type == "partial"? "warning"
                                                : ""} light`}
                                            >
                                                {choosedRow.payment_type }                                                                                
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>      
                    ):''
                } */}
                <Collapse in={choosedRow !== null}>
                    {/* <> */}
                    <div>
                        <div className="modal-table-wrap mt-2 mb-4">
                            <div className="table-responsive" style={{height: 'auto'}}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                order id
                                            </th>
                                            <th scope="col">
                                                order date
                                            </th>
                                            <th scope="col">
                                                customer ID
                                            </th>
                                            <th scope="col">
                                                customer name
                                            </th>
                                            <th scope="col">
                                                order type
                                            </th>
                                            <th scope="col">
                                                total
                                            </th>
                                            <th scope="col">
                                                status
                                            </th>
                                            <th scope="col">
                                                type
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{textTransform: 'capitalize'}} > 
                                            <td>
                                                {choosedRow?.order_id}
                                            </td>
                                            <td>{ConvertDate.convertToFullDate(choosedRow?.order_date, "/")}</td>
                                            <td>{choosedRow?.customer?.customer_id}</td>
                                            <td className="data-img">
                                                {choosedRow?.customer.name}
                                            </td>
                                            <td>{choosedRow?.order_type}</td>
                                            <td>
                                                {
                                                <NumberFormat intlConfig={{
                                                    value: choosedRow?.grandtotal, 
                                                    locale: "id-ID",
                                                    style: "currency", 
                                                    currency: "IDR",
                                                    }} 
                                                />
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    choosedRow?.order_status == "completed" ? 'success'
                                                    : choosedRow?.order_status == "pending" ? "secondary" 
                                                    : choosedRow?.order_status == "in-delivery" ? "warning" 
                                                    : choosedRow?.order_status == "canceled" ? "danger" 
                                                    : ""} light`}
                                                >
                                                    {
                                                        choosedRow?.order_status == "completed" ? 'completed'
                                                        : choosedRow?.order_status == "pending" ? 'pending'
                                                        : choosedRow?.order_status == "in-delivery" ? 'in-delivery'
                                                        : choosedRow?.order_status == "canceled" ? 'canceled'
                                                        : ""
                                                    }                                                                                
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${
                                                    choosedRow?.payment_type == "bayar nanti" ? 'danger'
                                                    : choosedRow?.payment_type == "lunas"? "primary"
                                                    : choosedRow?.payment_type == "sebagian"? "warning"
                                                    : ""} light`}
                                                >
                                                    {choosedRow?.payment_type }                                                                                
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>    
                        
                            {/* <div className="mt-4 " style={{height:'100%'}}> */}
                            {!isMobile && !isMediumScr? 
                            (
                            <div className="card card-table static-shadow" style={{minHeight: 400}}>
                                <p className="card-title mb-3">pilih Pengembalian Produk</p>
                                
                                <DataTable
                                    id='returnOrderTable'
                                    className="p-datatable freeze-overflow"
                                    value={choosedRowItem}
                                    size="normal"
                                    dataKey="item_id"
                                    tableStyle={{ minWidth: "50rem", fontSize: '14px', overflow: 'hidden', height:'100%'}}
                                    emptyMessage={emptyStateHandler}
                                    cellSelection
                                    selectionMode={'checkbox'} 
                                    selection={selectedProducts} 
                                    onSelectionChange={(e) => {
                                        // handleChoosedRO(e);
                                        setSelectedProducts(e.value);
                                        // setValue(`ro-item-${e.value[0].item_id}`, e.originalEvent.checked ? "on" : "off")
                                        // console.log(e)
                                    }} 
                                    isDataSelectable={isRowSelectable}
                                    scrollable={false}
                                    editMode="row"
                                    onRowEditComplete={onRowEditComplete}
                                    rowEditValidator={rowEditValidator}
                                >
                                    <Column 
                                        columnKey='checkboxRow'
                                        selectionMode="multiple" 
                                        headerStyle={{ width: '3rem' }}
                                    ></Column>
                                    <Column
                                        field="product.product_name"
                                        header="Nama produk"
                                        bodyStyle={{ textTransform: "capitalize" }}
                                        style={{ textTransform: "uppercase" }}
                                    ></Column>
                                    <Column
                                        field="product.variant"
                                        header="varian"
                                        bodyStyle={{ textTransform: "capitalize" }}
                                        style={{ textTransform: "uppercase" }}
                                    ></Column>
                                    <Column
                                        field=""
                                        header="alasan pengembalian"
                                        body={returnReasonEl}
                                        editor={(options) => selectOptEditor(options)}
                                        style={{ textTransform: "uppercase", width: 400 }}
                                        bodyStyle={{ textTransform: "capitalize", width: 400 }}
                                    ></Column>
                                    <Column
                                        field="quantity"
                                        header="kuantitas"
                                        body={returnQty}
                                        editor={(options) => qtyEditor(options)}
                                        style={{ textTransform: "uppercase" }}
                                        bodyStyle={{ textTransform: "capitalize" }}
                                    ></Column>
                                    <Column rowEditor={true} headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
                                </DataTable>
                            </div>
                            ) :
                            (
                                <DataView value={choosedRowItem} listTemplate={orderListTemplate} emptyMessage=' '></DataView>
                            )   
                            }                      
                            {/* </div> */}
                            {/* <div className='mt-3 mb-4'>
                                <Row className='mb-4'>
                                    <Col lg={3} sm={12}>
                                        <InputWSelect
                                            label={'Pilih produk'}
                                            name="order_item"
                                            selectLabel="Pilih produk"
                                            options={choosedRowProduct}
                                            optionKeys={["product_id", "product_name"]}
                                            value={(selected) => {
                                                setValue('order_item', selected.value);
                                                selected.value != "" ? clearErrors("order_item") : null;
                                            }}
                                            require={true}
                                            register={register}
                                            errors={errors}
                                        />
                                    </Col>
                                    <Col lg={3} sm={12}>
                                        <InputWSelect
                                            label={'alasan pengembalian'}
                                            name="reason"
                                            selectLabel="Pilih alasan pengembalian"
                                            options={dataStatic.returnReasonList}
                                            optionKeys={["id", "type"]}
                                            value={(selected) => {
                                                setValue('reason', selected.value);
                                                selected.value != "" ? clearErrors("reason") : null;
                                            }}
                                            require={true}
                                            register={register}
                                            errors={errors}
                                        />
                                    </Col>
                                     <Col lg={3} sm={12}>
                                        <QtyButton min={0} max={999} name={`qty-product`} label={"qty"} id="qtyItem" width={"180px"} returnValue={(e) => setQtyVal(e)} value={qtyVal} />
                                    </Col>
                                </Row>
                            </div> */}
                        

                    </div>
                    {/* </> */}
                </Collapse>
                 {/* ):''} */}
                 </form>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>batal</button>
                <button type="button" className="btn btn-primary" disabled={selectedProducts && selectedProducts.length > 0 ? false : true} onClick={handleSubmit(onSubmit,onError)}>simpan</button>
            </Modal.Footer>
        </Modal>
        

        {/* toast area */}
        {/* <ToastContainer className="p-3 custom-toast">
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                <Toast.Body>{toastContent.msg}</Toast.Body>
            </Toast>
        </ToastContainer> */}
        <Toast ref={toast} />

        </>


    )
}