import { useState, useEffect, useRef } from "react";
import propTypes from "prop-types";

export const CustomSelect = (props) => {
    const { options, selectedOption, defaultValue, 
        selectLabel, watch, name, optionKeys, disabled, defaultValueKey, width, isOpen, onChange,
        selected, resetController, onClick, position
    } = props;
    const [openSelect, setOpen] = useState(false);
    const [isValueLabel, setValueLabel] = useState(selectLabel);
    const [isValue, setValue] = useState(selectLabel);
    const [matchValue, setMatchValue] = useState("");
    const refToThis = useRef(null);
    const keyId = optionKeys ? optionKeys [0] : '';
    const keyValue = optionKeys ? optionKeys[1] : '';
    
    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(refToThis.current && !ref.current.contains(evt.target) ) {
                    setOpen(false);
                } else {
                    if(disabled){
                        setOpen(false);
                        onClick(true);
                    } else {
                        setOpen(true);
                    }
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref, disabled]);
    };
    
    handleClickSelect(refToThis);
    
    useEffect(() => {
        if(defaultValue && defaultValue !== ""){
            const getMatch = options?.find((e) => e[defaultValueKey] == defaultValue);
            const duplicate = {...getMatch};
            if(duplicate.length == 0) {
                setValue(selectLabel);
                selectedOption({id: '', value: ''})
            } else {
                setValue(getMatch[keyValue]);
                selectedOption({id: getMatch[keyId], value: getMatch[keyValue]});
            }
        } else if(defaultValue && defaultValue == "") {
            setValue(selectLabel);
            console.log(matchValue);
        }
    },[defaultValue]);

    useEffect(() => {
        if(resetController){
            setValue(selectLabel);
        }
    },[resetController])


    return(
        <>
        <div className="custom-select-opt" id={props.id} style={{width: width && width}} >
            {props.label ?
                (<label className="mb-1">{props.label}</label>)
                :""
            }
            <div 
                className={`same-as-select ${disabled ? 'disabled' : ''}`}
                value={isValue} 
                ref={refToThis}
                style={{width: width}}
                >
                <p>{isValue}</p>
                <div className={`select-items ${openSelect ? "" : "select-hide"} ${position ? position : 'bottom'}`}>
                    {selectLabel ?
                        (
                            <div className="custom-select-opt" value="" onClick={() => {setOpen((p) => !p);selectedOption({id: '', value: null});setValue(selectLabel)}}>{selectLabel}</div>
                        ):''
                    }
                    {options?.map((item, idx) => {
                        const handleClickOpt = () => {
                            setOpen((p) => !p);
                            setValue(item[keyValue]);
                            selectedOption({id: item[keyId], value: item[keyValue]});
                        }
                        return(
                            // idx === defaultValue ? 
                            <div key={idx} className="custom-select-opt" value={item[keyId]} onClick={handleClickOpt}>{item[keyValue]}</div>
                            // : <div key={idx} className="custom-select-opt" value={item} onClick={handleClickOpt}>{item}</div>
                        )
                    })}
                </div>
            </div>
        </div>
        </>
        
    )
}

CustomSelect.propTypes = {
    options: propTypes.array.isRequired,
    position: propTypes.oneOf(["top", "bottom", "left", "right"]),
    selectedOption: propTypes.func,
    require: propTypes.bool,
    label: propTypes.string,
    selectLabel: propTypes.string,
    id: propTypes.string,
    // register: propTypes.func,
    elementRef: propTypes.func,
    defaultValue: propTypes.string
    
}
