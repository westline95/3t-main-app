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
import { parse } from "dotenv";
import NumberFormat from "../Masking/NumberFormat";

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

  const storage = localStorage.getItem(`form-${data.id}`);
  const checkingStorage = storage ? JSON.parse(localStorage.getItem(`form-${data.id}`)) : [];
  const checkFilteredCustStorage = localStorage.getItem(data.id);
  const filteredCustParsed = checkFilteredCustStorage ? JSON.parse(localStorage.getItem(data.id)) : [];

  const [ progress, setProgress ] = useState(0);
  const [ bulkForm, setBulkForm ] = useState(filteredCustParsed && filteredCustParsed.length > 1 ? filteredCustParsed.length : 1);
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

  const [toDelete, setToDelete] = useState(null);
  const [updatedForm, setUpdatedForm] = useState(null);
  const [updatedCust, setUpdatedCust] = useState(null);

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
      .get("/pure-customers")
      .then((response) => {
        let tempOrigin = [...response.data];

        if(checkFilteredCustStorage){
          const parsedFilterCustData = JSON.parse(checkFilteredCustStorage); 
          let arr = [...parsedFilterCustData];
          let filteredCust = null;

          if(arr.length > 0) {
            arr.map(e => {
              filteredCust = tempOrigin.filter(item => Number(item.customer_id) != Number(e))
            });
          }
          console.log(filteredCust)
          setCustData(response.data);
          setCustDataDupe(filteredCust ? filteredCust : []);
          setFilteredCust(arr);
        } else {
          setCustData(response.data);
          setCustDataDupe(response.data);
        }
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
  // const fetchAllProd = async () => {
  //   await axiosPrivate
  //     .get("/products")
  //     .then((response) => {
  //       let dupe = [...response.data];
  //       response.data.map((e, idx) => {
  //         dupe[idx].fullProdName = e.product_name + " " + e.variant;
  //       });
  //       setAllProd(response.data);
  //     })
  //     .catch((error) => {
  //       toast.current.show({
  //         severity: "error",
  //         summary: "Failed",
  //         detail: "Error when get product data",
  //         life: 3000,
  //       });
  //     });
  // };

  const fetchAllProd = async () => {
    await axiosPrivate
      .get("/delivery-group/by", {
        params: {
          id: data.id,
        },
      })
      .then((resp) => {
        const storage = localStorage.getItem(`origin-dgitem-${data.id}`);

        let getDeliveryGroupItems = [...resp.data.DeliveryGroupItemsProduct];
        getDeliveryGroupItems.map((e, idx) => {
          e.fullProdName = e.product?.product_name + " " + e.product?.variant;
        });

        if(!storage) localStorage.setItem(`origin-dgitem-${data.id}`, JSON.stringify(getDeliveryGroupItems));
        setAllProd(getDeliveryGroupItems);
      })
      .catch((error) => {
        // setToastContent({variant:"danger", msg: "Error when get products data!"});
        // setShowToast(true);

        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error when get products data",
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

  // const handleFilterCust = (index) => {
  //   handleAutoComplete(getValues(`name ${index+1}`), index);
  //   // setCust(null);
  // };

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
    await axiosPrivate.post("/add/delivery-group-report", body)
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

  const delForm = (formStorageIndex) => {
    if(storage){
      let dupeOrigin = [...checkingStorage];
      let dupeOriginCust = [...filteredCustParsed];

      dupeOrigin.splice(formStorageIndex, 1);
      dupeOriginCust.splice(formStorageIndex, 1);

      localStorage.setItem(`form-${data.id}`, JSON.stringify(dupeOrigin));
      localStorage.setItem(data.id, JSON.stringify(dupeOriginCust));

      
      setToDelete(formStorageIndex);
      setUpdatedForm(dupeOrigin);
      setUpdatedCust(dupeOriginCust);
      formToRender.splice(toDelete, 1);
    }
  }

  const onError = () => {
    setControlUiBtn(false);
  };

  const onSubmit = async (formData) => {
    const storage = localStorage.getItem(`form-${data.id}`);
    console.log("hehe")
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
        delivery_group_id: Number(data.id),
        employee_id: Number(data.employee_id),
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

  const handleUpdateFormLocalStorage = (item, index) => {
    if(storage && checkFilteredCustStorage){
      let formStorage = JSON.parse(storage);
      let custStorage = JSON.parse(checkFilteredCustStorage);

      if(!item && custStorage) {
        custStorage[index] = null;
        
        localStorage.setItem(data.id, JSON.stringify(custStorage));
      }

      if(formStorage[index]){
        if(!item) {
          formStorage.splice(index, 1);

          localStorage.setItem(`form-${data.id}`, JSON.stringify(formStorage));
        } else{
          formStorage[index].customer_id = item.customer_id;
          formStorage[index].customer_name = item.name;
          formStorage[index].guest_name = "";
        }

        localStorage.setItem(`form-${data.id}`, JSON.stringify(formStorage));
      }

    }
  }

  const handleSelectedList = (selected, index) => {
    let arr = [];

    if(filterCust && filterCust.length == 0){
      !selected ? arr[index] = selected :  arr[index] = selected.customer_id;
      // arr[index] = selected.customer_id;
      // arr[index] = selected;
      // setFilteredCust(arr);
    } else {
      arr = [...filterCust];
      if(!selected){
        arr[index] = selected;
      } else {
        let findDupeSelected = arr.find(item => item == selected.customer_id);
  
        if(!findDupeSelected){
          arr[index] = selected.customer_id;
          // arr[index] = selected;
        } 

      }
    }
    
    setFilteredCust(arr);
    localStorage.setItem(data.id, JSON.stringify(arr));
    handleUpdateFormLocalStorage(selected, index);
  }

  useEffect(() => {
    if(custData){
      let reFilterAll = custData.filter(({customer_id}) => !filterCust.includes(customer_id));
      setCustDataDupe(reFilterAll);
    }
  },[filterCust]);


  const FormComponent = ({index}) => {
    let parsed;
    if(storage){
      parsed = JSON.parse(storage);
    }

    return(
      <div key={index} className={`form-delivery-component ${parsed && parsed[index] ? 'filled' : ''}`} style={{ border: '1.7px dashed #29a7fc', borderRadius: 17, marginTop: 0}}>
        <div style={{padding: 16, position: 'relative'}}>
          {
            parsed && parsed[index] ? (
              <button className="btn-card btn btn-danger light" onClick={(e) => {e.preventDefault();delForm(index)}}>
                <i className='bx bxs-trash'></i>
              </button>
            ):""
          }
          <p className="modal-section-title mb-3">Pelanggan {index + 1}</p>
            {guestMode[index] && guestMode[index] == true ? (
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
                Label={"nama pelanggan"} 
                Placeholder={"Cari dan pilih nama pelanggan..."}
                ForceSelection={true} 
                DataForm="array-object" 
                InputName={`name-${index+1}`}
                SearchKey={"name"} 
                DataKeyInputValue={"name"} 
                OnSelect={(choosedData) => {
                  choosedData.customer_id ? setValue(`customer_id-${index+1}`, choosedData.customer_id)
                  : setValue(`guest_name-${index+1}`, choosedData.name);
                  handleSelectedList(choosedData, index);
                  // (choosedData.customer_id) && handleFilteringAutoComplete(choosedData.customer_id);
                }}
                onKeyDownChange={(item, index) => {
                  handleSelectedList(item, index);
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
                setValue(`name-${index+1}`, "");
                setValue(`customer_id-${index+1}`, "");
                setValue(`guest_name-${index+1}`, "");
                // handleLocalstorage for filtering customer
                if(e.target.checked){
                  handleUpdateFormLocalStorage(null, index);
                  // if(checkFilteredCustStorage){
                  //   let setNull = JSON.parse(checkFilteredCustStorage);
                    
                  // }
                }
              }}
              register={register}
              require={false}
              errors={errors}
            />
            <div className="mt-3" style={{display: 'flex', flexDirection: 'row', alignItems:'end', justifyContent: 'space-between'}}>
              <button
                type="button"
                className={`add-btn btn btn-${parsed && parsed[index] ? 'warning' : 'primary'}  btn-w-icon form-support-btn mr-3`}
                aria-label="addDGTransaction"
                onClick={(e) => {
                  let dataToSend = {
                    action: "insert",
                    index: index,
                    delivery_group_id: data.id,
                    delivery_group_date: data.delivery_group_date,
                    note: parsed && parsed[index] ? parsed[index].note : "",
                    orders: parsed && parsed[index] ? [...parsed[index].orders] : [],
                    payment: parsed && parsed[index] ? parsed[index].payment : null
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
              
                
                
                {parsed && parsed[index] ? 'edit transaksi' : 'transaksi'}
              </button>
              {parsed && parsed[index] ? 
              ( 
                <div style={{display: 'flex', flexDirection: 'column', gap:5}}>
                  <span className={`badge badge-info ${parsed[index] ? '' : 'light'}`}
                  > Transaksi: 
                    <NumberFormat 
                      intlConfig={{
                        value: parsed[index].grandtotal, 
                        locale: "id-ID",
                        style: "currency", 
                        currency: "IDR",
                      }} 
                      style={{marginLeft: 7}}
                    />                                                                         
                  </span>
                  <span className={`badge badge-success ${parsed[index] ? '' : 'light'}`}
                  > Setoran: 
                    <NumberFormat 
                      intlConfig={{
                        value: parsed[index].amount_paid, 
                        locale: "id-ID",
                        style: "currency", 
                        currency: "IDR",
                      }} 
                      style={{marginLeft: 7}}
                    />                                                                         
                  </span>
                </div>
              ):""
              }

            </div>
        </div>
      </div>
    )
  }

  const formToRender = Array.from({ length: bulkForm}, (_, index) => (
    <FormComponent key={index} index={index} />
  ))

  useEffect(() => {
    if(custData){
      let customerIDTempArr = [];
      if(storage && checkFilteredCustStorage) {
        let parsed;
        parsed = JSON.parse(storage);
        
        let getCustIDOnly = null
        
        // retrievehandle item transaction
        if(parsed.length > 0) {
          getCustIDOnly = parsed.map(e => {
            return e.customer_id;
          });
          
          let custTmp = [...filteredCustParsed];
          const sync = getCustIDOnly.map((e,idx) => custTmp[idx] = e);
          console.log(sync)
          localStorage.setItem(data.id, JSON.stringify(sync));

          parsed.map((e,idx) => {
            if(e.customer_id) {
              setValue(`customer_id-${idx+1}`, e.customer_id);
              setValue(`name-${idx+1}`, e.customer_name);
              // customerIDTempArr.push(e.customer_id);
            } else {
              let guestModeDupe = [...guestMode];
              guestModeDupe[idx] = true;
              
              // customerIDTempArr.push(null);
              setValue(`guest_mode-${idx+1}`, true);
              setGuestMode(guestModeDupe);
              setValue(`guest_name-${idx+1}`, e.guest_name);
            }
          })
        // })
        }
        else if(parsed.length !== filteredCustParsed.length){
          const filterUnmatched = filteredCustParsed.filter(e => !getCustIDOnly.includes(e));
          const findInCustData = custData.find(e => e.customer_id == filterUnmatched[0]);
          const getIndex = filteredCustParsed.findIndex(e => e == filterUnmatched[0]);
          

          if(findInCustData){
            setValue(`customer_id-${getIndex+1}`, findInCustData.customer_id);
            setValue(`name-${getIndex+1}`, findInCustData.name);
          }
  
        }  
        // console.log(customerIDTempArr)
        // localStorage.setItem(data.id, JSON.stringify(customerIDTempArr));
      }

    }

    // if(checkFilteredCustStorage){
    //   let parsed;
    //   parsed = JSON.parse(checkFilteredCustStorage);
    //   if(parsed.length > 0) {
    //     parsed.map((e,idx) => {
    //       if(e.customer_id) {
    //         setValue(`customer_id-${idx+1}`, e.customer_id);
    //         setValue(`name-${idx+1}`, e.customer_name);
    //         customerIDTempArr.push(e.customer_id);
    //       } else {
    //         let guestModeDupe = [...guestMode];
    //         guestModeDupe[idx] = true;
            
    //         customerIDTempArr.push(null);
    //         setValue(`guest_mode-${idx+1}`, true);
    //         setGuestMode(guestModeDupe);
    //         setValue(`guest_name-${idx+1}`, e.guest_name);
    //       }
    //     })
    //   }
    // }
  },[custData])

  useEffect(() => {
    if(updatedCust && updatedForm && custData) {

      // re retrieve
      const storage = localStorage.getItem(`form-${data.id}`);
      const storageCust = localStorage.getItem(data.id);

      if(storage) {
        let parsed = JSON.parse(storage);
        let filteredCustParsed = JSON.parse(storageCust);

        // reset form first
        reset();

        if(parsed.length !== filteredCustParsed.length){
          let getCustIDOnly = parsed.map(e => {
            return e.customer_id;
          })
          
          const filterUnmatched = filteredCustParsed.filter(e => !getCustIDOnly.includes(e));
          const findInCustData = custData.find(e => e.customer_id == filterUnmatched[0]);
          const getIndex = filteredCustParsed.findIndex(e=> e == filterUnmatched[0]);
          
          if(findInCustData){
            setValue(`customer_id-${getIndex+1}`, findInCustData.customer_id);
            setValue(`name-${getIndex+1}`, findInCustData.name);
          }
        }

        if(parsed.length > 0) {
          parsed.map((e,idx) => {
            if(e.customer_id) {
              setValue(`customer_id-${idx+1}`, e.customer_id);
              setValue(`name-${idx+1}`, e.customer_name);
            } else {
              let guestModeDupe = [...guestMode];
              guestModeDupe[idx] = true;
              
              setValue(`guest_mode-${idx+1}`, true);
              setGuestMode(guestModeDupe);
              setValue(`guest_name-${idx+1}`, e.guest_name);
            }
          })
        }
      }
      setUpdatedCust(null);
      setUpdatedForm(null);
    }
  },[updatedCust, updatedForm])


  useEffect(() => {
    fetchAllCust();
    fetchAllProd();
  }, []);

  useEffect(() => {
    if(dgReportList){
      setShowModal("");
    }
  },[dgReportList]);

  useEffect(() => {
    if(custData && allProdData) {
      setLoading(false);
    }
  }, [custData, allProdData]);

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
        backdrop="static"
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
              <div className="form-delivery-wrapper" style={{paddingBottom: 24}}>
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
                      checkingStorage[bulkForm-1] ? setBulkForm(bulkForm+1) : toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Lengkapi transaksi pelanggan sebelumnya terlebih dahulu!",
                        life: 3000,
                      });
                      // setBulkForm(bulkForm+1);
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
