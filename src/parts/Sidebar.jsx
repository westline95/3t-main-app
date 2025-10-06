import React, { forwardRef, useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import "../assets/zwicon/zwicon.css";
import "../assets/css/sidebar.css";
import Wave from "../assets/images/wave.png";
import { Col, Collapse } from 'react-bootstrap';
import propTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import { axiosPrivate } from '../api/axios';

const Sidebar = forwardRef(({show, clickedMenu}, ref) => {
    const location = useLocation();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const getNavLinkClass = (path) => {
        if(location.pathname === path){
            return " active";
        } else {
            return "";
        }
        // return location.pathname === path ? " active" : "";
    };
    const [ collapseToggle, setCollapseToggle ] = useState(null);
    const [ collapseParentMenu, setCollapseParentMenu ] = useState(null);
    const [ collapseChildMenu, setCollapseChildMenu ] = useState(null);

    // const handleSidebar = (e) => {
    //     if(e.classList.contains("active")){
    //         clickedMenu(true);
    //         e.preventDefault();
    //     }
    // }

    const logout = async() => {
        await axiosPrivate.get("/logout")
        .then(resp => {
            navigate("/login");
        })
        .catch(err => {
            console.error(err);
        })
    }

    return(
        <>
        <nav ref={ref} className={`sidebar offcanvas-start ${show ? "active show" : ""}`} data-bs-scroll="true" data-bs-backdrop="false">
            <div className="d-flex justify-content-start align-items-center logo-wrapper">
                <Brand />
            </div>
            <div className="pt-2 sidebar-in">
                <div className="menu">
                    <ul className="sidebar-menu" id="accParent">
                        <li className="menus-group" id="mainMenus">
                            <a className="menu-title" data-bs-target="#mainMenu" aria-controls="mainMenu">
                                <span className="menu-label">main</span>
                            </a>
                            <div className="collapse show" data-bs-parent="mainMenus" id="mainMenu">
                                <ul className="sidebar-menu">
                                    <li className="menus dropdown-control">
                                        <Link to="/" className={`item-menu ${getNavLinkClass("/")}`} onClick={() => clickedMenu(true)} 
                                        >
                                            <i className='bx bx-home-alt'></i>
                                            <span className="menu-label">dashboard</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        {auth.roles == "admin" ?
                        (
                            <>
                            <li className="menus-group" id="peopleMenus">
                            <a className="menu-title" onClick={() => setCollapseToggle('peopleMenus')}>
                                <span className="menu-label">people</span>
                            </a>
                            <div className="collapse show" data-bs-parent="peopleMenus" id="peopleMenu">
                                <ul className="sidebar-menu">
                                    <li className="menus dropdown-control">
                                        <Link to={"/people/customers"} className={`item-menu ${getNavLinkClass("/people/customers")}`} onClick={() => clickedMenu(true)}>
                                            <i className='bx bx-user'></i>
                                            <span className="menu-label">customers</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            </li>
                            <li className="menus-group" id="inventoryMenus">
                                <a className="menu-title" data-bs-target="#inventoryMenus" aria-controls="inventoryMenus">
                                    <span className="menu-label">inventory</span>
                                </a>
                                <div className="collapse show" data-bs-parent="inventoryMenu" id="inventoryMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/inventory/products"} className={`item-menu ${getNavLinkClass("/inventory/products")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-cube-alt'></i>
                                                <span className="menu-label">products</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control" id="categoriesMenus">
                                            <Link to={"/inventory/categories"} className={`item-menu ${getNavLinkClass("/inventory/categories")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-git-branch'></i>
                                                <span className="menu-label">categories</span>
                                            </Link>
                                        </li>
                                        {/* <li className="menus dropdown-control">
                                            <Link to={"/inventory/variant"} className={`item-menu ${getNavLinkClass("/inventory/variant")}`}>
                                                <i className='bx bx-layer'></i>
                                                <span className="menu-label">variant attributes</span>
                                            </Link>
                                        </li> */}
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="stockMenus">
                                <a className="menu-title" data-bs-target="#stockMenus" aria-controls="stockMenus">
                                    <span className="menu-label">stock</span>
                                </a>
                                <div className="collapse show" data-bs-parent="stockMenu" id="stockMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/stock/manage"} className={`item-menu ${getNavLinkClass("/stock/manage")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-package'></i>
                                                <span className="menu-label">manage stock</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/stock/adjust"} className={`item-menu ${getNavLinkClass("/stock/adjust")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-box'></i>
                                                <span className="menu-label">stock adjustment</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="salesMenus">
                                <a className="menu-title" data-bs-target="#salesMenus" aria-controls="salesMenus">
                                    <span className="menu-label">sales</span>
                                </a>
                                <div className="collapse show" data-bs-parent="salesMenu" id="salesMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"https://3t-pos-exp.netlify.app/"} className='item-menu'>
                                                <i className='bx bx-hdd'></i>
                                                <span className="menu-label">POS</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/sales/order"} className={`item-menu ${getNavLinkClass("/sales/order")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-cart-alt'></i>
                                                <span className="menu-label">sales</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/sales/invoice"} className={`item-menu ${getNavLinkClass("/sales/invoice")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-receipt'></i>
                                                <span className="menu-label">billing</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/sales/payment"} className={`item-menu ${getNavLinkClass("/sales/payment")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-wallet'></i>
                                                <span className="menu-label">payment</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="salesMenus">
                                <a className="menu-title" data-bs-target="#salesMenus" aria-controls="salesMenus">
                                    <span className="menu-label">logistic</span>
                                </a>
                                <div className="collapse show" data-bs-parent="salesMenu" id="salesMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/logistic/delivery"} className={`item-menu ${getNavLinkClass("/logistic/delivery")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bxs-truck'></i>
                                                <span className="menu-label">delivery</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/logistic/tracking"} className={`item-menu ${getNavLinkClass("/logistic/tracking")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-receipt'></i>
                                                <span className="menu-label">tracking</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="hrmMenus">
                                <a className="menu-title" data-bs-target="#hrmMenus" aria-controls="hrmMenus">
                                    <span className="menu-label">HRM</span>
                                </a>
                                <div className="collapse show" data-bs-parent="hrmMenu" id="hrmMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/hrm/department"} className='item-menu'>
                                                <i className='bx bx-git-branch'></i>
                                                <span className="menu-label">department</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/hrm/employees"} className='item-menu'>
                                                <i className='bx bx-user'></i>
                                                <span className="menu-label">employees</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/hrm/leaves"} className='item-menu'>
                                                <i className='bx bxs-calendar-alt'></i>
                                                <span className="menu-label">leaves</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control" id="payrollMenus">
                                            <a className="item-menus" onClick={(e) => collapseParentMenu ? setCollapseParentMenu(null) : setCollapseParentMenu("payrollMenus")}>
                                                <i className='bx bx-dollar'></i>
                                                <span className="menu-label">payroll</span>
                                                <i className='bx bxs-chevron-down'></i>
                                            </a>
                                            <Collapse in={collapseParentMenu == "payrollMenus"}>
                                                <div>
                                                    <ul className="sidebar-menu">
                                                        <li className="menus dropdown-control">
                                                            <Link to={"/hrm/loan"} className='sub-item-menu-1'>
                                                                <i className='bx bxs-circle'></i>
                                                                <span className="menu-label">loan</span>
                                                            </Link>
                                                        </li>
                                                        <li className="menus dropdown-control">
                                                            <Link to={"/hrm/payslip"} className='sub-item-menu-1'>
                                                                <i className='bx bxs-circle'></i>
                                                                <span className="menu-label">payslip</span>
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </Collapse>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="reportMenus">
                                <a className="menu-title" data-bs-target="#reportMenus" aria-controls="reportMenus">
                                    <span className="menu-label">report</span>
                                </a>
                                <div className="collapse show" data-bs-parent="reportMenu" id="reportMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/report/sales"} className='item-menu'>
                                                <i className='bx bx-bar-chart'></i>
                                                <span className="menu-label">sales report</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/report/delivery"} className='item-menu'>
                                                <i className='bx bx-bar-chart'></i>
                                                <span className="menu-label">delivery report</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/report/prof-loss"} className='item-menu'>
                                                <i className='bx bxs-pie-chart-alt'></i>
                                                <span className="menu-label">profit and loss</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="userMngMenus">
                                <a className="menu-title" data-bs-target="#userMngMenus" aria-controls="userMngMenus">
                                    <span className="menu-label">user management</span>
                                </a>
                                <div className="collapse show" data-bs-parent="userMngMenu" id="userMngMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/user/users"} className='item-menu'>
                                                <i className='bx bx-user'></i>
                                                <span className="menu-label">users</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/user/roles"} className='item-menu'>
                                                <i className='bx bx-check-shield'></i>
                                                <span className="menu-label">roles & permission</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="menus-group" id="settingMenus">
                                <a className="menu-title" data-bs-target="#settingMenus" aria-controls="settingMenus">
                                    <span className="menu-label">setting</span>
                                </a>
                                <div className="collapse show" data-bs-parent="settingMenu" id="settingMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/setting/profile"} className='item-menu'>
                                                <i className='bx bx-user'></i>
                                                <span className="menu-label">profile</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <Link to={"/setting/app"} className={`item-menu ${getNavLinkClass("/setting/app")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bx-grid-alt'></i>
                                                <span className="menu-label">app</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control" id="menuLevelMenus">
                                            <a className="item-menus collapsed" data-bs-toggle="collapse" href="#menuLevelMenu"
                                                role="button" data-bs-target="#menuLevelMenu"
                                                aria-expanded="false" aria-controls="menuLevelMenu">
                                                <i className='bx bx-layer'></i>
                                                <span className="menu-label">menu level 1</span>
                                                <i className='bx bxs-chevron-down'></i>
                                            </a>
                                            <div className="collapse" data-bs-parent="menuLevelMenus" id="menuLevelMenu">
                                                <ul className="sidebar-menu">
                                                    <li className="menus dropdown-control">
                                                        <a href="./app/people-cust.html" className="sub-item-menu-1">
                                                            <i className='bx bxs-circle'></i>
                                                            <span className="menu-label">menu level 1.1</span>
                                                        </a>
                                                    </li>
                                                    <li className="menus dropdown-control" data-bs-toggle="collapse"
                                                        href="#menuLevel2Menus" role="button" 
                                                        data-bs-target="#menuLevel2Menus" aria-expanded="false"
                                                        aria-controls="menuLevel1Menus">
                                                        <a href="#" className="sub-item-menu-1">
                                                            <i className='bx bxs-circle'></i>
                                                            <span className="menu-label">menu level 1.2</span>
                                                            <i className='bx bxs-chevron-down'></i>
                                                        </a>
                                                        <div className="collapse" data-bs-parent="menuLevel1Menus"
                                                            id="menuLevel2Menus">
                                                            <ul className="sidebar-menu">
                                                                <li className="menus dropdown-control">
                                                                    <a href="./app/people-cust.html"
                                                                        className="sub-item-menu-2">
                                                                        <i className='bx bxs-circle'></i>
                                                                        <span className="menu-label">menu level 2.1</span>
                                                                    </a>
                                                                </li>
                                                                <li className="menus dropdown-control" data-bs-toggle="collapse"
                                                                    href="#menuLevel3Menus" role="button"
                                                                    data-bs-target="#menuLevel3Menus" aria-expanded="false"
                                                                    aria-controls="menuLevel3Menus">
                                                                    <a href="#" className="sub-item-menu-2">
                                                                        <i className='bx bxs-circle'></i>
                                                                        <span className="menu-label">menu level 2.2</span>
                                                                        <i className='bx bxs-chevron-down'></i>
                                                                    </a>
                                                                    <div className="collapse" data-bs-parent="menuLevel2Menus"
                                                                        id="menuLevel3Menus">
                                                                        <ul className="sidebar-menu">
                                                                            <li className="menus dropdown-control">
                                                                                <a href="./app/people-cust.html"
                                                                                    className="sub-item-menu-3">
                                                                                    <i className='bx bxs-circle'></i>
                                                                                    <span className="menu-label">menu level
                                                                                        3.1</span>
                                                                                </a>
                                                                            </li>
                                                                            <li className="menus dropdown-control">
                                                                                <a href="./app/people-cust.html"
                                                                                    className="sub-item-menu-3">
                                                                                    <i className='bx bxs-circle'></i>
                                                                                    <span className="menu-label">menu level
                                                                                        3.2</span>
                                                                                </a>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <span onClick={() => logout()} className="item-menu">
                                                <i className='bx bx-log-out'></i>
                                                <span className="menu-label">logout</span>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            </>
                        ): auth.roles == "staff" ?
                        (
                            <>
                            <li className="menus-group" id="salesMenus">
                                <a className="menu-title" data-bs-target="#salesMenus" aria-controls="salesMenus">
                                    <span className="menu-label">logistic</span>
                                </a>
                                <div className="collapse show" data-bs-parent="salesMenu" id="salesMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/delivery"} className={`item-menu ${getNavLinkClass("/delivery")}`} onClick={() => clickedMenu(true)}>
                                                <i className='bx bxs-truck'></i>
                                                <span className="menu-label">delivery</span>
                                            </Link>
                                        </li>
                                        
                                    </ul>
                                </div>
                            </li>
                             <li className="menus-group" id="settingMenus">
                                <a className="menu-title" data-bs-target="#settingMenus" aria-controls="settingMenus">
                                    <span className="menu-label">setting</span>
                                </a>
                                <div className="collapse show" data-bs-parent="settingMenu" id="settingMenus">
                                    <ul className="sidebar-menu">
                                        <li className="menus dropdown-control">
                                            <Link to={"/setting/profile"} className='item-menu'>
                                                <i className='bx bx-user'></i>
                                                <span className="menu-label">profile</span>
                                            </Link>
                                        </li>
                                        <li className="menus dropdown-control">
                                            <span onClick={(e) => {
                                                logout();
                                            }} className="item-menu">
                                                <i className='bx bx-log-out'></i>
                                                <span className="menu-label">logout</span>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            </>
                        ):null}
                       
                    </ul>
                </div>
            </div>
            <div className='wave-img' style={{width:"100%", height:'150px', position:'absolute', bottom:0}}>
                <img src={Wave} style={{width: '100%', height:'100%'}} />
            </div>
        </nav>
        </>
    )
})

export default Sidebar;

Sidebar.propTypes = {
    show: propTypes.bool,
    clickedMenu: propTypes.func
}