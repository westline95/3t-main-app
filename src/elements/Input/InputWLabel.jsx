import React, {useState, useEffect, useRef, forwardRef } from "react";
import { useController } from "react-hook-form";
import { Form } from "react-bootstrap";
import propTypes  from "prop-types";
import { Calendar } from "primereact/calendar";

const InputWLabel =  forwardRef((props, ref) => {
    const {
        label, 
        className,
        as, 
        type, 
        pattern, 
        name,
        placeholder, 
        onChange, 
        value, 
        register,
        errors,
        disabled,
        require,
        inputMode,
        theme,
        inlineForm,
        checked,
        defaultValue,
        defaultChecked,
        control,
        rules,
        onFocus,
        onBlur,
        onBlurCallback,
        inputRef,
        onKeyDown,
        style,
        maxLength,
        textStyle,
        autoComplete,
        inputWidth,
        display,
        minDate,
        onClick,
        fontSize
    } = props;

    const [ switched, setSwitch ] = useState(false);
    const [ dateValue, setDateValue ] = useState(null);

    useEffect(() => {
        if(type === 'date' && defaultValue){
            setDateValue(defaultValue);
        }
    },[defaultValue])

    // useEffect(()=> {
    //     if(onBlur && onBlurCallback){
    //         return onBlurCallback();
    //     }
    // },[onBlur])

    const handleCallbackBlur = () => {
        if(onBlur && onBlurCallback){
            return onBlurCallback();
        }
    }
     
    // const elRef = useRef(null);
    // if(inputRef){
    //     return inputRef(elRef.current);
    // }


    // console.log(errors[name]?.ref, errors[name]?.message)
    // const field = {...register ? register(`${name}`, { required: require }): ""}

    // const { field: { ref, ...field }, fieldState } = useController({
    //     control,
    //     name: name,
    //     defaultValue: value ? value : '',
    //     rules: rules
    // });
    // console.log(errors[name]);
    // // console.log(fieldState.invalid);
    // console.log(errors);
    // const [inputValue, setInputValue] = useState(value ? value : '');

    let styleInput;
    if(textStyle && textStyle === "capitalize"){
        styleInput = {
            textTransform: "capitalize"
        }
    }


    return (
        <div className={`input-label d-flex flex-wrap 
            ${inlineForm ? "flex-row justify-content-between horizontal-form-control" : "flex-column"}
            ${type === "switch" ? "form-switch" : "" }`} 
            style={{position: 'relative', width: inputWidth ? inputWidth : ''}}
        >
            {type === "checkbox" ? 
                (<input
                    type="checkbox"
                    className={`form-check-input ${theme ? `checkbox-${theme}` : 'checkbox-primary'}`}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    {...register != null ? {...register(name, { required: require, onChange: onChange })} : ""}
                />)
            : type == "customRadio" ?
            (<>
                <div className="form-check" style={{marginRight: "1rem"}}>
                    <input className="form-check-input radio-primary" // prettier-ignore
                        type="radio"
                        name={name}
                        value={value}
                        checked={checked}
                        // onChange={onChange}
                        

                        {...register != null ? {...register(name, { required: require ? "This field is required" :'', onChange: onChange })} : ""}
                    />
                    <label className="form-check-label">{label}</label>
                    
                </div>
                
            </>)
            : type === "switch" ?
            (
            <>
                <div style={{display: display != null ? display == true ? "flex" : "none" :" flex", gap: '1rem', ...style}}>
                    <input 
                        className="form-check-input switch-primary" 
                        name={name} 
                        type="checkbox" 
                        style={{marginTop:0, width: '3rem', fontSize: fontSize }}
                        defaultChecked={defaultChecked}
                        {...register != null ? {...register(name, { required: require, onChange:onChange })} : ""}
                    />
                    <Form.Label style={{marginBottom:0, fontWeight: switched ? 700 : 500}}>{label}</Form.Label>
                </div>
            </>
            )
            : type == "date" ?
            (
                <>
                    <Form.Label className="mb-1">{label}<span className="required-label" style={{ display: require ? 'inline' : 'none' }}>*</span></Form.Label>
                    <Calendar showIcon 
                        baseZIndex={999999} 
                        name={name}
                        dateFormat="dd/mm/yy"
                        value={dateValue}
                        minDate={minDate && minDate}
                        // value={new Date(defaultValue)}
                        disabled={disabled}
                        // onChange={(e) => setDateValue(e.value)}
                        {...register ? {...register(name, { required: require, onBlur: onBlur, ref: inputRef, onChange: onChange})} : ""}
                    />
                    
                </>
            )
            : (<>
            {display != null || display != undefined ? 
                (
                <div style={{ display: display ? 'block' : 'none'}}>
                    <Form.Label className="mb-1">{label}<span className="required-label" style={{ display: require ? 'inline' : 'none' }}>*</span></Form.Label>
                    <Form.Control 
                        as={as} 
                        type={type} 
                        className={className}
                        name={name} 
                        placeholder={placeholder} 
                        disabled={disabled} 
                        style={style || styleInput} 
                        inputMode={inputMode}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        maxLength={maxLength}
                        defaultValue={defaultValue ?? defaultValue}
                        autoComplete={autoComplete}
                        onClick={onClick}
                        onBlur={handleCallbackBlur}
                        // ref={ref}
                        {...register ? 
                            {...register(name, { 
                                required: require, 
                                onBlur: onBlur, 
                                ref: inputRef, 
                                onChange:onChange,
                                onBlur:handleCallbackBlur
                            })} 
                        : ""}
                        />
                        
                        {register && errors 
                        ? errors[name] && <span className="field-msg-invalid">{errors[name].message}</span>
                        : ""}
                       
                </div>
                )
                : (
                    <>
                    <Form.Label className="mb-1">{label}<span className="required-label" style={{ display: require ? 'inline' : 'none' }}>*</span></Form.Label>
                    <Form.Control 
                        as={as} 
                        type={type} 
                        className={className}
                        name={name} 
                        onChange={onChange}
                        placeholder={placeholder} 
                        disabled={disabled} 
                        style={style || styleInput} 
                        inputMode={inputMode}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        maxLength={maxLength}
                        defaultValue={defaultValue ?? defaultValue}
                        autoComplete={autoComplete}
                        onBlur={handleCallbackBlur}
                        {...register ? 
                            {...register(name, { 
                                required: require ? "This field is required" :'',  
                                onBlur: onBlur, 
                                ref: inputRef,
                                onChange:onChange,
                                onBlur: handleCallbackBlur
                            })} 
                        : ""}
                    />
                    {register && errors 
                        ? errors[name] && <span className="field-msg-invalid">{errors[name].message}</span>
                        : ""}
                    </>
                )
            }
            </>)
            }
             
        </div>
    )
})

export default InputWLabel;

InputWLabel.propTypes = {
    require: propTypes.bool,
    inlineForm: propTypes.bool,
    as: propTypes.string,
    className: propTypes.string,
    type: propTypes.string,
    name: propTypes.string,
    placeholder: propTypes.string,
    theme: propTypes.string,
    label: propTypes.string,
    textStyle: propTypes.oneOf(["capitalize","lowercase"]),
    onChange: propTypes.func,
    onKeyDown: propTypes.func,
    onFocus: propTypes.func,
    onBlur: propTypes.bool,
    value: propTypes.any,
    defaultValue:  propTypes.any,
    pattern: propTypes.oneOf(["currency", "number"]),
    validation: propTypes.bool,
    disabled: propTypes.bool,
    defaultChecked: propTypes.bool,
    checked: propTypes.bool,
    display: propTypes.bool,
    inputMode: propTypes.string,
    autoComplete: propTypes.string,
    style: propTypes.any,
    maxLength: propTypes.number,
    inputWidth: propTypes.any
}