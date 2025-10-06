import React, {useEffect, useRef, useState} from 'react';
import InputWLabel from '../Input/InputWLabel';
import propTypes from 'prop-types';
import { useForm, useFormContext } from 'react-hook-form';

export default function AutoComplete({Label, InputName, Placeholder, Data, ForceSelection, DataForm, SearchKey, DataKeyInputValue, returnData, require}){
    const popupRef = useRef();
    const { register, formState: {errors}, setError, setValue, getValues } = useFormContext();
    const [ filteredRes, setFilteredRes ] = useState(Data ? Data : []);
    const [ choosedItem, setChoosedItem ] = useState(null);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ popupClicked, setPopupClicked ] = useState(false);
    const [ blurred, setBlurred ] = useState(false);

    const handleAutoComplete = (e) => {
        setBlurred(false)
        const inputVal = getValues(InputName);
        if(inputVal && inputVal !== ""){
            // if arrray object type
            const filterData = Data.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
            setFilteredRes(filterData);
            
            (filterData.length == 0) ? setOpenPopup(false) : setOpenPopup(true);
        } else if(inputVal == "") {
            setFilteredRes(Data);
            setOpenPopup(true);
        } else {
            setOpenPopup(false);
        }
    }
    
    const handleKeyDown = (e) => {
        if(e.key) {
            setChoosedItem(null);
        }
    }

    const handleChooseItem = (e, itemData) => {
        // for array object datatype  
        // console.log()
        let setInputValue = itemData[DataKeyInputValue];
        console.log(setInputValue)
        setChoosedItem(setInputValue);
        setValue(`${InputName}`, setInputValue);
        setOpenPopup(false);
        setBlurred(false)
        if(returnData){
            return returnData(itemData);
        }
    }

    const handleBlur = () => {
        if(!choosedItem){
            setValue(`${InputName}`, '');
        }
    }

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                console.log(evt.target)
                if(!ref.current.contains(evt.target) 
                    && evt.target.className !== "res-item" 
                    && evt.target.className !== "popup-element"
                ) {
                    setOpenPopup(false);
                }  

            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        },[ref])
        
    };
    handleClickSelect(popupRef);

    return(
        <div style={{ position: "relative" }}>
            <InputWLabel
                label={Label}
                type="text"
                name={InputName}
                placeholder={Placeholder}
                onChange={(e) => handleAutoComplete(e)}
                onFocus={handleAutoComplete}
                onKeyDown={handleKeyDown}
                // for smooth working onBlur method in custom component must set nBlur=true 
                // && set prop onblurcallback for onblurfunction
                onBlur={true}
                onBlurCallback={handleBlur}
                // if onblur true, two items prop above are required

                require={require}
                register={register}
                errors={errors}
                textStyle={"capitalize"}
                autoComplete="off"
            />

            {/* popup autocomplete */}
            <div
                className="popup-element"
                aria-expanded={openPopup}
                ref={popupRef}
            >
                {filteredRes && filteredRes.length > 0
                ? filteredRes.map((item, idx) => {
                    return (
                        <div
                        key={idx}
                        className="res-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPopupClicked(true);
                            handleChooseItem(e, item)
                        }
                            
                        }
                        >
                        {item.name}
                        </div>
                    );
                    })
                : ""}
            </div> 
        </div>
    )
}

AutoComplete.propTypes = {
    Label: propTypes.string,
    InputName: propTypes.string,
    Placeholder: propTypes.string,
    Data: propTypes.array.isRequired,
    ForceSelection: propTypes.bool,
    returnData: propTypes.func,
    DataForm: propTypes.oneOf(['array', 'array-object']).isRequired,
    SearchKey: (props, propName, componentName) => {
        if(props.DataForm == "array-object" && typeof props[propName] != "string"){
            throw new Error("Search key must string for array object data type!")
        } 
        return null;
    },
    DataKeyInputValue: (props, propName, componentName) => {
        if(props.DataForm == "array-object" && typeof props[propName] != "string"){
            throw new Error("DataKeyInputValue must string for array object data type!")
        }
        return null;
    },
}