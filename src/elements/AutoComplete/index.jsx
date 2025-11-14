import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import InputWLabel from '../Input/InputWLabel';
import propTypes from 'prop-types';
import { useForm, useFormContext } from 'react-hook-form';
import  debounce  from 'debounce';

export default function AutoComplete({
    Label, InputName, Placeholder, DataOrigin , DataFiltered, ForceSelection, 
    DataForm, SearchKey, DataKeyInputValue, OnSelect, OnChange, require, 
    FilterData, FilteredData,  index, LocalStorage, OpenPopup, OnFocus, onKeyDownChange,storageResync
}){
    const popupRef = useRef();
    const { register, formState: {errors}, setError, setValue, getValues, setFocus, watch } = useFormContext();
    const [ dataOrigin, setDataOrigin ] = useState(DataOrigin ? DataOrigin : []);
    // const [ data, setData ] = useState(Data ? Data : []);
    const [ FilteredOrigin, setFilteredOrigin ] = useState( FilteredData ? FilteredData : []);
    const [ flag, setFlag] = useState(false);
    const [ filteredData, setFilteredData ] = useState(DataFiltered ? DataFiltered : []);
    const [ choosedItem, setChoosedItem ] = useState(null);
    const [ inputValue, setInputValue ] = useState("");
    const [ debouncedValue, setDebouncedValue ] = useState(null);
    const [ nullishTrigger, setNullishTrigger ] = useState(false);
    const [ processNullish, setProcessNullish] = useState(false);
    const [ openPopup, setOpenPopup ] = useState(false);
    const [ popupClicked, setPopupClicked ] = useState(false);
    const [ blurred, setBlurred ] = useState(true);
    const [ cleared, setCleared ] = useState(false);
    const [ currentActiveCust, setCurrentActiveCust ] = useState(null);
    const customerListTakenStorage = localStorage.getItem(LocalStorage);    
    const currentInput = useRef(null);

    const handleAutoComplete = (e) => {
        let inputVal = e.target.value;
        setInputValue(inputVal);
        
        // if(onKeyDownChange){
        //     onKeyDownChange(nputName, inputVal, index);
        // }
            
        const refilterCust = localStorage.getItem(LocalStorage);
        

        if(inputVal && inputVal !== ""){
        //     console.log("tidak kosong")
            
        // //     // if arrray object type
        // //     // let dupeFiltered;
        // //     // if(customerListTakenStorage && e.type =="change") {
        // //     //     dupeFiltered = JSON.parse(customerListTakenStorage);
        // //     //     dupeFiltered[index] = null;
        // //     //     localStorage.setItem(LocalStorage, JSON.stringify(dupeFiltered));
        // //     // }
            
        // //     // if(dupeFiltered){
        // //     //     const filter1 = dataOrigin.filter(item => !dupeFiltered.includes(item.customer_id));
        // //     //     const filter2 = filter1.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
        // //     //     // const filter2 = dataOrigin.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
        // //     //     setFilteredData(filter2);            
        // //     //     // (filter2.length == 0) ? setOpenPopup(false) : setOpenPopup(true);
        // //     //     setOpenPopup(true);
        // //     // } else {
        // //     //     const filter1 = dataOrigin.filter(item => !dupeFiltered.includes(item.customer_id));
        // //     // // const filter1 = filteredData ? filteredData.filter(item => item[SearchKey].includes(inputVal.toLowerCase())) : dataOrigin.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
        // //     // setFilteredData(filter1);            
        // //     // setOpenPopup(true);
        // //     // }
        // refilter
           
            // console.log(refilterCustRes);
            // setFilteredData(refilterCustRes);
            // console.log(filteredData)
            if(refilterCust){
                const refilterCustParse = JSON.parse(refilterCust);
                const refilterCustRes = dataOrigin.filter((item)  => !refilterCustParse.includes(item.customer_id));
                const filter2 = refilterCustRes.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
                setFilteredData(filter2);
            } else {
                const filter2 = dataOrigin.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
                setFilteredData(filter2);
            }
            setOpenPopup(true);

          
            

        } else if(inputVal == "") {

        // //     // if(customerListTakenStorage) {
        // //     //     let dupeFiltered = JSON.parse(customerListTakenStorage);
        // //     //     const filter1 = dataOrigin.filter(item => !dupeFiltered.includes(item.customer_id));
        // //     //     setFilteredData(filter1);
        // //     // } else {
        // //     //     setFilteredData(dataOrigin);

        // //     // }
        // //     setFilteredData(DataFiltered);
        // //     // if(filteredData){
        if(refilterCust){
            const refilterCustParse = JSON.parse(refilterCust);
            const refilterCustRes = dataOrigin.filter((item)  => !refilterCustParse.includes(item.customer_id));
            setFilteredData(refilterCustRes);
        } else {
            // const filter2 = dataOrigin.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
            setFilteredData(dataOrigin);
        }
        // const refilterCustParse = JSON.parse(refilterCust);
        // const refilterCustRes = dataOrigin.filter((item)  => !refilterCustParse.includes(item.customer_id));
        //         setFilteredData(refilterCustRes);
        // //     //     setOpenPopup(true);
        // //     // } else {
        //     //     setFilteredData(dataOrigin);
        // //     //     setOpenPopup(false);
                setOpenPopup(true);
        // //     // }
        }      
        // setNullishTrigger(true);
    }

    const handleKeyDown = (e) => {
        if (e.key) {
            setBlurred(false);
            if(e.key === "Backspace"){
                setCleared(true);
            }
        }
    }

    const handleChooseItem = (e, itemData) => {
        // for array object datatype  
        let setInputValue = itemData[DataKeyInputValue];
        setChoosedItem(itemData);
        setValue(`${InputName}`, setInputValue);
        // setOpenPopup(false);
        setBlurred(false);

        setTimeout(() => {
            if(OnSelect){
                return OnSelect(itemData);
            }// console.log(memoChoosed)
            
            // if(onKeyDownChange) {
            //    onKeyDownChange(index);
            // } 
            
        }, 250);

        // FilterData && itemData.customer_id && handleFilteringAutoComplete(itemData.customer_id);
    }

    const handleBlur = () => {
        if(!choosedItem && !blurred){
            setValue(`${InputName}`, '');
            if(onKeyDownChange){
                onKeyDownChange(index)
            }
        }
    }

    const handleClickSelect = (ref) => {
        useEffect(() => {
            const handleClickOutside = (evt) => {
                if(!ref.current.contains(evt.target) 
                    && evt.target.className !== "res-item" 
                    && evt.target.className !== "popup-element"
                ) {
                    setOpenPopup(false);
                    // handleBlur();
                }  

            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        },[ref])
        
    };
    handleClickSelect(popupRef);

    useEffect(() => {
        if(cleared){
            const customerListTakenStorage = localStorage.getItem(LocalStorage);    
             if(customerListTakenStorage) {
                let dupeFiltered = JSON.parse(customerListTakenStorage);
                dupeFiltered[index] = null;
                localStorage.setItem(LocalStorage, JSON.stringify(dupeFiltered));
                
                
                
            }
        }
    },[cleared])

    return(
        <div style={{ position: "relative" }}>
            <InputWLabel
                ref={currentInput}
                label={Label}
                type="text"
                name={InputName}
                placeholder={Placeholder}
                onChange={(e) => {
                    handleAutoComplete(e);
                    console.log(e)
                }}
                onFocus={(e) => handleAutoComplete(e)}
                onKeyDown={handleKeyDown}
                // for smooth working onBlur method in custom component must set nBlur=true 
                // && set prop onblurcallback for onblurfunction
                onBlur={true}
                onBlurCallback={() => ForceSelection && handleBlur()}
                // if onblur true, two items prop above are required
                // value={inputValue}
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
                {filteredData && filteredData.length > 0
                ? filteredData.map((item, idx) => {
                    return (
                        <div
                        key={idx}
                        className="res-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPopupClicked(true);
                            handleChooseItem(e, item);
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
    DataOrigin: propTypes.array.isRequired,
    DataFiltered: propTypes.array.isRequired,
    ForceSelection: propTypes.bool,
    FilterData: propTypes.bool,
    OnSelect: propTypes.func,
    OnChange: propTypes.func,
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