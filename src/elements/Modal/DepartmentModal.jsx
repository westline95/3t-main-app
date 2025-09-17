import React, {useState, useEffect, useRef} from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { Toast } from "primereact/toast";
import Button from "../Button";
import InputWLabel from "../Input/InputWLabel";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DropzoneFile from "../DropzoneFile";

import NoImg from "../../assets/images/no-img.jpg";
import { ProgressBar } from "primereact/progressbar";

export default function DepartmentModal({ show, onHide, data, returnAct }) {
    const axiosPrivate = useAxiosPrivate();
    const toast = useRef(null);
    const toastUpload = useRef(null);
    const [progress, setProgress] = useState(0);
    const {
        register,
        setError,
        clearErrors,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();
    
    const fetchInsertDepartment = async (formData) => {
        const toSend = {
            department: {
                ...formData
            }
        }
        const body = JSON.stringify(toSend);
        await axiosPrivate.post("/department", body)
        .then(resp => {
            if(resp.data){
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Berhasil menambahkan departemen",
                    life: 1500,
                });

                setTimeout(() => {
                    return returnAct(true);
                }, 1500);
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal menambahkan departemen",
                    life: 3000,
                });
            }
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when inserting departemen",
                life: 3000,
            });
        })
    };
    
    const fetchUpdateDepartment = async (formData) => {
        const toSend = {
            ...formData
        };

        const body = JSON.stringify(toSend);
        await axiosPrivate.patch("/department/minor-update", body, {params: {id: data.id}})
        .then(resp => {
            if(resp.data){
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Berhasil memperbarui departemen",
                    life: 1500,
                });
                setTimeout(() => {
                    return returnAct(true);
                }, 1500);
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal memperbarui departemen",
                    life: 3000,
                });
            }
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when updating departemen",
                life: 3000,
            });
        })
    };


    const onSubmit = async (formData) => {
        if(data.action == "insert"){
            fetchInsertDepartment(formData);
        } else {
            fetchUpdateDepartment(formData);
        }
    };  
    
    const onError = (errors) => {
        console.error(errors);
    }
    console.log(data)
    useEffect(() => {
        if(data && data.action == "update"){
            setValue("department_name", data.rowData.department_name);
        }
    },[data])

    if(!data){
        return;
    }
    
    return ( 
        <>
        <Modal size="md" show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{data.action == "insert" ? 'Tambah' : 'Ubah'} departemen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form style={{width: '100%'}}>
                    <Row className="gy-4">
                        <Col lg={12} md={12} sm={12}>
                            <InputWLabel
                                label={"Nama departemen"}
                                type="text"
                                name="department_name"
                                require={true}
                                register={register}
                                errors={errors} 
                            />
                        </Col>
                    </Row>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" isSecondary={true} isLight={true} onHide={true} onClick={onHide}>batal</Button>
                <Button type="button" isPrimary={true} onClick={handleSubmit(onSubmit, onError)}>simpan</Button>
            </Modal.Footer>
        </Modal>


        <Toast ref={toast} />
        <Toast
            ref={toastUpload}
            content={({ message }) => (
                <section
                className="flex p-3 gap-3 w-full shadow-2 fadeindown"
                style={{
                    borderRadius: "10px",
                    backgroundColor: "#262626",
                    color: "#ffffff",
                }}
                >
                <i className="bx bx-cloud-upload" style={{ fontSize: 24 }}></i>
                <div className="flex flex-column gap-3 w-full">
                    <p className="m-0 font-semibold text-base text-white">
                    {message.summary}
                    </p>
                    <p className="m-0 text-base text-700">{message.detail}</p>
                    <div className="flex flex-column gap-2">
                    <ProgressBar value={progress} showValue="false"></ProgressBar>
                    <label className="text-right text-xs text-white">
                        {progress}% uploaded...
                    </label>
                    </div>
                </div>
                </section>
            )}
        ></Toast>
        </>
    )
}

