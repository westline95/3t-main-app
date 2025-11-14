import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
import propTypes from "prop-types";
import { NumericFormat } from 'react-number-format';
import { ButtonGroup, Form } from "react-bootstrap";
import Button from "../Button";
import InputWLabel from "../Input/InputWLabel";

export default function QtyButton(props) {
    const { data, value, placeholder, name, min, max, returnValue, width, disabled, label, size } = props;
    const [ inputValue, setInputValue ] = useState(value ? Number(value) : 0 );
    const [ joinVal, setJoinVal ] = useState(inputValue ? inputValue.toString() : '');
    const [ delBtn, setDelBtn ] = useState(false);
    // const dispatch = useDispatch();

    const minus = () => {
        if(inputValue > min) {
            const newValue = Number(inputValue) - 1;
            // onChangeInput({ 
            //     target: {
            //         name: name,
            //         value: newValue,
            //     },
            // });
            setInputValue(newValue);
            // returnValue(Number(newValue));

            // if(data) {
            //     dispatch(cartSlice.actions.decrement({
            //         data: data,
            //         stateValue: inputValue
            //     }));
            // }
        } else if (data && inputValue === min){
            handleDeleteOrder(data.id);
        } 
    };

    const plus = () => {
        if(Number(inputValue)+1 < max) {
            const newValue = Number(inputValue) + 1;
            setInputValue(newValue);
        } else {
            const newValue = Number(max);
            setInputValue(newValue);
            
            if(inputValue == Number(max)){
                if(returnValue){
                    returnValue(Number(inputValue));
                }
            }
        }
    };

    const onChangeInput = (e) => {
        let val1 = e.target.value.toString();
        let val2 = val1.replace(/,(\d+)$/,'.$1');
        let valFormatted = parseFloat(val2);
        
        if(valFormatted == ""){
            setInputValue(min);
        } else {
            if(valFormatted <= max) {
                // const newValue = Number(inputValue) + 1;
                setInputValue(Number(valFormatted));
            } else {
                const newValue = Number(max);
                setInputValue(newValue);
            }
            // setInputValue(Number(valFormatted));
        }
    };

    const onKeyDown= (e) => {
        const key = e.key;
        const value = e.target.value;
        
        // Allow digits (0-9)
        if (key >= '0' && key <= '9') {
            if(parseFloat(value + key) >= min && parseFloat(value + key) <= max){
                if(value == ""){
                    setInputValue(Number(min));
                } else {
                    setInputValue(Number(value));
                }
                return true;
            } else if(parseFloat(value + key) < min){
                setInputValue(Number(min));
            } else if(parseFloat(value + key) > max) {
                setInputValue(Number(max));
            } else {
                e.preventDefault();
            }
        }

        // // Allow a single dot
        // if (key === '.') {
        //     if (value.includes('.')) {
        //         e.preventDefault(); // Prevent adding another dot if one already exists
        //     }
        //     return true;
        // }

        // Allow a single dot
        if (key === '.') {
            if (value.includes('.')) {
                e.preventDefault(); // Prevent adding another dot if one already exists
            } 
            // let convert = value.replace(/,(\d+)$/,'.$1')
            setInputValue(Number(value));
            return true;
        }

        // Allow Backspace, Delete, Tab, Arrow keys, etc. for editing
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            console.log(value)
            return true;
        }

        e.preventDefault(); // Prevent all other characters
    }

    const handleDeleteOrder = (itemID) => {
        dispatch(cartSlice.actions.deleteItem(itemID));
    }

    const customInput = () => {
        return(
            <Form.Control
                type="text"
                className="form-control"
                // inputMode={'numeric'}
                name={name}
                pattern="/^\d*\.?\d*$/"
                placeholder={placeholder ? placeholder : "0"}
                value={inputValue}
                onChange={onChangeInput}
                onKeyDown={onKeyDown}
                disabled={disabled}
            />
        )
    }

    useEffect(() => {
        const newValue = value;
        onChangeInput({ 
            target: {
                name: name,
                value: newValue,
            },
        });
    },[value])

    useEffect(() => {
        if(returnValue){
            returnValue(Number(inputValue));
        }
    },[inputValue])
    
    return(
        <div style={{display: 'flex', flexDirection:'column', width: size ? size : 'auto'}} >
            {label ? 
                (
                    <Form.Label className="mb-1">{label}</Form.Label>
                ):''
            }

            <div className="btn-group" role="group" style={{width: width ? width : size ? '100%' : "270px" , marginTop:'.1rem'}}>
                <button type="button" className="btn btn-secondary light" onClick={minus}  disabled={disabled} >
                    <i className="bx bx-minus"></i>
                </button>
                <NumericFormat 
                    // thousandSeparator="." 
                    // decimalSeparator="," 
                    // allowedDecimalSeparators=","
                    // fixedDecimalScale 
                    className="form-control" 
                    onChange={onChangeInput} 
                    onKeyDown={onKeyDown}
                    name={name} 
                    value={inputValue} 
                    disabled={disabled} 
                />
                <button type="button" className="btn btn-secondary light" onClick={plus} style={{borderLeft: 0}} disabled={disabled} >
                    <i className="bx bx-plus"></i>
                </button>
            </div>
        </div>
        // <div className="order-qty-btn">
        //     <ButtonGroup>
        //         <Button type="button" onClick={minus}>
        //             {
        //                 delBtn ? <box-icon name='trash' size="14px" color="#212529"></box-icon> 
        //                 :<box-icon name='minus' size="14px" color="#212529"></box-icon>

        //             }
        //         </Button>
        //         <Form.Control 
        //           type="text"
        //           pattern="[0-9]*" 
        //           placeholder={placeholder ? placeholder : "0"}
        //           value={inputValue}
        //           onChange={onChangeInput}
        //           name={name}
        //           id={props.id}
        //         />
        //         <Button type="button" onClick={plus}>
        //             <box-icon name='plus' size="14px" color="#212529"></box-icon>
        //         </Button>
        //     </ButtonGroup>
        // </div>
    )
}


QtyButton.propTypes = {
    value: propTypes.oneOfType(["number","string"]),
    placeholder: propTypes.string,
    label: propTypes.string,
    onChange: propTypes.func,
    name: propTypes.string,
    min: propTypes.number,
    max: propTypes.number,
    id: propTypes.string,
    data: propTypes.object,
    returnValue: propTypes.func,
    width: propTypes.any,
    disabled: propTypes.bool,
    size: propTypes.number
}