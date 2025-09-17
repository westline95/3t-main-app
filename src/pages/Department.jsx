import React, { useState, useEffect, useRef } from 'react';
import { Controller, get, useController, useForm } from 'react-hook-form';
import Sidebar from '../parts/Sidebar.jsx';
import Header from '../parts/Header.jsx';
import { CustomSelect } from '../elements/CustomSelect/index.jsx';
import NumberFormat from '../elements/Masking/NumberFormat.jsx';
import DropzoneFile from '../elements/DropzoneFile/index.jsx';
import SalesDetailModal from '../elements/Modal/salesDetailModal.jsx';
import SalesEditModal from '../elements/Modal/SalesEditModal.jsx';
import ConfirmModal from '../elements/Modal/ConfirmModal.jsx';
import InputWLabel from '../elements/Input/InputWLabel.jsx';
import InputWSelect from '../elements/Input/InputWSelect.jsx';
import FetchApi from '../assets/js/fetchApi.js';
import { Accordion, Col, Collapse, Dropdown, Form, Row, 
    // Toast, ToastContainer 
} from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { primeTableBodyStyle, primeTableHeaderStyle } from '../assets/js/primeStyling.js';

import { Column } from 'primereact/column';
import { Dropdown as PrimeDropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import dataStatic from '../assets/js/dataStatic.js';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';

import AutoComplete from '../elements/AutoComplete/index.jsx';
import QtyButton from '../elements/QtyButton/index.jsx';
import DiscountModal from '../elements/Modal/DiscModal.jsx';
import CreatePayment from '../elements/Modal/CreatePaymentModal.jsx';
import ConvertDate from '../assets/js/ConvertDate.js';
import CustomToggle from '../elements/Custom/CustomToggle.jsx';
import InputGroup from '../elements/Input/InputGroup.jsx';

import EmptyState from "../../public/vecteezy_box-empty-state-single-isolated-icon-with-flat-style_11537753.jpg"; 
import NoImg from "../assets/images/no-img.jpg";
import EditProduct from '../elements/Modal/EditProductModal.jsx';
import EditProductModal from '../elements/Modal/EditProductModal.jsx';
import AddCategoryModal from '../elements/Modal/AddCategoryModal.jsx';
import EditCategoryModal from '../elements/Modal/EditCategoryModal.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { DataView } from 'primereact/dataview';
import DepartmentModal from '../elements/Modal/DepartmentModal.jsx';

export default function Department({handleSidebar, showSidebar}){
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const axiosPrivate = useAxiosPrivate();
    const toast = useRef(null);
    const toastUpload = useRef(null);
    const mobileSearchInput = useRef(null);

    const [progress, setProgress] = useState(0);
    const [ isLoading, setLoading ] = useState(true);
    const [mobileSearchMode, setMobileSearchMode] = useState(false);
    const [mobileFilterValue, setMobileFilterValue] = useState("");
    const [ isClicked, setClicked ] = useState(false);
    const [ isClickedProd, setClickedProd ] = useState(false);
    const [ isClose, setClose ] = useState(false);
    const [ salesData, setSalesData ] = useState();
    const [ openTab, setOpenTab ] = useState('departmentListTab');
    const [ modalData, setModalData ] = useState(null);
    const [ showModal, setShowModal ] = useState("");
    const [ modalMsg, setModalMsg ] = useState("");
    const [ prodTypeFilter, setProdTypeFilter ] = useState(null);
    const [ filterCust, setFilteredCust ] = useState([]);
    const [ filterCourier, setFilteredCourier ] = useState([]);
    const [ filterProd, setFilteredProd ] = useState([]);
    const [ salesDataArr, setSalesDataArr ] = useState([]);
    const [ custData, setCustData ] = useState(null);
    const [ courierList, setCourierList ] = useState(null);
    const [ openDropdown, setopenDropdown] = useState(false);
    const [ custTypeData, setCustType ] = useState(null);
    const [ statusCode, setStatusCode ] = useState(null);
    const [ allProdData, setAllProd ] = useState(null);
    const [ departmentList, setDepartmentList ] = useState(null);
    const [ refetch, setRefetch ] = useState(false);
    const [ chooseCust, setCust] = useState("");
    const [ chooseCourier, setCourier] = useState("");
    const [ chooseProd, setProd] = useState(null);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ openPopupProd, setOpenPopupProd ] = useState(false);
    const [ openPopupCourier, setOpenPopupCourier ] = useState(false);
    const [ confirmVal, setConfirm ] = useState(false);
    const [ dupeSalesData, setDupeProdData ] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [ salesComplete, setSalesComplete ] = useState(null);
    const [ salesCanceled, setSalesCanceled ] = useState(null);
    const [ salesMain, setSalesMain ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ cantCanceled, setCantCanceled ] = useState(false);
    const [ mergeOrderInv, setMergeOrderInv ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ qtyVal, setQtyVal ] = useState(0);
    const [ salesItems, setSalesItems] = useState([]);

    // const [ salesPaid, setSalesPaid] = useState({payType: 0, val: 0});
    const [ salesPaid, setSalesPaid] = useState({payType: 0, val: 0});
    const [ salesDisc, setSalesDisc] = useState(null);
    const [ discVal, setDiscVal] = useState(0);
    const [ totalDiscProd, setTotalDiscProd] = useState(0);
    const [ paidData, setPaidData] = useState(null);
    const [ salesEndNote, setSalesEndNote] = useState(null);
    const [ existInv, setExistInv] = useState(false);
    const [ currentOrder, setCurrentOrder] = useState(null);
    const [ addOrderItem, setAddOrderItem] = useState(false);
    const [ variantSwitch, setVariantSwitch] = useState(false);
    const [ addInvID, setAddInvID] = useState(false);
    const [ resetInputWSelect, setResetInputWSelect] = useState(false);
    const [ selectedSales, setSelectedSales ] = useState(null);
    const [ departmentFilters, setDepartmentFilters ] = useState(null);
    const [ globalFilterValue, setGlobalFilterValue ] = useState("");
    const [ delDepartment, setDelDepartment ] = useState(false);
    
    const [orderStatus] = useState(dataStatic.orderStatus);

    const refToThis = useRef(null);
    const refToCourier = useRef(null);
    const refToProd = useRef(null);
    
    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        setValue,
        getValues,
        setFocus,
        setError,
        trigger,
        clearErrors,
        getFieldState,
        formState: { errors},
    } = useForm({
        defaultValues:{
            variant_switch: false
        }
    });

    const fetchAllProd = async () => {
        await axiosPrivate.get("/products")
          .then(response => {
                let dupe = [...response.data];
                response.data.map((e, idx) => {
                    dupe[idx].fullProdName = e.product_name + " " + e.variant;
                });

                setAllProd(response.data);
                setDupeProdData(response.data);
                setTotalRecords(response.data.length);
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Error when get product data",
                    life: 3000,
                });
          })
    };
    
    const fetchDepartments = async () => {
        await axiosPrivate.get("/department/all")
        .then(response => {
            console.log(response)
            setDepartmentList(response.data);
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get department data",
                life: 3000,
            });
        })
    };

    const fetchInsertreceipt = async (body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/receipt/write", bodyData)
          .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New receipt is created",
                    life: 3500,
                });
                setTimeout(() => {
                    window.location.reload();
                },1700)
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to create new receipt",
                    life: 3500,
                });
          })
    };

    const fetchInsertPayment = async (body, completed) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.post("/payment/write", bodyData)
          .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New payment is created",
                    life: 3000,
                });
                
                if(completed){
                    let receiptModel = {
                        customer_id: resp.data.customer_id,
                        invoice_id: resp.data.invoice_id,
                        total_payment: paidData.amountOrigin,
                        change: paidData.change,
                        receipt_date: new Date()
                    }
                    fetchInsertreceipt(receiptModel);
                } else {
                    setTimeout(() => {
                        window.location.reload();
                    },1700)
                }
          })
          .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to create new payment data",
                    life: 3000,
                });
          })
    };

    const fetchUpdateInv = async (invoiceID, body) => {
        let bodyData = JSON.stringify(body);
        await axiosPrivate.put("/inv", bodyData, {
            params: {
                id: invoiceID
            }
        })
        .then(resp => {
            let salesBody = JSON.stringify({invoice_id: invoiceID});
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully update invoice",
                life: 3000,
            });

            axiosPrivate.put("/sales", salesBody, {
                params: {
                    id: currentOrder.order_id
                }
            })
            .then(resp => {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Successfully update sales",
                    life: 1500,
                });

                setTimeout(() => {
                    window.location.reload();
                },1500)
            })
            .catch(error => {
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to update sales",
                    life: 3000,
                });
            })
      })
      .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Failed to update invoice",
                life: 3000,
            });
      })
    }

    const fetchDeleteSales = async (salesID) => {
        await axiosPrivate.delete(`/sales?id=${salesID}`)
        .then((resp) => {
            // idk what 2 do
            console.log("success delete")
        })
        .catch(err => {
            throw new Error(err);
        })
    }
   
    const handleClick = (e) => {
        switch(e.target.id) {
            case "departmentListTab":
                setOpenTab("departmentListTab");
            break;
            case "addProdTab":
                setOpenTab("addProdTab");
            break;
            case "completeTab":
                setOpenTab("completeTab");
            break;
            case "returnTab":
                setOpenTab("returnTab");
            break;
            case "canceledTab":
                setOpenTab("canceledTab");
            break;
        }
    };

    const returnSelectVal = (val) => {
    }

    const handleModalWData = (e, prodListData, salesDataProd) => {
        let data;
        switch (e.currentTarget.ariaLabel) {
            case "salesDetailModal":
                data = {
                    origin: prodListData, 
                    // items: salesDataProd != null ? JSON.parse(salesDataProd) : salesDataProd
                }
                setModalData(prodListData);
                setShowModal("salesDetailModal");
                break;
            case "salesEditModal":
                    // items: salesDataProd != null ? JSON.parse(salesDataProd) : salesDataProd
                setModalData(prodListData);
                setShowModal("salesEditModal");
                break;
            case "cancelSalesModal":
               
                setModalData(prodListData);
                // console.log(data)
                setShowModal("cancelSalesModal");
                break;
            case "custTypeModal":
                setShowModal("custTypeModal");
                break;
        }
    }

    const handleModal = (e, data) => {
        switch (e.currentTarget.ariaLabel) {
            case 'addDiscount':
                setShowModal("addDiscount");
                break;
            case 'createPayment':
                setShowModal("createPayment");
                break;
            case 'editProdModal':
                setShowModal("editProdModal");
                setModalData(data);
                break;
            case 'confirmDelDepartment':
                setShowModal("confirmDelDepartment");
                setModalData(data);
                break;
            case 'addDepartmentModal':
                setShowModal("addDepartmentModal");
                setModalData(data);
                break;
            case 'editDepartmentModal':
                setShowModal("editDepartmentModal");
                setModalData(data);
                break;
        }
    }

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(refToThis.current 
                    && !ref.current.contains(evt.target) 
                    && evt.target.className !== "res-item" 
                    && evt.target.className !== "popup-element") {
                    setOpenPopup(false);
                    setOpenPopupProd(false);
                    setOpenPopupCourier(false);
                } 
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        },[ref])
        
    };
    handleClickSelect(refToThis);
    handleClickSelect(refToProd);
    handleClickSelect(refToCourier);

    const handleAutoComplete = (custName) => {
        if(custData && custName !== ""){
            let filteredCust = custData.filter(item => item.name.includes(custName.toLowerCase()));
            if(filteredCust.length === 0){
                setOpenPopup(false);
                setFilteredCust(filteredCust);
            } else {
                setOpenPopup(true);
                setFilteredCust(filteredCust);
            }
        } 
        else if(custName || custName === ""){
            setOpenPopup(true);
            setFilteredCust(custData);
        } 
        else {
            setOpenPopup(false);
            setFilteredCust("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    };
    
    const handleAutoCompleteCourier = (courierName) => {
        if(courierList && courierName !== ""){
            let filteredCourier = courierList.filter(item => item.name.includes(courierName.toLowerCase()));
            if(filteredCourier.length === 0){
                setOpenPopupCourier(false);
                setFilteredCourier(filteredCourier);
            } else {
                setOpenPopupCourier(true);
                setFilteredCourier(filteredCourier);
            }
        } 
        else if(courierName || courierName === ""){
            setOpenPopupCourier(true);
            setFilteredCourier(courierList);
        } 
        else {
            setOpenPopupCourier(false);
            setFilteredCourier("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    }
    
    const handleAutoCompleteProd = (product) => {
        if(allProdData && product !== ""){
            let filteredProd = allProdData.filter(item => item.fullProdName.includes(product.toLowerCase()));
            if(filteredProd.length === 0){
                setOpenPopupProd(false);
                setFilteredProd(filterProd);
                setError("salesProduct", { type: 'required', message: "Product name error!" });
            } else {
                setOpenPopupProd(true);
                setFilteredProd(filteredProd);
                clearErrors("salesProduct");
            }
        }
         else if(product || product === ""){
            setOpenPopupProd(true);
            setFilteredProd(allProdData);
        } else {
            setOpenPopupProd(false);
            setFilteredProd("error db");
            setToastContent({variant:"danger", msg: "Database failed"});
            setShowToast(true);
        }
    }

    const handleChooseCust = (e) => {
        setCust(e);
        setValue('customer_id', e.customer_id);
        setValue('name', e.name);
        setOpenPopup(false);
    }
    
    const handleChooseCourier = (e) => {
        setCourier(e);
        setValue('courier_id', e.id);
        setValue('courier_name', e.user_name);
        setOpenPopupCourier(false);
    }
    
    const handleChooseProd = (e) => {
        setProd(e);
        // setValue('salesProduct', e.variant !== "" ? e.product_name + " " + e.variant : e.product_name);
        // setValue('product_id', e.product_id);
        setOpenPopupProd(false);
    }

    const handleFilterCust = () => {
        handleAutoComplete(getValues('name'));
        setCust(null);
    }    
    const handleFilterCourier = () => {
        handleAutoCompleteCourier(getValues('courier_name'));
        setCourier(null);
    }    

    const handleSearchProd = () => {
        handleAutoCompleteProd(getValues('salesProduct'));
        setProd(null);
    }

    const handleKeyDown = (e) => {
        if(e){
            setCust(null);
        }
    }
    const handleKeyDownCourier = (e) => {
        if(e){
            setCourier(null);
        }
    }
    
    const keyDownSearchProd = (e) => {
        if(e){
            setProd(null);
        }
    }
    
    // useEffect(() => {
    //     if(!chooseProd){
    //         setValue('product_id', '');
    //     } else {
    //         clearErrors("salesProduct");
    //     }
    // },[chooseProd]);

    const handleEdit = (val, idx) => {
        let duplicate = [...salesItems];
        duplicate[idx].quantity = val;
        setSalesItems(duplicate);
    }

    const delSalesItems = (idx) => {
        salesItems.splice(idx, 1);
        handleUpdateEndNote();
    }

    useEffect(() => {
        if(salesDisc || paidData ){
            if(salesItems.length > 0) {
                handleUpdateEndNote();
            } else {
                setPaidData(null);
                setSalesDisc(null);
            }
        }
    },[salesDisc, paidData]);

    const handleCloseModal = () => {
        setShowModal("");
    };

    useEffect(() => {
        if(confirmVal){
            handleSubmit(onSubmitSales, onError)();
            setShowModal("");
        }
    },[confirmVal]);

    const fetchInsertProd = async (prodModel) => {
        await axiosPrivate.post("/add/product", prodModel)
        .then(res => {
            if(typeof res.data == 'object'){
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Sucessfully add new product",
                    life: 1500,
                });

                setTimeout(() => {
                    window.location.reload();
                },1500)
            }
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "failed",
                detail: "Failed to insert product",
                life: 3000,
            });
        })
    };

     const fetchDelDepartment = async (department_id) => {
        await axiosPrivate.delete(`/department/del/${department_id}`)
        .then(response => {
            console.log(response)
            if(response.data == 1){
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Departemen berhasil dihapus",
                    life: 1500,
                });

                setTimeout(() => {
                    setRefetch(true);
                }, 1500);
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal menghapus departemen",
                    life: 3000,
                });
            }
        })
        .catch(error => {
            console.log(error)
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when deleting department",
                life: 3000,
            });
        })
    };

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

    const onSubmitProd = async (formData) => {
        if (formData.img && formData.img.length > 0) {
            const imgFile = formData.img[0];
            const base64 = await convertBase64(imgFile);

            axiosPrivate.post("/api/upload/img",
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
                    ...formData,
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
                const prodModel = JSON.stringify(newFormData);
                fetchInsertProd(prodModel);
            })
            .catch((err) => {
                setProgress(0);
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to upload image",
                    life: 3000,
                });
            });
        } else {
            const noimg = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`;
            let newFormData = {
                ...formData,
                img: noimg,
            };
            console.log(newFormData);
            const prodModel = JSON.stringify(newFormData);
            fetchInsertProd(prodModel);
        } 
    };

    const onError = (errors, e) => {
        if(getValues('name') != "" && errors.customer_id){
            setError("name", { type: 'required', message: 'Choose customer name correctly!' });
        }
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "There is an error with required field",
            life: 3500,
        });
    }; 


    useEffect(() => {
        // fetchAllProd();
        // fetchCategory(); 
        fetchDepartments(); 
    },[]);

    useEffect(() => {
        if(departmentList){
            setLoading(false);
        } 
    },[departmentList]);
    
    useEffect(() => {
        if(refetch){
            fetchDepartments();
            setShowModal("");
            setRefetch(false);
        } 
    },[refetch]);

    // control select filter
    useEffect(() => {
        if(prodTypeFilter && prodTypeFilter !== null && prodTypeFilter !== ""){
            const getMatch = allProdData.filter(({ category }) => category.category_name === prodTypeFilter);
            setDupeProdData(getMatch);
        } else {
            setDupeProdData(allProdData);
        }
    },[prodTypeFilter]);

    const tableHeader = () => {
        return (
          <div className="flex justify-content-between" style={{ width: "100%" }}>
            <div className="flex gap-3 align-items-center" style={{ width: "60%" }}>
                <div className="input-group-right" style={{ width: "40%" }}>
                    <span className="input-group-icon input-icon-right">
                    <i className="zwicon-search"></i>
                    </span>
                    <input
                    type="text"
                    className="form-control input-w-icon-right"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-w-icon"
                    style={{ fontWeight: 500 }}
                    onClick={clearFilter}
                >
                    <i className="bx bx-filter-alt" style={{ fontSize: "24px" }}></i>
                    Clear filter
                </button>
            </div>
    
            <div
              className="wrapping-table-btn flex gap-3"
              style={{ width: "60%", height: "inherit" }}
            >
              {/* <button
                type="button"
                className="btn btn-light light"
                style={{ height: "100%" }}
              >
                <i className="bx bx-printer"></i>
              </button> */}
            <Dropdown drop={"down"}>
                <Dropdown.Toggle variant="primary" style={{ height: "100%" }}>
                    <i className="bx bx-download"></i> export
                </Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="viewInvModal"
                    onClick={(e) =>
                        handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                    }
                    >
                    <i className="bx bx-show"></i> PDF (.pdf)
                    </Dropdown.Item>
                    <Dropdown.Item
                    eventKey="1"
                    as="button"
                    aria-label="editInvModal"
                    onClick={(e) => handleModal(e, inv.invoice_id)}
                    >
                    <i className="bx bxs-edit"></i> Microsoft Excel (.xlsx)
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <button
                type="button"
                className=" btn btn-primary btn-w-icon"
                style={{ height: "100%" }}
            >
                <i className="bx bxs-file-plus"></i> import
            </button>
            <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                aria-label="addDepartmentModal"
                onClick={(e) =>
                    handleModal(e, {
                        action: "insert",
                    })
                }
            >
                <i className="bx bx-plus" style={{ marginTop: -3 }}></i>
                departemen
            </button>
            </div>
          </div>
        );
    };

    const clearFilter = () => {
        initFilters();
    };
    
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...departmentFilters };

        _filters["global"].value = value;

        setDepartmentFilters(_filters);
        setGlobalFilterValue(value);
    };
    
    const initFilters = () => {
        setDepartmentFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            department_name: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.IN }],
            },
            department_id: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
            },
        });
        setGlobalFilterValue("");
    };

    const formatedProductCost = (rowData) => {
        return(
            <NumberFormat intlConfig={{
                value: rowData.product_cost, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };
    
    const formatedSellPrice = (rowData) => {
        return(
            <NumberFormat intlConfig={{
                value: rowData.sell_price, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };

    const formatedDisc = (rowData) => {
        return(
            <NumberFormat intlConfig={{
                value: rowData.discount, 
                locale: "id-ID",
                style: "currency", 
                currency: "IDR",
            }} />
        )
    };

    const cellWithImg = (rowData) => {
        return (
            <>
            <div className="d-flex align-items-center gap-2">
                {/* <div className='user-img'>
                    <img
                        src={
                        rowData.img && rowData.img != ""
                            ? rowData.img
                            : "../src/assets/images/Avatar 2.jpg"
                        }
                        alt=""
                    />
                </div> */}
                {rowData.department_name}
            </div>
            </>
        );
    };

    const formatedOrderDate = (rowData) => {
        return <span>{ConvertDate.convertToFullDate(rowData.order_date, "/")}</span>;
    };

    const actionCell = (rowData, rowIndex) => {
        return (
        <div style={{ display: "inline-flex" }}>
            <span
                className="table-btn edit-table-data"
                aria-label="editDepartmentModal"
                onClick={(e) => {
                    handleModal(e, {
                        id: rowData.department_id,
                        action: "update",
                        rowData,
                    });
                }}
            >
                <i className="bx bxs-edit"></i>
            </span>
            <span
                className="table-btn del-table-data"
                aria-label="confirmDelDepartment"
                onClick={(e) =>
                    handleModal(e, {
                        endpoint: "department",
                        id: rowData.department_id,
                        action: "delete",
                    })
                }
            >
                <i className="bx bx-trash"></i>
            </span>
        </div>
        );
    };
    

    const statusCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.status == "in-stock" ? 'primary'
                : rowData.status == "out-of-stock" ? "danger" 
                : rowData.status == "low" ? "warning" 
                : ""} light`}
            >
                {
                    rowData.status == "in-stock" ? 'in-stock'
                    : rowData.status == "out-of-stock" ? 'habis'
                    : rowData.status == "low" ? 'menipis'
                    : "??"
                }                                                                                
            </span>
        )
    };

    const paymentTypeCell = (rowData) => {
        return(
            <span className={`badge badge-${
                rowData.payment_type == "bayar nanti" ? 'danger'
                : rowData.payment_type == "lunas"? "primary"
                : rowData.payment_type == "sebagian"? "warning"
                : ""} light`}
            >
                {rowData.payment_type }                                                                                
            </span>
        )
    };

    const selectedToDelete = () => {
        const getOnlyID = selectedSales.map(e => {
            return e.order_id
        });
        console.log(getOnlyID)
        set({
            endpoint: "sales",
            id: getOnlyID,
            action: "cancel",
        });
        setShowModal("confirmModal");
    };

    const statusItemTemplate = (option) => {
        return (
            <span className={`badge badge-${
                option == "completed" ? 'success'
                : option == "pending" ? "secondary" 
                : option == "in-delivery" ? "warning" 
                : option == "canceled" ? "danger" 
                : ""} light`}
            >
                {
                    option == "completed" ? 'completed'
                    : option == "pending" ? 'pending'
                    : option == "in-delivery" ? 'in-delivery'
                    : option == "canceled" ? 'canceled'
                    : ""
                }                                                                                
            </span>
        )
    }

    const statusRowFilter = (options) => {
        return (
            <PrimeDropdown 
              value={options.value} 
              options={orderStatus} 
              onChange={(e) => options.filterApplyCallback(e.value.toLowerCase())} 
              itemTemplate={statusItemTemplate} 
              placeholder="Select One" 
              className="p-column-filter" 
              showClear 
              style={{ width: '100%'}} 
            />
        )
    };

    const emptyStateHandler = () =>{
        return (
        <div style={{width: '100%', textAlign: 'center'}}>
            <img src={EmptyState} style={{width: '165px', height: '170px'}}  />
            <p style={{marginBottom: ".3rem"}}>No result found</p>
        </div>
        )
    };

    const mobileFilterFunc = (e) => {
        setMobileFilterValue(e.target.value);
        e.target.value == "" ? setMobileSearchMode(false):setMobileSearchMode(true)
    }

    const itemTemplate = (rowData, index) => {
        return (
        <div className="col-12" key={rowData.category_id} style={{position:'relative'}}>
            <div className='flex flex-column xl:align-items-start gap-2 static-shadow'
                style={{
                    backgroundColor: '#F8F9FD',
                    padding: '1rem',
                    boxShadow: '1px 1px 7px #9a9acc1a',
                    borderRadius: '9px',
                    position:'relative'
                }}
                aria-label="editCategoryModal"
                onClick={(e) => {
                    handleModal(e, {
                        endpoint: "category",
                        id: rowData.category_id,
                        action: "update",
                        ...rowData,
                    });
                }}
            >
            <div className="flex align-items-center gap-3" 
                style={{
                    textTransform: 'capitalize', 
                }}
            >
                <span className="user-img" style={{marginRight: 0}}>
                    <img
                        src={
                        rowData.img ? rowData.img
                            : `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`
                        }
                        alt=""
                    />
                </span>
                <div style={{width: '80%'}}>
                    <p style={{marginBottom: 0, fontSize: 15, fontWeight: 600}}>{rowData.category_name}</p>
                </div>
            </div>
            </div>
            <Dropdown drop={index == departmentList.length - 1 ? "up" : "down"}  style={{position: 'absolute', top: 10, right: 9, padding: '1rem 1rem .5rem 1rem'}}>
                <Dropdown.Toggle as={CustomToggle.CustomToggle1} id="dropdown-custom-components" ></Dropdown.Toggle>
                <Dropdown.Menu align={"end"}>
                    <Dropdown.Item eventKey="1" as="button" 
                        aria-label="confirmdelDepartment"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleModal(e, {
                                endpoint: "category",
                                id: rowData.category_id,
                                action: "delete",
                            })
                        }}
                    >
                        <i className='bx bx-trash'></i> Hapus kategori
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
        );
    };

    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;

        let list = items.map((category, index) => {
            return itemTemplate(category, index);
        });

        return (
        <>
        <div className="flex flex-column gap-2" style={{ width: "100%" }}>
            <div className="flex gap-3 align-items-center mb-4" style={{ width: "100%" }}>
                <div className="input-group-right" style={{ width: "100%" }}>
                    {mobileSearchMode ?
                    (
                    <span className="input-group-icon input-icon-right" 
                        onClick={() => {
                            setMobileFilterValue('');
                            setMobileSearchMode(false);
                            mobileSearchInput.current.focus();
                        }}
                    >
                        <i className='bx bx-x'></i>
                    </span>
                    ):(
                    <span className="input-group-icon input-icon-right">
                        <i className="zwicon-search"></i>
                    </span>
                    )
                    }
                    <input
                        ref={mobileSearchInput}
                        type="text"
                        className="form-control input-w-icon-right"
                        value={mobileFilterValue}
                        onChange={mobileFilterFunc}
                        placeholder="Keyword Search"
                        // onKeyDown={() => setMobileSearchMode(true)}
                    />
                </div>
            </div>
        </div>
        <div className="grid gap-1">{list}</div>
        </>
        );
    };

    useEffect(() => {
        initFilters();
    }, []);

    useEffect(() => {
        if(cantCanceled){
            let data = {
                id: modalData.id, 
                endpoint: 'content',
                action: 'info',
                items: modalData.items
            }
            setModalData(data);
            setShowModal("");
            setShowModal("warningCancelModal");
        } else {
            // fetchAllSales();
        }
    },[cantCanceled]);

    useEffect(() => {
        if(delDepartment){
            fetchDelDepartment(modalData.id);
        }
    },[delDepartment]);


    if(isLoading){
        return;
    }

    return(
        <>
        {/* <Sidebar show={isClose} /> */}
            {/* <main className={`main-content ${showSidebar ? "active" : ""}`}>
                <Header onClick={() => handleSidebar((p) => !p)} /> */}
                <div className="container-fluid">
                    <div className="row mt-4">
                        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                            <div className="basic-tabs">
                                <div className="tabs">
                                    <div className={`tab-indicator ${openTab === "departmentListTab" ? "active" : ""}`}  
                                        id='departmentListTab' 
                                        onClick={(e) => handleClick(e)}
                                    >
                                        <span className="tab-title">departemen</span>
                                    </div>
                                </div>
                                <div className="tabs-content" style={openTab === "departmentListTab" ? {display: "block"} : {display: "none"}}>
                                    <div className="card card-table add-on-shadow">
                                        {/* <div className="wrapping-table-btn">
                                            <span className="selected-row-stat">s
                                                <p className="total-row-selected"></p>
                                                <button type="button" className=" btn btn-danger btn-w-icon">
                                                    <i className='bx bx-trash'></i>Delete selected row
                                                </button>
                                            </span>
                                            <button type="button" className="btn btn-light light"><i className='bx bx-filter-alt'></i>
                                            </button>
                                            <button type="button" className="btn btn-light light"><i className='bx bx-printer'></i>
                                            </button>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-primary btn-w-icon dropdown-toggle"
                                                    data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className='bx bx-download'></i> export
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><a className="dropdown-item" href="#">PDF (.pdf)</a></li>
                                                    <li><a className="dropdown-item" href="#">Microsoft Excel (.xlsx)</a></li>
                                                </ul>
                                            </div>
                                            <button type="button" className=" btn btn-primary btn-w-icon">
                                                <i className='bx bxs-file-plus'></i> import
                                            </button>
                                        </div>
                                        <p className="card-title">filter</p>
                                        <div className="filter-area">
                                            <div className="table-search">
                                                <div className="input-group-right">
                                                    <span className="input-group-icon input-icon-right"><i
                                                            className="zwicon-search"></i></span>
                                                    <input type="text" className="form-control input-w-icon-right"
                                                        placeholder="Search customer..." />
                                                </div>
                                            </div>
                                            <InputWSelect
                                                name="prodTypeFilter"
                                                selectLabel="Select customer type"
                                                options={[{id: "member", value: "member"}, {id:"non-member", value:"non-member"}]}
                                                optionKeys={["id", "value"]}
                                                value={(selected) => setProdTypeFilter(selected)}
                                            />
                                        </div> */}
                                        {!isMobile && !isMediumScr ? 
                                        (
                                        <div className="mt-4">
                                            <DataTable
                                                className="p-datatable"
                                                value={departmentList}
                                                size="normal"
                                                removableSort
                                                dataKey="category_id"
                                                tableStyle={{ minWidth: "50rem", fontSize: '14px' }}
                                                filters={departmentFilters}
                                                filterDisplay='menu'
                                                globalFilterFields={[
                                                    "category_name",
                                                ]}
                                                emptyMessage={emptyStateHandler}
                                                onFilter={(e) => setDepartmentFilters(e.filters)}
                                                header={tableHeader}
                                                paginator
                                                totalRecords={totalRecords}
                                                rows={10}
                                            >
                                            <Column
                                                header="#"
                                                body={(data, options) => options.rowIndex + 1}
                                            ></Column>
                                            <Column
                                                header="ID departemen"
                                                field='department_id'
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            <Column
                                                field="department_name"
                                                header="departemen"
                                                // sortable
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                                body={cellWithImg}
                                                style={{ textTransform: "uppercase" }}
                                            ></Column>
                                            <Column
                                                field=""
                                                header="aksi"
                                                body={(rowData, rowIndex) => actionCell(rowData, rowIndex)}
                                                style={{ textTransform: "uppercase" }}
                                                bodyStyle={primeTableBodyStyle}
                                                headerStyle={primeTableHeaderStyle}
                                            ></Column>
                                            </DataTable>
                                        </div>
                                        ):(
                                            <>
                                            <div
                                                className="wrapping-table-btn flex flex-end gap-3"
                                                style={{ width: "100%", height: "inherit"}}
                                            >
                                                {/* <button
                                                    type="button"
                                                    className="btn btn-light light"
                                                    style={{ height: "100%" }}
                                                >
                                                    <i className="bx bx-printer"></i>
                                                </button> */}
                                                <Dropdown drop={"down"}>
                                                    <Dropdown.Toggle variant="primary" style={{ height: "100%" }}>
                                                        <i className="bx bx-download"></i> export
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu align={"end"}>
                                                        <Dropdown.Item
                                                        eventKey="1"
                                                        as="button"
                                                        aria-label="viewInvModal"
                                                        onClick={(e) =>
                                                            handleModal(e, { id: inv.invoice_id, items: { ...inv } })
                                                        }
                                                        >
                                                        <i className="bx bx-show"></i> PDF (.pdf)
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                        eventKey="1"
                                                        as="button"
                                                        aria-label="editInvModal"
                                                        onClick={(e) => handleModal(e, inv.invoice_id)}
                                                        >
                                                        <i className="bx bxs-edit"></i> Microsoft Excel (.xlsx)
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                                <button
                                                    type="button"
                                                    className=" btn btn-primary btn-w-icon"
                                                    style={{ height: "100%" }}
                                                >
                                                    <i className="bx bxs-file-plus"></i> import
                                                </button>
                                                <button type="button" className="add-btn btn btn-primary btn-w-icon" 
                                                    aria-label="addCategoryModal"
                                                    onClick={(e) =>
                                                        handleModal(e, {
                                                            endpoint: "category",
                                                            action: "insert",
                                                        })
                                                    }
                                                >
                                                    <i className="bx bx-plus"></i>
                                                    kategori
                                                </button>
                                            </div>
                                            <DataView value={departmentList} listTemplate={listTemplate} style={{marginTop: '.5rem'}} />         
                                            </>
                                        )}
                                       

                                        {/* <div className="table-responsive mt-4">
                                            <table className="table" id="advancedTablesWFixedHeader" data-table-search="true"
                                                data-table-sort="true" data-table-checkbox="true">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">
                                                            <input className="form-check-input checkbox-primary checkbox-all"
                                                                type="checkbox" />
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="product Name">
                                                            Order ID
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="category">
                                                            Order Date
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="variant">
                                                            Customer Name
                                                            <span className="sort-icon"></span>
                                                        </th> 
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Customer type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sub variant">
                                                            Order type
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="qty">
                                                            Total
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="source">
                                                            source
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" className="head-w-icon sorting" aria-label="sku">
                                                            Status
                                                            <span className="sort-icon"></span>
                                                        </th>
                                                        <th scope="col" aria-label="total">
                                                            type
                                                        </th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="custListRender">
                                                    {dupeSalesData ? 
                                                        ( 
                                                            dupeSalesData.map((sales, idx) => {
                                                                console.log(sales)
                                                                return (
                                                                    <tr key={`sales-list- ${idx}`}>
                                                                        <th scope="row">
                                                                            <input className="form-check-input checkbox-primary checkbox-single" type="checkbox" value="" />
                                                                        </th>
                                                                        <td>{sales.order_id}</td>
                                                                        <td>{ConvertDate.convertToFullDate(sales.order_date, "/")}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.name}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.customer.cust_type}</td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.order_type}</td>
                                                                        <td>
                                                                            <NumberFormat intlConfig={{
                                                                                value: sales.grandtotal, 
                                                                                locale: "id-ID",
                                                                                style: "currency", 
                                                                                currency: "IDR",
                                                                            }} />
                                                                        </td>
                                                                        <td style={{textTransform:'capitalize'}}>{sales.source}</td>
                                                                        <td style={{textTransform:'capitalize'}}>
                                                                            <span className={`badge badge-${
                                                                                sales.order_status == "completed" ? 'success'
                                                                                : sales.order_status == "pending" ? "secondary" 
                                                                                : sales.order_status == "in-delivery" ? "warning" 
                                                                                : sales.order_status == "canceled" ? "danger" 
                                                                                : ""} light`}
                                                                            >
                                                                                {
                                                                                    sales.order_status == "completed" ? 'completed'
                                                                                    : sales.order_status == "pending" ? 'pending'
                                                                                    : sales.order_status == "in-delivery" ? 'in-delivery'
                                                                                    : sales.order_status == "canceled" ? 'canceled'
                                                                                    : ""
                                                                                }                                                                                
                                                                            </span>
                                                                        </td>
                                                                        <td style={{textTransform:'capitalize'}}>
                                                                            <span className={`badge badge-${
                                                                                sales.payment_type == "unpaid" ? 'danger'
                                                                                : sales.payment_type == "paid"? "primary"
                                                                                : sales.payment_type == "partial"? "warning"
                                                                                : ""} light`}
                                                                            >
                                                                                {sales.payment_type }                                                                                
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <Dropdown drop={idx == salesData.length - 1 ? "up" : "down"}>
                                                                                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" ></Dropdown.Toggle>

                                                                                <Dropdown.Menu align={"end"}>
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="salesEditModal" onClick={(e) => handleModalWData(e, {endpoint: "sales", id: sales.order_id, action: 'update', ...sales})}>
                                                                                        <i className='bx bxs-edit'></i> Edit sales
                                                                                    </Dropdown.Item>
                                                                                    <Dropdown.Item eventKey="1" as="button" aria-label="cancelSalesModal" onClick={(e) => handleModalWData(
                                                                                        e, 
                                                                                        {
                                                                                            endpoint: "sales", 
                                                                                            id: sales.order_id, 
                                                                                            action: 'canceled',
                                                                                            data: {...sales}
                                                                                        })}>
                                                                                        <i className='bx bx-trash'></i> Cancel sales
                                                                                    </Dropdown.Item>
                                                                                </Dropdown.Menu>
                                                                            </Dropdown>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            
                                                        ):""
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="table-end d-flex justify-content-between">
                                                <p className="table-data-capt" id="tableCaption"></p>
                                                <ul className="basic-pagination" id="paginationBtnRender"></ul>
                                            </div>
                                        </div> */}
                                        {/* <!-- mobile list -->
                                        <div className="mobile-list-wrap">
                                            <div className="mobile-list" id="custLists">
                                                <div className="list-item mt-3">
                                                    <div className="modal-area" data-bs-toggle="modal"
                                                        data-bs-target="#custDetailModal">
                                                        <div className="list-img">
                                                            <img src="../assets/images/Avatar 1.jpg" alt="user-img">
                                                        </div>
                                                        <div className="list-content">
                                                            <h4 className="list-title">Kiya</h4>
                                                            <p className="list-sub-title">cust091</p>
                                                        </div>
                                                    </div>
                                                    <div className="list-badge primary">
                                                        <p className="badge-text">Delivery Order</p>
                                                    </div>
                                                    <div className="more-opt" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className='bx bx-dots-horizontal-rounded'></i>
                                                    </div>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#editCustModal">
                                                                <i className='bx bxs-edit'></i> Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#dangerModal">
                                                                <i className='bx bx-trash'></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="list-item mt-3">
                                                    <div className="modal-area" data-bs-toggle="modal"
                                                        data-bs-target="#custDetailModal">
                                                        <div className="list-img">
                                                            <img src="../assets/images/Avatar 1.jpg" alt="user-img">
                                                        </div>
                                                        <div className="list-content">
                                                            <h4 className="list-title">Kiya</h4>
                                                            <p className="list-sub-title">cust091</p>
                                                        </div>
                                                    </div>
                                                    <div className="list-badge primary">
                                                        <p className="badge-text">Delivery Order</p>
                                                    </div>
                                                    <div className="more-opt" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className='bx bx-dots-horizontal-rounded'></i>
                                                    </div>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#editCustModal">
                                                                <i className='bx bxs-edit'></i> Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#dangerModal">
                                                                <i className='bx bx-trash'></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="list-item mt-3">
                                                    <div className="modal-area" data-bs-toggle="modal"
                                                        data-bs-target="#custDetailModal">
                                                        <div className="list-img">
                                                            <img src="../assets/images/Avatar 1.jpg" alt="user-img">
                                                        </div>
                                                        <div className="list-content">
                                                            <h4 className="list-title">Kiya</h4>
                                                            <p className="list-sub-title">cust091</p>
                                                        </div>
                                                    </div>
                                                    <div className="list-badge primary">
                                                        <p className="badge-text">Delivery Order</p>
                                                    </div>
                                                    <div className="more-opt" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className='bx bx-dots-horizontal-rounded'></i>
                                                    </div>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#editCustModal">
                                                                <i className='bx bxs-edit'></i> Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item" type="button" data-bs-toggle="modal"
                                                                data-bs-target="#dangerModal">
                                                                <i className='bx bx-trash'></i> Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                         
            {/* </main> */}

            {showModal === "salesDetailModal" ? 
                (
                    <SalesDetailModal show={showModal === "salesDetailModal" ? true : false} onHide={handleCloseModal} data={showModal == "salesDetailModal" ? modalData : ""} />
                )
             : showModal === "editDepartmentModal" ?
                (
                    <DepartmentModal 
                        show={showModal == "editDepartmentModal" ? true : false} 
                        onHide={handleCloseModal}  
                        data={showModal == "editDepartmentModal" ? modalData : ""} 
                        returnAct={(act) => act ? setRefetch(true) : setRefetch(false)}
                    />
                )
             : showModal === "confirmDelDepartment" ? (
                    <ConfirmModal
                      show={showModal === "confirmDelDepartment" ? true : false}
                      onHide={handleCloseModal}
                      data={showModal === "confirmDelDepartment" ? modalData : ""}
                      msg={"Yakin ingin menghapus departemen ini?"}
                      returnValue={(value) => {setDelDepartment(value)}}
                    />
            ): showModal === "addDepartmentModal" ? (
                    <DepartmentModal 
                        show={showModal === "addDepartmentModal" ? true : false}
                        onHide={handleCloseModal}
                        data={showModal === "addDepartmentModal" ? modalData : ""}
                        returnAct={(act) => act ? setRefetch(true) : setRefetch(false)}
                    />

            ) : showModal === "warningCancelModal" ?
                (
                    <ConfirmModal show={showModal === "warningCancelModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "warningCancelModal" ? modalData : ""} 
                        msg={
                            <p style={{marginBottom: 0}}>
                                Tidak dapat membatalkan order ini karena hanya satu-satunya order di invoice dan terdapat pembayaran yang belum penuh.<br />
                                Coba hapus pembayaran yang terkait terlebih dahulu lalu coba hapus ulang order ini
                            </p>
                        }
                        returnValue={(value) => {setCantCanceled(value)}}
                    />
                )

             : showModal === "existInvOrderModal" ?
                (
                    <ConfirmModal show={showModal === "existInvOrderModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "existInvOrderModal" ? modalData : ""} 
                        msg={
                            <p style={{marginBottom: 0}}>
                                Ada invoice dengan pelanggan yang sama, mau ditambahkan ke invoice?
                            </p>
                        }
                        returnValue={(value) => {setMergeOrderInv(value)}}
                    />
                )
            : showModal === "confirmationModal" ?
                (
                    <ConfirmModal show={showModal === "confirmationModal" ? true : false} onHide={handleCloseModal} 
                        data={showModal === "confirmationModal" ? modalData : ""}  
                        msg={modalMsg}
                        returnValue={(confirm) => {setConfirm(confirm)}}
                    />
                )
             : showModal === "addDiscount" ?
                (
                    <DiscountModal show={showModal === "addDiscount" ? true : false} onHide={handleCloseModal} totalCart={salesEndNote ? salesEndNote.subtotal : 0} returnVal={(val) => {setSalesDisc(val)}} />
                )
             : showModal === "createPayment" ?
                (
                    <CreatePayment 
                        show={showModal === "createPayment" ? true : false} 
                        onHide={handleCloseModal} 
                        source={'order'}
                        totalCart={showModal === "createPayment" && salesEndNote ? salesEndNote.grandtotal : ""} 
                        returnValue={(paymentData) => {setPaidData(paymentData)}} 
                    />
                )
             : ""
            }

            {/* toast area */}
            {/* <ToastContainer className="p-3 custom-toast">
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