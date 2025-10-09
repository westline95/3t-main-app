import React, { createRef, useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Toast } from "primereact/toast";
import { useForm, useController, FormProvider } from "react-hook-form";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import FetchApi from "../../assets/js/fetchApi";
import User from "../../assets/images/Avatar 1.jpg";
import { CustomSelect } from "../CustomSelect";
import ConvertDate from "../../assets/js/ConvertDate";
import ConfirmModal from "./ConfirmModal";
import InputWLabel from "../Input/InputWLabel";
import InputGroup from "../Input/InputGroup";
import InputWSelect from "../Input/InputWSelect";
import DropzoneFile from "../DropzoneFile";
import useMediaQuery from "../../hooks/useMediaQuery";
import DGTransactionModal from "./DGTransactionModal";
import AutoComplete from "../AutoComplete";

export default function WriteDelivGroupItemsModal({
  show,
  onHide,
  data,
  returnAct,
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isMediumScr = useMediaQuery(
    "(min-width: 768px) and (max-width: 1024px)"
  );

  const axiosPrivate = useAxiosPrivate();
  let locale = "id-ID";
  const formatedNumber = new Intl.NumberFormat(locale);

  const toast = useRef(null);
  const toastUpload = useRef(null);
  const [ progress, setProgress ] = useState(0);
  const [ bulkForm, setBulkForm ] = useState(1);
  const methods = useForm({
    defaultValues: {
    },});

  const {  
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    getValues,
    clearErrors,
    unregister,
    formState: { errors }, 
  } = methods

  const [showModal, setShowModal] = useState(false);
  const [statusSwitch, setStatusSwitch] = useState(true);
  const [targetKey, setTarget] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [controlUiBtn, setControlUiBtn] = useState(false);
  const [toastContent, setToastContent] = useState({
    variant: "",
    msg: "",
    title: "",
  });
  const [custCategory, setCustCategory] = useState("");
  const [custTypeData, setCustType] = useState(null);
  const [custData, setCustData] = useState(null);
  const [custDataDupe, setCustDataDupe] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [sendTarget, setSendTarget] = useState(null);
  const [selectedDob, setSelectedDob] = useState(
    data.rowData?.dob ? new Date(data.rowData?.dob) : null
  );
  const [selectedHiredDate, setSelectedHiredDate] = useState(
    data.rowData?.hired_date ? new Date(data.rowData.hired_date) : null
  );
  const [selectedDepartmentDate, setSelectedDepartmentDate] = useState(
    data.rowData?.department_histories[0]?.date
      ? new Date(data.rowData.department_histories[0].date)
      : null
  );

  const [allProdData, setAllProd] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [dgReportList, setDgReportList] = useState(null);

  // popup needs
  const refToThis = useRef(Array.from({ length: bulkForm }, () => createRef()));
  const [openPopup, setOpenPopup] = useState([false]);
  const [filterCust, setFilteredCust] = useState([]);
  const [chooseCust, setCust] = useState(Array.from({length: bulkForm}));
  const [guestMode, setGuestMode] = useState([false]);
  const [currFormIndex, setCurrentFormIndex ] = useState(0);
  const [isFocus, setIsFocus ] = useState(null);

  const returnSelectVal = (selected) => {
    setOrderTypeTmp(selected);
  };

  const handleModal = (e, data) => {
    switch (e.currentTarget.ariaLabel) {
      case "addDGTransaction":
        setModalData(data);
        setShowModal("addDGTransaction");
      break;
    }
  };

  // fetch all customer
  const fetchAllCust = async () => {
    await axiosPrivate
      .get("/customers")
      .then((response) => {
        setCustData(response.data);
        setCustDataDupe(response.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Error when get customer data",
          life: 3000,
        });
      });
  };

  // fetch all prod
  const fetchAllProd = async () => {
    await axiosPrivate
      .get("/products")
      .then((response) => {
        let dupe = [...response.data];
        response.data.map((e, idx) => {
          dupe[idx].fullProdName = e.product_name + " " + e.variant;
        });
        setAllProd(response.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: "Error when get product data",
          life: 3000,
        });
      });
  };

  // popup needs
  // const handleAutoComplete = (custName, index) => {
  //   let openPopupDupe = [...openPopup];
  //   if (custData && custName !== "") {
  //     let filteredCust = custData.filter((item) =>
  //       item.name.includes(custName.toLowerCase())
  //     );
  //     if (filteredCust.length === 0) {
  //       openPopupDupe[index] = false;
  //       // setOpenPopup(false);
  //       setFilteredCust(filteredCust);
  //     } else {
  //       openPopupDupe[index] = true;
  //       // setOpenPopup(true);
  //       setFilteredCust(filteredCust);
  //     }
  //   } else if (custName || custName === "") {
  //     openPopupDupe[index] = true;
  //     // setOpenPopup(true);
  //     setFilteredCust(custData);
  //   } else {
  //     openPopupDupe[index] = false;
  //     // setOpenPopup(false);
  //     setFilteredCust("error db");
  //   }
  
  // };

  const handleFilterCust = (index) => {
    handleAutoComplete(getValues(`name ${index+1}`), index);
    // setCust(null);
  };

  const handleChooseCust = (e, index) => {
    let openPopupDupe = [...openPopup];
    setCust(e);
    setValue(`customer_id ${index+1}`, e.customer_id);
    setValue(`name ${index+1}`, e.name);
    openPopupDupe[index] = false;
    // setOpenPopup(false);
    setOpenPopup(openPopupDupe);
  };

  // const handleClickSelect = (ref) => {
    // useEffect(() => {
      // const handleClickOutside = (evt) => {
      //   evt.stopPropagation();
      //   if (!refToThis.current[currFormIndex].current.contains(evt.target)) {
      //   //   let openPopupDupe = [...openPopup];
      //   //   openPopupDupe[currFormIndex] = true;
      //   //   setOpenPopup(openPopupDupe);
      //   // }  else {
      //     let openPopupDupe = [...openPopup];
      //     setOpenPopup(Array(openPopupDupe.length).fill(false));
          
      //   } else {
      //      let openPopupDupe = [...openPopup];
      //      openPopupDupe[currFormIndex] = true;
      //      setOpenPopup(openPopupDupe)
      //   }
      //   // console.log(refToThis.current[currFormIndex].current)
      //   // console.log(evt.target)
      //   return () => {
      //     document.removeEventListener("mousedown", handleClickOutside);
      //   };
      // };
      // document.addEventListener("mousedown", handleClickOutside, true);
      // return () => {
      //   document.removeEventListener("mousedown", handleClickOutside);
      // };
    // }, [refToThis.current[currFormIndex]]);
  // };

  // refToThis.current.map((ref, index) => {
    // handleClickSelect(refToThis.current[currFormIndex]);
    // console.log(openPopup[currFormIndex])
  // })

  const handleKeyDown = (e) => {
    if (e) {
      setCust(null);
    }
  };

  const fetchDGReport = async(dataToSend) => {
    let body = JSON.stringify(dataToSend);
    await axiosPrivate.post("http://localhost:5056/add/delivery-group-report", body)
    .then(resp => {
      toast.current.show({
        severity: "success",
        summary: "Sukses",
        detail: "Berhasil membuat laporan harian pengantaran",
        life: 3000,
      });
      localStorage.removeItem(`form-${data.id}`);
    })
    .catch(err => {
      setControlUiBtn(false);
      
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Gagal membuat laporan",
        life: 3000,
      });
    })
  }

  // end of popup needs

  const onError = () => {
    setControlUiBtn(false);
  };

  const onSubmit = async (formData) => {
    const storage = localStorage.getItem(`form-${data.id}`);
    if(!storage){
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "tidak ada data yang dapat dibuat laporan",
        life: 3000,
      });
    } else {
      let parsed = JSON.parse(storage);
      let delivery_group_report_list = parsed.filter(item => item);
      console.log(delivery_group_report_list)

      let total_item = 0;
      let total_value = 0;

      // delivery_group_report_list.map(item => {
      //   item.map(item2 => {
      //     total_item += item2.quantity;
      //     total_value += item2.grandtotal;
      //   }) 
      // })
      // change into 1 array
      let lists = [];
      delivery_group_report_list.map(item1 => {
        item1.map(item2 => {
          total_item += item2.quantity;
          total_value += item2.grandtotal;
          item2.invoice_id = null;
          item2.return_order_id = null;
          item2.receipt_id = null;
          item2.customer_id ? Number(item2.customer_id) : null;
          item2.product_id = Number(item2.product_id);
          lists.push(item2)
        });
      })
      
      let delivery_group_report = {
        delivery_group_id: data.id,
        employee_id: data.employee_id,
        report_status: 0,
        notes: "",
        total_item,
        total_value
      }

      let dataToSend = {
        delivery_group_report,
        delivery_group_report_list: lists
      }
      fetchDGReport(dataToSend);

    }
  };

  const handleCloseModal = () => {
    setShowModal();
  };

  const handleSelectedList = (selected, index) => {
    if(!filterCust){
      let arr = [];
      arr[index] = selected.customer_id;
      setFilteredCust(arr);
    } else {
      let arr = [...filterCust];
      let findDupeSelected = arr.find(item => item == selected.customer_id);

      if(!findDupeSelected){
        arr[index] = selected.customer_id;
      } 

      setFilteredCust(arr);
      // setOpenPopup(false);
      const storage = localStorage.setItem(data.id, JSON.stringify(arr));
    }
  }

  const handleAutoComplete = (e, index) => {
    const inputVal = e.target.value;
    // setIsFocus(e.target.name);
    if(inputVal && inputVal !== ""){
        // if arrray object type
        
        // let arr = [...filterCust];
        // arr[index] = null;
        // let reFilterAll = custData.filter(({customer_id}) => !arr.includes(customer_id));
        // setCustDataDupe(reFilterAll);
        // console.log(reFilterAll)
        // console.log(custData.filter(item => item['name'].includes(inputVal.toLowerCase())))
        const filterData = custData.filter(item => item['name'].includes(inputVal.toLowerCase()));
        (filterData.length == 0) ? setOpenPopup(false) : setOpenPopup(true);
        console.log(filterData)
        // setOpenPopup(true);
        // setFilteredData(filterData);            
        setCustDataDupe(filterData);
    } else if(inputVal == "") {
        setOpenPopup(true);
        console.log(filterCust)
        if(filterCust && filterCust.length > 0) {
          let arr = [...filterCust];
          let reFilterAll = custData.filter(({customer_id}) => !arr.includes(customer_id));
          setCustDataDupe(reFilterAll);
        } else {
          setCustDataDupe(custData);
        }
        // setBlurred(false);
        // const customerListTakenStorage = localStorage.getItem(`customer_id`);
        // const checkstorage = JSON.parse(customerListTakenStorage);
        // if(checkstorage.length < 1){
            // setFilteredData(data);
        // } 
        // else {
            // handleFilteringAutoComplete(null);

        // }
        // setOpenPopup(true);
    } else {
        // setOpenPopup(false);
    }
    // console.log(e.type)
    // if(e.type == "change" && OnChange){
    //     return OnChange();
    // }
  }
  
  // const handleAutoComplete = (index) => {
  //   console.log(index)
  //   // if(!filterCust){
  //   //   let arr = [];
  //   //   arr[index] = selected.customer_id;
  //   //   setFilteredCust(arr);
  //   // } else {
  //     let arr = [...filterCust];
  //     arr[index] = null;
  //     setFilteredCust(arr);

  //     // if(!findDupeSelected){
  //     //   arr[index] = selected.customer_id;
  //     // } 

  //   // }
  // }

  useEffect(() => {
    if(custData){
      let reFilterAll = custData.filter(({customer_id}) => !filterCust.includes(customer_id));
      setCustDataDupe(reFilterAll);
      
    }
  },[filterCust])


  const FormComponent = ({index}) => {
    const storage = localStorage.getItem(`form-${data.id}`);
    let parsed;
    if(storage){
      parsed = JSON.parse(storage);
    }

    return(
        <div key={index} className="form-delivery-component" style={{ border: '1.7px dashed #29a7fc', borderRadius: 17, marginTop: 0}}>
          <div style={{padding: 16}}>
            <p className="modal-section-title mb-3">Pelanggan {index + 1}</p>
              {guestMode[index] ? (
                <InputWLabel
                  label={"nama pelanggan"}
                  type="text"
                  name={`guest_name-${index+1}`}
                  placeholder={"Ketik nama pelanggan..."}
                  // onChange={(e) => handleAutoComplete(e)}
                  // onFocus={handleAutoComplete}
                  // onKeyDown={handleKeyDown}
                  // for smooth working onBlur method in custom component must set nBlur=true 
                  // && set prop onblurcallback for onblurfunction
                  // onBlur={true}
                  // onBlurCallback={handleBlur}
                  // if onblur true, two items prop above are required

                  require={false}
                  register={register}
                  errors={errors}
                  textStyle={"capitalize"}
                  autoComplete="off"
                />
              ):(
                <AutoComplete 
                  index={index}
                  LocalStorage={data.id}
                  FilterData={true}
                  DataOrigin={custData} 
                  DataFiltered={custDataDupe} 
                  // OpenPopup={openPopup}
                  FilteredData={filterCust}
                  SetFilteredData={(value) => setFilteredCust(value)}
                  Label={"nama pelanggan"} 
                  Placeholder={"Cari dan pilih nama pelanggan..."}
                  ForceSelection={true} 
                  DataForm="array-object" 
                  InputName={`name-${index+1}`}
                  SearchKey={"name"} 
                  DataKeyInputValue={"name"} 
                  OnSelect={(choosedData) => {
                    choosedData.customer_id ? setValue(`customer_id-${index+1}`, choosedData.customer_id)
                    : setValue(`guest_name ${index+1}`, choosedData.name);
                    handleSelectedList(choosedData, index);
                   
                    
                    // (choosedData.customer_id) && handleFilteringAutoComplete(choosedData.customer_id);
                  }}
                  // OnChange={(e) => handleAutoComplete(e, index)}
                  // OnFocus={(e) => handleAutoComplete(e, index)}
                  require={false}
                />

              )}
              <InputWLabel
                label={"Pelanggan tidak ditemukan?"}
                type={"switch"}
                fontSize={"11px"}
                name={"guest_mode-"+(index+1)}
                style={{ alignItems: "center", marginTop: "1rem" }}
                defaultChecked={guestMode[index]}
                onChange={(e) => {
                  setValue("guest_mode-"+(index+1), e.target.checked);
                  let guestModeDupe = [...guestMode];
                  guestModeDupe[index] = e.target.checked;
                  setGuestMode(guestModeDupe);
                  console.log(e)
                  // unregister("lastName")
                  setValue(`name-${index+1}`, "");
                  setValue(`customer_id-${index+1}`, "");
                  setValue(`guest_name-${index+1}`, "");
                  // setCust(null);
                }}
                register={register}
                require={false}
                errors={errors}
              />
              <button
                type="button"
                className={`add-btn btn btn-${parsed ? parsed[index] ? 'success' : 'primary' : 'primary'} light btn-w-icon form-support-btn mt-3`}
                aria-label="addDGTransaction"
                onClick={(e) => {
                  
                  let dataToSend = {
                    action: "insert",
                    index: index,
                    delivery_group_id: data.id,
                    delivery_group_date: data.delivery_group_date
                  };

                  guestMode[index]
                  ? dataToSend.guest_name = getValues(`guest_name-${index+1}`)
                  : dataToSend = {
                    ...dataToSend, 
                    customer_id: getValues(`customer_id-${index+1}`),
                    name: getValues(`name-${index+1}`)
                  };
                  if(guestMode[index]) {
                    console.log('jsadjasd')
                    getValues(`guest_name-${index+1}`) || getValues(`guest_name-${index+1}`) != "" ? handleModal(e, dataToSend) 
                    : toast.current.show({
                      severity: "error",
                      summary: "Error",
                      detail: "Isi data pelanggan terlebih dahulu",
                      life: 3000,
                    })
                  } else {
                    console.log('jsadjassadasd')
                    getValues(`customer_id-${index+1}`) && getValues(`name-${index+1}`) ? handleModal(e, dataToSend)
                    : toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Isi data pelanggan terlebih dahulu",
                        life: 3000,
                      })
                  }
                }}
              >
                {parsed ? parsed[index] ? <i className='bx bxs-edit' ></i> :  <i className="bx bx-plus"></i> :  <i className="bx bx-plus"></i>}
               
                
                
                {parsed ? parsed[index] ? 'edit transaksi' : 'transaksi' : 'transaksi'}
              </button>
          </div>
        </div>
    )
  }

  const formToRender = Array.from({ length: bulkForm}, (_, index) => (
    <FormComponent key={index} index={index} />
  ))

  useEffect(() => {
    fetchAllCust();
    fetchAllProd();
  }, []);

  useEffect(() => {
    if(dgReportList){
      setShowModal("");
      let dgReportListArr = [];
      dgReportList.items.map((item, idx) => {
        let dgListItem = {
          customer_id: dgReportList.customer_id,
          guest_name : dgReportList.customer_id ? '' : dgReportList.name,
          order_date: dgReportList.origin.delivery_group_date,
          order_type: 'delivery',
          order_status: dgReportList.payment.amountOrigin == 0 ? 'pending' 
                        : dgReportList.payment.amountOrigin < dgReportList.payment.pay_amount ? 'pending'
                        : dgReportList.payment.amountOrigin >= dgReportList.payment.pay_amount ? 'completed'
                        : 'pending',
          source: 'delivery_group',
          shipped_date: dgReportList.origin.delivery_group_date,
          payment_type: dgReportList.payment.amountOrigin == 0 ? 'bayar nanti' 
                        : dgReportList.payment.amountOrigin < dgReportList.payment.pay_amount ? 'sebagian'
                        : dgReportList.payment.amountOrigin >= dgReportList.payment.pay_amount ? 'lunas'
                        : 'bayar nanti',
          subtotal: dgReportList.cost_detail.grandtotal,
          grandtotal: dgReportList.cost_detail.grandtotal,
          note: dgReportList.note,
          is_complete: dgReportList.payment.amountOrigin == 0 ? false 
          : dgReportList.payment.amountOrigin < dgReportList.payment.pay_amount ? false
          : dgReportList.payment.amountOrigin >= dgReportList.payment.pay_amount ? true
          : false,
          order_discount: 0,
          payment_date: dgReportList.payment.payment_date,
          amount_paid: dgReportList.payment.amountOrigin,
          payment_method: 'cash',
          payment_note: dgReportList.payment.note,
        }  

        dgListItem.product_id = item.product_id;
        dgListItem.quantity = item.quantity;
        dgListItem.sell_price = item.sell_price;
        dgListItem.disc_prod_rec = item.discProd;

        dgReportListArr.push(dgListItem);
      })

      console.log(dgReportListArr);
    }
  },[dgReportList]);

  useEffect(() => {
    if (custData && allProdData) {
      setLoading(false);
    }
  }, [custData, allProdData]);

  useEffect(() =>{
    const checkStorage = localStorage.getItem(data.id);
    if(!checkStorage){
      let arr = new Array(bulkForm);
      localStorage.setItem(data.id, JSON.stringify(arr));
    } else {
      let parsed = JSON.parse(checkStorage);
      parsed.length < bulkForm && parsed.push(null);
      localStorage.setItem(data.id, JSON.stringify(parsed));

    }
  },[bulkForm]);

  if (isLoading) {
    return;
  }
    
  return (
    <>
      <Modal
        size={isMobile || isMediumScr ? "fullscreen" : "xl"}
        show={show}
        onHide={() => {
          onHide();
          handleCancel();
        }}
        scrollable={true}
        centered={true}
        dialogClassName="deliveryGroupFormModal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {data.action == "insert" ? "tambah" : "ubah"} data pengantaran
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormProvider {...methods}>
            <form>
              {/* <div className="add-prod-detail-wrap" style={{flexDirection: 'column', gap: '1rem'}}> */}
              <div className="form-delivery-wrapper">
              {formToRender}
              
              <div  className="form-delivery-component" style={{ 
                border: '1.7px dashed #29a7fc',
                borderRadius: 17, 
                marginTop: 0,
                padding: "90px 16px",
                textAlign:"center"
                
                }}>
                  <button
                    style={{height: 'fit-content'}}
                    type="button"
                    className="add-btn btn btn-info btn-w-icon cta-btn"
                    aria-label="addDGTransaction"
                    onClick={(e) => {
                      setBulkForm(bulkForm+1);
                      // update
                      let updateOpenPopup = [...openPopup];
                      let updateGuestMode = [...guestMode];
                      updateOpenPopup.push(false);
                      updateGuestMode.push(false);
                      setOpenPopup(updateOpenPopup);
                      setGuestMode(updateGuestMode);
                    }}
                  >
                    <i className="bx bx-plus"></i>
                    pelanggan
                  </button>
              </div>
              </div>
              {/* </div> */}
            </form>
          </FormProvider>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary light"
            onClick={() => {
              onHide();
              handleCancel();
            }}
          >
            batal
          </button> 
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => {
              onHide();
              handleCancel();
            }}
          >
            simpan draf
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={controlUiBtn}
            onClick={() => {
              setControlUiBtn(true);
              handleSubmit(onSubmit, onError)();
            }}
          >
            {controlUiBtn ? "Loading..." : "submit"}
          </button>
        </Modal.Footer>
      </Modal>

      {showModal === "addDGTransaction" ? 
      (
        <DGTransactionModal
          show={showModal === "addDGTransaction" ? true : false} 
          onHide={handleCloseModal} 
          multiple={true}
          stack={1}
          data={showModal == "addDGTransaction" ? modalData : ""}
          returnValue={(dgReportList) => {setDgReportList(dgReportList);}}
        />
      ) : (
        ""
      )}

      {/* toast area */}
      <Toast ref={toast} />
    </>
  );
}
