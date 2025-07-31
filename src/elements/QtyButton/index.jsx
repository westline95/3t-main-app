import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
import propTypes from "prop-types";
import { NumericFormat } from 'react-number-format';
import { ButtonGroup, Form } from "react-bootstrap";
import Button from "../Button";
import InputWLabel from "../Input/InputWLabel";

export default function QtyButton(props) {
    const { data, value, placeholder, name, min, max, returnValue, width, disabled, label } = props;
    const [ inputValue, setInputValue ] = useState(value ? value : 0 );
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
            
            // onChangeInput({ 
            //     target: {
            //         name: name,
            //         value: newValue,
            //     }
            // })
            // returnValue(Number(newValue));
        } else {
            const newValue = Number(max);
            // onChangeInput({ 
            //     target: {
            //         name: name,
            //         value: newValue,
            //     }
            // })
            setInputValue(newValue);
            // returnValue(Number(newValue));
        }
    };

    const onChangeInput = (e) => {
        let val = e.target.value;
        // console.log(val)
        // console.log(inputValue)
        // // const patternNumeric = /^\d*\.?\d*$/;
        // // const patternNumeric = new RegExp ("[0-9]*$");
        // // const isNumeric = patternNumeric.test(val);
        // let newVal;

        // // const patternNumeric = /^\d*\.?\d*$/;
        // // const isNumeric = patternNumeric.test(joinVal + val);
        if(val == ""){
            setInputValue(min);
        } else {
            setInputValue(Number(val));
        }
        // // if(isNumeric){
        // //     setJoinVal(joinVal + keyjoinVal + val);
        //     // setInputValue(val);
        // // }
        
        // // if(+val >= min && +val <= max) {
        // //     setInputValue((parseFloat(+val)));
        // //     newVal = parseFloat(+val);
        // //     console.log(newVal)
        // // } else if (+val < min) {
        // //     newVal = min;
        // //     setInputValue(min);
        // // } else {
        // //     newVal = inputValue;
            
        // // }

        // // if(parseFloat(inputValue) <= max && parseFloat(inputValue) >= min) {
        // //     // e.target.name = name;
        // //     // e.target.value = +val;
        // //     setInputValue(inputValue);
        // //     newVal = Number(inputValue);
        // // } else if (inputValue < min) {
        // //     newVal = min;
        // //     setInputValue(min);
        // // } else {
        // //     newVal = inputValue;
        // //     // setInputValue(min);
        // // }
                
                    
        // returnValue(Number(val));
        // returnValue(newVal);

    };

    const onKeyDown= (e) => {
        const key = e.key;
        const value = e.target.value;
        console.log(value + key)
        
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
        returnValue(Number(inputValue));
    },[inputValue])
    
    return(
        <div style={{display: 'flex', flexDirection:'column'}}>
            {label ? 
                (
                    <Form.Label className="mb-1">{label}</Form.Label>
                ):''
            }

            <div className="btn-group" role="group" style={{width: width ? width : "270px", marginTop:'.1rem'}}>
                <button type="button" className="btn btn-secondary light" onClick={minus}>
                    <i className="bx bx-minus"></i>
                </button>
                <NumericFormat 
                    // thousandSeparator="." 
                    // decimalSeparator="," 
                    fixedDecimalScale 
                    className="form-control" 
                    onChange={onChangeInput} 
                    onKeyDown={onKeyDown}
                    name={name} 
                    value={inputValue} 
                    disabled={disabled} 
                />
                <button type="button" className="btn btn-secondary light" onClick={plus}>
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
    value: propTypes.number,
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
    disabled: propTypes.bool
}