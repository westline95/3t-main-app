import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import User from "../../assets/images/Avatar 1.jpg";
import ConvertDate from '../../assets/js/ConvertDate';
import NumberFormat from '../Masking/NumberFormat';

export default function EmployeeDetailModal({show, onHide, data}) {
    console.log(data)
    
    return(
        <Modal size='lg' show={show} onHide={onHide} scrollable={true} centered={true} id="custDetailModal">
            <Modal.Header closeButton>
                <Modal.Title>detail karyawan</Modal.Title>
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
                                <div style={{display: 'inline-flex', gap: 24}}>
                                    <div className="cards-info-group">
                                        <p className="label-text">ID karyawan</p>
                                        <p className="cards-text">{data.employee_id}</p>
                                    </div>
                                    <div className="cards-info-group">
                                        <p className="label-text">tanggal rekrut</p>
                                        <p className="cards-text">{data.hired_date && ConvertDate.convertToFullDate(data.hired_date, "/")}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-detail">
                                <div className="profile-img">
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
                                    <div className="col-lg-4 col-sm-6 col-12">
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
                                    <div className="col-lg-4 col-sm-6 col-12">
                                        <p className="card-title">Gaji aktif</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: data.salary_settings[0]?.salary_amount ? data.salary_settings[0]?.salary_amount : 0 , 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </h3>
                                    </div>
                                    <div className="col-lg-4 col-sm-6 col-12">
                                        <p className="card-title">total pinjaman</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: 0, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </h3>
                                    </div>
                                    {/* <div className="col-lg-3 col-sm-6 col-12">
                                        <p className="card-title">total hutang</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: 0, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </h3>
                                    </div> */}
                                    
                                </div>
                            </div>
                        </div>
                        <p className="modal-section-title">profil</p>
                        <div className="cards-content" style={{paddingTop: 16}}>
                            <div className="card card-table w-100 static-shadow">
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">nama karyawan</p>
                                    <p className="cards-text">{data.name}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">tanggal lahir</p>
                                    <p className="cards-text">{data.dob && ConvertDate.convertToFullDate(data.dob, "/")}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">jenis kelamin</p>
                                    <p className="cards-text">{data.gender}</p>
                                </div>
                                {/* <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">email</p>
                                    <p className="cards-text" style={{textTransform: "unset"}}>{data.email}</p>
                                </div> */}
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">nomor telepon</p>
                                    <p className="cards-text">{data.phonenumber}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">alamat</p>
                                    <p className="cards-text">{data.address}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">status karyawan</p>
                                    <div className="badge-wraping">
                                        <span className={`badge badge-${data.is_active ? 'primary' : 'danger'} light`} style={{borderRadius: 17, textTransform:'capitalize'}}>
                                            {data.is_active ? 'aktif' : 'non-aktif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* salary setting info*/}
                        <p className="modal-section-title">Informasi gaji</p>
                        <div className="cards-content" style={{paddingTop: 16}}>
                            <div className="card card-table w-100 static-shadow">
                            {data.salary_settings[0] ? data.salary_settings.map((salary, index) => {
                                return(
                                    <>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">Tipe gaji</p>
                                        <p className="cards-text">{salary.salary_type}</p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">gaji</p>
                                        <p className="cards-text">
                                            <NumberFormat intlConfig={{
                                                value: salary.salary_amount, 
                                                locale: "id-ID",
                                                style: "currency", 
                                                currency: "IDR",
                                            }} 
                                            />
                                        </p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">status uang rokok</p>
                                        <p className="cards-text">{salary.status_uang_rokok ? "disimpan" : "tidak disimpan"}</p>
                                    </div>
                                    {/* <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">email</p>
                                        <p className="cards-text" style={{textTransform: "unset"}}>{data.email}</p>
                                    </div> */}
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">mulai tanggal</p>
                                        <p className="cards-text">{salary.start_date ? ConvertDate.convertToFullDate(salary.start_date, "/") : '???'}</p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">berakhir tanggal</p>
                                        <p className="cards-text">{salary.end_date ? ConvertDate.convertToFullDate(salary.end_date, "/") : '???'}</p>
                                    </div>
                                    </>
                                )
                            }):(
                                <p className="label-text" style={{marginBottom: 0, fontSize: 14}}>Pengaturan gaji belum ditentukan.</p>
                            )
                            }
                            </div>
                        </div>

                        {/* department info */}
                        <p className="modal-section-title">Departemen</p>
                        <div className="cards-content" style={{paddingTop: 16}}>
                            <div className="card card-table w-100 static-shadow">
                            {data.department_histories[0] ? data.department_histories.map((dh, index) => {
                                return(
                                    <>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">team</p>
                                        <p className="cards-text">{dh.department?.department_name}</p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">posisi</p>
                                        <p className="cards-text">{dh.position}</p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">ditentukan tanggal</p>
                                        <p className="cards-text">{ConvertDate.convertToFullDate(dh.date, "/")}</p>
                                    </div>
                                    </>
                                )
                            }):(
                                <p className="label-text" style={{marginBottom: 0, fontSize: 14}}>Penempatan posisi dan departmen belum ditentukan.</p>
                            )
                            }
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