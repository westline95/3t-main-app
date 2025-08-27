import React, { useState } from 'react';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';
import Person from "../assets/images/person.png";
import Trophy1 from "../assets/images/Trophy numb 1.png";
import Trophy2 from "../assets/images/Trophy numb 2.png";
import Trophy3 from "../assets/images/Trophy numb 3.png";
import Tahu from "../assets/images/tahu.png";
import TempeDaun from "../assets/images/tempe-daun.png";
import TempePlastik from "../assets/images/tempe-plastik.png";
import Tauge from "../assets/images/tauge.png";
import useMediaQuery from '../hooks/useMediaQuery';

export default function Dashboard({handleSidebar, showSidebar}){
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const [ isClose, setClose ] = useState(false);

    return(
        <>
            {/* <Sidebar show={isClose} /> */}
            {/* <main className={`main-content ${!showSidebar ? "active" : ""}`}> */}
                {/* <Header onClick={() => isClose ? setClose(false) : setClose(true)} /> */}
                {/* <Header onClick={() => handleSidebar((p) => !p)} /> */}
                <div className="container-fluid mt-3">
                    <div className="searchbox-container mobile">
                        <div className="input-group-right">
                            <span className="input-group-icon input-icon-right"><i className='bx bx-search'></i></span>
                            <input type="text" className="form-control input-w-icon-right" placeholder="Search product..." />
                        </div>
                    </div>
                    <div className={`row gy-${isMediumScr || isMobile ? '0':'4'} cards-dash`}>
                        <div className="col-lg-4 col-sm-12 col-md-12 col-12">
                            <div className="card welcome-card">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="col-lg-6 col-sm-8 col-7">
                                        <h5 className="welcome-title">Welcome back <span className="user-name">kiya</span>!</h5>
                                        <p className="welcome-text">Here whats happing in your account today</p>
                                        <button className="welcome-cta mt-3">See now</button>
                                    </div>
                                    <div className="col-sm-4 col-5 welcome-img">
                                        <img src={Person} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-12 col-md-12 col-12 card-stats">
                            <div className={`row gy-${isMediumScr || isMobile ? '0':'4'}`}>
                                <div className="col-lg-12 col-sm-6 col-md-6 col-12">
                                    <div className="card">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-wrapper blue">
                                                <i className='bx bx-dollar'></i>
                                            </div>
                                            <div>
                                                <h3 className="stat-card-val"><span className="currency"></span> 10M</h3>
                                                <p className="stat-card-text">total sales</p>
                                            </div>
                                        </div>
                                        <span className="stats-trend-up">
                                            <i className='bx bx-trending-up'></i>
                                            <p className="stat-trend-val">5.35%</p>
                                        </span>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-sm-6 col-md-6 col-12">
                                    <div className="card">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-wrapper red">
                                                <i className='bx bx-archive-in'></i>
                                            </div>
                                            <div>
                                                <h3 className="stat-card-val">25</h3>
                                                <p className="stat-card-text">sales return</p>
                                            </div>
                                        </div>
                                        <span className="stats-trend-down">
                                            <i className='bx bx-trending-down'></i>
                                            <p className="stat-trend-val">5.35%</p>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-12 col-md-12 col-12 card-stats">
                            <div className={`row gy-${isMediumScr || isMobile ? '0':'4'}`}>
                                <div className="col-lg-12 col-sm-6 col-md-6 col-12">
                                    <div className="card">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-wrapper yellow">
                                                <i className='bx bx-cart-alt'></i>
                                            </div>
                                            <div>
                                                <h3 className="stat-card-val">538</h3>
                                                <p className="stat-card-text">total orders</p>
                                            </div>
                                        </div>
                                        <span className="stats-trend-up">
                                            <i className='bx bx-trending-up'></i>
                                            <p className="stat-trend-val">5.35%</p>
                                        </span>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-sm-6 col-md-6 col-12">
                                    <div className="card">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-wrapper purple">
                                                <i className='bx bx-receipt'></i>
                                            </div>
                                            <div>
                                                <h3 className="stat-card-val">1.278</h3>
                                                <p className="stat-card-text">invoices due</p>
                                            </div>
                                        </div>
                                        <span className="stats-trend-up">
                                            <i className='bx bx-trending-up'></i>
                                            <p className="stat-trend-val">5.35%</p>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-sm-12 col-md-6 col-12">
                            <div className="card loyal-cust-card">
                                <p className="card-title">top spend customers</p>
                                <p className="stat-card-text mb-2">This Month</p>
                                <div className="loyal-cust-wrap">
                                    <div className="trophy-cust"><img src={Trophy1} alt="" /></div>
                                    <p className="loyal-cust-name">
                                        Anton Ruchiat
                                    </p>
                                    <p className="loyal-cust-sales flex-fill">5M</p>
                                </div>
                                <div className="loyal-cust-wrap">
                                    <div className="trophy-cust"><img src={Trophy2} alt="" /></div>
                                    <p className="loyal-cust-name">Anton Ruchiat</p>
                                    <p className="loyal-cust-sales flex-fill">5M</p>
                                </div>
                                <div className="loyal-cust-wrap">
                                    <div className="trophy-cust"><img src={Trophy3} alt="" /></div>
                                    <p className="loyal-cust-name">Anton Ruchiat</p>
                                    <p className="loyal-cust-sales flex-fill">5M</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-12 col-sm-12 col-md-6 col-12 card-group-stat">
                            <div className="card">
                                <div className="row gy-4">
                                    <div className="col-lg-3 col-sm-6 col-6">
                                        <p className="card-title">total products</p>
                                        <h3 className="stat-card-val">213</h3>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-6">
                                        <p className="card-title">total invoices</p>
                                        <h3 className="stat-card-val">213</h3>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-6">
                                        <p className="card-title">customers</p>
                                        <h3 className="stat-card-val">213</h3>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-6">
                                        <p className="card-title">remaining stock</p>
                                        <h3 className="stat-card-val">213</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-sm-12 col-md-6  col-12 sales-chart">
                            <div className="card">
                                <p className="card-title mb-4">sales analytical</p>
                                <div id="salesAnalytical"></div>
                                <div className="custom-select-opt">
                                    <select className="form-select form-control" aria-label="sales-analy-select" required>
                                        <option value="2024" >2024</option>
                                        <option value="2023">2023</option>
                                        <option value="2022">2022</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-12 col-md-6 col-12 ">
                            <div className="card card-profit">
                                <p className="card-title">profit overview</p>
                                <p className="stat-card-text mb-2">This month</p>
                                {/* <!-- <h3 className="stat-card-val"><span className="currency">Rp</span> 5.000.000</h3> --> */}
                                <div className="mb-4" id="profitCard"></div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-12 col-md-6 col-12 ">
                            <div className="card top-products">
                                <p className="card-title">top products</p>
                                <p className="stat-card-text mb-3">This month</p>
                                <div className="top-product-list-wrap">
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={Tahu} alt="" />
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tahu 14 x 14</p>
                                            <p className="top-prod-category">Tahu</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={Tahu} alt="" />
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tahu 14 x 14</p>
                                            <p className="top-prod-category">Tahu</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={Tahu} alt=""/>
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tahu 14 x 14</p>
                                            <p className="top-prod-category">Tahu</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={Tahu} alt=""/>
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tahu 14 x 14</p>
                                            <p className="top-prod-category">Tahu</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-12 col-md-6 col-12 ">
                            <div className="card order-statistics">
                                <p className="card-title">order statistics</p>
                                <p className="stat-card-text mb-4">10M total sales</p>
                                <h3 className="order-total-val">7.967</h3>
                                <p className="order-total-caption mb-4">Total Orders</p>
                                <div className="top-product-list-wrap">
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={Tahu} alt="tahu" />
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tahu</p>
                                            <p className="top-prod-category">All Variant</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={TempeDaun} alt="tempe daun" />
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tempe Daun</p>
                                            <p className="top-prod-category">All Variant</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={TempePlastik} alt="tempe plastik" />
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tempe Plastik</p>
                                            <p className="top-prod-category">All Variant</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                    <div className="top-product-list">
                                        <div className="top-prod-img-wrap">
                                            <img src={Tauge} alt="tauge" />
                                        </div>
                                        <div className="top-prod-text">
                                            <p className="top-prod-title">Tauge</p>
                                            <p className="top-prod-category">All Variant</p>
                                        </div>
                                        <p className="top-prod-val flex-fill">581</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/* </main> */}
        
        </>

    )
}