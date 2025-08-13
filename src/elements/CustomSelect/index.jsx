import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import ReactDOM from 'react-dom';
import propTypes from "prop-types";


const container = document.getElementById('portal');

// Create a root.
// const portal = ;

export const CustomSelect = (props) => {
    const { options, selectedOption, defaultValue, 
        selectLabel, watch, name, optionKeys, disabled, defaultValueKey, width, isOpen, onChange,
        selected, resetController, onClick, position
    } = props;
    const [openSelect, setOpen] = useState(false);
    const [isValueLabel, setValueLabel] = useState(selectLabel);
    const [isValue, setValue] = useState(selectLabel);
    const [matchValue, setMatchValue] = useState("");
    // const [matchValue, setMatchValue] = useState("");
    const refToThis = useRef(null);
    const [elPosition, setElPosition] = useState(null);
    const selectItems = useRef(null);
    const keyId = optionKeys ? optionKeys [0] : '';
    const keyValue = optionKeys ? optionKeys[1] : '';

    const measureElement = () => {
        if (refToThis.current) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const rect = refToThis.current.getBoundingClientRect();
            // const dropdownHeight = document.getElementById("portal").querySelector.offsetHeight;
            const dropdownTop= rect.top;

            // console.log(windowHeight - dropdownTop)
            // console.log(selectItems?.current?.offsetHeight)
            // console.log(dropdownHeight)

            // if (windowHeight - dropdownTop < dropdownHeight) {
            //     // dropdownList.style.bottom = '100%'
            //     // dropdownList.style.top = 'auto'
            //     console.log("harusnya di top kan")
            // } else {
            //     console.log("harusnya default")
            //     // dropdownList.style.bottom = 'auto'
            //     // dropdownList.style.top = '100%'
            // }
            // console.log(windowHeight)
            // console.log(rect)
            setElPosition({
                width: rect.width,
                height: rect.height,
                top: rect.top ,
                bottom: rect.bottom + scrollTop ,
                left: rect.left,
                x: rect.x,
                y: rect.y
            });
        }
    };

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(refToThis.current && !ref.current.contains(evt.target)) {
                    if(!evt.target.classList.contains('opt-list')){
                        setOpen(false);
                    } 
                } else {
                    if(disabled){
                        setOpen(false);
                        // onClick(true);
                    } else {
                        // setElPosition(refToThis.current.getBoundingClientRect());
                        // if(openSelect){
                        //     setOpen(false);
                        //     setOpen(true);
                        // } else {
                            setOpen(true);
                        // }
                    }
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref, disabled]);
    }
    handleClickSelect(refToThis);

    const handleClickDropdown = (e) => {
        // setElPosition(e.currentTarget.getBoundingClientRect());
        measureElement();
    }
    
    
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

    // console.log(elPosition)

    useEffect(() => {
        if(refToThis.current){
            window.addEventListener('scroll', measureElement, true);
            window.addEventListener('resize', measureElement, true);
            return () => {
                window.removeEventListener('scroll', measureElement, true);
                window.addEventListener('resize', measureElement, true);
            };
        }
    }, [openSelect,refToThis]);


    return (
        <>
        <div  className="custom-select-opt" id={props.id} style={{width: width && width}} ref={refToThis} onClick={(e) => {!disabled && setOpen(true);handleClickDropdown(e)}}>
            {props.label ?
                (<label className="mb-1">{props.label}</label>)
                :""
            }
            <div 
                className={`same-as-select ${disabled ? 'disabled' : ''}`}
                value={isValue} 
                style={{width: width}}
            >
                <p>{isValue}</p>
            </div>
        </div>
        <DropdownSelect 
            ref={selectItems}
            open={openSelect} 
            openCallback={() => {setOpen(false)}} 
            position={position} 
            selectLabel={selectLabel} 
            options={options} 
            selectedOption={(selectedCB) => selectedOption({id: selectedCB.id, value: selectedCB.value})}
            returnValue={(value) => setValue(value)}
            keyId={keyId}
            keyValue={keyValue}
            elementPosition={elPosition}
        />
        </>
    )
}

const DropdownSelect = forwardRef((props,ref) => {
    const { open, position, selectLabel, options, openCallback, selectedOption, returnValue, keyId, keyValue, elementPosition } = props;
    const [portalNode, setPortalNode] = useState(null);

    useEffect(() => {
        const node = document.getElementById('portal');
        if (node) {
            setPortalNode(node);
        }
    }, [])

    if (!open || !portalNode) {
        return null;
    }
    
    return(
        ReactDOM.createPortal(
            <div ref={ref} className={`select-items ${open ? '' : 'select-hide'} static-shadow`} 
                style={{
                    width: elementPosition ? elementPosition.width  : '100%',
                    // top: elementPosition ? (elementPosition.top + elementPosition.height + 1.5) : 0,
                    // bottom: elementPosition ? (elementPosition.bottom) : 0,
                    top: elementPosition ? (elementPosition.bottom) : 0,
                    // transform: elementPosition && `translateY(-${elementPosition.bottom+elementPosition.height}px)`,
                    left: elementPosition ? elementPosition.left : 0
                }}
            >
            {selectLabel ?
                (
                    <div className="opt-list" value="" onClick={() => {openCallback(false);selectedOption({id: '', value: null});returnValue(selectLabel)}}>{selectLabel}</div>
                ):''
            }
            {options?.map((item, idx) => {
                const handleClickOpt = () => {
                    // setOpen(false);
                    openCallback(false);
                    returnValue(item[keyValue]);
                    selectedOption({id: item[keyId], value: item[keyValue]});
                }
                return(
                    // idx === defaultValue ? 
                    <div key={idx} className="opt-list" value={item[keyId]} onClick={handleClickOpt}>{item[keyValue]}</div>
                    // : <div key={idx} className="custom-select-opt" value={item} onClick={handleClickOpt}>{item}</div>
                )
            })}
        </div>,
            portalNode
        )
    )
});


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
