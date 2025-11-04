import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Modal } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import NumberFormat from '../Masking/NumberFormat.jsx';
import { BlobProvider, pdf, PDFDownloadLink } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';
import FetchApi from '../../assets/js/fetchApi.js';
import InvoiceDoc from '../../parts/InvoiceDoc.jsx';
import ConvertDate from '../../assets/js/ConvertDate.js';
import InputWLabel from '../Input/InputWLabel.jsx';
import { CustomSelect } from '../CustomSelect/index.jsx';
import User from "../../assets/images/Avatar 1.jpg";
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import capitalizeEveryWord from '../../assets/js/CapitalizeEveryWord.js';
import CreatePayment from './CreatePaymentModal.jsx';
import dataStatic from '../../assets/js/dataStatic.js';
import InputWSelect from '../Input/InputWSelect.jsx';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import ReceiptDoc from '../../parts/ReceiptDoc.jsx';
import axios from 'axios';

import NoImg from "../../assets/images/no-img.jpg";
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth.js';


export default function DeliveryGroupListModal({show, onHide, data, returnAct}) {
    const { auth } = useAuth();
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const [ countItem, setCountItem ] = useState(0);
    const [ dataPoint, setDataPoint ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ controlUiBtn, setControlUiBtn ] = useState(false);
    const [ invData, setInvData ] = useState(false);
    const [ showModal, setShowModal ] = useState("");
    const [ paidData, setPaidData ] = useState(null);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ isLoading, setIsLoading ] = useState(true);
    const [ salesList, setSalesList ] = useState(null);
    const [ roList, setROList ] = useState(null);
    const [ invStatus, setInvStatus ] = useState(null);
    const [ paymentData, setPaymentData] = useState(null);
    const [ totalPaid, setTotalPaid] = useState(0);
    const [ dGList, setDGList ] = useState(data ? {...data} : null); 

    const axiosPrivate = useAxiosPrivate();

    const toast = useRef();
    const componentRef = useRef(null);

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
        trigger,
        formState: { errors },
      } = useForm({
        defaultValues: {
        },
      });


    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `My_HeaderText_Print`,
        onAfterPrint: () => console.log('Printing completed'),
    });

    const handlePage = () => {
        const getTargetElement = document.getElementById("tes");
        getTargetElement.style.overflowX = "unset !important";
        handlePrint();
        getTargetElement.style.overflowX = "auto";
    }

    const fetchSalesByID = async (request) => {
        await axiosPrivate.get(`/sales/order-items?id=${request}`)
        .then(resp => {
            console.log(resp.data)
            if(resp.data){
                setSalesList(resp.data);
            }
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get sales data!",
                life: 3000,
            });
        })
    };
    
    const fetchROByOrder = async (request) => {
        await axiosPrivate.get(`/ro/by?id=${request}`)
        .then(resp => {
            if(resp.data){
                console.log(request)
                setROList(resp.data);
            }
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get sales data!",
                life: 3000,
            });
        })
    };

    const fetchPaymentByInv = async () => {
        await axiosPrivate.get("/payment/inv", { params: {invid: data.id}})
        .then(resp => {
            setPaymentData(resp.data)

            let totalPaid = resp.data.reduce((sum, payment) => Number(sum) + Number(payment.amount_paid), 0);
            setTotalPaid(totalPaid);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get payment data!",
                life: 3000,
            });
        })
    };

    const fetchUpdateStatus = async() => {
        const body = JSON.stringify({
            delivery_group: {
                status: Number(getValues('status'))
            },
            delivery_group_items: null
        });

        await axiosPrivate.patch("/edit-minor/delivery-group", body, {
            params:{
                id: dGList.delivery_group_id,
            }
        })
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "berhasil memperbarui status",
                life: 1500,
            });

            setTimeout(() => {
                setControlUiBtn(false);
                return returnAct(true);
            }, 1500);
        })
        .catch(err => {
             setControlUiBtn(false);
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Gagal memperbarui status",
                life: 3000,
            });
        })
    }

    // const fetchUpdateInvStatus = async () => {
    //     let invStatusUpdate = JSON.stringify({status: invStatus});
    //     await axiosPrivate.patch(`/inv/status?id=${dGList.id}`, invStatusUpdate)
    //     .then(resp => {
    //         console.log(resp.data[1][0])
    //         if(resp.data.length > 0 && resp.data[0] > 0){
    //             toast.current.show({
    //                 severity: "success",
    //                 summary: "Success",
    //                 detail: "Invoice status updated",
    //                 life: 3000,
    //             });

    //             axiosPrivate.get("/inv/by",{params:{id: dGList.id}})
    //             .then(resp2 => {
    //                 console.log(resp2.data)
    //                 setDGList({...data, items: resp2.data[0]});
    //             })
    //             .catch(err2 => {

    //             })
    //         }
    //     })
    //     .catch(err => {
    //         toast.current.show({
    //             severity: "error",
    //             summary: "Failed",
    //             detail: "Failed to update status",
    //             life: 3000,
    //         });
    //     })
    // }

    const testSend = async(receipientNumber) => {
        const invDoc = <InvoiceDoc data={{invoice: dGList.items, order: salesList, payment: paymentData, ro: roList}} />;
        const blob = await pdf(invDoc).toBlob();
       
        const formData = new FormData();
        formData.append('file', blob, { filename: 'tes-doc.pdf', contentType: "application/pdf" }); // Provide a filename and content type
        formData.append('messaging_product', 'whatsapp');
        formData.append('type', "application/pdf");

        const accessToken= 'EAAQmpbkuRWoBPgegdmJM8w7G4IxIoGYszQbVNZBtvZC2LRMX72LzC9Bb6YIC5RwIkNQ34dTlC8Y9EZAYmbw13ClpqofMbXeGiM3m8126A1AAYSivSTzMps02U6DHjaa3vMk3SnFpkFxa9ee8ZCuZAqDL3BZA1w60JyP6jqL5BKTopg61kGVUDrmHGdOIVlhK1ILgZDZD';
        // const accessToken= 'EAAQmpbkuRWoBPhr0Ns58VSOWBT4VmXuWmbJQSidgZB6LGMWgTEQdZAnRldhwd4WBWV7xFvm3FakUfCUXHu7o4wOe9wioaHsKsFyooudnG5chFjWeRAZCyHAZBmtrq1IjZCfqF0ZBmz60boB1oLxNVDXuG5texOYu2ODq1m6zTg2YeZCHVrWQvcfMHwivEylw3yh2ZBHx7ZC68Gvqh0JbQL5HsJZALySTuvI0y3OXwq8vfeeBvRlAZDZD';
        // const pdfBlob = new Blob(['%PDF-1.4...'], { type: 'application/pdf' }); 
        await axios.post('https://graph.facebook.com/v23.0/765819206619796/media', formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/pdf'
            },
        })
        .then(res => {
            const msgBody = JSON.stringify({
                messaging_product: 'whatsapp',
                // recipient_type: "individual",
                to: `62${receipientNumber}`,
                type: "document",
                document: {
                    id: res.data.id,
                    filename: `${(dGList.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(dGList.items.customer?.name)}.pdf`,
                }
            });
            const send = axios.post('https://graph.facebook.com/v23.0/765819206619796/messages', msgBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                
            });
            console.log(send);
        })
        .catch(err => {
            console.log(err)
        })
        // await axios({
        //     url: 'https://graph.facebook.com/v22.0/765819s206619796/media',
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer EAAQmpbkuRWoBPe2mZC442Dbv4ke5wOZA6xV5nWdCvZBIVq2WkolIk3yIIpN1t5XFkZAmhZCAsvIc9VIhDnVXKPewBhZAIiisyZBXukUENF6Mvl8XmuLBtnXJ8553WiwJH9LElLBiDZBpNN1SbZCXV241vpim3mWBVLaeWUO6eZB0328drrhug8sq88vRC5INPiE4HMZBsan4iyOzm81sQ5uYhmtZB44d4B6RtDkJbM1cpgqhQwZDZD`,
        //         'Content-Type': 'application/pdf'
        //     },
        //     data: JSON.stringify({
        //         messaging_product: 'whatsapp',
        //         file: formData
        //         // text :{
        //         //     body: "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us."
        //         // }
        //     }),
        // })
        // .then(resp => {
        //     console.log(resp)
        //     if(resp.data){
        //         const send = axios({
        //             url: 'https://graph.facebook.com/v22.0/765819206619796/messages',
        //             method: 'POST',
        //             headers: {
        //                 'Authorization': `Bearer EAAQmpbkuRWoBPe2mZC442Dbv4ke5wOZA6xV5nWdCvZBIVq2WkolIk3yIIpN1t5XFkZAmhZCAsvIc9VIhDnVXKPewBhZAIiisyZBXukUENF6Mvl8XmuLBtnXJ8553WiwJH9LElLBiDZBpNN1SbZCXV241vpim3mWBVLaeWUO6eZB0328drrhug8sq88vRC5INPiE4HMZBsan4iyOzm81sQ5uYhmtZB44d4B6RtDkJbM1cpgqhQwZDZD`,
        //                 'Content-Type': 'application/json'
        //             },
        //             data: JSON.stringify({
        //                 messaging_product: 'whatsapp',
        //                 to: '+6281270982995',
        //                 // type: 'template',
        //                 // template: {
        //                 //     name: "hello_world",
        //                 //     language: {
        //                 //         code: 'en_US'
        //                 //     }
        //                 // }
        //                 type: "document",
        //                 document: {
        //                     "id": resp.data.id,
        //                     "filename": `${(dGList.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(dGList.items.customer?.name)}.pdf`,
        //                     "caption": "Please review this document."
        //                 }
        //                 // text :{
        //                 //     body: "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us."
        //                 // }
        //             }),
        //         });
        //         console.log(send);
        //     }
        // })
        // .catch(err => {
        //     console.log(err)
        // })
    }

    // useEffect(() => {
    //     if(dGList){
    //         let getSalesRef = JSON.parse(dGList.items.order_id);
    //         let sendReq;
    //         if(getSalesRef.length > 1){
    //             sendReq = getSalesRef.join("&id=");
    //             // fetchPaymentByInv();
    //         } else {
    //             sendReq = getSalesRef[0];
    //             // fetchSalesByID(sendReq);
    //             // fetchPaymentByInv();
    //         }

    //         setPaymentData(dGList.items.payments);

    //         let totalPaid = dGList.items.payments?.reduce((sum, payment) => Number(sum) + Number(payment.amount_paid), 0);
    //     //    console.log(totalPaid)
    //         setTotalPaid(totalPaid);
    //         fetchSalesByID(sendReq);
    //         fetchROByOrder(sendReq);
            
    //     }
    // },[dGList]);
    
    // useEffect(() => {
    //        if(paidData && invData){
    //            fetchInsertPayment();
    //         //    console.log(paidData)
    //        }
    //    },[paidData])
    
    useEffect(() => {
        if(dGList){
            setIsLoading(false);
        }
    },[dGList]);


    if(isLoading){
        return;
    }

    console.log(dGList)
    
    const handleModal = (e, inv) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "addPaymentModal":
                setInvData(inv);
                setShowModal("addPaymentModal");
            break;
        }
    };

    const fetchInsertPayment = async () => {
        let paymentModel = {
            invoice_id: invData.items.invoice_id,
            customer_id: invData.items.customer_id,
            amount_paid: paidData.amountOrigin,
            note: paidData.note,
            payment_ref: paidData.payment_ref,
            payment_date: paidData.payment_date,
            payment_method: paidData.payment_method,
        };

        let invModel = {
            remaining_payment: (invData.items.remaining_payment - paidData.amountOrigin) <= 0 ? 0 : (invData.items.remaining_payment - paidData.amountOrigin),
            is_paid: (invData.items.remaining_payment - paidData.amountOrigin) <= 0 ? true : false
        }

        await axiosPrivate.post("/payment/write", JSON.stringify(paymentModel))
        .then(resp => {
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully add payment",
                life: 3000,
            });
            
            axiosPrivate.patch("/inv/payment", JSON.stringify(invModel), { params: { id: invData.items.invoice_id } })
            .then(resp2 => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Successfully update invoice",
                    life: 3000,
                });
                
                setTimeout(() => {
                    window.location.reload();
                },1200)
            })
            .catch(err2 => {
                fetchDeletePayment(resp.data.payment_id);
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Error when update invoice payment",
                    life: 3000,
                });
            })
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to add payment",
                life: 3000,
            });
        })
    };

    console.log(dGList)

    return(
        <>
         {/* <div className="modal fade" id="invoiceDetailModal" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="invoiceDetailModal" aria-hidden="true">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="invoiceDetailModal">invoice detail: #INV-001</h1>
                        <div className="modal-btn-wrap">
                            <button type="button" className="modal-btn"><i className='bx bxs-file-pdf'></i></button>
                            <button type="button" className="modal-btn"><i className='bx bx-printer'></i></button>
                            <button type="button" className="modal-btn"><i className='bx bx-printer'></i></button>
                        </div>
                        <div className="modal-btn-mobile dropdown">
                            <button type="button" className="modal-btn" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className='bx bx-dots-vertical-rounded'></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="modalFeature">
                                <li><a href="./sett-profile.html" className="dropdown-item"><i
                                            className='bx bxs-file-pdf'></i>Download PDF</a></li>
                                <li><a href="" className="dropdown-item"><i className='bx bx-printer'></i>Download xlsx</a></li>
                                <li><a href="" className="dropdown-item"><i className='bx bx-printer'></i>Print</a></li>
                            </ul>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="invoice-header">
                            <div className="invoice-detail">
                                <h3 className="invoice-title">invoice: #INV-0001</h3>
                                <div className="invoice-info-group">
                                    <p className="label-text">nomor invoice</p>
                                    <p className="invoice-text">#INV-0001</p>
                                </div>
                                <div className="invoice-info-group">
                                    <p className="label-text">tanggal</p>
                                    <p className="invoice-text">16/05/2024</p>
                                </div>
                            </div>
                            <div className="company-detail">
                                <div className="company-img">
                                    <img src="../assets/images/Logo_WA-removebg-preview.png" alt="logo">
                                </div>
                                <div className="company-profile">
                                    <p className="label-text">tahu tempe tauge</p>
                                    <p className="label-text">+628123456789</p>
                                    <p className="label-text">pangururan, samosir</p>
                                </div>
                            </div>
                        </div>
                        <div className="invoice-content">
                            <div className="invoice-cust-info">
                                <div className="invoice-info-group">
                                    <p className="label-text">nama pelanggan</p>
                                    <p className="invoice-text">Anton ruchiat</p>
                                </div>
                                <div className="invoice-info-group">
                                    <p className="label-text">status</p>
                                    <span className="badge badge-primary light">Lunas</span>
                                </div>
                            </div>
                            <div className="invoice-amount">
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">Total Transaksi</p>
                                        <p className="invoice-text"><span className="currency">Rp</span> 1.456.000</p>
                                    </div>
                                </div>
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">Total Bayar</p>
                                        <p className="invoice-text"><span className="currency">Rp</span> 1.456.000</p>
                                    </div>
                                </div>
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">sisa bon</p>
                                        <p className="invoice-text"><span className="currency">Rp</span> 0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="invoice-transaction">
                            <p className="inv-table-title">detail transaksi</p>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>tanggal</th>
                                            <th>item</th>
                                            <th>qty</th>
                                            <th>satuan</th>
                                            <th>jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td rowSpan="2">15/05/2024</td>
                                            <td>Tahu (14x14)</td>
                                            <td>14</td>
                                            <td><span className="currency">Rp</span> 50.000</td>
                                            <td><span className="currency">Rp</span> 700.000</td>
                                        </tr>
                                        <tr>
                                            <td>Tempe Plastik</td>
                                            <td>70</td>
                                            <td><span className="currency">Rp</span> 2.000</td>
                                            <td><span className="currency">Rp</span> 140.000</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3"></td>
                                            <td className="each-total-title">Total</td>
                                            <td className="each-total-text"><span className="currency">Rp</span> 840.000</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>tanggal</th>
                                            <th>item</th>
                                            <th>qty</th>
                                            <th>satuan</th>
                                            <th>jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td rowSpan="2">14/05/2024</td>
                                            <td>Tahu (14x14)</td>
                                            <td>14</td>
                                            <td><span className="currency">Rp</span> 50.000</td>
                                            <td><span className="currency">Rp</span> 700.000</td>
                                        </tr>
                                        <tr>
                                            <td>Tempe Plastik</td>
                                            <td>70</td>
                                            <td><span className="currency">Rp</span> 2.000</td>
                                            <td><span className="currency">Rp</span> 140.000</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3"></td>
                                            <td className="each-total-title">Total</td>
                                            <td className="each-total-text"><span className="currency">Rp</span> 840.000</td>
                                        </tr>
                                        <tr className="grand-total">
                                            <td colSpan="3"></td>
                                            <td className="each-total-title">Total transaksi</td>
                                            <td className="each-total-text"><span className="currency">Rp</span> 1.680.000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="invoice-payment">
                            <p className="inv-table-title">detail pembayaran</p>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>tanggal</th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th>jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>15/05/2024</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td><span className="currency">Rp</span> 840.000</td>
                                        </tr>
                                        <tr>
                                            <td>14/05/2024</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td><span className="currency">Rp</span> 840.000</td>
                                        </tr>
                                        <tr className="grand-total">
                                            <td colSpan="3"></td>
                                            <td className="each-total-title">Total bayar</td>
                                            <td className="each-total-text"><span className="currency">Rp</span> 1.680.000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="invoice-footer">
                            <p className="invoice-footer-text">Thank you for your business!</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary light" data-bs-dismiss="modal">cancel</button>
                        <button type="button" className="btn btn-primary">save</button>
                    </div>
                </div>
            </div>
        </div> */}
        <Modal dialogClassName={auth.roles == "admin" ? isMobile || isMediumScr ? 'modal-fullscreen' : 'modal-75w': "modal-xl"} show={show} onHide={onHide} scrollable={true} centered={true}  id="" >
            <Modal.Header closeButton>
                <Modal.Title style={{marginRight: '1rem'}}>ID pengantaran: {dGList !== "" ? `${dGList.delivery_group_id}` : ""}</Modal.Title>
                <span>
                    {/* <InputWSelect
                                // label={'status'}
                                // name="status"
                                // selectLabel="Select order type"
                                options={dataStatic.statusInvList}
                                optionKeys={["id", "type"]}
                                defaultValue={dGList.items.status}
                                defaultValueKey={"type"}
                                value={(selected) => {
                                    setInvStatus(selected.value);
                                    // selected.value != "" ? clearErrors("status") : null;
                                }}
                                width={150}
                                
                                // resetController={resetInputWSelect}
                                // require={true}
                                // register={register}
                                // errors={errors}
                            /> */}
                </span>
                {/* <div className="modal-btn-wrap">
                    <Dropdown>
                        <Dropdown.Toggle className="btn btn-primary btn-w-icon" style={{fontWeight: 600}}>
                            <i className='bx bxs-send'></i>
                            <span style={{marginRight: '.3rem'}}>Send</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item as="button" href="#/action-1"><i className='bx bx-envelope'></i>Email</Dropdown.Item>
                            <Dropdown.Item as="button" href="#/action-2"><i className='bx bxl-whatsapp'></i>Whatsapp</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    
                    <button type="button" className={`btn btn-dark btn-w-icon`}>
                        <i className='bx bxs-file-pdf'></i>
                        <PDFDownloadLink style={{textDecoration: 'none', color: '#ffffff'}} 
                            document={<InvoiceDoc data={{invoice: data.items, order: salesList, payment: paymentData}} />} 
                            fileName={`${(data.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(data.items.customer?.name)}.pdf`}>
                            {({ loading }) => (loading ? 'Loading...' : 'Download PDF')}
                        </PDFDownloadLink>
                    </button>
                    {
                        data.items.is_paid ? 
                        (
                            <button type="button" className={`btn btn-success btn-w-icon`}>
                                <i className='bx bxs-receipt'></i>
                                <PDFDownloadLink style={{textDecoration: 'none', color: '#ffffff'}} 
                                    document={<InvoiceDoc data={{invoice: data.items, order: salesList, payment: paymentData}} />} 
                                    fileName={`${(data.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(data.items.customer?.name)}.pdf`}>
                                    {({ loading }) => (loading ? 'Loading...' : 'Receipt')}
                                </PDFDownloadLink>
                            </button>
                        ):''
                    }

                    <button type="button" className={`btn btn-danger btn-w-icon`} onClick={handlePage}>
                        <i className='bx bxs-printer'></i>Print
                    </button>
                </div> */}
                {/* <div className="modal-btn-mobile dropdown">
                    <button type="button" className="modal-btn" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className='bx bx-dots-vertical-rounded'></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="modalFeature">
                        <li>
                            <a href="" className="dropdown-item"><i className='bx bx-send'></i>Download xlsx</a></li>
                        <li>
                            <a href="./sett-profile.html" className="dropdown-item"><i className='bx bxs-file-pdf'></i>Download PDF</a>
                        </li>
                        <li>
                            <a href="" className="dropdown-item"><i className='bx bx-printer'></i>Print</a>
                        </li>
                    </ul>
                </div> */}
            </Modal.Header>
            <Modal.Body ref={componentRef}>
                <div className='prev-inv-container' style={{display: 'flex', flexDirection: isMobile || isMediumScr ? 'column' : 'row', width: '100%', gap:'3rem'}}>
                    <div className='card static-shadow prev-inv-content' style={{width: auth.roles == "admin" ? isMobile || isMediumScr ? '100%' : '75%' : '100%'}}>
                        <div className='invoice-wrapper'>
                            <div className="invoice-header">
                                <div className="invoice-detail">
                                    <h3 className="invoice-title">Pengantaran grup</h3>
                                    <div className="invoice-info-group">
                                        <p className="label-text">ID pengantaran</p>
                                        <p className="invoice-text" style={{textTransform: 'uppercase'}}>#{dGList.delivery_group_id}</p>
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'row', gap: '2rem'}}>
                                        <div className="invoice-info-group">
                                            <p className="label-text">tanggal</p>
                                            <p className="invoice-text">{ConvertDate.convertToBeautyDate(dGList.delivery_group_date)}</p>
                                        </div>
                                        <div className="invoice-info-group">
                                            <p className="label-text">dibuat tanggal</p>
                                            <p className="invoice-text">{ConvertDate.convertToBeautyDate(dGList.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="company-detail" style={{}}>
                                    <div className="company-img">
                                        <img src={'https://res.cloudinary.com/du3qbxrmb/image/upload/v1748248130/Logo_WA-removebg-preview_qnf7tu.png'} alt="logo" />
                                    </div>
                                    <div className="company-profile">
                                        <p className="label-text">tahu tempe tauge</p>
                                        <p className="label-text">+6282229990644</p>
                                        <p className="label-text">pangururan, samosir</p>
                                    </div>
                                </div>
                            </div>
                            <div className="invoice-content" style={{ overflowX: 'auto', justifyContent: 'space-between'}}>
                                <div className="invoice-cust-info">
                                    <div className="invoice-info-group">
                                        <p className="label-text">nama karyawan</p>
                                        <p className="invoice-text" style={{marginBottom:17}}>{dGList.employee?.name}</p>
                                    </div>
                                    <div className="invoice-info-group">
                                        <p className="label-text">ID karyawan</p>
                                        <p className="invoice-text" style={{marginBottom:17}}>{dGList.employee_id}</p>
                                    </div>
                                </div>
                                <div className="invoice-info-group">
                                    <p className="label-text mb-1">status</p>
                                    <span className={`badge badge-${
                                        dGList.status == 1  ? 'secondary' 
                                        : dGList.status == 2 ? 'primary'
                                        : dGList.status == 3 ? 'danger'
                                        : dGList.status == 4 ? 'success'
                                        : 'secondary'} light`}
                                    >
                                        {
                                            dGList.status ? dataStatic.deliveryGroupStatus[dGList.status-1].type : "???"
                                        }
                                    </span>
                                </div>
                                {/* <div className='inv-bank-info'>
                                    <div className="invoice-info-group">
                                        <p className="label-text" style={{marginBottom:3}}>Informasi Pembayaran</p>
                                        <p className="invoice-text" style={{marginBottom:3}}><span className="label-text">Bank Transfer:</span> BRI</p>
                                        <p className="invoice-text" style={{marginBottom:3}}><span className="label-text">A/N:</span> Anton Ruchiat</p>
                                        <p className="invoice-text" style={{marginBottom:0}}><span className="label-text">Nomor rekening:</span> 005301102808501</p>
                                    </div>
                                </div> */}
                            </div>
                            <div className="invoice-amount">
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">Total qty item</p>
                                        <p className="invoice-text">{Number(dGList.total_item)}</p>
                                    </div>
                                </div>
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">Total Nilai pengantaran</p>
                                        <p className="invoice-text">
                                            <NumberFormat intlConfig={{
                                                value: dGList.total_value, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                                }} 
                                            />
                                        </p>
                                    </div>
                                </div>
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">Total Nilai pengantaran akhir</p>
                                        <p className="invoice-text">
                                            <NumberFormat intlConfig={{
                                                value: 0, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                                }} 
                                            />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="invoice-transaction mt-4">
                                <p className="inv-table-title">detail pengantaran awal</p>
                                <div className='table-responsive'>
                                    {dGList.DeliveryGroupItemsGrouped && dGList.DeliveryGroupItemsGrouped.map((group_items, index) => {  
                                        return(
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>sesi</th>
                                                    <th>waktu</th>
                                                    <th>item</th>
                                                    <th>qty</th>
                                                    <th>satuan</th>
                                                    <th>diskon/item</th>
                                                    <th>jumlah</th>
                                                    <th>status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {group_items.items.map((item, idx) => {
                                                return( 
                                                    <tr key={idx} style={{textTransform:'capitalize'}}>
                                                    {idx == 0 ? 
                                                    (
                                                        <>
                                                        <td rowSpan={`${group_items.items.length}`} style={{fontWeight: 700}}>{group_items.session}</td>
                                                        <td rowSpan={`${group_items.items.length}`} style={{fontWeight: 700}}>{new Date(group_items.items[0].createdAt).toLocaleString('id-ID').replaceAll(".", ":")}</td>
                                                        
                                                        </>
                                                    ):''}
                                                        <td>{`${item.product.product_name}  ${item.product.variant}`}</td>
                                                        <td>{Number(item.quantity)}</td>
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
                                                                    value: Number(item.disc_prod_rec), 
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                    value: (Number(item.quantity) * Number(item.sell_price))-(Number(item.quantity)*Number(item.disc_prod_rec)), 
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                        {idx == 0 && 
                                                        (

                                                            <td rowSpan={`${group_items.items.length}`} style={{fontWeight: 700}}>
                                                                <span className={`badge badge-${
                                                                    item.status == 1  ? 'secondary' 
                                                                    : item.status == 2 ? 'primary'
                                                                    : item.status == 3 ? 'danger'
                                                                    : 'secondary'} light`}
                                                                >
                                                                    {
                                                                        item.status ? dataStatic.deliveryGroupItemsStatus[item.status-1].type : "???"
                                                                    }
                                                                </span>
                                                            </td>
                                                        )
                                                        }
                                                    </tr>
                                                    )
                                                })
                                            }
                                                <tr>
                                                    <td colSpan={2}></td>
                                                    <td className="endnote-row-title" style={{fontWeight:700}}>Items</td>
                                                    <td colSpan={2} style={{fontWeight:700}}>{Number(group_items.total_item)}</td>
                                                    <td className="each-total-title" style={{textAlign:'right'}}>total</td>
                                                    <td colSpan={2} className="each-total-text">
                                                        <NumberFormat intlConfig={{
                                                            value: Number(group_items.total_value),
                                                            locale: "id-ID",
                                                            style: "currency", 
                                                            currency: "IDR",
                                                            }} 
                                                        />
                                                    </td>
                                                </tr>
                                                {/* {idx == salesList.length-1 ? 
                                                    (
                                                    <tr className="grand-total">
                                                        <td colSpan="4"></td>
                                                        <td className="each-total-title" style={{textAlign:'right'}}>Total seluruh transaksi</td>
                                                        <td className="each-total-text">
                                                            <NumberFormat intlConfig={{
                                                                value: data.items.amount_due, 
                                                                locale: "id-ID",
                                                                style: "currency", 
                                                                currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                    </tr>
                                                    )
                                                :""} */}
                                            </tbody>
                                        </table>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            {/* <div className="invoice-payment">
                                {
                                    paymentData.length > 0 ? 
                                    (
                                        <>
                                        <p className="inv-table-title">detail pembayaran</p>
                                        <div className="table-responsive">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>tanggal</th>
                                                        <th>catatan</th>
                                                        <th></th>
                                                        <th>metode</th>
                                                        <th>jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paymentData ?
                                                        paymentData.map((payment,idx) => {
                                                            return(
                                                                <>
                                                                    <tr key={`payment-${idx}`}>
                                                                        <td>{ConvertDate.convertToFullDate(payment.payment_date,"/")}</td>
                                                                        <td>{payment.note == '' || payment.note == null ? '-' : payment.note}</td>
                                                                        <td></td>
                                                                        <td style={{textTransform: 'capitalize'}}>{payment.payment_method}</td>
                                                                        <td>
                                                                            <NumberFormat intlConfig={{
                                                                                value: payment.amount_paid, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                            }}/>
                                                                        </td>
                                                                    </tr>
                                                                    {idx == paymentData.length-1 ? 
                                                                    (
                                                                        <>
                                                                        
                                                                        <tr className="grand-total">
                                                                            <td colSpan="3"></td>
                                                                            <td className="each-total-title" style={{textAlign:'right'}}>Total bayar</td>
                                                                            <td className="each-total-text">
                                                                                <NumberFormat intlConfig={{
                                                                                    value: totalPaid, 
                                                                                    locale: "id-ID",
                                                                                    style: "currency", 
                                                                                    currency: "IDR",
                                                                                }}/>
                                                                            </td>
                                                                        </tr>
                                                                        </>
                                                                    ):''}
                                                                
                                                                </>
                                                                
                                                            )
                                                        })
                                                    :''}
                                                </tbody>
                                            </table>
                                        </div>
                                        </>
                                    ): ''
                                }
                            </div> */}

                        </div>
                    </div>
                   
                        
                        {auth.roles == "admin" && (
                        <div className='inv-tools' style={{width: isMobile || isMediumScr ? '100%' : '25%'}}>
                        {/* send invoice card */}
                            <div className='card static-shadow cust-card-inv' style={{height: 'auto', padding: '1.5rem 1.7rem'}}>
                                <div className="card-header">
                                    <div className='cust-img-wrap'>
                                        <img src={dGList.employee?.img || NoImg} />
                                    </div>
                                    <span className='card-title'>{dGList.employee.name}</span>
                                </div>
                                <div className="card-sub-header mb-3">
                                    <div className='inline-detail'>
                                        <p className='sub-header'>ID karyawan:</p>
                                        <p className='sub-header'>{dGList.employee_id}</p>
                                    </div>
                                    <div className='inline-detail'>
                                        <p className='sub-header'>Nomor telepon:</p>
                                        <p className='sub-header'>{dGList.employee?.phonenumber}</p>
                                    </div>
                                    
                                </div>
                            </div>
                            <div className='card static-shadow cust-card-inv' style={{minHeight: '100px', padding: '1.5rem 1.7rem'}}>
                                <div className="card-header" style={{display: 'block'}}>
                                    <div className='remaining-payment'>
                                        <p className='card-title' style={{marginBottom: '.8rem', color: '#929292'}}>konfirmasi pengantaran</p>
                                        <InputWSelect
                                            // label={"status pengantaran"}
                                            name="status_pengantaran"
                                            selectLabel="Pilih status"
                                            options={dataStatic.deliveryGroupStatus}
                                            optionKeys={["id", "type"]}
                                            value={(selected) => {setValue("status", selected.id);setValue("status_pengantaran", selected.value);getValues("status_pengantaran") !== "" && clearErrors('status_pengantaran')}}
                                            defaultValue={dGList.status ?? ""}
                                            defaultValueKey={"id"}
                                            register={register}
                                            require={true}
                                            errors={errors}
                                        />
                                    </div>
                                </div>
                                <button type="button" className="btn btn-success btn-w-icon mt-2" 
                                onClick={(e) => {
                                    setControlUiBtn(true);
                                    fetchUpdateStatus();
                                }}
                                disabled={controlUiBtn}
                                >
                                    <i className='bx bx-plus'></i>
                                    {controlUiBtn ? "Loading..." : "konfirmasi pengantaran"}
                                    
                                </button> 
                            </div>

                            {/* buttons */}
                            <div className='inv-tool-btns card static-shadow'>
                                <button type="button" className={`btn btn-dark btn-w-icon`}>
                                    <i className='bx bxs-file-pdf'></i>
                                    {/* <PDFDownloadLink style={{textDecoration: 'none', color: '#ffffff'}} 
                                        document={<InvoiceDoc data={{invoice: dGList.items, order: salesList, payment: paymentData, ro: roList}} />} 
                                        fileName={`${(dGList.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(dGList.items.customer?.name)}.pdf`}>
                                        {({ loading }) => (loading ? 'Loading...' : 'Download Invoice')}
                                    </PDFDownloadLink> */}
                                </button>
                                <div className='inline-group-btn' style={{display: 'inline-flex', gap: '.7rem'}}>
                                    <button type="button" className={`btn btn-danger light btn-w-icon`} onClick={handlePage}>
                                        <i className='bx bxs-printer'></i>Print
                                    </button>
                                    <button type="button" className={`btn btn-success light btn-w-icon`} onClick={handlePage}>
                                        <i className='bx bxs-printer'></i>excel
                                    </button>
                                </div>
                            </div> 
                        </div>
                        )}
                        
                </div>
            </Modal.Body>
                
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>OK</button>
                {/* <button type="button" className="btn btn-primary" onClick={{}}>Add payment</button> */}
            </Modal.Footer>
        </Modal>

        {/* modal */}
        
        {/* toast area */}
        <Toast ref={toast} />
        </>
    )
}