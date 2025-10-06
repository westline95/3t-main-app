import React, { useEffect, useState, useRef } from 'react';
import { Modal, 
    // Toast, ToastContainer 
} from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import propTypes from "prop-types";

import User from "../../assets/images/Avatar 1.jpg";
import DangerImg from "../../assets/images/danger.png";
import WarningImg from "../../assets/images/warning.png";
import InfoImg from "../../assets/images/info.png";
import SuccessImg from "../../assets/images/success.png";
import FetchApi from "../../assets/js/fetchApi.js";
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';

export default function ConfirmModal({show, onHide, multiple, data, stack, msg, returnValue, resetControl}) {
    const [ showToast, setShowToast ] = useState(false);
    const [ continueCancel, setContinueCancel ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const toast = useRef(null);
    const toastUpload = useRef(null);
    const [progress, setProgress] = useState(0);
    const axiosPrivate = useAxiosPrivate();

    // const handleValue = () => {
    //     return props.returnValue(props.data.id);
    // }

    const fetchDelCust = async () => {
        if(data.id.length !== 0) {
            let params;
            if(data.id.length > 1){
                params = data.id.join("&id=");
            } else {
                params = data.id[0];
            }
            await axiosPrivate.delete(`/customers?id=${params}`)
                .then(response => {
                    setToastContent({variant:"success", msg: "Delete success"});
                    setShowToast(true);
                    setTimeout(() => {
                        window.location.reload();
                    },1200)
                })
                .catch(error => {
                    setToastContent({variant:"danger", msg: "Delete failed!"});
                    setShowToast(true);
                }
            )
        }
    }

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

    const fetchUpdateCust = async (custData) => {
        if(custData) {
            let dupe = {...custData};
            delete dupe["id"];
            let body = JSON.stringify(dupe);

            await axiosPrivate
            .put("/customers", body, {
                params: {
                    id:data.id
                },
            })
            .then((response) => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Sucessfully update customer",
                    life: 3000,
                });
                setTimeout(() => {
                    window.location.reload();
                },1200)
            })
            .catch((error) => {
                toast.current.show({
                    severity: "danger",
                    summary: "Failed",
                    detail: "Failed to update customer",
                    life: 3000,
                });
                resetControl();
            });
        } else {
            toast.current.show({
                severity: "danger",
                summary: "Failed",
                detail: "Customer data error",
                life: 3000,
            });
            resetControl();
        }   
    };

    const handleUpdateCust = async () => {
        if (data.data.img && typeof data.data.img != "string") {
            const imgFile = data.data.img[0];
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
                    let newFormData = {
                        ...data.data,
                        img: res.data,
                    };
                    setProgress(100);
                    toastUpload.current.clear();
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Sucessfully upload image",
                        life: 3000,
                    });
                    fetchUpdateCust(newFormData);
                })
                .catch((err) => {
                    setProgress(0);
                    toast.current.show({
                        severity: "danger",
                        summary: "Failed",
                        detail: "Failed to upload image",
                        life: 3000,
                    });
                });
        } else {
            fetchUpdateCust(data.data);
        }
    }

    const fetchInsertCustType = async () => {
        await axiosPrivate
        .put("/type/write", body)
            .then(response => {
                setToastContent({variant:"success", msg: "Successfully add new data"});
                setShowToast(true);
                setTimeout(() => {
                    window.location.reload();
                },1200)
            })
            .catch(error => {
                setToastContent({variant:"danger", msg: "Update failed"});
                setShowToast(true);
            }
        )
        
    }

    const fetchDelCustType = async () => {
        if(data.id && data.id != "") {
            await axiosPrivate.delete("/type", {params: {id: data.id}})
                .then(data => {
                    setToastContent({variant:"success", msg: "Delete success"});
                    setShowToast(true);
                    setTimeout(() => {
                        window.location.reload();
                    },1200)
                })
                .catch(error => {
                    setToastContent({variant:"danger", msg: "Delete failed!"});
                    setShowToast(true);
                }
            )
        }
    };

    const updateTotalSalesCust = async(currentOrderData, oldData) => {
        await axiosPrivate.get("/customers/member", {params: { id: currentOrderData.customer_id }})
        .then((resp1) => {
            if(resp1.data){
                let updatedTotalDebt,updatedTotalOrder;
                if(data.action === "canceled"){
                    currentOrderData.payment_type == "bayar nanti" || currentOrderData.payment_type == "sebagian" && !currentOrderData.is_complete ? 
                        updatedTotalDebt = Number(resp1.data.total_debt)-Number(currentOrderData.grandtotal) 
                    : updatedTotalDebt=null;

                    updatedTotalOrder = Number(resp1.data.total_sales)-Number(currentOrderData.grandtotal);
                } else if(data.action === "update"){
                    if(oldData){
                        console.log(currentOrderData)
                        if(oldData.payment_type == "bayar nanti" || oldData.payment_type == "sebagian"){
                            updatedTotalOrder = Number(resp1.data.total_sales)-Math.abs(Number(currentOrderData.grandtotal)-Number(oldData.grandtotal));
                            if(oldData.invoice?.payments?.length > 0){
                                const paymentTotal = oldData.invoice.payments.reduce((prev, curr) => prev + Number(curr.amount_paid), 0);
                                updatedTotalDebt = ((Number(resp1.data.total_debt)-Number(oldData.grandtotal)) + Number(currentOrderData.grandtotal)) - paymentTotal <= 0 ? 0 :
                                ((Number(resp1.data.total_debt)-Number(oldData.grandtotal)) + Number(currentOrderData.grandtotal)) - paymentTotal; 
                                
                            } else {
                                updatedTotalDebt = Number(resp1.data.total_debt)-Number(currentOrderData.grandtotal);
                            }
                        } else {
                            updatedTotalDebt = null;
                        }
                    }
                }

                axiosPrivate.patch(`/customer/sales/${resp1.data.customer_id}/${updatedTotalOrder}`)
                .then(resp2 => {
                    console.log("jhh")
                    if(updatedTotalDebt != null || updatedTotalDebt != undefined){
                    // if(currentOrderData.payment_type == "unpaid"){
                        axiosPrivate.patch(`/customer/debt/${resp1.data.customer_id}/${updatedTotalDebt}`)
                        .then(resp3 => {
                            // setTimeout(() => {
                            //     window.location.reload();
                            // },1200);
                            toast.current.show({
                                severity: "success",
                                summary: "Sukses",
                                detail: `Data pelanggan diperbarui!`,
                                life: 1700,
                            });
                        })
                        .catch(err3 => {
                            console.error("Failed to update total debt");
                        })
                    
                    
                    } else {
                        // setTimeout(() => {
                        //     window.location.reload();
                        // },1200);
                        toast.current.show({
                            severity: "success",
                            summary: "Sukses",
                            detail: `Data pelanggan diperbarui!`,
                            life: 1700,
                        });
                    }

                })
                .catch(err2 => {
                    console.error("Failed to update total sales");
                })
            }
        })
        .catch(err1 => {
            if(err1.response.status === 404){
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: `Update detail customer failed, because customer id is not found!`,
                    life: 3000,
                });
            }
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
   
    
    const handleROAndOrderCredit = async () => {
        // checking order credit
        if(data.items.return_order_id && data.items.orders_credit){
            console.log("return order & order credit")
            await axiosPrivate.delete(`/order-credit/ro?ro_id=${data.items.return_order_id}`)
            .then(() => {
                // delete RO
                axiosPrivate.delete(`/ro?id=${data.items.return_order_id}`)
                .then(() => {
                    //update roID in order to null
                    let roIDNull = JSON.stringify({return_order_id: null});
                    axiosPrivate.patch(`/sales/update/ro/${data.items.order_id}`, roIDNull)
                    .then(() => {
                        // delete ROITEM
                        axiosPrivate.delete(`/ro-item/ro?ro_id=${data.items.return_order_id}`)
                        .then(() => {
                            // // unlink order credit
                            let orderIDNull = JSON.stringify({order_id: null});
                            axiosPrivate.patch(`/order-credit/${data.items.orders_credit.order_credit_id}`,orderIDNull)
                            .then(() => {
                                
                                console.log("sampe sini")
                                setContinueCancel(true);
                            })  
                            .catch(err5 => {
                                console.error("gagal men-null kan order kredit!")
                                setContinueCancel(false);
                            })
                        })  
                        .catch(err4 => {
                            console.error("gagal menghapus return order items!")
                             setContinueCancel(false);
                        })
                    })
                    .catch((err3) => {
                        console.error("gagal men-nullkan return order id!")
                         setContinueCancel(false);
                    })
                })  
                .catch(err2 => {
                    console.error("gagal menghapus return order!")
                     setContinueCancel(false);
                })

            })  
            .catch(err1 => {
                console.error("gagal menghapus kan order kredit!")
                 setContinueCancel(false);
            })
        } else {
            if(data.items.orders_credit){
                console.log("order credit")
                let orderIDNull = JSON.stringify({order_id: null});
                await axiosPrivate.patch(`/order-credit/${data.items.orders_credit.order_credit_id}`,orderIDNull)
                .then(() => {
                    setContinueCancel(true);
                })  
                .catch(err => {
                    console.error("gagal men-null kan order kredit!")
                    setContinueCancel(false);
                })
    
            } else if(data.items.return_order_id){
                console.log("return order")
                await axiosPrivate.delete(`/order-credit/ro?ro_id=${data.items.return_order_id}`)
                .then(() => {
                    // delete RO
                    axiosPrivate.delete(`/ro?id=${data.items.return_order_id}`)
                    .then(() => {
                        //update roID in order to null
                        let roIDNull = JSON.stringify({return_order_id: null});
                        axiosPrivate.patch(`/sales/update/ro/${data.items.order_id}`, roIDNull)
                        .then(() => {
                            // delete ROITEM
                            axiosPrivate.delete(`/ro-item/ro?ro_id=${data.items.return_order_id}`)
                            .then(() => {
                                setContinueCancel(true);
                            })  
                            .catch(err4 => {
                                console.error("gagal menghapus return order items!")
                                setContinueCancel(false);
                            })
                        })
                        .catch((err3) => {
                            console.error("gagal men-nullkan return order id!")
                            setContinueCancel(false);
                        })
                    })  
                    .catch(err2 => {
                        console.error("gagal menghapus return order!")
                        setContinueCancel(false);
                    })

                })  
                .catch(err1 => {
                    console.error("gagal menghapus kan order kredit!")
                    setContinueCancel(false);
                })
                // await axiosPrivate.delete(`/order-credit/ro?ro_id=${data.items.return_order_id}`)
                // .then(() => {
                //     // delete RO
                //     axiosPrivate.delete(`/ro?id=${data.items.return_order_id}`)
                //     .then(() => {
                //         // delete ROITEM
                //         axiosPrivate.delete(`/ro-item/ro?ro_id=${data.items.return_order_id}`)
                //         .then(() => {
                //             cancelSales2();
                //         })  
                //         .catch(err3 => {
                //             console.error("gagal menghapus return order items!")
                //         })
                        
                //     })  
                //     .catch(err2 => {
                //         console.error("gagal menghapus return order!")
                //     })

                // })  
                // .catch(err1 => {
                //     console.error("gagal menghapus kan order kredit!")
                // })
            } else {
                console.log("none")
                setContinueCancel(true);
            }

        }
    };
    console.log(data)

    const cancelSales = async () => {
        handleROAndOrderCredit();
    }; 

    useEffect(() => {
        if(continueCancel){
            console.log(data)
            // let tes = JSON.parse("[\"1099428398817902593\",\"1099431095945560065\",\"1099432000028672001\"]");
            // tes.splice(tes.indexOf(data.id), 1);
            // console.log(tes)
            if(!data.items.invoice_id){
                    // let handleROcredit = handleROAndOrderCredit();
                // if(continueCancel == true){
                    let body = JSON.stringify({order_status: 'canceled', is_complete: false});
                    axiosPrivate.patch("/sales/update/status",body, {params: {id: data.id}})
                    .then(() => {
                        toast.current.show({
                            severity: "success",
                            summary: "Sukses",
                            detail: "Berhasil membatalkan order",
                            life: 1500,
                        });
    
                        if(data.items?.delivery){
                            if(data.items.delivery.delivery_status !== "delivered"){
                                let delivBody = JSON.stringify({delivery_status: 'canceled'});
                                axiosPrivate.patch(`/delivery/status/${data.items.delivery.delivery_id}`, delivBody)
                                .then(() => {
                                    toast.current.show({
                                        severity: "success",
                                        summary: "Sukses",
                                        detail: "Berhasil membatalkan pengiriman",
                                        life: 1500,
                                    });
                
                                    // setTimeout(() => {
                                    //     window.location.reload();
                                    // },1500);
                                    // updateTotalSalesCust(data.items);
                                    fetchDetailedCust(data.items.customer_id);
                                })
                                .catch(error => {
                                    toast.current.show({
                                        severity: "error",
                                        summary: "Gagal",
                                        detail: "Gagal membatalkan pengiriman!",
                                        life: 3000,
                                    });
                                })   
                            } else {
                                // updateTotalSalesCust(data.items);
                                fetchDetailedCust(data.items.customer_id);
                                // setTimeout(() => {
                                //     window.location.reload();
                                // },1500);
                            }
                        } else {
                            // updateTotalSalesCust(data.items);
                            fetchDetailedCust(data.items.customer_id);
                            // setTimeout(() => {
                            //     window.location.reload();
                            // },1500);
                        }
    
                        // if(data.items.payment_type == "unpaid"  && !data.items.is_complete){
                        //     const currTotalDebt = Number(data.items?.customer?.total_debt);
                        //     const newTotalDebt = (currTotalDebt - Number(data.item.grandtotal)) <= 0 ? 0 : (currTotalDebt - Number(data.item.grandtotal));
                        //     const updtTotalDebt = JSON.stringify({total_debt: newTotalDebt});
    
                        //     axiosPrivate.patch(`/customer/debt/${data.item.customer_id}/${Number(data.item.grandtotal)}`,updtTotalDebt)
                        //     .catch(() => {
                        //         console.error("error: update debt cust");
                        //     })
                        // } 
                        // else if(data.items.payment_type == "partial"  && !data.items.is_complete) {
    
                        // }
                    })
                    .catch(error => {
                        toast.current.show({
                            severity: "error",
                            summary: "Gagal",
                            detail: "Gagal mengupdate order!",
                            life: 3000,
                        });
                    })     
    
                // }
            } else {
                const parsedOrderIds = JSON.parse(data.items.invoice?.order_id);
                if(parsedOrderIds.length > 1){
                    // let handleROcredit = handleROAndOrderCredit();
    
                    // if(continueCancel == true){
                        let body = JSON.stringify({order_status: "canceled", is_complete: false});
                        axiosPrivate.patch(`/sales/update/status?id=${data.id}`, body)
                        .then((resp1) => {
                            if(resp1.data.length > 1 && resp1.data[0] > 0){
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil Mengupdate data order",
                                    life: 3000,
                                });
    
                                // check if order type is delivery
                                if(data.items?.delivery){
                                    if(data.items.delivery.delivery_status !== "delivered"){
                                        let delivBody = JSON.stringify({delivery_status: 'canceled'});

                                        axiosPrivate.patch(`/delivery/status/${data.items.delivery.delivery_id}`, delivBody)
                                        .then(() => {
                                            toast.current.show({
                                                severity: "success",
                                                summary: "Sukses",
                                                detail: "Berhasil membatalkan pengiriman",
                                                life: 1500,
                                            });
                                        })
                                        .catch(error => {
                                            toast.current.show({
                                                severity: "error",
                                                summary: "Gagal",
                                                detail: "Gagal membatalkan pengiriman!",
                                                life: 3000,
                                            });
                                        })
                                    }   
                                    
                                } 
            
                                let getIndex = parsedOrderIds.indexOf(data.id);
                                if (getIndex >= 0) {
                                    parsedOrderIds.splice(getIndex, 1);
                                }
            
                                // update invoice
                                let oldInv = {
                                    ...data.items.invoice
                                };
                                delete oldInv.invoice_id;
            
                                let newInvModel = {
                                    // ...oldInv,
                                    order_id: JSON.stringify(parsedOrderIds),
                                    subtotal: data.items.invoice.subtotal - data.items.subtotal,
                                    amount_due: data.items.invoice.amount_due - data.items.grandtotal,
                                    remaining_payment: data.items.invoice.remaining_payment - data.items.grandtotal,
                                    total_discount: data.items.invoice.total_discount - data.items.order_discount,
                                };
                                
                                newInvModel.is_paid = newInvModel.remaining_payment <= 0 ? true:false;
                                console.log(newInvModel)
                                let toStr = JSON.stringify(newInvModel);
                                axiosPrivate.patch("/inv/payment", toStr, {params: {id: data.items.invoice.invoice_id}})
                                .then(res2 => {
                                    toast.current.show({
                                        severity: "success",
                                        summary: "Sukses",
                                        detail: "Berhasil Mengupdate invoice",
                                        life: 1500,
                                    });
    
                                    fetchDetailedCust(data.items.customer_id);
                                    // updateTotalSalesCust(data.items);
    
                                    // setTimeout(() => {
                                    //     window.location.reload();
                                    // },1500);
                                    
                                }) 
                                .catch(error2 => {
                                    toast.current.show({
                                        severity: "error",
                                        summary: "Gagal",
                                        detail: "Gagal mengupdate invoice!",
                                        life: 3000,
                                    });
                                    // undo update order_status
                                    body = JSON.stringify({
                                        order_status: data.items.order_status, 
                                        is_complete: data.items.order_status != "completed" ? false : true
                                    });
                                    axiosPrivate.patch(`/sales/update/status?id=${data.id}`, body);
                                })
                            } else {
                                console.error("no row affected");
                            }
                        })
                        .catch(error1 => {
                            console.log(error1)
                            toast.current.show({
                                severity: "error",
                                summary: "Gagal",
                                detail: "Gagal mengupdate order!",
                                life: 3000,
                            });
                        })
                    // }
                }  
                else {
                    if(data.items.invoice?.payments?.length > 0){
                        console.error("minimal 1 order pada invoice dan terdapat pembayaran invoice")
                        return returnValue(true);
                        // coming soon => control return payment customer either by credit or cash
                        
                        // await axiosPrivate.patch(`/customer/${data.items.customer_id}/credit`, )
                        // .then((resp1) => {
                        //     if(resp1.data.length > 0 && resp1.data[0] > 0){
                        //         // check if order type is delivery
                        //         if(data.items?.delivery){
                        //             if(data.items.delivery.delivery_status !== "delivered"){
                        //                 let delivBody = JSON.stringify({delivery_status: 'canceled'});
                        //                 axiosPrivate.patch(`/delivery/status/${data.items.delivery.delivery_id}`, delivBody)
                        //                 .then(() => {
                        //                     toast.current.show({
                        //                         severity: "success",
                        //                         summary: "Sukses",
                        //                         detail: "Berhasil membatalkan pengiriman",
                        //                         life: 1500,
                        //                     });
                        //                 })
                        //                 .catch(error => {
                        //                     toast.current.show({
                        //                         severity: "error",
                        //                         summary: "Gagal",
                        //                         detail: "Gagal membatalkan pengiriman!",
                        //                         life: 3000,
                        //                     });
                        //                 })
                        //             }   
                                    
                        //         } 
    
                        //         axiosPrivate.patch("/inv/status",invBody, {params: {id: data.items.invoice.invoice_id}})
                        //         .then((resp2) => {
                        //             toast.current.show({
                        //                 severity: "success",
                        //                 summary: "Success",
                        //                 detail: "Order updated",
                        //                 life: 3000,
                        //             });
                                    
                        //             setTimeout(() => {
                        //                 window.location.reload();
                        //             },1200)
                        //         })
                        //         .catch(error2 => {
                        //             toast.current.show({
                        //                 severity: "error",
                        //                 summary: "Failed",
                        //                 detail: "Failure for update sales",
                        //                 life: 3000,
                        //             });
        
                        //             // undo update order_status bcs failed to update invoice
                        //             axiosPrivate.patch("/sales/update/status", salesBodyUndo, {params: {id: data.id}})
                        //             .then((resp1) => {
                                        
                        //             })
                        //             .catch(error2 => {
                        //                 toast.current.show({
                        //                     severity: "error",
                        //                     summary: "Failed",
                        //                     detail: "Fatal error update order",
                        //                     life: 3000,
                        //                 });
                        //             })
                        //         })
        
                        //     }
                        // })
                        // .catch(error1 => {
                        //     toast.current.show({
                        //         severity: "error",
                        //         summary: "Failed",
                        //         detail: "Failed to update order",
                        //         life: 3000,
                        //     });
                            
                        // })
                    } else {
                        // let handleROcredit = handleROAndOrderCredit();
    
                        // if(continueCancel == true){
                            // canceled order and update invoice:status = canceled
                            let salesBodyUpdate = JSON.stringify({order_status: "canceled", is_complete: false});
                            let salesBodyUndo = JSON.stringify({
                                order_status: data.items.order_status,
                                is_complete: data.items.order_status != "completed" ? false : true
                            });
                            let invBody = JSON.stringify({status: "canceled"});
                            axiosPrivate.patch(`/sales/update/status?id=${data.id}`, salesBodyUpdate)
                            .then((resp1) => {
                                if(resp1.data.length > 0 && resp1.data[0] > 0){
                                    // check if order type is delivery
                                    if(data.items?.delivery){
                                        if(data.items.delivery.delivery_status !== "delivered"){
                                            let delivBody = JSON.stringify({delivery_status: 'canceled'});
                                            axiosPrivate.patch(`/delivery/status/${data.items.delivery.delivery_id}`, delivBody)
                                            .then(() => {
                                                toast.current.show({
                                                    severity: "success",
                                                    summary: "Sukses",
                                                    detail: "Berhasil membatalkan pengiriman",
                                                    life: 1500,
                                                });
                                            })
                                            .catch(error => {
                                                toast.current.show({
                                                    severity: "error",
                                                    summary: "Gagal",
                                                    detail: "Gagal membatalkan pengiriman!",
                                                    life: 3000,
                                                });
                                            })
                                        }   
                                        
                                    } 
        
                                    axiosPrivate.patch("/inv/status",invBody, {params: {id: data.items.invoice.invoice_id}})
                                    .then((resp2) => {
                                        toast.current.show({
                                            severity: "success",
                                            summary: "Success",
                                            detail: "Order updated",
                                            life: 3000,
                                        });
                                        
                                            // updateTotalSalesCust(data.items);
                                            fetchDetailedCust(data.items.customer_id);
                                        // setTimeout(() => {
                                        //     window.location.reload();
                                        // },1200)
                                    })
                                    .catch(error2 => {
                                        toast.current.show({
                                            severity: "error",
                                            summary: "Failed",
                                            detail: "Failure for update sales",
                                            life: 3000,
                                        });
            
                                        // undo update order_status bcs failed to update invoice
                                        axiosPrivate.patch("/sales/update/status", salesBodyUndo, {params: {id: data.id}})
                                        .then((resp1) => {
                                            
                                        })
                                        .catch(error2 => {
                                            toast.current.show({
                                                severity: "error",
                                                summary: "Failed",
                                                detail: "Fatal error update order",
                                                life: 3000,
                                            });
                                        })
                                    })
            
                                }
                            })
                            .catch(error1 => {
                                toast.current.show({
                                    severity: "error",
                                    summary: "Failed",
                                    detail: "Failed to update order",
                                    life: 3000,
                                });
                                
                            })
    
                        // }
    
                    }
                }
            }
        }
    },[continueCancel])

    const fetchInsertMultipleOrderItem = async (body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/order-item/writes", bodyData)
        .then(res => {
            if(res.data){
                
                if(data.data && data.data.order){
                    let body = JSON.stringify(data.data.order);

                    axiosPrivate.patch(`/sales/update-minor/${data.id}`, body )
                    .then(resp => {
                        if(resp.data){
                            
                            

                            if(data.old_data.invoice){
                                const getTotalPayment = data.old_data.invoice?.payments ? data.old_data.invoice.payments.reduce((prevValue, currValue) => Number(prevValue) + Number(currValue.amount_paid),0) : 0;
                                const totalDisc = Number(data.old_data.invoice.total_discount) == 0 ? (Number(data.old_data.invoice.total_discount) + Number(data.data.order.order_discount)) : ((Number(data.old_data.invoice.total_discount) - Number(data.old_data.order_discount)) + Number(data.data.order.order_discount));
                                const subtotal = (Number(data.old_data.invoice.subtotal) - Number(data.old_data.subtotal) + Number(data.data.order.subtotal));
                                const amount_due = ((Number(data.old_data.grandtotal) - Number(data.old_data.invoice.amount_due)) + (subtotal-totalDisc));

                                let forInvoiceUpdate = {
                                    total_discount: totalDisc,
                                    subtotal: subtotal,
                                    amount_due: amount_due,
                                    remaining_payment: amount_due - getTotalPayment,
                                    is_paid: (amount_due - getTotalPayment) <= 0 ? true : false
                                }
    
                                const invBody = JSON.stringify(forInvoiceUpdate);
    
                                axiosPrivate.patch(`/inv/payment?id=${data.old_data.invoice_id}`, invBody )
                                .then(resp2 => {
                                    // updateTotalSalesCust(data.data.order, data.old_data);

                                    if(forInvoiceUpdate.is_paid){
                                        const orderIDs = JSON.parse(data.old_data.invoice.order_id);
                                        let updateOrderIDs;
                                        if(orderIDs.length > 1){
                                           updateOrderIDs = orderIDs.join("&id=");
                                        } else {
                                            updateOrderIDs = orderIDs[0];
                                        }

                                        let status = JSON.stringify({order_status: 'completed', is_complete: true});
                                        axiosPrivate.patch(`/sales/update/status?id=${updateOrderIDs}`, status)
                                        .then(() => {
                                            toast.current.show({
                                                severity: "success",
                                                summary: "Sukses",
                                                detail: "Berhasil memeperbarui data!",
                                                life:1200,
                                            });
                                        })
                                        .catch(() => {
                                            console.error("failed to update sales => order_status")
                                        })
                                    } else {
                                        toast.current.show({
                                            severity: "success",
                                            summary: "Sukses",
                                            detail: "Berhasil memeperbarui data!",
                                            life:1200,
                                        });
                                    }
                                    
                                   
                                })
                                .catch(err2 => {
                                    console.error(err2)
                                })
                                
                            } else {
                                // updateTotalSalesCust(data.data.order, data.old_data);
                                
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil memperbarui data!",
                                    life:1200,
                                });
                            }

                            // console.log("sinsnisn")
                            fetchDetailedCust(data.old_data.customer_id);

                        }
                    })
                    .catch(error => {
                        toast.current.show({
                            severity: "error",
                            summary: "Gagal",
                            detail: "Gagal memeperbarui data!",
                            life: 3000,
                        });
                        console.log(error)
                    })
                }
            }
        })
        .catch(error => {
            setAddOrderItem(false);
            setToastContent({variant:"danger", msg: "Failed to add order items!"});
            setShowToast(true);
        })
    };

    const fetchDelOrderItem = async () => {
        // console.log(data)
        if(data.id && data.id != "") {
            await axiosPrivate.delete("/order-item/order", { params: {id: data.id} })
            // FetchApi.fetchDelOrderItem(data.id)
                .then(res => {
                    // console.log(data)
                    if(res.data){
                        if(data.data && data.data.order_items){
                            // console.log("1")
                            // console.log("1sdiasdawsd")
                            fetchInsertMultipleOrderItem(data.data.order_items);
                        } else {
                            // console.log("2sdiasdawsd")

                            // updateTotalSalesCust(data.data.order, data.old_data);
                            fetchDetailedCust(data.old_data.customer_id);
                           
                            toast.current.show({
                                severity: "success",
                                summary: "Sukses",
                                detail: "Berhasil memeperbarui data!",
                                life:1200,
                            });
                        }
                    }
                })
                .catch(error => {
                    toast.current.show({
                        severity: "error",
                        summary: "Gagal",
                        detail: "Gagal memeperbarui data!",
                        life: 3000,
                    });
                }
            )
        }
    };

    const fetchDelSales = () => {
        if(data.id && data.id != "") {
            FetchApi.fetchDelOrder(data.id)
                .then(res => {
                    setToastContent({variant:"success", msg: "Delete success"});
                    setShowToast(true);
                    setTimeout(() => {
                        window.location.reload();
                    },1200)
                })
                .catch(error => {
                    setToastContent({variant:"danger", msg: "Delete failed!"});
                    setShowToast(true);
                }
            )
        }
    }

    const fetchDelRO = async() => {
        if(data.id && data.id != "" && data.items) {
            // delete RO item 
            const orderBody = JSON.stringify({return_order_id: null});
            await axiosPrivate.patch(`/sales/update/ro/${data.items.order_id}`,orderBody)
            .then(res1 => {
                if(res1.data){
                    // => must change from delete to update status RO = canceled
                    // then => remove order credit if exist
                    const roStatus = JSON.stringify({status: 'batal'});
                    // update status RO to canceled
                    axiosPrivate.patch("/ro/half-update", {params: {id: data.id}}, roStatus)
                    .then(res2 => {
                        if(res2.data){
                            // delete order credit if exist
                            axiosPrivate.delete("/order-credit/ro", {params: {ro_id: data.id}})
                            .then(res3 => {
                                toast.current.show({
                                    severity: "success",
                                    summary: "Sukses",
                                    detail: "Berhasil membatalkan pengembalian",
                                    life: 1500,
                                });
                                setTimeout(() => {
                                    window.location.reload();
                                },1500)
                            })
                            .catch(err3 => {
                                toast.current.show({
                                    severity: "error",
                                    summary: "Gagal",
                                    detail: "Error saat membatalkan pengembalian",
                                    life: 3000,
                                });
                            })
                        } 
                    })
                    .catch(err2 => {
                        toast.current.show({
                            severity: "error",
                            summary: "Gagal",
                            detail: "Gagal membatalkan pengembalian",
                            life: 3000,
                        });
                    })
                    // axiosPrivate.delete("/ro-item/ro", { params: {ro_id: data.id} })
                    // .then(res2 => {
                    //     // delete RO
                    //     if(res2.data){
                    //         axiosPrivate.delete("/ro", { params: {id: data.id} })
                    //         .then(res3 => {
                    //             if(res3.data){
                    //                 // update RoID in order
                    //                 toast.current.show({
                    //                     severity: "success",
                    //                     summary: "Sukses",
                    //                     detail: "Berhasil menghapus data",
                    //                     life: 1500,
                    //                 });
                    //                 setTimeout(() => {
                    //                     window.location.reload();
                    //                 },1500)
                    //             } 
                    //         })
                    //         .catch(error3 => {
                    //             toast.current.show({
                    //                 severity: "error",
                    //                 summary: "Gagal",
                    //                 detail: "Gagal menghapus data!",
                    //                 life: 3000,
                    //             });
                    //         })
                    //     } 
                    // })
                    // .catch(error2 => {
                    //     toast.current.show({
                    //         severity: "error",
                    //         summary: "Gagal",
                    //         detail: "Gagal menghapus item pengembalian",
                    //         life: 3000,
                    //     });
                    // })
                }
            })
            .catch(error1 => {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Terjadi error saat menghapus pengembalian",
                    life: 3000,
                });
            })
        }
    }

    const fetchDelDG = async(delivery_group_id) => {
        await axiosPrivate.delete("/del/delivery-group", {
            params: {
                id: delivery_group_id
            }
        })
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Berhasil menghapus data delivery group",
                life: 1500,
            });

            setTimeout(() => {
                return returnValue(true);
            }, 1500);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal menghapus data delivery group",
                life: 3000,
            });
        })
    }

    const fetchCancelDG = async(delivery_group_id) => {
        await axiosPrivate.delete("/cancel/delivery-group", {
            params: {
                id: delivery_group_id
            }
        })
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Berhasil membatalkan data delivery group",
                life: 1500,
            });

            setTimeout(() => {
                return returnValue(true);
            }, 1500);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal membatalkan data delivery group",
                life: 3000,
            });
        })
    }

    const handleAction = () => {
        console.log(data)
        if(data !== "" || data !== null){
            switch(data.endpoint){
                case "customer":
                    if(data.action === "delete"){
                        fetchDelCust();
                    } else if(data.action === "update"){
                        // fetchUpdateCust();
                        handleUpdateCust();
                    }
                break;
                case "custType":
                    if(data.action === "delete"){
                        fetchDelCustType();
                    } else if(data.action === "update"){
                        fetchUpdateCust();
                    } else if(data.action === "insert"){
                        fetchInsertCustType();
                    }
                break;
                case "sales":
                    if(data.action === "canceled"){
                        // console.log(data)
                        // update order_status to canceled
                        cancelSales();
                        // fetchGetInv(data.data.invoice_id)
                        // fetchDelOrderItem();
                        // fetchDelSales();
                    } else if(data.action === "update"){
                        // delete order item -> insert order item -> update order detail
                        fetchDelOrderItem();
                        
                    } else if(data.action === "insert"){
                        // fetchInsertCustType();
                    }
                    else if(data.action === "warning"){
                        console.log('warning')
                        // fetchInsertCustType();
                    }
                break;
                case "inv":
                    if(data.action === "delete"){
                        if(returnValue){
                            return returnValue(true);
                        } 
                        // update order_status to canceled
                        // cancelSales();
                        // fetchGetInv(data.data.invoice_id)
                        // fetchDelOrderItem();
                        // fetchDelSales();
                    } else if(data.action === "update"){
                        // delete order item -> insert order item -> update order detail
                        fetchDelOrderItem();
                    } else if(data.action === "insert"){
                        // fetchInsertCustType();
                    } else if(data.action === "warning"){
                        return returnValue(true);
                        // fetchInsertCustType();
                    }
                break;
                case "product":
                    if(data.action === "delete"){
                        if(returnValue){
                            return returnValue(true);
                        }
                    }
                break;
                case "category":
                    if(data.action === "delete"){
                        if(returnValue){
                            return returnValue(true);
                        }
                    }
                break;
                case "ro":
                    if(data.action === "delete"){
                        fetchDelRO();
                    }
                break;
                case "payment":
                    if(data.action === "delete"){
                        if(returnValue){
                            return returnValue(true);
                        } 
                    } 
                break;
                case "department":
                    if(data.action === "delete"){
                        if(returnValue){
                            return returnValue(true);
                        } 
                    } 
                break;
                case "employee":
                    if(data.action === "delete"){
                        if(returnValue){
                            return returnValue(true);
                        } 
                    } 
                break;
                case "delivery_group":
                    if(data.action === "delete"){
                        fetchDelDG(data.id);
                    } else if(data.action == "canceled"){
                        fetchCancelDG(data.id);
                    }
                break;
            }

        } 
    };

    useEffect(() => {
        if(multiple === true){
            document.querySelectorAll(".modal-backdrop").forEach((e,idx) => {
                e.style.zIndex = 1055 + (idx * stack);
            })
            document.querySelectorAll(".modal").forEach((e,idx) => {
                e.style.zIndex = 1056 + (idx * stack);
            })
        }
    },[show])

    if(!data){
        return;
    }

    return(
        <>
        <Modal show={show} onHide={onHide} scrollable={true} centered className={`${data.action == 'info' ? 'info':'danger'}-modal`} >
            <Modal.Header style={{paddingBottom: 0, paddingTop: '1.5rem'}}>
                <div className="modal-bg-circle">
                    <img 
                        src={
                            data.action === 'delete' || data.action === 'canceled' ? DangerImg
                            : data.action === 'update' || data.action === 'warning' ? WarningImg
                            : data.action === 'info' ? InfoImg
                            : data.action === 'success' ? SuccessImg
                            :""
                        } 
                        alt="img" 
                    />
                </div>
            </Modal.Header>
            <Modal.Body>
                {/* <div style={{wordBreak: 'break-word'}}> */}
                    {msg}
                {/* </div> */}
            </Modal.Body>
            <Modal.Footer>
                {data.action === 'info' ?
                    (
                        <button type="button" className="btn btn-primary" onClick={() => {onHide();returnValue && returnValue(false)}}>mengerti</button>
                    )
                    : data.endpoint === 'sales' && data.action == 'warning' ?
                    (
                    <button type="button" className="btn btn-warning" onClick={() => {onHide();returnValue && returnValue(false)}}>mengerti</button>

                    ):
                (
                    <>
                    <button type="button" className="btn btn-secondary light" onClick={() => {
                        onHide(); 
                        returnValue && returnValue(false)}}
                    >
                        { data.action == 'warning' || data.action == "delete" ? 'Tidak' : 'Batal'}
                    </button>
                    <button 
                        type="button" 
                        className={`btn btn-${
                            data.action === 'delete' || data.action === 'canceled' ? 'danger'
                            : data.action === 'update' || data.action === 'warning' ? 'warning'
                            : data.action === 'info' ? 'info'
                            : data.action === 'success' ? 'success'
                            :""
                        }`} 
                        aria-label="confirm-btn" 
                        onClick={handleAction}
                    >Ya</button>
                    </>

                )
                }
            </Modal.Footer>
        </Modal>

        {/* toast area */}
        {/* <ToastContainer
            className="p-3 custom-toast"
        >
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

ConfirmModal.propTypes = {
    show: propTypes.bool, 
    onHide: propTypes.func, 
    multiple: propTypes.bool,
    stack: propTypes.number, 
    msg: propTypes.any, 
    returnValue: propTypes.func
}