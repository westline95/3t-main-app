import React, {forwardRef, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import propTypes from "prop-types";
import { Form } from "react-bootstrap";
import { InputNumber } from 'primereact/inputnumber';

const InputGroup = forwardRef((props, ref) => {
    const { position, label, groupLabel, type, placeholder, inputMode, name, 
        value, onChange, mask, require, register, defaultValue, validateValue, validateMsg,
        errors, returnValue, validateData, disabled, min, max, onBlur } = props;
   
    // const [ defaultValues, setDefaultValues] = useState(defaultValue ? defaultValue.toString() : '0');
    const [ masked, setMask ] = useState("");
    let locale = "id-ID";
    const formatedNumber = new Intl.NumberFormat(locale);
    const inputEl = useRef();
    const [ inputValue, setVal] = useState(mask == 'phone' ? '' : '0');
   

    const handleMask = (e) => {
        let val = e;
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

        if(mask == "currency"){
            let unformatted;
            let newVal
            const minimum = min ? min : 0;
            const maximum = max ? max : 999999999;

            if(val.includes('.')){
                unformatted = Number(val.replace(/[.,]/g,""));
            } else {
                unformatted = Number(+val);
            }
                
            if(unformatted >= minimum && unformatted <= maximum){
                newVal = formatedNumber.format(unformatted).toString();
                unformatted = Number(unformatted);
                setVal(newVal);
            } else if(unformatted < minimum){
                unformatted = Number(minimum);
                newVal = formatedNumber.format(minimum).toString();
                setVal(newVal);
            } else if(unformatted > maximum) {
                unformatted = Number(maximum);
                newVal = formatedNumber.format(maximum).toString();
                setVal(newVal);
            } 

            returnValue && returnValue({origin: unformatted, formatted: newVal});
            
        } else if(mask == "phone"){
             setVal(val.toString());
            returnValue && returnValue({origin: val, formatted: val});
            
        }
    }

    const onKeyDownCurrency = (e) => {
        const key = e.key;
        let value = e.target.value;
        let join;
        
        // Allow digits (0-9)
        if (key >= '0' && key <= '9') {
            return true;
        }

        // Allow Backspace, Delete, Tab, Arrow keys, etc. for editing
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            return true;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
          e.preventDefault(); // Prevent default browser behavior (e.g., selecting all text on the page)
          if (e.target) {
            e.target.select(); // Select all text within the input
          }
        }

        e.preventDefault(); // Prevent all other characters
    }
    
    const onKeyDownPhone = (e) => {
        const key = e.key;
        let value = e.target.value;
        let join;
            
        const maximum = 12;
        
        // Allow digits (0-9)
        if (key >= '0' && key <= '9') {
            if((value+key).length <= maximum){
                return true;
            } else {
                e.preventDefault();
            }
        }
          
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

         if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
          e.preventDefault(); // Prevent default browser behavior (e.g., selecting all text on the page)
          if (e.target) {
            e.target.select(); // Select all text within the input
          }
        }

        e.preventDefault(); // Prevent all other characters
    }

    const handleKeyDown = (e) => {
        switch (mask) {
            case 'currency':
                onKeyDownCurrency(e);
                break;
            case 'phone':
                onKeyDownPhone(e);
                break;
        
            default:
                break;
        }
    }


    // const inputGroup = register(name,  { required: require ? "This field is required" :'', onChange: handleMask, ref: inputEl });

    useEffect(() => {
        if(defaultValue){
            switch (mask) {
                case 'currency':
                    onChangeInput({ 
                        target: {
                            name: name,
                            value: defaultValue.toString(),
                        },
                    });
                    break;
                case 'phone':
                    onChangeInput({ 
                        target: {
                            name: name,
                            value: defaultValue.toString(),
                        },
                    });
                    break;
            
                default:
                    break;
            }
        }
    },[defaultValue]);


    
        
    return(
        <div className="input-label d-flex flex-column flex-wrap">
            <Form.Label className="mb-1">{label}<span className="required-label" style={{ display: require ? 'inline' : 'none' }}>*</span></Form.Label>
            <div className={`input-group-${position}`}>
                <span className="input-group-w-text fw-semibold" style={{textAlign:'center'}}>{groupLabel}</span>
                <Form.Control 
                    type={type} 
                    name={name}
                    className={`input-w-text-${position}`}
                    placeholder={placeholder} 
                    // inputMode={inputMode}  
                    onKeyDown={handleKeyDown}
                    onChange={onChangeInput}
                    value={inputValue}
                    // defaultValue={defaultValue}
                    disabled={disabled}
                    style={{borderTopLeftRadius: "0 !important", borderTopRightRadius: "0 !important"}} 
                    {...register ? 
                        {...register(name, { 
                            required: require ? "This field is required" :'',  
                            onBlur: onBlur, 
                            onChange: onChangeInput,
                        })} 
                    : ""}
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
           {register && errors 
                ? errors[name] && <span className="field-msg-invalid">{errors[name].message}</span>
                : ""}
        </div>
    )
})

export default InputGroup;

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