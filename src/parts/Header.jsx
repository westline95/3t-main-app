import React from 'react';
import propTypes from 'prop-types';
import { Navbar } from 'react-bootstrap';
import FriesMenu from "../assets/images/fries-menu.svg";
import User from "../assets/images/Avatar 1.jpg";

export default function Header(props) {

    return(
        <>
        <Navbar className="navbar navbar-expand-lg pt-4">
            <div className="container-fluid">
                <div className="sidebar-tools">
                    <div className="fries-menu sidebarCollapseDefault" onClick={props.onClick}
                        aria-controls="sidebar">
                        <img src={FriesMenu} alt="fries-menu" width="24px" />
                    </div>
                    <div className="searchbox-container">
                        <div className="input-group-right">
                            <span className="input-group-icon input-icon-right"><i className='bx bx-search'></i></span>
                            <input type="text" className="form-control input-w-icon-right" placeholder="Search product..." />
                        </div>
                    </div>
                </div>
                <div className="navbar-content">
                    <span id="fullscreenMode">
                        <i className='bx bx-fullscreen'></i>
                    </span>
                    <span id="darkMode">
                        <i className='bx bx-moon'></i>
                    </span>
                    <div className="notification-area dropdown">
                        <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className='bx bx-bell'>
                                <span
                                    className="position-absolute translate-middle p-1 badge-danger border border-light rounded-circle">
                                    <span className="visually-hidden">New notification</span>
                                </span>
                            </i>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <div className="dropdown-header">
                                <p className="dropdown-title">Notifications</p>
                                <i className='bx bx-envelope-open' data-bs-toggle="tooltip" data-bs-placement="bottom"
                                    data-bs-title="Mark all as read"></i>
                            </div>
                            <div className="dropdown-content">
                                <li>
                                    <a href="" className="dropdown-item">
                                        <div className="icon-wrapper yellow">
                                            <i className='bx bx-cart'></i>
                                            <span
                                                className="position-absolute top-7 start-100 translate-middle p-1 badge-danger border border-light rounded-circle">
                                                <span className="visually-hidden">New notification</span>
                                            </span>
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">You have new order</p>
                                            <p className="notif-desc"><span className="cust-name-notif">ruru</span> just ordered
                                                sdadaoshdasu casbcsabc</p>
                                        </div>
                                        <p className="notif-time">20m</p>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="dropdown-item">
                                        <div className="icon-wrapper purple">
                                            <i className='bx bx-receipt'></i>
                                            <span
                                                className="position-absolute top-7 start-100 translate-middle p-1 badge-danger border border-light rounded-circle">
                                                <span className="visually-hidden">New notification</span>
                                            </span>
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">Invoices due!</p>
                                            <p className="notif-desc">Notify <span className="cust-name-notif">ruru</span> to
                                                pay!</p>
                                        </div>
                                        <p className="notif-time">1m</p>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="dropdown-item">
                                        <div className="icon-wrapper yellow">
                                            <i className='bx bx-cart'></i>
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">You have new order</p>
                                            <p className="notif-desc"><span className="cust-name-notif">ruru</span> just ordered
                                                sdadaoshdasu casbcsabc</p>
                                        </div>
                                        <p className="notif-time">1hr</p>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="dropdown-item">
                                        <div className="icon-wrapper yellow">
                                            <i className='bx bx-cart'></i>
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">You have new order</p>
                                            <p className="notif-desc"><span className="cust-name-notif">ruru</span> just ordered
                                                sdadaoshdasu casbcsabc</p>
                                        </div>
                                        <p className="notif-time">1hr</p>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="dropdown-item">
                                        <div className="icon-wrapper yellow">
                                            <i className='bx bx-cart'></i>
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">You have new order</p>
                                            <p className="notif-desc"><span className="cust-name-notif">ruru</span> just ordered
                                                sdadaoshdasu casbcsabc</p>
                                        </div>
                                        <p className="notif-time">1hr</p>
                                    </a>
                                </li>
                                <li>
                                    <a href="" className="dropdown-item">
                                        <div className="icon-wrapper yellow">
                                            <i className='bx bx-cart'></i>
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">You have new order</p>
                                            <p className="notif-desc"><span className="cust-name-notif">ruru</span> just ordered
                                                sdadaoshdasu casbcsabc</p>
                                        </div>
                                        <p className="notif-time">1hr</p>
                                    </a>
                                </li>
                            </div>
                        </ul>
                    </div>
                    <div className="dropdown">
                        <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <div className="profile-w-badge position-relative">
                                <img src={User} alt="user-img" />
                                <span
                                    className="position-absolute translate-middle p-2 badge-success border border-light rounded-circle">
                                    <span className="visually-hidden">New alerts</span>
                                </span>
                            </div>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li><a href="./pages/sett-profile.html" className="dropdown-item"><i
                                        className='bx bx-user'></i>Profile</a></li>
                            <li><a href="" className="dropdown-item"><i className='bx bx-cog'></i>Setting</a></li>
                            <li><a href="" className="dropdown-item"><i className='bx bx-log-out'></i>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </Navbar>
        </>
    )
}

Header.propTypes = {
    onClick: propTypes.func
}