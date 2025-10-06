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


export default function DeliveryGroupListReportModal({show, onHide, data}) {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const [ countItem, setCountItem ] = useState(0);
    const [ dataPoint, setDataPoint ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ invData, setInvData ] = useState(false);
    const [ showModal, setShowModal ] = useState("");
    const [ paidData, setPaidData ] = useState(null);
    const [ dg, setDG ] = useState(null);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ isLoading, setIsLoading ] = useState(true);
    const [ salesList, setSalesList ] = useState(null);
    const [ roList, setROList ] = useState(null);
    const [ invStatus, setInvStatus ] = useState(null);
    const [ paymentData, setPaymentData] = useState(null);
    const [ dgReportList, setDgReportList] = useState([]);
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

    const handleModal = (e, inv) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "addPaymentModal":
                setInvData(inv);
                setShowModal("addPaymentModal");
            break;
        }
    };

    const fetchDG = async() =>{
        await axiosPrivate.get("/delivery-group/by", {params: {id: data.id}})
        .then(resp => {
            console.log(resp.data)
            setDG(resp.data);
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Gagal",
                detail: "Gagal mendapatkan data delivery group",
                life: 3000,
            });
        })
    }

    useEffect(() => {
        fetchDG();
    },[]);  

    useEffect(() => {
        if(dg){
            setIsLoading(false);
        }
    },[dg])

    if(isLoading){
        return;
    }

    return(
        <>
        <Modal dialogClassName={isMobile || isMediumScr ? 'modal-fullscreen' : 'modal-xl'} show={show} onHide={onHide} scrollable={true} centered={true}  id="invoiceDetailModal" >
            <Modal.Header closeButton>
                <Modal.Title style={{marginRight: '1rem'}}>laporan pengantaran harian</Modal.Title>
                <span>
                    {/* <InputWSelect
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
                    /> */}
                </span>
            </Modal.Header>
            <Modal.Body ref={componentRef}>
                <div className='prev-inv-container' style={{display: 'flex', flexDirection: isMobile || isMediumScr ? 'column' : 'row', width: '100%', gap:'3rem'}}>
                    <div className='card static-shadow prev-inv-content' style={{width: '100%'}}>
                        <div className='invoice-wrapper'>
                            <div className="invoice-header">
                                <div className="invoice-detail">
                                    <h3 className="invoice-title">Laporan pengantaran harian</h3>
                                    <div className="invoice-info-group">
                                        <p className="label-text">ID pengantaran</p>
                                        <p className="invoice-text" style={{textTransform: 'uppercase'}}>#{dg.delivery_group_id}</p>
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'row', gap: '2rem'}}>
                                        <div className="invoice-info-group">
                                            <p className="label-text">tanggal laporan</p>
                                            <p className="invoice-text">
                                                {ConvertDate.convertToBeautyDate(dg.delivery_group_date)}
                                            </p>
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
                                <div className="invoice-cust-info" style={{width: '60%'}}>
                                    <div className="invoice-info-group">
                                        <p className="label-text">nama karyawan</p>
                                        <p className="invoice-text" style={{marginBottom:17}}>{dg.employee?.name}</p>
                                    </div>
                                    <div className="invoice-info-group">
                                        <p className="label-text">ID karyawan</p>
                                        <p className="invoice-text" style={{marginBottom:17}}>{dg.employee_id}</p>
                                    </div>
                                    <div className="invoice-info-group">
                                        <p className="label-text">status</p>
                                        <p className="invoice-text" style={{marginBottom:17}}>
                                            <span className={`badge badge-${
                                                !dg.delivery_group_report ? 'secondary' 
                                                : dg.delivery_group_report.report_status == 0 ? 'warning' 
                                                : dg.delivery_group_report.report_status == 1 ? 'primary' 
                                                : dg.delivery_group_report.report_status == 2 ? 'danger' 
                                                : 'secondary'} 
                                                light`}
                                            >
                                                { !dg.delivery_group_report ? 'belum ada laporan' 
                                                : dg.delivery_group_report.report_status == 0 ? 'sedang ditinjau' 
                                                : dg.delivery_group_report.report_status == 1 ? 'disetujui' 
                                                : dg.delivery_group_report.report_status == 2 ? 'ditolak' 
                                                : 'N/A'} 
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="invoice-amount" style={{alignItems: 'center'}}>
                                    <div className="card-amount" style={{width: '50%'}}>
                                        <div className="invoice-info-group">
                                            <p className="label-text">Total item keluar</p>
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
                                    <div className="card-amount" style={{width: '50%'}}>
                                        <div className="invoice-info-group">
                                            <p className="label-text">Total setoran</p>
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
                                {/* <div className='inv-bank-info'>
                                    <div className="invoice-info-group">
                                        <p className="label-text" style={{marginBottom:3}}>Informasi Pembayaran</p>
                                        <p className="invoice-text" style={{marginBottom:3}}><span className="label-text">Bank Transfer:</span> BRI</p>
                                        <p className="invoice-text" style={{marginBottom:3}}><span className="label-text">A/N:</span> Anton Ruchiat</p>
                                        <p className="invoice-text" style={{marginBottom:0}}><span className="label-text">Nomor rekening:</span> 005301102808501</p>
                                    </div>
                                </div> */}
                            </div>
                           
                            <div className="invoice-transaction mt-4">
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent:'space-between'
                                }}>
                                    <p className="inv-table-title">detail pengantaran</p>
                                    <button type="button" className="add-btn btn btn-primary light btn-w-icon" 
                                        aria-label="createInvModal"
                                        onClick={(e) =>
                                            handleModal(e, {
                                                endpoint: "custType",
                                                action: "insert",
                                            })
                                        }
                                    >
                                        <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                                        daftar pengantaran
                                    </button>
                                </div>
                                <div className='table-responsive'>
                                    {/* <table className="table"> */}
                                    {/* <InvoiceDoc data={{invoice: data.items, order: salesList, payment: paymentData}} /> */}
                                    {dgReportList ? (dgReportList.map((sales, idx) => {
                                        return(
                                        <>
                                        <table className="table" key={`delivery-list`} id='tes'>
                                            <thead>
                                                <tr>
                                                    <th>pelanggan</th>
                                                    <th>item</th>
                                                    <th>catatan</th>
                                                    <th>qty</th>
                                                    <th>diskon</th>
                                                    <th>jumlah</th>
                                                    <th>bayar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dgReportList.length > 0 && dgReportList.order_items.map((orderItem, index) => {
                                                    return( 
                                                        <tr key={index} style={{textTransform:'capitalize'}}>
                                                            {index == 0 ? 
                                                                (
                                                                    <td rowSpan={`${dgReportList.order_items.length}`}>{}</td>
                                                            ):''} 
                                                            <td>{`${orderItem.product.product_name} ${orderItem.product.variant}`}</td>
                                                            <td>catatan</td>
                                                            <td>{Number(orderItem.quantity)}</td>
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
                                                                    value: ((Number(orderItem.quantity) * Number(orderItem.sell_price)) - (Number(orderItem.quantity)*orderItem.discount_prod_rec)), 
                                                                    locale: "id-ID",
                                                                    style: "currency", 
                                                                    currency: "IDR",
                                                                    }} 
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <td colSpan="4"></td>
                                                    <td className="each-total-title" style={{textAlign:'right'}}>total</td>
                                                    <td className="each-total-text">
                                                        <NumberFormat intlConfig={{
                                                            value: Number(dgReportList.grandtotal),
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

                                    
                                        
                                        </>
                                        )
                                    })):""}
                                </div>
                            </div>

                            <div className="invoice-footer">
                                <p className="invoice-footer-text">Thank you for your business!</p>
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