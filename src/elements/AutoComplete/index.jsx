import React, {useState} from 'react';
import FetchApi from '../../assets/js/fetchApi';

export default function AutoComplete({show, data}){
    const [filterCust, setFilteredCust] = useState([]);
    const [chooseCust, setCust] = useState("");
    const [openPopup, setOpenPopup] = useState(show);
    const [ showToast, setShowToast ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});


    const handleChooseCust = (e) => {
        setCust(e);
        setOpenPopup(false);
    }

    return(
        <div className="popup-element" aria-expanded={openPopup}>
        {data.length > 0 ? 
            data.map((e,idx) => {
                return (
                    <div key={`cust-${idx}`} className="res-item" onClick={() => handleChooseCust({id: e.id, name: e.name, category: isActive, type: e.custType})}>{e.name}</div>
                )
            }) : ""
        }
        </div>   
    )
}