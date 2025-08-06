import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Modal } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import NumberFormat from '../Masking/NumberFormat';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';
import FetchApi from '../../assets/js/fetchApi';
import InvoiceDoc from '../../parts/InvoiceDoc.jsx';
import ConvertDate from '../../assets/js/ConvertDate.js';
import InputWLabel from '../Input/InputWLabel';
import { CustomSelect } from '../CustomSelect';
import User from "../../assets/images/Avatar 1.jpg";
import useAxiosPrivate from '../../hooks/useAxiosPrivate.js';
import capitalizeEveryWord from '../../assets/js/CapitalizeEveryWord.js';
import CreatePayment from './CreatePaymentModal.jsx';
import dataStatic from '../../assets/js/dataStatic.js';
import InputWSelect from '../Input/InputWSelect.jsx';


export default function InvoiceModal({show, onHide, data}) {
    const [ countItem, setCountItem ] = useState(0);
    const [ dataPoint, setDataPoint ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
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
    const [ invDupe, setInvDupe ] = useState(data ? {...data} : null); 
    const axiosPrivate = useAxiosPrivate();
    const toast = useRef();
    const componentRef = useRef(null);
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

    const fetchUpdateInvStatus = async () => {
        let invStatusUpdate = JSON.stringify({status: invStatus});
        await axiosPrivate.patch(`/inv/status?id=${invDupe.id}`, invStatusUpdate)
        .then(resp => {
            console.log(resp.data[1][0])
            if(resp.data.length > 0 && resp.data[0] > 0){
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Invoice status updated",
                    life: 3000,
                });

                axiosPrivate.get("/inv/by",{params:{id: invDupe.id}})
                .then(resp2 => {
                    setInvDupe({...data, items: resp2.data[0]});
                })
                .catch(err2 => {

                })
            }
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to update status",
                life: 3000,
            });
        })
    }

    useEffect(() => {
        if(invDupe){
            console.log(invDupe)
            let getSalesRef = JSON.parse(invDupe.items.order_id);
            let sendReq;
            if(getSalesRef.length > 1){
                sendReq = getSalesRef.join("&id=");
                // fetchPaymentByInv();
            } else {
                sendReq = getSalesRef[0];
                // fetchSalesByID(sendReq);
                // fetchPaymentByInv();
            }

            setPaymentData(invDupe.items.payments);

            let totalPaid = invDupe.items.payments?.reduce((sum, payment) => Number(sum) + Number(payment.amount_paid), 0);
        //    console.log(totalPaid)
            setTotalPaid(totalPaid);
            fetchSalesByID(sendReq);
            fetchROByOrder(sendReq);
            
        }
    },[invDupe]);
    
    useEffect(() => {
           if(paidData && invData){
               fetchInsertPayment();
            //    console.log(paidData)
           }
       },[paidData])
    
    useEffect(() => {
        if(salesList && paymentData && invDupe){
            setIsLoading(false);
        }
    },[salesList, paymentData, invDupe]);

    useEffect(() => {
        if(invStatus && invStatus !== invDupe.items.status){
            fetchUpdateInvStatus();
        }
    },[invStatus])


    if(isLoading){
        return;
    }

    
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
        <Modal dialogClassName="modal-75w" show={show} onHide={onHide} scrollable={true} centered={true}  id="invoiceDetailModal" >
            <Modal.Header closeButton>
                <Modal.Title style={{marginRight: '1rem'}}>invoice detail: #INV-{invDupe !== "" ? `${invDupe.id}` : ""}</Modal.Title>
                <span>
                    <InputWSelect
                                // label={'status'}
                                // name="status"
                                // selectLabel="Select order type"
                                options={dataStatic.statusInvList}
                                optionKeys={["id", "type"]}
                                defaultValue={invDupe.items.status}
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
                            />
                </span>
                {/* <div className="modal-btn-wrap">
                    <Dropdown>
                        <Dropdown.Toggle className="btn btn-primary btn-w-icon" style={{fontWeight: 600}}>
                            <i className='bx bxs-send'></i>
                            <span style={{marginRight: '.3rem'}}>Send</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item as="button" href="#/action-1"><i class='bx bx-envelope'></i>Email</Dropdown.Item>
                            <Dropdown.Item as="button" href="#/action-2"><i class='bx bxl-whatsapp'></i>Whatsapp</Dropdown.Item>
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
                <div className="modal-btn-mobile dropdown">
                    <button type="button" className="modal-btn" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className='bx bx-dots-vertical-rounded'></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="modalFeature">
                        <li>
                            <a href="" className="dropdown-item"><i class='bx bx-send'></i>Download xlsx</a></li>
                        <li>
                            <a href="./sett-profile.html" className="dropdown-item"><i className='bx bxs-file-pdf'></i>Download PDF</a>
                        </li>
                        <li>
                            <a href="" className="dropdown-item"><i className='bx bx-printer'></i>Print</a>
                        </li>
                    </ul>
                </div>
            </Modal.Header>
            <Modal.Body ref={componentRef}>
                <div className='prev-inv-container' style={{display: 'flex', flexDirection: 'row', width: '100%', gap:'3rem'}}>
                    <div className='card static-shadow prev-inv-content' style={{width: '75%'}}>
                        <div className="invoice-header">
                            <div className="invoice-detail">
                                <h3 className="invoice-title">invoice</h3>
                                <div className="invoice-info-group">
                                    <p className="label-text">nomor invoice</p>
                                    <p className="invoice-text" style={{textTransform: 'uppercase'}}>#{invDupe !== "" ? `${invDupe.items?.invoice_number}` : ""}</p>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'row', gap: '2rem'}}>
                                    <div className="invoice-info-group">
                                        <p className="label-text">tanggal</p>
                                        <p className="invoice-text">{ConvertDate.convertToBeautyDate(invDupe.items.invoice_date)}</p>
                                    </div>
                                    <div className="invoice-info-group">
                                        <p className="label-text">jatuh tempo</p>
                                        <p className="invoice-text">{ConvertDate.convertToBeautyDate(invDupe.items.invoice_due)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="company-detail" style={{}}>
                                <div className="company-img">
                                    <img src={'https://res.cloudinary.com/du3qbxrmb/image/upload/v1748248130/Logo_WA-removebg-preview_qnf7tu.png'} alt="logo" />
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
                                    <p className="invoice-text">{invDupe.items.customer.name}</p>
                                </div>
                                <div className="invoice-info-group">
                                    <p className="label-text">status</p>
                                    <span className={`badge badge-${invDupe.items.is_paid ? 'success' : 'danger'} light`}>{invDupe.items.is_paid ? 'lunas' : 'belum lunas'}</span>
                                </div>
                            </div>
                            <div className="invoice-amount">
                                <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">Total Transaksi</p>
                                        <p className="invoice-text">
                                            <NumberFormat intlConfig={{
                                                value: invDupe.items.amount_due, 
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
                                        <p className="label-text">Total Bayar</p>
                                        <p className="invoice-text">
                                            <NumberFormat intlConfig={{
                                                value: totalPaid, 
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
                                        <p className="label-text">jumlah yang harus dibayar</p>
                                        <p className="invoice-text">
                                            <NumberFormat intlConfig={{
                                                value: totalPaid == 0 ? invDupe.items.amount_due : ((totalPaid - invDupe.items.amount_due) > 0 ? 0 :(invDupe.items.amount_due - totalPaid)), 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                                }} 
                                            />
                                        </p>
                                    </div>
                                </div>
                                {/* <div className="card-amount">
                                    <div className="invoice-info-group">
                                        <p className="label-text">sisa bon</p>
                                        <p className="invoice-text"><span className="currency">Rp</span> 0</p>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <div className="invoice-transaction">
                            <p className="inv-table-title">detail transaksi</p>
                            <div style={{width: '100%'}}>
                                {/* <table className="table"> */}
                                {/* <InvoiceDoc data={{invoice: data.items, order: salesList, payment: paymentData}} /> */}
                                {salesList ? (salesList.map((sales, idx) => {
                                    return(
                                    <>
                                    <table className="table" key={`transaction-table-${idx}`} id='tes'>
                                        <thead>
                                            <tr className='order-number-tab'>
                                                <th className='inv-tab-primary'>Order ID:</th>
                                                <th className='inv-tab-primary'>{sales.order_id}</th>
                                            </tr>
                                            <tr>
                                                <th>tanggal</th>
                                                <th>item</th>
                                                <th>qty</th>
                                                <th>satuan</th>
                                                <th>diskon/item</th>
                                                <th>jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sales.order_items.length > 0 && sales.order_items.map((orderItem, index) => {
                                                return( 
                                                    <tr style={{textTransform:'capitalize'}}>
                                                        {index == 0 ? 
                                                            (
                                                                <td rowSpan={`${sales.order_items.length}`}>{ConvertDate.convertToFullDate(sales.order_date,"/")}</td>
                                                            ):''
                                                        }
                                                        <td>{`${orderItem.product.product_name}  ${orderItem.product.variant}`}</td>
                                                        <td>{orderItem.return_order_item ? 
                                                            `${Number(orderItem.quantity)} (-${Number(orderItem.return_order_item.quantity)})`
                                                            : `${Number(orderItem.quantity)}`
                                                        }
                                                        </td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                    value: orderItem.sell_price, 
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                value: orderItem.discount_prod_rec, 
                                                                locale: "id-ID",
                                                                style: "currency", 
                                                                currency: "IDR",
                                                                }} 
                                                            />
                                                            {/* <span style={{textTransform: 'lowercase'}}>{`(x${Number(orderItem.quantity)})`}</span> */}
                                                        </td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                value: orderItem.return_order_item ? 
                                                                (((Number(orderItem.quantity) - Number(orderItem.return_order_item.quantity)) * Number(orderItem.sell_price)) - ((Number(orderItem.quantity) - Number(orderItem.return_order_item.quantity))*orderItem.discount_prod_rec)) 
                                                                : ((Number(orderItem.quantity) * Number(orderItem.sell_price)) - (Number(orderItem.quantity)*orderItem.discount_prod_rec)), 
                                                                locale: "id-ID",
                                                                style: "currency", 
                                                                currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            {sales.orders_credit ?
                                            (
                                                <>
                                                {sales.orders_credit.return_order.return_order_items.map((roItem, roItemIdx) => {
                                                    return (
                                                    <tr style={{textTransform:'capitalize'}}>
                                                        <td></td>
                                                        {/* {roItemIdx == 0 ? 
                                                            // (
                                                            //     // <td rowSpan={`${sales.orders_credit.return_order.return_order_items.length}`}>{ConvertDate.convertToFullDate(sales.order_date,"/")}</td>
                                                            // ):''
                                                        } */}
                                                        <td>{`+${roItem.order_item.product.product_name}  ${roItem.order_item.product.variant}`}</td>
                                                        <td>{Number(roItem.quantity)}</td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                    value: roItem.order_item.sell_price, 
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                value: roItem.order_item.discount_prod_rec, 
                                                                locale: "id-ID",
                                                                style: "currency", 
                                                                currency: "IDR",
                                                                }} 
                                                            />
                                                            {/* <span style={{textTransform: 'lowercase'}}>{`(x${Number(orderItem.quantity)})`}</span> */}
                                                        </td>
                                                        <td>
                                                            <NumberFormat intlConfig={{
                                                                value: roItem.return_value,
                                                                locale: "id-ID",
                                                                style: "currency", 
                                                                currency: "IDR",
                                                                }} 
                                                            />
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                                
                                                </>
                                            )
                                            :''}
                                            {sales.order_discount && Number(sales.order_discount) !== 0 ?
                                                (
                                                <tr>
                                                    <td colSpan="4"></td>
                                                    <td className="each-total-title"  style={{fontWeight: 500}}>diskon order</td>
                                                    <td className="each-total-text"  style={{fontWeight: 500}}>
                                                        <NumberFormat intlConfig={{
                                                            value: sales.order_discount, 
                                                            locale: "id-ID",
                                                            style: "currency", 
                                                            currency: "IDR",
                                                            }} 
                                                        />
                                                    </td>
                                                </tr>
                                                ): null
                                            }
                                            <tr>
                                                <td colSpan="4"></td>
                                                <td className="each-total-title">total</td>
                                                <td className="each-total-text">
                                                    <NumberFormat intlConfig={{
                                                        value: Number(sales.grandtotal) + (sales.orders_credit ? (Number(sales.orders_credit.return_order.refund_total)):0) - (sales.return_order ? (Number(sales.return_order.refund_total)):0),
                                                        locale: "id-ID",
                                                        style: "currency", 
                                                        currency: "IDR",
                                                        }} 
                                                    />
                                                </td>
                                            </tr>
                                            {idx == salesList.length-1 ? 
                                                (
                                                <tr className="grand-total">
                                                    <td colSpan="4"></td>
                                                    <td className="each-total-title">Total seluruh transaksi</td>
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
                                            :""}
                                        </tbody>
                                    </table>

                                  
                                    
                                    </>
                                    )
                                })):""}
                            </div>
                        </div>
                        
                        <div className="invoice-payment">
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
                                                                        <td className="each-total-title">Total bayar</td>
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
                        </div>

                        {/* return order detail if return method id is 2 or potong tagihan  */}
                        
                        {roList && roList.length >0 ? 
                            (
                            <div className="invoice-transaction">
                                <p className="inv-table-title">detail pengembalian</p>
                                <p className="inv-table-desc">Detail pengembalian ini hanya untuk transparansi data. Seluruh data transaksi sudah mencakup data pengembalian yang ada.</p>
                                {/* <div style={{width: '100%'}}> */}
                                    {roList.map((ro, idx) => {
                                        return(
                                            <>
                                            <div className='table-top-desc-wrap'>
                                                <div className='table-desc-wrap-inline'>
                                                    <div className='table-desc-inline'>
                                                        <p className='table-desc-title'>tanggal order:</p>
                                                        <p className='table-desc-value'>{ConvertDate.convertToFullDate(ro.order.order_date,"/")}</p>
                                                    </div>    
                                                    <div className='table-desc-inline'>
                                                        <p className='table-desc-title'>tanggal pengembalian:</p>
                                                        <p className='table-desc-value'>{ConvertDate.convertToFullDate(ro.return_date,"/")}</p>
                                                    </div>
                                                </div>
                                                <div className='table-desc-inline'>
                                                    <p className='table-desc-title'>Metode pengembalian:</p>
                                                    <p className='table-desc-value'>{ro.return_method}</p>
                                                </div>
                                            </div>
                                            <table className="table" key={`transaction-table-${idx}`}>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>item</th>
                                                        <th>order qty</th>
                                                        <th></th>
                                                        <th>pengembalian</th>
                                                        <th>Alasan pengembalian</th>
                                                        <th>jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {ro.return_order_items?.map((roItem, index) => {
                                                    console.log(roItem)
                                                    return (
                                                        <>
                                                        <tr style={{textTransform:'capitalize'}}>
                                                            <td style={{fontWeight: 500, paddingLeft: '2rem'}}>{index+1}</td>
                                                            <td>{`${roItem.order_item.product.product_name}  ${roItem.order_item.product.variant}`}</td>
                                                            <td>
                                                                {
                                                                    Number(roItem.order_item.quantity)
                                                                }
                                                            </td>
                                                            <td><i class='bx bxs-chevrons-right'></i></td>
                                                            <td>
                                                                {/* {Number(roItem.quantity) - Number(orderItem.return_order_item.quantity)} */}
                                                                {Number(roItem.quantity)}
                                                            </td>
                                                            <td>
                                                                {roItem.reason}
                                                            </td>
                                                            <td>
                                                                <NumberFormat intlConfig={{
                                                                    // value: (((Number(roItem.order_item.quantity) - Number(roItem.quantity)) * Number(roItem.order_item.sell_price)) - ((Number(roItem.order_item.quantity) - Number(roItem.quantity))*roItem.order_item.discount_prod_rec)),
                                                                    value: roItem.return_value,
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                    }} 
                                                                />
                                                            </td>
                                                        </tr>
                                                        {index == ro.return_order_items.length-1 ?
                                                            (
                                                            <tr>
                                                                <td colSpan="5"></td>
                                                                <td className="each-total-title">total</td>
                                                                <td className="each-total-text">
                                                                    <NumberFormat intlConfig={{
                                                                        value: ro.refund_total, 
                                                                        locale: "id-ID",
                                                                        style: "currency", 
                                                                        currency: "IDR",
                                                                        }} 
                                                                    />
                                                                </td>
                                                            </tr>
                                                            ):''
                                                        }
                                                        {idx == roList.length-1 ? 
                                                            (
                                                            <tr className="grand-total">
                                                                <td colSpan="5"></td>
                                                                <td className="each-total-title">Total pengembalian</td>
                                                                <td className="each-total-text">
                                                                    <NumberFormat intlConfig={{
                                                                        value: ro.refund_total, 
                                                                        locale: "id-ID",
                                                                        style: "currency", 
                                                                        currency: "IDR",
                                                                        }} 
                                                                    />
                                                                </td>
                                                            </tr>
                                                            )
                                                        :""}
                                                        </>
                                                    )
                                                })}
                                                </tbody>
                                            </table>
                                        </>
                                        )
                                    })}
                                {/* </div> */}
                            </div>
                            )
                            :''
                        }
                        <div className="invoice-footer">
                            <p className="invoice-footer-text">Thank you for your business!</p>
                        </div>
                    </div>
                    <div className='inv-tools' style={{width: '25%'}}>
                        {/* send invoice card */}
                        <div className='card static-shadow cust-card-inv' style={{minHeight: '200px', padding: '1.5rem 1.7rem'}}>
                            <div className="card-header">
                                <div className='cust-img-wrap'>
                                    <img src={invDupe.items.customer?.img} />
                                </div>
                                <span className='card-title'>{invDupe.items.customer.name}</span>
                            </div>
                            <div className="card-sub-header mb-3">
                                <div style={{display: 'inline-flex', gap: '1rem'}}>
                                    <p className='sub-header'>Email:</p>
                                    <p className='sub-header'>{invDupe.items.customer.email ? invDupe.items.customer.email : "-"}</p>
                                </div>
                                <div style={{display: 'inline-flex', gap: '1rem'}}>
                                    <p className='sub-header'>Phonenumber:</p>
                                    <p className='sub-header'>{invDupe.items.customer.phonenumber}</p>
                                </div>
                                
                            </div>

                            

                            <Dropdown style={{marginBottom: '.25rem'}}>
                                <Dropdown.Toggle className="btn btn-primary btn-w-icon" style={{fontWeight: 600, width: '100%'}}>
                                    {/* <i className='bx bxs-send'></i> */}
                                    <span style={{marginRight: '.3rem'}}>Send invoice</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as="button" href="#/action-1"><i class='bx bx-envelope'></i>Email</Dropdown.Item>
                                    <Dropdown.Item as="button" href="#/action-2"><i class='bx bxl-whatsapp'></i>Whatsapp</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            {
                                invDupe.items.is_paid ?
                                (
                                    <button type="button" className="btn btn-success btn-w-icon mt-2" onClick={onHide}>
                                        {/* <i className='bx bxs-send'></i> */}
                                        send receipt
                                    </button> 
                                ):''
                            }
                        </div>
                        
                        {/* add payment card */}
                        <div className='card static-shadow cust-card-inv' style={{minHeight: '100px', padding: '1.5rem 1.7rem'}}>
                            <div className="card-header" style={{display: 'block'}}>
                                <div className='remaining-payment'>
                                    <p className='card-title' style={{marginBottom: '.8rem', color: '#929292'}}>remaining</p>
                                    <NumberFormat intlConfig={{
                                        value: invDupe.items.remaining_payment, 
                                        locale: "id-ID",
                                        style: "currency", 
                                        currency: "IDR",
                                        }} 
                                    />
                                </div>
                            </div>
                            <button type="button" className="btn btn-success btn-w-icon mt-2" disabled={invDupe.items.is_paid ? true : false} 
                                aria-label='addPaymentModal' onClick={(e) => handleModal(e, {id: invDupe.id, items: {...invDupe.items}})}
                            >
                                <i className='bx bx-plus'></i>
                                Add payment
                            </button> 
                        </div>

                        {/* buttons */}
                        <div className='inv-tool-btns card static-shadow'>
                            <button type="button" className={`btn btn-dark btn-w-icon`}>
                                <i className='bx bxs-file-pdf'></i>
                                <PDFDownloadLink style={{textDecoration: 'none', color: '#ffffff'}} 
                                    document={<InvoiceDoc data={{invoice: invDupe.items, order: salesList, payment: paymentData}} />} 
                                    fileName={`${(invDupe.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(invDupe.items.customer?.name)}.pdf`}>
                                    {({ loading }) => (loading ? 'Loading...' : 'Download PDF')}
                                </PDFDownloadLink>
                            </button>
                            {
                                data.items.is_paid ? 
                                (
                                    <button type="button" className={`btn btn-light light btn-w-icon`}>
                                        <i className='bx bxs-receipt'></i>
                                        <PDFDownloadLink style={{textDecoration: 'none', color: '#262626'}} 
                                            document={<InvoiceDoc data={{invoice: invDupe.items, order: salesList, payment: paymentData}} />} 
                                            fileName={`${(invDupe.items.invoice_number).toUpperCase()} - ${capitalizeEveryWord(invDupe.items.customer?.name)}.pdf`}>
                                            {({ loading }) => (loading ? 'Loading...' : 'Download Receipt')}
                                        </PDFDownloadLink>
                                    </button>
                                ):''
                            }
                            <div style={{display: 'inline-flex', gap: '.7rem'}}>
                                <button type="button" className={`btn btn-danger light btn-w-icon`} style={{width: '50%'}} onClick={handlePage}>
                                    <i className='bx bxs-printer'></i>Print
                                </button>
                                <button type="button" className={`btn btn-success light btn-w-icon`} style={{width: '50%'}} onClick={handlePage}>
                                    <i className='bx bxs-printer'></i>excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
                
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>OK</button>
                {/* <button type="button" className="btn btn-primary" onClick={{}}>Add payment</button> */}
            </Modal.Footer>
        </Modal>

        {/* modal */}
        { showModal === "addPaymentModal" ? 
            (
                <CreatePayment
                    show={showModal === "addPaymentModal" ? true : false} 
                    onHide={() => setShowModal("")} 
                    source={'invoice'}
                    totalCart={showModal === "addPaymentModal" && invData ? invData.items.remaining_payment : ""} 
                    data={invData}
                    multiple={true}
                    stack={1}
                    returnValue={(newPaymentData) => {setPaidData(newPaymentData);console.log(newPaymentData)}} 
                />
            ):''
        }

        {/* toast area */}
        <Toast ref={toast} />
        </>
    )
}