import React, {useEffect, useRef, useState} from 'react';
import { Form } from 'react-bootstrap';
import { CustomSelect } from '../CustomSelect';
import propTypes from "prop-types";
import { useController } from 'react-hook-form';

export default function InputWSelect(props) {

    const keyId = props.optionKeys ? props.optionKeys [0] : '';
    const keyValue = props.optionKeys ? props.optionKeys[1] : '';
    // const name = props.name;
    // const control = props.controller;
    // const {field2} = useController({
    //     name,
    //     control,
        
    // });
    // const watchs = watch();
    // const { field } = props.controller ? props.controller : "";
    // const [selected, selectedVal] = useState(field ? field.value || "" : "");
    const [selected2, selectedVal2] = useState({id: "", value: ""});
    const returnValue = (data) => {
        selectedVal2(data);
        if(typeof props.value === "function"){
            return props.value(data);
        } else {

        }
    };


    return(
        <>
        <div className="input-label d-flex flex-column flex-wrap">
        {props.label ? (
            <Form.Label className="mb-1">{props.label}<span className="required-label" style={{ display: props.require ? 'inline' : 'none' }}>*</span></Form.Label>
        ):''}
            <CustomSelect 
                options={props.options}
                selectedOption={returnValue} 
                defaultValue={props.defaultValue}
                defaultValueKey={props.defaultValueKey}
                selectLabel={props.selectLabel}
                watch={props.watch}
                name={props.name}
                optionKeys={props.optionKeys}
                disabled={props.disabled}
                width={props.width}
                onChange={props.onChange}
                onClick={props.onClick}
                selected={props.selected}
                resetController={props.resetController}
                position={props.position}
            /> 
            <Form.Select 
            id='tess'
            // onChange={selectOrigin} 
            name={props.name}
            defaultValue={selected2.value}
            {...props.register ? {...props.register(props.name, { 
                    required: props.require ? "This field is required" :''
                }
            )} : ""}
            style={{display: "none"}}
            >   
                <option value="">{props.selectLabel}</option>
                {props.options?.map((item, idx) => {
                    // console.log(item[keyId]);
                    return(
                        // idx === props.defaultValue ? 
                        <option key={idx} value={item[keyValue]}>{item[keyValue]}</option>
                        // : <option key={idx} value="">{item}</option>
                    )
                })}
            </Form.Select>
            {props.errors ?
              props.errors[props.name] && <span className="field-msg-invalid">{props.errors[props.name].message}</span>
             : "" }

        </div>
        
        </>
    )
}

InputWSelect.propTypes = {
    label: propTypes.string,
    selectLabel: propTypes.string,
    name: propTypes.string,
    value: propTypes.func,
    options: propTypes.array,
    onChange: propTypes.func,
    require: propTypes.bool,
    defaultValue: propTypes.string,
    defaultValueKey: propTypes.string,
    optionKeys: propTypes.array,
    disabled: propTypes.bool,
    position: propTypes.oneOf(["top", "bottom", "left", "right"]),
    onClick: propTypes.func
    // register:propTypes.func
}