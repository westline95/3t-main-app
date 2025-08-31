import React, { useEffect, useRef, useState } from 'react';
import { Col, Collapse, Modal, Row } from 'react-bootstrap';
import DropzoneFile from '../DropzoneFile';
import { useForm } from 'react-hook-form';
import InputWLabel from '../Input/InputWLabel';
import InputWSelect from '../Input/InputWSelect';
import { Toast } from 'primereact/toast';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import dataStatic from '../../assets/js/dataStatic';
import InputGroup from '../Input/InputGroup';
import { ProgressBar } from 'primereact/progressbar';
import useMediaQuery from '../../hooks/useMediaQuery';

export default function EditProductModal({show, onHide, data}) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isMediumScr = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    const axiosPrivate = useAxiosPrivate();

    const toast = useRef(null);
    const toastUpload = useRef(null);
    const [progress, setProgress] = useState(0);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ category, setCategory ] = useState(null);

    const {
        register,
        setError,
        setValue,
        getValues,
        clearErrors,
        handleSubmit,
        formState: {errors}
    } = useForm({
        defaultValues: {
            product_name: data?.product_name,
            variant: data?.variant,
            img: data?.img,
            sell_price: data?.sell_price,
            unit: data?.unit,
            product_cost: data?.product_cost,
            category_id: data?.category?.category_id,
            category_name: data?.category?.category_name,
            discount: data?.discount,
        }
    });

    const fetchCategory = async () => {
        await axiosPrivate.get("/categories")
        .then(response => {
            let categories = [];
            if(response.data.length > 0){
                response.data.map(e => {
                    let category = {
                        id: Number(e.category_id),
                        category_name: e.category_name,
                    };
                    categories.push(category);
                })
                setCategory(categories);
            } else {
                setCategory(null);
            }
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when get category data",
                life: 3000,
            });
        })
    };

    const fetchUpdateProduct = async (productData) => {
        let body = JSON.stringify(productData);
        await axiosPrivate.put("/products", body, {params: {id: data.product_id}})
        .then(response => {
            if(response.data[0] == 1){
                toast.current.show({
                    severity: "success",
                    summary: "Sukses",
                    detail: "Update produk berhasil",
                    life: 1500,
                });

                setTimeout(() => {
                    window.location.reload();
                },1500)
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Gagal mengupdate produk",
                    life: 3000,
                });
            }
        })
        .catch(error => {
            toast.current.show({
                severity: "error",
                summary: "Failed",
                detail: "Error when updating product",
                life: 3000,
            });
        })
    };

    const onSubmit = async(formData) => {
        if (formData.img && typeof formData.img == 'object') {
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
                const prodModel = JSON.stringify(newFormData);
                fetchUpdateProduct(prodModel);
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
        } else if(formData.img && typeof formData.img){
            const prodModel = JSON.stringify(formData);
            fetchUpdateProduct(prodModel);
        } else {
            const noimg = `https://res.cloudinary.com/du3qbxrmb/image/upload/v1751378806/no-img_u5jpuh.jpg`;
            let newFormData = {
                ...formData,
                img: noimg,
            };
            const prodModel = JSON.stringify(formData);
            fetchUpdateProduct(prodModel);
        } 
        
    };

    const onError = (error) => {
        console.error(error);
    };


    useEffect(() => {
        fetchCategory();
    },[]);
    
    useEffect(() => {
        if(category){
            setIsLoading(false);
        }
    }, [category]);

    if(isLoading){
        return;
    }
    // console.log(getValues("category_name"))
    return(
        <>
        <Modal
            size='xl'
            show={show}
            onHide={() => {
            onHide();
            // handleCancel();
            }}
            scrollable={true}
            centered={true}
        >
            <Modal.Header closeButton>
                <Modal.Title>ubah produk</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="add-prod-area mt-2" style={{gap: !isMobile && !isMediumScr ? '3.5rem' : '2rem', height: 'auto'}}>
                        <div className="add-prod-img-wrap">
                            <label className="mb-1" htmlFor="cust-image">foto produk</label>
                            <DropzoneFile
                                name={"img"}
                                register={register}
                                require={false}
                                errors={errors}
                                defaultValue={getValues('img')}
                            />
                        </div>

                        <div className="add-prod-detail-wrap" style={{display: 'block'}}>
                            <Row className='gy-4 mb-4'>
                                <Col lg={4} sm={12}>
                                    <InputWLabel
                                        label="nama produk"
                                        type="text"
                                        name="product_name"
                                        placeholder="Tahu"
                                        register={register}
                                        require={true}
                                        errors={errors}
                                        textStyle={'capitalize'}
                                    />
                                </Col>
                                <Col lg={4} sm={12}>
                                    <InputWLabel
                                        label="SKU"
                                        type="text"
                                        name="sku"
                                        placeholder=""
                                        register={register}
                                        require={false}
                                        errors={errors}
                                    />
                                </Col>
                                <Col lg={4} sm={12}>
                                    <InputWSelect
                                        label={"unit"}
                                        name="unit"
                                        selectLabel="Pilih unit pengukuran"
                                        options={dataStatic.unitOfProduct}
                                        optionKeys={["id", "type"]}
                                        defaultValue={getValues("unit")}
                                        defaultValueKey={"type"}
                                        value={(selected) => {setValue("unit", selected.value);getValues("unit_select") !== "" && clearErrors('unit_select')}}
                                        width={"100%"}
                                        register={register}
                                        require={true}
                                        errors={errors}
                                    />
                                </Col>
                                <Col lg={4} sm={12}>
                                    <InputWSelect
                                        label={"kategori"}
                                        name="category_name"
                                        selectLabel="Pilih kategori produk"
                                        options={category}
                                        optionKeys={["id", "category_name"]}
                                        defaultValue={getValues("category_name")}
                                        defaultValueKey={"category_name"}
                                        value={(selected) => {setValue("category_name", selected.value);setValue("category_id", selected.id);getValues("category_name") !== "" && clearErrors('category_name')}}
                                        width={"100%"}
                                        register={register}
                                        require={true}
                                        errors={errors}
                                    />
                                </Col>
                                {
                                    data?.variant && data?.variant != "" ?
                                    (
                                    <Col lg={4} sm={12}>
                                        <InputWLabel
                                            label="nama varian"
                                            type="text"
                                            name="variant"
                                            placeholder="ex.eceran"
                                            register={register}
                                            require={true}
                                            errors={errors}
                                            textStyle={'capitalize'}
                                        />
                                    </Col>
                                    ):""
                                }
                            </Row>
                            <Row className="gy-4 mb-4">
                                <Col lg={4} sm={12} md={6}>
                                    <InputGroup
                                        label="biaya produksi"
                                        groupLabel="Rp"
                                        type="text"
                                        position="left"
                                        name="prod_cost"
                                        inputMode="numeric" 
                                        mask="currency"
                                        defaultValue={getValues('product_cost')}
                                        returnValue={(value) => {setValue('product_cost', value.origin);setValue('prod_cost', value.formatted)}}
                                        register={register}
                                        require={true}
                                        errors={errors}
                                    />
                                </Col>
                                <Col lg={4} sm={12} md={6}>
                                    <InputGroup
                                        label="harga jual"
                                        groupLabel="Rp"
                                        type="text"
                                        position="left"
                                        inputMode="numeric" 
                                        mask="currency"
                                        name="selling_price"
                                        defaultValue={getValues('sell_price')}
                                        returnValue={(value) => {setValue('sell_price', value.origin);setValue('selling_price', value.formatted)}}
                                        register={register}
                                        require={true}
                                        errors={errors}
                                    />
                                </Col>
                            </Row>
                            <Row className="gy-4">
                                <Col lg={4} sm={12} md={6}>
                                    <InputGroup
                                        label="potongan harga aktif"
                                        groupLabel="Rp"
                                        type="text"
                                        position="left"
                                        name="disc"
                                        inputMode="numeric" 
                                        mask="currency"
                                        defaultValue={getValues('discount')}
                                        returnValue={(value) => {setValue('discount', value.origin);setValue('disc', value.formatted)}}
                                        register={register}
                                        require={false}
                                        errors={errors}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" data-bs-dismiss="modal">batal</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit(onSubmit, onError)}>Simpan</button>
            </Modal.Footer>
        </Modal>

        {/* toast */}
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