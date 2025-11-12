import React, {useEffect, useRef, useState} from 'react';
import InputWLabel from '../Input/InputWLabel';
import propTypes from 'prop-types';
import { useForm, useFormContext } from 'react-hook-form';

export default function AutoComplete({
    Label, InputName, Placeholder, DataOrigin , DataFiltered, ForceSelection, 
    DataForm, SearchKey, DataKeyInputValue, OnSelect, OnChange, require, 
    FilterData, FilteredData,  index, LocalStorage, OpenPopup, OnFocus, onKeyDownChange
}){
    const popupRef = useRef();
    const { register, formState: {errors}, setError, setValue, getValues, setFocus, watch } = useFormContext();
    const [ dataOrigin, setDataOrigin ] = useState(DataOrigin ? DataOrigin : []);
    // const [ data, setData ] = useState(Data ? Data : []);
    const [ FilteredOrigin, setFilteredOrigin ] = useState( FilteredData ? FilteredData : []);
    const [ flag, setFlag] = useState(false);
    const [ filteredData, setFilteredData ] = useState(DataFiltered ? DataFiltered : []);
    const [ choosedItem, setChoosedItem ] = useState(null);
    const [ openPopup, setOpenPopup ] = useState(OpenPopup);
    const [ popupClicked, setPopupClicked ] = useState(false);
    const [ blurred, setBlurred ] = useState(true);
    const [ currentActiveCust, setCurrentActiveCust ] = useState(null);
    const customerListTakenStorage = localStorage.getItem(LocalStorage);    

    const handleAutoComplete = (e) => {
        const inputVal = getValues(InputName);

        if(inputVal && inputVal !== ""){
            // if arrray object type
            // let dupeFiltered;
            if(customerListTakenStorage && e.type =="change") {
                dupeFiltered = JSON.parse(customerListTakenStorage);
                dupeFiltered[index] = null;
                localStorage.setItem(LocalStorage, JSON.stringify(dupeFiltered));
            }
            
            if(dupeFiltered){
                const filter1 = dataOrigin.filter(item => !dupeFiltered.includes(item.customer_id));
                const filter2 = filter1.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
                // const filter2 = dataOrigin.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
                setFilteredData(filter2);            
                // (filter2.length == 0) ? setOpenPopup(false) : setOpenPopup(true);
                setOpenPopup(true);
            } else {
                const filter1 = dataOrigin.filter(item => !dupeFiltered.includes(item.customer_id));
            // const filter1 = filteredData ? filteredData.filter(item => item[SearchKey].includes(inputVal.toLowerCase())) : dataOrigin.filter(item => item[SearchKey].includes(inputVal.toLowerCase()));
            setFilteredData(filter1);            
            setOpenPopup(true);
            // (filter1.length == 0) ? setOpenPopup(false) : setOpenPopup(true);
            }
        } else if(inputVal == "") {
            if(customerListTakenStorage) {
                let dupeFiltered = JSON.parse(customerListTakenStorage);
                const filter1 = dataOrigin.filter(item => !dupeFiltered.includes(item.customer_id));
                setFilteredData(filter1);
            } else {
                setFilteredData(dataOrigin);

            }
            // if(filteredData){
            //     setFilteredData(DataFiltered);
            //     setOpenPopup(true);
            // } else {
            //     setFilteredData(dataOrigin);
            //     setOpenPopup(false);
                setOpenPopup(true);
            // }
        }

        // if(onKeyDownChange){
        //     return onKeyDownChange(choosedItem, index);
        // }
    }
    
    const handleKeyDown = (e) => {
        if (e.key) {
            setChoosedItem(null);
            setBlurred(false);
        }
    }

    const handleFilteringAutoComplete = (custID) => {
        // for fitering customer
        let arr;
        let parsed = JSON.parse(customerListTakenStorage);
        arr = [...parsed];
        if(custID && custID != ""){
            if(arr.length == 0) {
                arr[index] = custID;
                console.log("data baru")
                // localStorage.setItem(LocalStorage, JSON.stringify(arr));
                // setFilteredData(arr);
            } else {

                let findDupe = arr.find((customerID) => customerID === custID);
                if(!findDupe) {
                // arr.push(custID);
                arr[index] = custID;
                // setFilteredData(arr);
                // localStorage.setItem(`customer_id`, JSON.stringify(arr));
                } else {
                console.log("udah ada");
                }
            }

            // let custDataDupe = [...Data];
            // let result = data.filter(({customer_id}) => !arr.includes(customer_id));
            // setFilteredData(result);
            localStorage.setItem(LocalStorage, JSON.stringify(arr));
        } 
        // else {
            // const customerListTakenStorage = localStorage.getItem(`customer_id`);
            // let parsed = JSON.parse(customerListTakenStorage);
            // let custDataDupe = [...Data];
            let result = data.filter(({customer_id}) => !arr.includes(customer_id));
            setFilteredData(result);
            console.log(result);
        // }
    }

    const handleChooseItem = (e, itemData) => {
        // for array object datatype  
        let setInputValue = itemData[DataKeyInputValue];

        setChoosedItem(itemData);
        setValue(`${InputName}`, setInputValue);
        setOpenPopup(false);
        setBlurred(false);

        setTimeout(() => {
            if(OnSelect){
                return OnSelect(itemData);
            }
            
        }, 250);

        // FilterData && itemData.customer_id && handleFilteringAutoComplete(itemData.customer_id);
    }

    const handleBlur = () => {
        if(!choosedItem && !blurred){
            setValue(`${InputName}`, '');
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

    // useEffect(() => {
    //     if(choosedItem){
    //        if(OnSelect) return OnSelect(choosedItem);
    //     }
    // },[choosedItem]);
    console.log(openPopup);

    return(
        <div style={{ position: "relative" }}>
            <InputWLabel
                label={Label}
                type="text"
                name={InputName}
                placeholder={Placeholder}
                onChange={(e) => {
                    handleAutoComplete(e);
                }}
                onFocus={(e) => handleAutoComplete(e)}
                onKeyDown={handleKeyDown}
                // for smooth working onBlur method in custom component must set nBlur=true 
                // && set prop onblurcallback for onblurfunction
                onBlur={true}
                onBlurCallback={() => ForceSelection && handleBlur()}
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