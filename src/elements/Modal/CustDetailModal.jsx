import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import User from "../../assets/images/Avatar 1.jpg";
import ConvertDate from '../../assets/js/ConvertDate';
import NumberFormat from '../Masking/NumberFormat';

export default function CustDetailModal({show, onHide, data}) {
    
    return(
        <Modal size='lg' show={show} onHide={onHide} scrollable={true} centered={true} id="custDetailModal">
            <Modal.Header closeButton>
                <Modal.Title>customer detail</Modal.Title>
                <div className="modal-btn-wrap">
                    <button type="button" className="modal-btn"><i className='bx bxs-file-pdf'></i></button>
                    <button type="button" className="modal-btn"><i className='bx bx-printer'></i></button>
                    <button type="button" className="modal-btn"><i className='bx bx-printer'></i></button>
                </div>
            </Modal.Header>
                {data !== "" ?
                    (<Modal.Body>
                        <div className="cards-header">
                            <div className="cards-detail">
                                <h3 className="cards-title" style={{textTransform: 'capitalize'}}>{data.name}</h3>
                                <div className="cards-info-group">
                                    <p className="label-text">customer ID</p>
                                    <p className="cards-text">{data.customer_id}</p>
                                </div>
                            </div>
                            <div className="company-detail">
                                <div className="company-img">
                                    <img src={data.img} alt="" />
                                </div>
                            </div>
                        </div>
                        {/* <div className="cards-amount">
                            <div className="card-amount">
                                <div className="cards-info-group">
                                    <p className="label-text">Credit/debt Limit</p>
                                    <p className="cards-text">
                                        <NumberFormat intlConfig={{
                                            value: data.debt_limit, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} 
                                        />
                                    </p>
                                </div>
                            </div>
                            <div className="card-amount">
                                <div className="cards-info-group">
                                    <p className="label-text">Total Sales</p>
                                    <p className="cards-text">
                                        <NumberFormat intlConfig={{
                                            value: data.total_sales, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} 
                                        />
                                    </p>
                                </div>
                            </div>
                            <div className="card-amount">
                                <div className="cards-info-group">
                                    <p className="label-text">Total Debt</p>
                                    <p className="cards-text">
                                        <NumberFormat intlConfig={{
                                            value: data.total_debt, 
                                            locale: "id-ID",
                                            style: "currency", 
                                            currency: "IDR",
                                        }} 
                                        />
                                    </p>
                                </div>
                            </div>
                        </div> */}
                        <div className="col-lg-12 col-sm-12 col-md-6 col-12 cust-group-stat">
                            <div className="card static-shadow">
                                <div className="row gy-4">
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <p className="card-title">Limit hutang</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: data.debt_limit, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                        />
                                        </h3>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <p className="card-title">total penjualan</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: data.total_sales, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </h3>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <p className="card-title">total hutang</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: data.total_debt, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </h3>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <p className="card-title">kredit</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: data.credit, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="modal-section-title">profile</p>
                        <div className="cards-content" style={{paddingTop: 16}}>
                            <div className="card card-table w-100 static-shadow" style={{paddingTop: 24}}>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">customer name</p>
                                    <p className="cards-text">{data.name}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">date of birth</p>
                                    <p className="cards-text">{data.dob ? ConvertDate.FriendlyDate(data.dob) : "-"}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">gender</p>
                                    <p className="cards-text">{data.gender}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">email</p>
                                    <p className="cards-text" style={{textTransform: "unset"}}>{data.email}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">phone</p>
                                    <p className="cards-text">{data.phonenumber}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">country</p>
                                    <p className="cards-text">{data.country}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">province</p>
                                    <p className="cards-text">{data.province}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">city</p>
                                    <p className="cards-text">{data.city}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">postal code</p>
                                    <p className="cards-text">{data.postalCode}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">address</p>
                                    <p className="cards-text">{data.address}</p>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    ):""
                }
                {/* <!-- <div className="invoice-footer">
                    <p className="invoice-footer-text">Thank you for your business!</p>
                </div> --> */}
            <Modal.Footer>
                <button type="button" className="btn btn-primary" onClick={onHide}>OK</button>
            </Modal.Footer>
        </Modal>
    )
}