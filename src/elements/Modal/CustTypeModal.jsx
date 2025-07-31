import React, {useEffect, useState} from 'react';
import { Modal, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useController, useForm } from 'react-hook-form';
import InputWLabel from '../Input/InputWLabel';
import propTypes from "prop-types";
import FetchApi from '../../assets/js/fetchApi.js';
import ConfirmModal from './ConfirmModal.jsx';

export default function CustTypeModal(props){
    const {show, onHide, data, action} = props;
    const duplicate = data ? {...data} : null;
    const [ showToast, setShowToast ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ showModal, setShowModal ] = useState(false);
    const [ targetKey, setTarget ] = useState('');
    const [ sendTarget, setSendTarget ] = useState(null);
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors },
    } = useForm(action === "update" ? {
        defaultValues: {
            type: data.type,
            status: data.status
        }
    }:"");


    const fetchAddCustType = (data) => {
        if(data && data != "") {
            let body = JSON.stringify(data);
            FetchApi.fetchInsertCustType(body)
                .then(data => {
                    setToastContent({variant:"success", msg: "Add new customer type success"});
                    setShowToast(true);
                    setTimeout(() => {
                        window.location.reload();
                    },1200)
                })
                .catch(error => {
                    setToastContent({variant:"danger", msg: "Add new customer type failed"});
                    setShowToast(true);
                }
            )
        } else {
            setToastContent({variant:"danger", msg: "Something is wrong with data!"});
            setShowToast(true);
        }
        
    }

    const handleClose = () => {
        setShowModal(false);
    }

    const onError = () => {
        setToastContent({variant:"danger", msg: "Required field can't be blank!"});
        setShowToast(true);
    }

    const onSubmit = (custTypeData) => {
        switch(action) {
            case 'insert':
                fetchAddCustType(custTypeData);
                break;
                case 'update':
                    setShowModal(true);
                    let dataToSend = {
                        id: data.id,
                        endpoint: data.endpoint,
                        action: data.action,
                        data: custTypeData
                    }
                    setSendTarget(dataToSend);
                break;
        }
    }
    useEffect(() => {
        if(data && data !== ""){
            setValue("type", data.type)
        }
    }, [data])

    return(
        <>
        <Modal size='md' show={show} onHide={() => {onHide();reset()}} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>{data.action === "insert" ? "add" : "edit"} customer type</Modal.Title>
            </Modal.Header>
            {data  ? 
            <Modal.Body>
                <form>
                    <InputWLabel
                        label="Customer Type"
                        type="text" 
                        name="type"
                        require={true}
                        register={register}
                        errors={errors}
                    />
                    <InputWLabel 
                        label="Status" 
                        inlineForm={true}
                        type="switch"
                        theme="primary"
                        name="status" 
                        register={register}
                        require={false}
                        errors={errors}
                    /> 
                </form>
            </Modal.Body>
            :""}
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={() => {onHide();reset()}}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit(onSubmit, onError)}>Save</button>
            </Modal.Footer>
        </Modal>

        {showModal ? 
            <ConfirmModal
                show={showModal} 
                onHide={handleClose} 
                data={showModal === true && sendTarget ? sendTarget : ""} 
                multiple={true} 
                stack={1} 
                msg={"Are you sure to make changes for this data?"}
                // returnValue={(value) => setTarget(value)}
            />
            :""
        }
        
        {/* toast area */}
        <ToastContainer
            className="p-3 custom-toast"
        >
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                {/* <Toast.Header>
                    <img
                        src="holder.js/20x20?text=%20"
                        className="rounded me-2"
                        alt=""
                    />
                    <strong className="me-auto">{toastContent.title}</strong>
                    <small>11 mins ago</small>
                </Toast.Header> */}
                <Toast.Body>{toastContent.msg}</Toast.Body>
            </Toast>
        </ToastContainer>
        </>
    )
}

CustTypeModal.propTypes = {
    action: propTypes.oneOf(["update", "insert", ""]),

}