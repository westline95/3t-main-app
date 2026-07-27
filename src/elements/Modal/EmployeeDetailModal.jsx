import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import User from "../../assets/images/Avatar 1.jpg";
import ConvertDate from '../../assets/js/ConvertDate';
import NumberFormat from '../Masking/NumberFormat';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


export default function EmployeeDetailModal({show, onHide, data}) {    
    const axiosPrivate = useAxiosPrivate();
    const [ empByID, setEmpByID ] = useState(data);
    const [ empDetail, setEmpDetail ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(true);
    
    const fetchEmpByID = async () => {
    await axiosPrivate.get(`/employee-by`, { params: {employee_id: data}})
        .then((response) => {
            console.log(response)
            setEmpDetail(response.data);
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

    useEffect(() => {
        fetchEmpByID();
    },[])

    useEffect(() => {
        if(empDetail){
            setIsLoading(false);
        }
    },[empDetail]);

    if(isLoading){
        return;
    }

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
                {empDetail !== "" || empDetail !== null ?
                    (<Modal.Body>
                        <div className="cards-header">
                            <div className="cards-detail">
                                <h3 className="cards-title" style={{textTransform: 'capitalize'}}>{empDetail.name}</h3>
                                <div style={{display: 'inline-flex', gap: 24}}>
                                    <div className="cards-info-group">
                                        <p className="label-text">ID karyawan</p>
                                        <p className="cards-text">{empDetail.employee_id}</p>
                                    </div>
                                    <div className="cards-info-group">
                                        <p className="label-text">tanggal rekrut</p>
                                        <p className="cards-text">{empDetail.hired_date && ConvertDate.convertToFullDate(empDetail.hired_date, "/")}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-detail">
                                <div className="profile-img">
                                    <img src={empDetail.img} alt="" />
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
                        <div className="col-lg-12 col-sm-12 col-md-12 col-12 cust-group-stat">
                            <div className="card static-shadow">
                                <div className="row gy-4">
                                    <div className="col-lg-4 col-sm-6 col-12">
                                        <p className="card-title">Limit hutang</p>
                                        <h3 className="stat-card-val">
                                            <NumberFormat intlConfig={{
                                                value: empDetail.debt_limit, 
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
                                                value: empDetail.salary_settings[0]?.salary_amount ? empDetail.salary_settings[0]?.salary_amount : 0 , 
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
                                    <p className="cards-text">{empDetail.name}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">tanggal lahir</p>
                                    <p className="cards-text">{empDetail.dob && ConvertDate.convertToFullDate(empDetail.dob, "/")}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">jenis kelamin</p>
                                    <p className="cards-text">{empDetail.gender}</p>
                                </div>
                                {/* <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">email</p>
                                    <p className="cards-text" style={{textTransform: "unset"}}>{data.email}</p>
                                </div> */}
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">nomor telepon</p>
                                    <p className="cards-text">{empDetail.phonenumber}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">alamat</p>
                                    <p className="cards-text">{empDetail.address}</p>
                                </div>
                                <div className="cards-info-group d-flex justify-content-between">
                                    <p className="label-text">status karyawan</p>
                                    <div className="badge-wraping">
                                        <span className={`badge badge-${empDetail.is_active ? 'primary' : 'danger'} light`} style={{borderRadius: 17, textTransform:'capitalize'}}>
                                            {empDetail.is_active ? 'aktif' : 'non-aktif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* salary setting info*/}
                        <p className="modal-section-title">Informasi gaji awal</p>
                        <div key={`container-sett`} className="cards-content" style={{paddingTop: 16}}>    
                            {empDetail.salary_settings[0] ? empDetail.salary_settings.map((salary, index) => {
                                return(
                                    <div className="card card-table w-100 static-shadow" key={index}>
                                        {/* <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">Tipe gaji</p>
                                            <p className="cards-text">{salary.salary_type}</p>
                                        </div> */}
                                        <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">gaji</p>
                                            <p className="cards-text">
                                                <NumberFormat intlConfig={{
                                                    value: salary.base_salary, 
                                                    locale: "id-ID",
                                                    style: "currency", 
                                                    currency: "IDR",
                                                }} 
                                                />
                                            </p>
                                        </div>
                                        <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">status uang rokok</p>
                                            {/* <p className="cards-text"> */}
                                            <div className="badge-wraping">
                                                <span className={`badge badge-${salary.status_uang_rokok ? 'success' : 'danger'} light`} style={{borderRadius: 17, textTransform:'capitalize'}}>
                                                    {salary.status_uang_rokok ? "disimpan" : "tidak disimpan"}
                                                </span>
                                            </div>
                                        </div>
                                        {/* <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">email</p>
                                            <p className="cards-text" style={{textTransform: "unset"}}>{data.email}</p>
                                        </div> */}
                                        <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">berlaku mulai tanggal</p>
                                            <p className="cards-text">{salary.effective_date ? ConvertDate.convertToFullDate(salary.effective_date, "/") : '???'}</p>
                                        </div>
                                        {/* <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">berakhir tanggal</p>
                                            <p className="cards-text">{salary.end_date ? ConvertDate.convertToFullDate(salary.end_date, "/") : '???'}</p>
                                        </div> */}

                                    </div>
                                )
                            }):(
                                <div className="card card-table w-100 static-shadow">
                                    <p className="label-text" style={{marginBottom: 0, fontSize: 14}}>Pengaturan gaji belum ditentukan.</p>
                                </div>
                            )}
                        </div>

                        {/* department info */}
                        <p className="modal-section-title">Departemen</p>
                        <div className="cards-content" style={{paddingTop: 16}}>
                            <div className="card card-table w-100 static-shadow">
                            {empDetail.department_histories[0] ? empDetail.department_histories.map((dh, index) => {
                                return(
                                    <div key={`dh-${index}`}>
                                        <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">team</p>
                                            <p className="cards-text">{dh.department?.department_name}</p>
                                        </div>
                                        <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">posisi</p>
                                            <p className="cards-text">{dh.position}</p>
                                        </div>
                                        <div className="cards-info-group d-flex justify-content-between">
                                            <p className="label-text">diposisikan tanggal</p>
                                            <p className="cards-text">{ConvertDate.convertToFullDate(dh.date, "/")}</p>
                                        </div>
                                    </div>
                                )
                            }):(
                                <p className="label-text" style={{marginBottom: 0, fontSize: 14}}>Penempatan posisi dan departmen belum ditentukan.</p>
                            )
                            }
                            </div>
                        </div>
                        {/* informasi akun */}
                        <p className="modal-section-title">informasi akun</p>
                        <div className="cards-content" style={{paddingTop: 16}}>
                            <div className="card card-table w-100 static-shadow">
                            {empDetail.user_id ? 
                                (
                                <div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">nama pengguna</p>
                                        <p className="cards-text">{empDetail.user.user_name}</p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">email</p>
                                        <p className="cards-text" style={{textTransform: 'none'}}>{empDetail.user.user_mail}</p>
                                    </div>
                                    <div className="cards-info-group d-flex justify-content-between">
                                        <p className="label-text">role</p>
                                        <p className="cards-text">{empDetail.user.role}</p>
                                    </div>
                                </div>
                                )
                            :(
                                <p className="label-text" style={{marginBottom: 0, fontSize: 14}}>Akun karyawan belum dibuat.</p>
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