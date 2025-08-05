import React, {useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import propTypes from "prop-types";
import { Form } from "react-bootstrap";
import { InputNumber } from 'primereact/inputnumber';

export default function InputGroup(props) {
    const { position, label, groupLabel, type, placeholder, inputMode, name, 
        value, onChange, mask, require, register, defaultValue, validateValue, validateMsg,
        errors, returnValue, validateData, disabled, min, max } = props;
   
    // const [ defaultValues, setDefaultValues] = useState(defaultValue ? defaultValue.toString() : '0');
    const [ masked, setMask ] = useState("");
    let locale = "id-ID";
    const formatedNumber = new Intl.NumberFormat(locale);
    const inputEl = useRef();
    const [ inputValue, setVal] = useState(mask == 'currency' ? '0' : '');
   

    const handleMask = (e) => {
        let val = e;
        console.log(e)
        // if(e){
        //     console.log(e.target)
        //     console.log(e)
        //     // val = e.replace(/[.,]/g,"");
        //     // console.log(val)
        //     // val = e.target.value.replace(/[.,]/g,"") || e.target.value;
        // } 
        // const disc = e.target.value.replace(/[.,]/g,"") || e.target.value;s
        switch(mask) {
            case "currency":
                let pattern = new RegExp("[0-9]*");
                let matchPattern = pattern.test(+val);
                console.log(+val)
                let tes1 = '1000';
                console.log(tes1.replace(/[.,]/g,""))
                if(matchPattern){
                    // if(Number(+val) >= 0 ){
                        // console.log(+val >= 0)
                        // const formatCurrency = +val;
                        // // e.target.value = formatedNumber.format(formatCurrency);
                        // setVal(formatedNumber.format(formatCurrency).toString());
                        // // setInputValueFormatted(formatedNumber.format(formatCurrency));
                        // console.log(formatedNumber.format(formatCurrency).toString())
                        // // setDefaultValues(formatedNumber.format(formatCurrency));
                        // returnValue && returnValue({origin: Number(+val), formatted: formatedNumber.format(formatCurrency)});
                        // returnValue({origin: formatCurrency, formatted: formatedNumber.format(formatCurrency)});
                    // } 
                    // else {
                        //     // e.target.value = 0;
                        //     setVal(0); 
                        //     returnValue && returnValue({origin: 0, formatted: 0});
                        // }
                    } else {
                    // e.target.value = 0;
                    setVal('0'); 
                    returnValue && returnValue({origin: 0, formatted: '0'});
                }
                break;
        
            default:
                break;
        }
    };

    const onChangeInput = (e) => {
        let val = e.target.value;
        console.log(val)
        const minimum = min ? min : 0;
        const maximum = max ? max : 0;

        if(mask == "currency"){
            if(val.includes('.')){
                val = val.replace(/[.,]/g,"");
            }
    
            if(val == ""){
                setVal(minimum.toString());
            } else {
                let newVal = formatedNumber.format(+val);
                setVal(newVal.toString());
            }
    
            returnValue && returnValue({origin: Number(val.replace(/[.,]/g,"")), formatted: formatedNumber.format(val)});
            
        } else if(mask == "phone"){
             setVal(val.toString());
            returnValue && returnValue({origin: val, formatted: val});
            
        }
    }

    const onKeyDownCurrency = (e) => {
        const key = e.key;
        let value = e.target.value;
        let join;

        if(value.includes('.')){
            value = e.target.value.replace(/[.,]/g,"");
        } 

        const minimum = min ? min : 0;
        const maximum = max ? max : 0;
        
        // Allow digits (0-9)
        if (key >= '0' && key <= '9') {
            if(maximum !== 0){
                if(Number(value+key) >= minimum && Number(value+key) <= maximum){
                    if(value == ""){
                        setVal(minimum.toString());
                    } else {
                        setVal(value.toString());
                    }
                    return true;
                } else if(Number(value+key) < minimum){
                    setVal(minimum.toString());
                } else if(Number(value+key) > maximum) {
                    setVal(maximum.toString());
                } else {
                    e.preventDefault();
                }
            } else {
                if(Number(value+key) >= minimum){
                    if(value == ""){
                        setVal(minimum.toString());
                    } else {
                        console.log("hahahahah")
                        setVal(value.toString());
                    }
                    return true;
                } else if(Number(value+key) < minimum){
                    setVal(minimum.toString());
                    return true;
                } else {
                    e.preventDefault();
                }
            }
        }

        // // Allow a single dot
        // if (key === '.') {
        //     if (value.includes('.')) {
        //         e.preventDefault(); // Prevent adding another dot if one already exists
        //     } 
        //     // setInputValue(Number(value));
        //     return true;
        // }
        // Allow Backspace, Delete, Tab, Arrow keys, etc. for editing
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            let newValue = value;
            onChangeInput({ 
                target: {
                    name: name,
                    value: newValue,
                },
            });
            return true;
        }

        if(e.keyCode == 65){
            return true;
        }

        e.preventDefault(); // Prevent all other characters
    }
    
    const onKeyDownPhone = (e) => {
        const key = e.key;
        let value = e.target.value;
        let join;
        // console.log(value + key)
        
        // if(value.includes('.')){
            //     value = e.target.value.replace(/[.,]/g,"");
            // } 
            
        const maximum = 12;
        
        // Allow digits (0-9)
        if (key >= '0' && key <= '9') {
            if((value+key).length <= maximum){
                return true;
            } else {
                e.preventDefault();
            }
        }
            

        // // Allow a single dot
        // if (key === '.') {
        //     if (value.includes('.')) {
        //         e.preventDefault(); // Prevent adding another dot if one already exists
        //     } 
        //     // setInputValue(Number(value));
        //     return true;
        // }
        // Allow Backspace, Delete, Tab, Arrow keys, etc. for editing
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            let newValue = value;
            onChangeInput({ 
                target: {
                    name: name,
                    value: newValue,
                },
            });
            return true;
        }

        if(e.keyCode == 65){
            return true;
        }

        e.preventDefault(); // Prevent all other characters
    }


    // const inputGroup = register(name,  { required: require ? "This field is required" :'', onChange: handleMask, ref: inputEl });

    useEffect(() => {
        if(mask == "currency" && defaultValue){
            let DefValue = Number(defaultValue);
            onChangeInput({ 
                target: {
                    name: name,
                    value: DefValue.toString(),
                },
            });
        } 
    },[defaultValue]);


    
        
    return(
        <div className="input-label d-flex flex-column flex-wrap">
            <Form.Label className="mb-1">{label}<span className="required-label" style={{ display: require ? 'inline' : 'none' }}>*</span></Form.Label>
            <div className={`input-group-${position}`}>
                <span className="input-group-w-text fw-semibold" style={{textAlign:'center'}}>{groupLabel}</span>
                <Form.Control 
                    // ref={(e) => {inputGroup.ref(e)}}
                    type={type} 
                    name={name}
                    className={`input-w-text-${position}`}
                    placeholder={placeholder} 
                    // inputMode={inputMode}  
                    onKeyDown={mask == "currency" ? onKeyDownCurrency : mask == "phone" ? onKeyDownPhone : null}
                    onChange={onChangeInput}
                    value={inputValue}
                    // defaultValue={defaultValue}
                    disabled={disabled}
                    style={{borderTopLeftRadius: "0 !important", borderTopRightRadius: "0 !important"}} 
                    // {...register != null ? {...register(name, { 
                    //     required: require ? "This field is required" :'', 
                    //     onChange: handleMask,
                    //     // value: checkValue   
                    //     ref: inputEl 
                    // })} : ""}
                />
                {/* <InputNumber 
                    inputId="currency-us" 
                    value={value1} 
                    onValueChange={(e) => setValue1(e.value)} 
                    prefix=''
                    style={{paddingLeft: '3rem'}}
                    mode="currency" 
                    currency="USD" 
                    locale="en-US" 
                /> */}
            </div>
            {errors && errors[name]
             ?
                <span className="field-msg-invalid">{errors[name].message}</span>
             : ""}
        </div>
    )
}

InputGroup.propTypes = {
    position: propTypes.oneOf(["left", "right"]).isRequired,
    label: propTypes.string,
    groupLabel: propTypes.oneOfType([propTypes.string, propTypes.element]),
    type: propTypes.string,
    name: propTypes.string,
    placeholder: propTypes.string,
    value: propTypes.string,
    disabled: propTypes.bool,
    defaultValue: propTypes.oneOfType([propTypes.string, propTypes.number]),
    inputMode: propTypes.oneOf(["search", "text", "none", "tel", "url", "email", "numeric", "decimal"]),
    mask: propTypes.oneOf(["currency", "number"]),
    // returnValue: propTypes.func
    validateData: propTypes.array

}