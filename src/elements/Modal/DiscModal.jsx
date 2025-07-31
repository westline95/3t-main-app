import React, {useState, useEffect} from "react";
// import { useDispatch, useSelector } from "react-redux";
import { Modal, Form, Toast, ToastContainer } from "react-bootstrap";
import NumberFormat from "../Masking/NumberFormat";
import Button from "../Button";
// import cartSlice from "../store/reducers/cart";

export default function DiscountModal({ show, onHide, totalCart, returnVal, multiple, stack }) {
    const [ inputDiscount, setDiscount ] = useState(0);
    const [ discDisplay, setDiscountDisplay ] = useState(0);
    const [ toastStatus, setToastStatus ] = useState(false);
    const [ toastMessage, setToastMsg ] = useState("");
    const [ discTmp, setDiscTmp ] = useState("");
    const [ discType, setDiscType ] = useState("percent");
    const [ isShow, setShow ] = useState("discPercent");
    // const dispatch = useDispatch();

    const openTab = (e) => {
        setDiscount("");
        switch(e.currentTarget.id){
            case "discPercent":
                setShow("discPercent");
                setDiscType("percent");
                break;
            case "discNominal":
                setShow("discNominal");
                setDiscType("nominal");
                break;
            case "discVoucher":
                setShow("discVoucher");
                setDiscType("voucher");
                break;
        }
    }

    let locale = "id-ID";
    const formatedNumber = new Intl.NumberFormat(locale);


    const handleVoucher = (e) => {
        const disc = e.target.value.replace(/[.,]/g,"") || e.target.value;
        
        let pattern, matchPattern;
        switch(isShow){
            case "discPercent":
                pattern = new RegExp("[0-9]*");
                matchPattern = pattern.test(disc);

                if(matchPattern && +disc >= 0){
                    setDiscount(Number(+disc));
                } else if(matchPattern && +disc < 0) {
                    setDiscount(0);
                } else {
                    setDiscount(0);
                }
                break;
            case "discNominal":
                pattern = new RegExp("[0-9]*");
                matchPattern = pattern.test(+disc);
                
                if(matchPattern){
                    if(+disc >= 0 ){
                        const formatCurrency = +disc;
                        setDiscount(formatedNumber.format(formatCurrency));
                    } else {
                        setDiscount(0);
                    }
                } else {
                    setDiscount(0);
                }
                break;
            case "discVoucher":
                pattern = new RegExp("^[A-Za-z]+$");
                matchPattern = pattern.test(disc);
                const newVal = disc.toUpperCase();
                matchPattern ? setDiscount(newVal) :  "";
                break;
        }
        
    }

    const applyVoucher = () => {
        // if(list.length > 0) {
            let voucher, discVal;
            
            if(discType === "nominal"){
                discVal = inputDiscount.replace(/[.,]/g,"");
                discVal <= totalCart ? 
                voucher = {
                    value: Number(discVal),
                    type: discType
                }
                : voucher = {
                    value: 0,
                    type: discType
                };
               
            } else {
                discVal = inputDiscount;
                voucher = {
                    value: Number(discVal),
                    type: discType
                }
            }
            returnVal({discType: discType, value: Number(discVal)})
            // dispatch(cartSlice.actions.applyVoucher(voucher));
        // } else {
        //     setToastMsg("Add product first!");
        //     setToastStatus(true);
        // }
        onHide();
    }

    useEffect(() => {
        if(multiple === true){
            document.querySelectorAll(".modal-backdrop").forEach((e,idx) => {
                e.style.zIndex = 1055 + (idx * stack);
            })
            document.querySelectorAll(".modal").forEach((e,idx) => {
                e.style.zIndex = 1056 + (idx * stack);
            })
        }
    },[show])

    
    return ( 
        <>
        
        <Modal size="md" show={show} onHide={onHide} style={{zIndex: 9999999}}>
            <Modal.Header closeButton>
                <Modal.Title>add discount</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="basic-tabs mt-3">
                    <div className="tabs-sm">
                        <div 
                        className={`tab-indicator ${isShow === "discPercent" ? "active" : ""}`} 
                        aria-label="defaultTab"
                        id="discPercent" 
                        onClick={(e) => openTab(e)}
                        >
                            <span className="tab-title" 
                            style={isShow === "discPercent" ? {color: "#344050"} : {color: "#FFFFFF"}}>
                            % percent
                            </span>
                        </div>
                        <div 
                        className={`tab-indicator ${isShow === "discNominal" ? "active" : ""}`}
                        id="discNominal"
                        onClick={(e) => openTab(e)} 
                        >
                            <span className="tab-title">
                                <box-icon name='dollar' 
                                size="16px" 
                                color={isShow === "discNominal" ? "#344050" : "#FFFFFF"}
                                style={{marginTop: "-3px"}}
                                >
                                </box-icon> 
                                nominal
                            </span>
                        </div>                        
                        <div 
                        className={`tab-indicator ${isShow === "discVoucher" ? "active" : ""}`} 
                        id="discVoucher"
                        onClick={(e) => openTab(e)}
                        >
                            <span className="tab-title">
                                <box-icon name='discount' 
                                type='solid' 
                                size="16px" 
                                color={isShow === "discVoucher" ? "#344050" : "#FFFFFF"} 
                                style={{marginTop: "-3px"}}>
                                </box-icon> 
                                voucher
                            </span>
                        </div>
                    </div>
                    <div className="tabs-content"  >
                        {
                            isShow === "discPercent" 
                            ? <> 
                                <div className="input-group-left">
                                    <span className="input-group-w-text fw-semibold">%</span>
                                    <Form.Control 
                                    type="text" 
                                    className="input-w-text-left" 
                                    placeholder="0" 
                                    inputMode="numeric"                                
                                    value={inputDiscount ? inputDiscount : 0} 
                                    maxLength={2}
                                    onChange={handleVoucher} 
                                    style={{borderTopLeftRadius: "0", borderTopRightRadius: "0"}}  
                                    /> 
                                </div>
                            </>
                            : isShow === "discNominal"
                            ? <> 
                                <div className="input-group-left">
                                    <span className="input-group-w-text fw-semibold">Rp</span>
                                    <Form.Control 
                                        type="text" 
                                        className="input-w-text-left" 
                                        placeholder="0" 
                                        inputMode="numeric"               
                                        value={inputDiscount ? inputDiscount : 0}
                                        onChange={handleVoucher} 
                                        style={{borderTopLeftRadius: "0 !important", borderTopRightRadius: "0 !important"}} 
                                    />
                                </div>
                              </>
                            : isShow === "discVoucher"
                            ? <Form.Control 
                                type="text" 
                                placeholder="DISCOUNTTIME" 
                                inputMode="text"
                                pattern="[^[A-Za-z]+$]"
                                value={inputDiscount || ""}
                                onChange={handleVoucher} 
                                style={{borderTopLeftRadius: "0", borderTopRightRadius: "0"}} 
                              />
                            : "" 
                        }
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" isSecondary={true} isLight={true} onHide={true} onClick={onHide}>cancel</Button>
                <Button type="button" isPrimary={true} onClick={applyVoucher}>apply</Button>
            </Modal.Footer>
        </Modal>


        <ToastContainer style={{top: "4rem", right: "2rem"}}>
            <Toast 
            className='align-items-center border-0 toast-danger'
            aria-live='assertive' 
            aria-atomic="true" 
            show={toastStatus} 
            onClose={() => setToastStatus(false)}
            delay={2500} 
            autohide>
                {/* <Toast.Header></Toast.Header> */}
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </ToastContainer>
        </>
    )
}

