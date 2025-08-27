import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, ToastContainer, Collapse, Col, Row } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import InputWLabel from '../Input/InputWLabel.jsx';
import InputWSelect from '../Input/InputWSelect.jsx';
import { useForm } from 'react-hook-form';
import FetchApi from '../../assets/js/fetchApi.js';
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
import { Swiper, SwiperSlide } from 'swiper/react';


export default function EditReturnOrderModal({ show, onHide, data }){
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
    const [ custData, setCustData ] = useState(null);
    const [ selectedOpt, setSelectedOpt ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ editing, onEditing ] = useState(false);
    const [ chooseCust, setCust] = useState("");
    const [ ordersByCust, setOrdersByCust] = useState(null);
    const [ choosedRow, setChoosedRow] = useState(null);
    const [ choosedRowItem, setChoosedRowItem] = useState(() =>{
        if(data && data.ro){
            if(data.ro.order?.order_items && data.ro.order?.order_items?.length > 0){
                data.ro.order?.order_items?.map(e => {
                    if(e.return_order_item){
                        e.returnValue = Number(e.return_order_item.quantity);
                        e.reason_id = Number(e.return_order_item.reason_id);
                        e.reason = e.return_order_item.reason;
                    } 
                });
                return data.ro.order.order_items;
            } else {
                return null;
            }
        } else {
            return null;

        }
        // data && data.ro ? data.ro.order?.order_items  : null
    });
    // const [ defaultROItem, setDefaultROItem] = useState(data && data.ro && data.ro.order?.order_items.return_order_item ? data.ro.order?.order_items.return_order_item : null);
    const [ choosedRowProduct, setChoosedRowProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(() => {
        if(data && data.ro){
            if(choosedRowItem){
                let orderItem = [...choosedRowItem];
                if(orderItem.length > 0) {
                    let filteringRO = orderItem.filter(({return_order_item}) => return_order_item !== null);
                    console.log(filteringRO)
                    return filteringRO;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    });
    console.log(data)
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ choosedOrderId, setChoosedOrderId ] = useState([]);
    const [ choosedOrder, setChoosedOrder ] = useState([]);
    const [ returnItem, setReturnItem ] = useState([]);
    const [ showToast, setShowToast ] = useState(false);
    const [ checkAll, setCheckAll ] = useState(false);
    const [ orderSum, setOrderSum ] = useState(null);
    const [ totalRecords, setTotalRecords ] = useState(0);
    const [ qtyVal, setQtyVal ] = useState(0);
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
            return_date: new Date(),
            return_method_id: data.ro.return_method_id,
            status: data.ro.status
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
        await axiosPrivate.get("/sales/cust/available", { params: { 
            id: chooseCust.customer_id, 
        } })
        .then(resp => {
            console.log(resp.data)
            if(resp.data){
                if(resp.data.length > 0){
                    let filteringOrder = resp.data.filter(({return_order_id}) => return_order_id == null);
                    setOrdersByCust(filteringOrder);
                } else {
                    setOrdersByCust(resp.data);

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

    const fetchAddReturnOrder = async(ROModel, ROIModel) => {
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
                            console.log(resp3)
                            if(resp3.data){
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil menambahkan data pengembalian",
                                    life: 3000,
                                });
                                
                                // setTimeout(() => {
                                //     window.location.reload();
                                // },1500)
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
                        console.log(resp4)
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
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal menambahkan data pengembalian",
                life: 3000,
            });
        })
    };

    const fetchDelOrderCredit = async() => {
        await axiosPrivate.delete(`/order-credit/ro?ro_id=${data.id}`)
        .then(resp1 => {
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Berhasil menghapus order kredit!",
                life: 3000,
            });
        })
        .catch(err1 => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Gagal menghapus order kredit",
                life: 3000,
            });
        })
    } 
    
    const fetchInsertOrderCredit = async() => {
        let toDate = data.ro.order.order_date;
        let nextOrderAddOn = {};

        await axiosPrivate.get(`/sales/next?id=${data.ro.customer_id}&order_date=${toDate}`)
        .then(resp1 => {
            nextOrderAddOn.customer_id = data.ro.customer_id;
            nextOrderAddOn.return_order_id = data.ro.return_order_id;
            if(resp1.data.length > 0){
                let placedOrderToRO;

                if(resp1.data.length > 1){
                    let findCurrent = resp1.data.findIndex(({order_id}) => data.ro.order_id == order_id);
                    placedOrderToRO = resp1.data[findCurrent+1];
                    nextOrderAddOn.order_id = placedOrderToRO ? placedOrderToRO.order_id : null;
                    
                } else {
                    nextOrderAddOn.order_id = null;
                }
            } else {
                nextOrderAddOn.order_id = null;
            }

            axiosPrivate.post("/order-credit", JSON.stringify(nextOrderAddOn))
            .then(resp2 => {
                if(resp2.data){
                    console.log(resp2.data);
                    toast.current.show({
                        severity: "success",
                        summary: "Sukses",
                        detail: "Berhasil menambahkan order kredit!",
                        life: 3000,
                    });
                }
            })
            .catch(err2 => {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal menambahkan order kredit!",
                    life: 3000,
                });
            })
        })
        .catch(err1 => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Gagal melakukan request",
                life: 3000,
            });
        })
    }

     const fetchDetailedCust = async(custID) => {
        await axiosPrivate.get(`/customer/detail?custid=${custID}`)
        .then(resp => {
            console.log(resp.data)
            const sales = resp.data.sales ? resp.data.sales[0] : null;
            const debt = resp.data.debt ? resp.data.debt[0] : null;

            const updt_total_sales = (sales && sales.total_sales_grandtotal ? Number(sales.total_sales_grandtotal) : 0) 
            - (sales && sales.return_refund ? Number(sales.return_refund) : 0)
            + (sales && sales.orders_credit_uncanceled ? Number(sales.orders_credit_uncanceled.total) : 0);
            
            const orderBBNotInv = debt && debt.total_debt_grandtotal ? Number(debt.total_debt_grandtotal) : 0;
            const orderReturn = debt && debt.return_refund ? Number(debt.return_refund) : 0;
            const orderPartialRemain = debt && debt.partial_sisa ? Number(debt.partial_sisa.sisa) : 0;
            const orderInvRemain = debt && debt.hutang_invoice ? Number(debt.hutang_invoice.sisa_hutang) : 0;
            const orderCreditUncomplete = debt && debt.orders_credit_uncomplete ? Number(debt.orders_credit_uncomplete.total) : 0;

            const updt_total_debt = (orderBBNotInv+orderPartialRemain+orderInvRemain+orderCreditUncomplete)-orderReturn;
        
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
    
    // console.log(data)
    const fetchUpdateRO = async(ROModel, ROIModel) => {
       
        // delete all ro item
        await axiosPrivate.delete("/ro-item/ro", {params: {
            ro_id: data.id
        }})
        .then(resp1 => {
            if(resp1.data){
                // insert new ro item
                const ROIModelStr = JSON.stringify(ROIModel); 
                axiosPrivate.post("/ro-item", ROIModelStr)
                .then(resp2 => {
                    if(resp2.data){
                        // update ro 
                        const ROModelStr = JSON.stringify(ROModel); 
                        axiosPrivate.put("/ro/update", ROModelStr, {params: {
                            ro_id: data.id
                        }})
                        .then(resp3 => {
                            if(resp3.data){
                                console.log(data.ro.order.invoice)
                                if(data.ro.order.invoice){
                                    const payments = data.ro.order.invoice?.payments?.length > 0 ? data.ro.order.invoice?.payments.reduce((prev, curr) => prev + Number(curr.amount_paid),0) : 0;
                                    let invUpdate = {};
                                    const grandTotal = (Number(data.ro.order.invoice.amount_due) + Number(data.ro.refund_total)) - Number(ROModel.refund_total);
                                    invUpdate = {
                                        subtotal: (Number(data.ro.order.invoice.subtotal) + Number(data.ro.refund_total)) - Number(ROModel.refund_total),
                                        amount_due: grandTotal,
                                        remaining_payment: (grandTotal - payments) <= 0 ? 
                                        0 : (grandTotal - payments),
                                        is_paid: (grandTotal - payments) <= 0 ? true : false,
                                    }
                                    
                                    if(Object.keys(invUpdate).length > 0){
                                        fetchUpdateInv(data.ro.order.invoice.invoice_id, invUpdate);
                                    } else {
                                        console.error("Empty invoice, no invoice update!")
                                    }
                                } else {
                                    // setTimeout(() => {
                                    //     window.location.reload();
                                    // },1500);
                                    fetchDetailedCust(data.items.customer_id);

                                    toast.current.show({
                                        severity: "success",
                                        summary: "Sukses",
                                        detail: "Update pengembalian barang berhasil",
                                        life: 1700,
                                    });
                                }
                            }
                        })
                        .catch(err3 => {
                            toast.current.show({
                                severity: "error",
                                summary: "Gagal",
                                detail: "Gagal update pengembalian barang berhasil",
                                life: 3000,
                            });
                        })
                    }
                })
                .catch(err2 => {
                    toast.current.show({
                        severity: "error",
                        summary: "Gagal",
                        detail: "Gagal update item pengembalian barang",
                        life: 3000,
                    });
                })
            }
        })
        .catch(err1 => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal menghapus item pengembalian barang yg lama",
                life: 3000,
            });
        })
    }

    const fetchUpdateInv = async(invID, invUpdate) => {
        let invUpdateBody = JSON.stringify(invUpdate);
        console.log(data)
        console.log(invID)
        // await axiosPrivate.put("/inv", invUpdateBody, {params: {id: invID}})
        await axiosPrivate.patch("/inv/payment", invUpdateBody, {params: {id: invID}})
        .then(resp => {
            // console.log(resp.data);
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Berhasil memperbarui invoice",
                life: 3000,
            });
            fetchDetailedCust(data.ro.customer_id);
            // setTimeout(() => {
            //     window.location.reload();
            // },1500);

            // toast.current.show({
            //     severity: "success",
            //     summary: "Sukses",
            //     detail: "Update pengembalian barang berhasil",
            //     life: 1700,
            // });
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
    console.log(data)
    const onSubmit = async (formData) => {
        let roItemModel = [];
        let returnOrderModel = {
            ...formData,
        }
        let refundTotal = 0;
        selectedProducts?.map(product => {
            returnOrderModel.order_id = product.order_id;
            refundTotal += (Number(product.returnValue) * Number(product.sell_price)) - (Number(product.returnValue) * Number(product.discount_prod_rec));
            
            let returnOrderItem = {
                return_order_id: data.id,
                item_id: product.item_id,
                quantity: product.returnValue,
                return_value: (Number(product.returnValue) * Number(product.sell_price)) - (Number(product.returnValue) * Number(product.discount_prod_rec)),
                return_item_status: 'pengecekan',
                reason_id: product.reason_id,
                reason: product.reason
            };
            roItemModel.push(returnOrderItem);
        });
        returnOrderModel.refund_total = refundTotal;

         //do what based on selected return method 
        await axiosPrivate.get(`/orders-credit/ro/${data.id}`)
        .then(resp => {
            if(resp.data){
                if(formData.return_method_id == 2) {
                    // hapus order kredit
                    fetchDelOrderCredit();
                }
            } else {
                if(formData.return_method_id == 3){
                    fetchInsertOrderCredit();
                } 
            }
        })
        .catch(err => {
            console.error("checking order credit before update RO error")
        })

        fetchUpdateRO(returnOrderModel, roItemModel);
        
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
    //     }fonSa
    // },[ordersByCust])
    const handleClickRow = (rowData) => {
        let dupeOrderItem = [...rowData.order.order_items];
        let dupeROItem = {...rowData.return_order_item};

        setChoosedRow(rowData);
        rowData?.order_items?.map(e => {
            e.returnValue = 0;
            e.reason = null;
        })
        setValue('is_paid', rowData.invoice.is_paid);

        // filtering return order_item & order_item
        let matchedItem = dupeOrderItem.filter(({product_id}) => dupeROItem.product_id === product_id);
        if(matchedItem.length > 0){
            setChoosedRowItem(rowData.order_items);

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
            <p key={options.rowIndex} style={{marginBottom:  0}}>{!rowData.reason ? rowData.return_order_item?.reason ? rowData.return_order_item?.reason : '' :rowData.reason}</p>
        </>
       )
    };
    const selectOptEditor = (options) => {
        return(
            <>
            {options.rowData.return_order_item ?
                <InputWSelect
                    name="reason"
                    // position={choosedRowItem.length - 1 > 1 ? row.rowIndex == choosedRowItem.length - 1 ? "top" : "bottom" : "bottom"}
                    selectLabel="Pilih alasan pengembalian"
                    options={dataStatic.returnReasonList}
                    optionKeys={["id", "type"]}
                    defaultValue={options.rowData.return_order_item.reason_id}
                    defaultValueKey={'id'}
                    value={(selected) => {
                        options.rowData.reason = selected.value;
                        options.rowData.reason_id = selected.id;
                    }}
                    onChange={(e) => options.editorCallback(e.value)}
                />
                :<InputWSelect
                    name="reason"
                    // position={choosedRowItem.length - 1 > 1 ? row.rowIndex == choosedRowItem.length - 1 ? "top" : "bottom" : "bottom"}
                    selectLabel="Pilih alasan pengembalian"
                    options={dataStatic.returnReasonList}
                    optionKeys={["id", "type"]}
                    value={(selected) => {
                        options.rowData.reason = selected.value;
                        options.rowData.reason_id = selected.id;
                    }}
                    onChange={(e) => options.editorCallback(e.value)}
                />
            }
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
        console.log(rowData)
        return(
            rowData.returnValue ?
                <p key={options.rowIndex} style={{marginBottom:0}}>{Number(rowData.returnValue)}</p>
            : <p key={options.rowIndex} style={{marginBottom:0}}>{''}</p>
        )
    };

    const qtyEditor = (options) => {
        return(
            <QtyButton 
                min={1} max={Number(options.rowData.quantity)} name={`qty-product`} width={"180px"} 
                value={options.rowData.returnValue ? options.rowData.returnValue.toString() : qtyVal} 
                returnValue={(e) => {setQtyVal(e);options.rowData.returnValue = e}}
                onChange={(e) => {options.editorCallback(e.value);console.log(e)}} 
            />
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
        let selectedProductsDupe = [...selectedProducts];

        _products[index] = newData;
        // update selected product
        _products.forEach(productEdited => {
            selectedProductsDupe.forEach((selected, index) => {
                if(selected.item_id == productEdited.item_id){
                    selectedProductsDupe[index] = productEdited;
                }
            })
        })
        setSelectedProducts(selectedProductsDupe);
        setChoosedRowItem(_products);
        onEditing(false);
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
                                register={register}
                                require={false}
                                checked={selectedProducts.find(({item_id}) => rowData.item_id == item_id ? true : false)}
                            />
                            <div className='flex flex-column' style={{width: '80%'}}>
                                <div className='mb-1'>
                                    <p style={{marginBottom: 0, fontSize: 14, fontWeight: 600, maxWidth: '100px'}}>{`${rowData.product.product_name}`}</p>
                                    <p style={{marginBottom: 0, fontSize: 11, color: '#7d8086', maxWidth: '100px'}}>
                                        {`Variant: ${rowData.product.variant}`}
                                    </p>
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
                                    // selected.value != null ? setReasonVal(true):setReasonVal(false);
                                }}
                                defaultValue={rowData.reason_id}
                                defaultValueKey={'id'}
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

    useEffect(() => {
        if(chooseCust && chooseCust != ""){
            setChoosedOrder([]);
            setCheckAll(false);
            fetchSalesbyCust();
        }
    },[chooseCust]);

    useEffect(() => {
        console.log(returnItem)
    },[returnItem])
    
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
    console.log(isMobile)
    console.log(isMediumScr)

    return(
        <>
        <Modal dialogClassName={`${isMobile || isMediumScr ? 'modal-fullscreen' : 'modal-70w'}`} show={show} onHide={onHide} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>Ubah pengembalian barang</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{height: '100%'}}>
                <form className="row gy-3 mb-4">
                    {/* <div className="col-lg-3 col-sm-6 col-md-6 col-6">
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
                    </div> */}
                    <div className="col-lg-4 col-sm-12 col-md-4 col-12">
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
                    <div className="col-lg-4 col-sm-12 col-md-4 col-12">
                        <InputWSelect
                            label={'metode pengembalian'}
                            name="return_method"
                            selectLabel="Pilih metode pengembalian"
                            options={getValues('is_paid') ? dataStatic.returnMethodWPaidStatus : dataStatic.returnMethod}
                            optionKeys={["id", "type"]}
                            defaultValue={getValues('return_method_id')}
                            defaultValueKey={'id'}
                            value={(selected) => {
                                setValue('return_method', selected.value);
                                setValue('return_method_id', selected.id);
                                selected.value != "" ? clearErrors("return_method") : null;
                            }}
                            require={true}
                            register={register}
                            errors={errors}
                           
                        />
                    </div>
                    <div className="col-lg-4 col-sm-12 col-md-4 col-12">
                        <InputWSelect
                            label={'Status pengembalian'}
                            name="status"
                            selectLabel="Pilih status pengembalian"
                            options={dataStatic.returnOrderStatus}
                            optionKeys={["id", "type"]}
                            defaultValue={getValues('status')}
                            defaultValueKey={'type'}
                            value={(selected) => {
                                setValue('status', selected.value);
                                selected.value != "" ? clearErrors("status") : null;
                            }}
                            require={true}
                            register={register}
                            errors={errors}
                        />
                    </div>
                
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
                                    <tr style={{textTransform: 'capitalize'}}> 
                                        <td>
                                            {data.ro.order?.order_id}
                                        </td>
                                        <td>{ConvertDate.convertToFullDate(data.ro.order?.order_date, "/")}</td>
                                        <td>{data.ro.customer?.customer_id}</td>
                                        <td className="data-img">
                                            {data.ro.customer?.name}
                                        </td>
                                        <td>{data.ro.order?.order_type}</td>
                                        <td>
                                            {
                                            <NumberFormat intlConfig={{
                                                value: data.ro.order?.grandtotal, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                                }} 
                                            />
                                            }
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                data.ro.order?.order_status == "completed" ? 'success'
                                                : data.ro.order?.order_status == "pending" ? "secondary" 
                                                : data.ro.order?.order_status == "in-delivery" ? "warning" 
                                                : data.ro.order?.order_status == "canceled" ? "danger" 
                                                : data.ro.order?.order_status == "confirmed" ? "primary" 
                                                : ""} light`}
                                            >
                                                {
                                                    data.ro.orderRow?.order_status == "completed" ? 'selesai'
                                                    : data.ro.order?.order_status == "pending" ? 'pending'
                                                    : data.ro.order?.order_status == "in-delivery" ? 'in-delivery'
                                                    : data.ro.order?.order_status == "canceled" ? 'batal'
                                                    : data.ro.order?.order_status == "confirmed" ? 'dikonfirmasi'
                                                    : ""
                                                }                                                                                
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${
                                                data.ro.order?.payment_type == "bayar nanti" ? 'danger'
                                                : data.ro.order?.payment_type == "lunas"? "primary"
                                                : data.ro.order?.payment_type == "sebagian"? "warning"
                                                : ""} light`}
                                            >
                                                {data.ro.order?.payment_type }                                                                                
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>    
                    
                    {!isMobile && !isMediumScr ? 
                    (
                    <div className="card card-table static-shadow" style={{minHeight: 400}}>
                        <p className="card-title mb-3">pilih Pengembalian Produk</p>
                        <DataTable
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
                                setSelectedProducts(e.value); 
                            }} 
                            isDataSelectable={isRowSelectable}
                            scrollable={false}
                            editMode="row"
                            onRowEditInit={(e) => {onEditing(true)}}
                            onRowEditCancel={(e) => {onEditing(false)}}
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
                                bodyStyle={{ textTransform: "capitalize" }}
                            ></Column>
                            <Column
                                field="quantity"
                                header="kuantitas"
                                body={returnQty}
                                editor={(options) => qtyEditor(options)}
                                style={{ textTransform: "uppercase" }}
                            ></Column>
                            <Column rowEditor={true} headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
                        </DataTable>
                    </div>
                    ):(
                    <DataView value={choosedRowItem} listTemplate={orderListTemplate} emptyMessage=' '></DataView>
                    )}

                </div>
                 {/* ):''} */}
                 </form>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>batal</button>
                <button type="button" className="btn btn-primary" disabled={selectedProducts && selectedProducts.length > 0 ? !editing ? false : true : true} onClick={handleSubmit(onSubmit,onError)}>simpan</button>
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