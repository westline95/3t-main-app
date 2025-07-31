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

export default function AddCategoryModal({ show, onHide, categoryList }) {
    const axiosPrivate = useAxiosPrivate();
    const toast = useRef(null);
    const toastUpload = useRef(null);
    const [progress, setProgress] = useState(0);
    const {
        register,
        setError,
        clearErrors,
        handleSubmit,
        formState: { errors }
    } = useForm();
    
    const fetchInsertCategory = async (category) => {
        await axiosPrivate.post("/category", category)
        .then(resp => {
            if(resp.data){
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Berhasil menambahkan kategori",
                    life: 1500,
                });

                setTimeout(() => {
                    window.location.reload();
                },1500);
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal menambahkan kategori",
                    life: 3000,
                });
            }
        })
        .catch(err => {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error when inserting category",
                life: 3000,
            });
        })
    };

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const onSubmit = async (formData) => {
        const getDupl = categoryList.find(({category_name}) => formData.category_name.toLowerCase() == category_name);
        if(getDupl){
            // show duplicate error
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Kategori sudah ada!",
                life: 3000,
            });
        } else {
            // fetch insert
            if (formData.img && formData.img.length > 0) {
                const imgFile = formData.img[0];
                const base64 = await convertBase64(imgFile);
    
                axiosPrivate.post("/api/upload/img",
                    { image: base64 },
                    {
                        onUploadProgress: (progressEvent) => {
                            const progress = progressEvent.total
                                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                                : 0;
                            toastUpload.current.show({
                                summary: "Uploading your files...",
                            });
                            setProgress(progress);
                        },
                    }
                )
                .then((res) => {
                    let newFormData = {
                        ...formData,
                        img: res.data,
                    };
                    setProgress(100);
                    toastUpload.current.clear();
                    toast.current.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Sucessfully upload image",
                        life: 3000,
                    });
                    const categoryModel = JSON.stringify(newFormData);
                    fetchInsertCategory(categoryModel);
                })
                .catch((err) => {
                    setProgress(0);
                    toast.current.show({
                        severity: "error",
                        summary: "Failed",
                        detail: "Failed to upload image",
                        life: 3000,
                    });
                });
            } else {
                const noimg = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`;
                let newFormData = {
                    ...formData,
                    img: noimg,
                };
                const categoryModel = JSON.stringify(newFormData);
                fetchInsertCategory(categoryModel);
            } 
            
        }
        
    };  
    
    const onError = (errors) => {
        console.error(errors);
    }

    if(!categoryList){
        return;
    }
    
    return ( 
        <>
        <Modal size="md" show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Tambah kategori</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form style={{width: '100%'}}>
                    <Row className="gy-4">
                        <Col lg={12} md={12} sm={12}>
                            <div className="add-prod-img-wrap" style={{textAlign:'center'}}>
                                <label className="mb-1" htmlFor="name" >foto kategori</label>
                                <DropzoneFile
                                    name={"img"}
                                    register={register}
                                    require={false}
                                    errors={errors}
                                    style={{position:'relative', left:'27%'}}
                                />
                            </div>
                        </Col>
                        <Col lg={12} md={12} sm={12}>
                            <InputWLabel
                                label={"Nama kategori"}
                                type="text"
                                name="category_name"
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

