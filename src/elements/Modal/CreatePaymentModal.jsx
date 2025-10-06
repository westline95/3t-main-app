import React, {useCallback, useEffect, useRef, useState} from 'react';
import FetchApi from '../../assets/js/fetchApi.js';
import { Modal, Form, Collapse } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import propTypes from 'prop-types';
import { Calendar } from 'primereact/calendar';
import { Controller, useController, useForm } from 'react-hook-form';
import InputWLabel from '../Input/InputWLabel';
import { CustomSelect } from '../CustomSelect';
import InputGroup from '../Input/InputGroup';
import InputWSelect from '../Input/InputWSelect';
import DataStatic from '../../assets/js/dataStatic.js';
import NumberFormat from '../Masking/NumberFormat';

export default function CreatePayment({show, onHide, totalCart, multiple, stack, returnValue, source, data}){
    const toast = useRef(null);
    const [ paymentType, setPaymentType ] = useState(null);
    const [ paymentMethod, setPaymentMethod ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ isScrolled, setIsScrolled ] = useState(false);
    const [ changeMoneyUI, setChange ] = useState(0);
    const [ defaultVal, setDefaultVal ] = useState(0);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});

    let locale = "id-ID";
    const formatedNumber = new Intl.NumberFormat(locale);
    
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        getValues,
        setError,
        clearErrors,
        trigger,
        
        formState: { errors },
    } = useForm({
        defaultValues: {
            payment_date: data?.action == "insert" ? new Date() : new Date(data.items.payment_date) ,
            payment_method: '',
            paid_amount: '0',
            partial_amount: '0',
            amountOrigin: 0,
            payment_ref: data?.action == "update" ? data.items.ref : '' ,
            note: data?.action == "update" ? data.items.note : '' ,
            pay_amount: data?.action == "update" ? Number(data.items.amount_paid) : totalCart,
        }
    });

    const fetchInsertreceipt = (body) => {
        let bodyData = JSON.stringify(body);
        FetchApi.fetchInsertReceipt(bodyData)
        .then(data => {
            setToastContent({variant:"success", msg: "New receipt is created"});
            setShowToast(true);
            setTimeout(() => {
                window.location.reload();
            },1200)
        })
        .catch(error => {
            setToastContent({variant:"danger", msg: "Failed to create new receipt!"});
            setShowToast(true);
        })
    };

    const fetchUpdateInv = (invoiceID, body, formData) => {
        let bodyData = JSON.stringify(body);
        FetchApi.fetchUpdateInv(invoiceID, bodyData)
        .then(res => {
            setToastContent({variant:"success", msg: "Successfully update invoice"});
            setShowToast(true);
            if(res[0] == 1 && res.length > 1){
                if(res[1][0].is_paid){
                    let receiptModel = {
                        customer_id: data.items.customer_id,
                        invoice_id: data.items.invoice_id,
                        total_payment: formData.amountOrigin,
                        change: formData.change,
                        receipt_date: new Date()
                    }
                    fetchInsertreceipt(receiptModel);
                } else {
                    // setTimeout(() => {
                    //     window.location.reload();
                    // },1200)
                }
            }
        })
        .catch(error => {
            setToastContent({variant:"danger", msg: "Failed to update invoice!"});
            setShowToast(true);
        })
    }

    const fetchInsertPayment = (body, formData) => {
        let bodyData = JSON.stringify(body);
        FetchApi.fetchInsertPayment(bodyData)
        .then(res => {
            setToastContent({variant:"success", msg: "New payment is created"});
            setShowToast(true);
            if(formData.remaining_payment == 0){
                let modelInv = {
                    is_paid: true,
                    remaining_payment: formData.remaining_payment
                }
                fetchUpdateInv(data.items.invoice_id, modelInv, formData);
            } else {
                let modelInv = {
                    is_paid: false,
                    remaining_payment: formData.remaining_payment
                }
                fetchUpdateInv(data.items.invoice_id, modelInv, formData);
            }
        })
        .catch(error => {
            setToastContent({variant:"danger", msg: "Failed to create new payment data!"});
            setShowToast(true);
        })
    };

    const onError = (errors) => {
        // if(Number(getValues('amount')) == 0){
        //     setError('amount', {type: 'custom', message: `Paid amount can't be 0`})
        //     trigger('amount', {shouldFocus: true});
        // } else {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "There is an error with form",
                life: 3500,
            });
        // }
    };

    const onSubmit = async (formData) => {
        const isValid = await trigger();

        if(isValid){
            returnValue({...formData, originData: {...data.items}});
            onHide();
        }
            
    }

    useEffect(() => {
        if(multiple === true){
            document.querySelectorAll(".modal-backdrop").forEach((e,idx) => {
                e.style.zIndex = 1055 + (idx * stack);
            })
            document.querySelectorAll(".modal").forEach((e,idx) => {
                e.style.zIndex = 1056 + (idx * stack);
            })
        }
    },[show]);

    useEffect(() => {
        clearErrors('amount');
    },[watch('amount')]);

    const handleScroll = (event) => {
		const { scrollTop, scrollHeight, clientHeight } = event.target;
        if(scrollTop > 0){
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    // useEffect(() => {
    //     if(getValues('payment_method') == 'transfer'){
    //         setValue('pay_amount_default', totalCart);
    //         // setValue('pay_amount_default', totalCart);
    //         // setValue('partial_amount', totalCart);
    //         // setValue('paid_amount', totalCart);

    //         // setDefaultVal(totalCart);
    //     } else{
    //         setValue('pay_amount_default', '0');
    //         // setValue('pay_amount_default', '0');
    //         // setDefaultVal(0);
    //         // setValue('partial_amount', 0);
    //         // setValue('paid_amount', 0);
    //     }
    // },[getValues('payment_method')]);

    // const handlePaidAmount = (paymenMethod) => {
    //     if(paymenMethod == 'transfer'){
    //         setValue('pay_amount_default', totalCart);
    //         // setValue('pay_amount', value.formatted);
    //         // setValue('pay_amount_default', totalCart);
    //         // setValue('partial_amount', totalCart);
    //         // setValue('paid_amount', totalCart);
            
    //         // setDefaultVal(totalCart);
    //     } else{
    //         console.log("bukan tf")
    //         setValue('pay_amount_default', 0);
    //         // setValue('pay_amount', '0');
    //         // setValue('pay_amount_default', '0');
    //         // setDefaultVal(0);
    //         // setValue('partial_amount', 0);
    //         // setValue('paid_amount', 0);
    //     }
    // }


    return(
        <>
        <Modal size='md' show={show} onHide={onHide} scrollable={true} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>{
                data.action ? 
                data.action == "insert" ? 'Tambah' 
                : data.action == "update" ? 'Ubah'
                : 'Tambah'  : 'Tambah'
            } {source == "delivery_group" ? 'informasi': ''} pembayaran</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '600px', overflowY: getValues('payment_method') ? 'auto' : 'unset'}}>
                {data.action != "update" ?
                (
                    <div style={{
                        textAlign: "center", 
                        padding: "2rem 0 1rem 0",
                        width: '100%', 
                        position:'sticky', 
                        top:0, 
                        backgroundColor:"#FFFFFF", 
                        zIndex:9999, 
                        boxShadow: isScrolled ? '0px 12px 20px 10px rgba(154, 154, 204, 0.13)' : 'unset',
                        marginBottom: '2rem'
                    }}>
                        <h3>
                            <NumberFormat intlConfig={{
                                value: totalCart ? totalCart : 0,
                                locale: "id-ID",
                                style: "currency",
                                currency: "IDR",
                            }} /> 
                        </h3>
                    </div>
                ):''
                }
                <form style={{display: 'flex', flexDirection: 'column', gap: '1.4rem'}}>
                    <InputWLabel 
                        label="tanggal pembayaran" 
                        type="date"
                        defaultValue={getValues("payment_date")}
                        name="payment_date" 
                        register={register}
                        require={true}
                        errors={errors}
                    />  
                    {
                        source == 'invoice' || source == 'payment' ?
                        (
                            <>
                            {data.action && data.action == "update" ? 
                            (
                                <InputWSelect
                                    label={'metode pembayaran'}
                                    name={"payment_method"}
                                    selectLabel={"Pilih metode pembayaran"}
                                    options={DataStatic.invPayMethod}
                                    optionKeys={["id", "type"]}
                                    value={(selected) => {
                                        setPaymentType(selected);
                                        setValue('payment_method', selected.value);
                                        // selected.value == 'transfer' ? setValue('pay_amount', Number(totalCart).toString()) : '0';
                                        // handlePaidAmount(selected.value);
                                    }}
                                    defaultValue={data.action == "update" && data.items.payment_method}
                                    defaultValueKey={'type'}
                                    require={true}
                                    register={register}
                                    errors={errors}
                                    // watch={watch('payTypeId')}
                                />
                            ):(
                                <InputWSelect
                                    label={'metode pembayaran'}
                                    name={"payment_method"}
                                    selectLabel={"Pilih metode pembayaran"}
                                    options={DataStatic.invPayMethod}
                                    optionKeys={["id", "type"]}
                                    value={(selected) => {
                                        setPaymentType(selected);
                                        // setValue('payTypeId', selected.id);
                                        setValue('payment_method', selected.value);
                                        selected.value == 'transfer' ? setValue('pay_amount', Number(totalCart).toString()) : setValue('pay_amount', '0');
                                        // handlePaidAmount(selected.value);
                                        // selected.value == 'cash' ? setValue('pay_amount_default', 0) : setValue('pay_amount_default', totalCart);
                                       
                                        // selected.value != "" ? clearErrors("payTypeId"):null;
                                    }}
                                    
                                    require={true}
                                    register={register}
                                    errors={errors}
                                    // watch={watch('payTypeId')}
                                />
                            )
                            }
                            <Collapse in={getValues('payment_method') == "transfer"}>
                                <div>
                                    <InputWLabel 
                                        label="referensi" 
                                        type="text"
                                        name="payment_ref" 
                                        placeholder="" 
                                        register={register}
                                        require={false}
                                        errors={errors}
                                    />  
                                </div>
                            </Collapse>
                            </>

                        ) : source == "order" ?
                        (
                            <InputWSelect
                                label={'tipe pembayaran'}
                                name={"payment_type"}
                                selectLabel={"Pilih tipe pembayaran"}
                                options={data.guest_mode ? DataStatic.orderPayGuestMethod : DataStatic.orderPayMethod}
                                optionKeys={["id", "type"]}
                                value={(selected) => {
                                    setPaymentType(selected);
                                    // setValue('payTypeId', selected.id);
                                    setValue('payment_type', selected.value);
                                    // selected.value != "" ? clearErrors("payTypeId"):null;
                                }}
                                require={true}
                                register={register}
                                errors={errors}
                                // watch={watch('payTypeId')}
                            />
                        ):''
                    }
                  
                    <InputWLabel 
                        label="catatan" 
                        type="text"
                        name="note" 
                        placeholder="" 
                        register={register}
                        require={false}
                        errors={errors}
                    /> 

                    {
                        source == 'order'  ? 
                        (
                            <>
                            
                            <Collapse in={getValues('payment_type') && getValues('payment_type') !== "bayar nanti"}>
                                <div>
                                    <InputWSelect
                                        label={'payment method'}
                                        name="payment_method"
                                        selectLabel="Pilih metode pembayaran"
                                        options={DataStatic.invPayMethod}
                                        optionKeys={["id", "type"]}
                                        value={(selected) => {
                                            setPaymentMethod(selected);
                                            // setValue('payMethodId', selected.id);
                                            setValue('payment_method', selected.value);
                                            selected.value == 'transfer' ? setValue('paid_amount', totalCart) : '0';
                                            selected.value != "" ? clearErrors("payment_method"):null;
                                        }}
                                        
                                        require={getValues('payment_type') !== "bayar nanti" ? true : false}
                                        register={register}
                                        errors={errors}
                                        // watch={watch('payTypeId')}
                                    />
                                </div>
                            </Collapse>
                            <Collapse in={getValues('payment_method') == "transfer"}>
                                <div>
                                    <InputWLabel 
                                        label="reference" 
                                        type="text"
                                        name="payment_ref" 
                                        placeholder="" 
                                        register={register}
                                        require={false}
                                        errors={errors}
                                    />  
                                </div>
                            </Collapse>
                            {
                                paymentType && paymentType.value !== "bayar nanti" ?
                                    paymentType.value == "sebagian" && getValues('payment_method') ?
                                    (
                                        <Controller
                                            control={control}
                                            name="partial_amount"
                                            rules={{validate:{
                                                condition1: (value) => value != "0" || `Paid amount can't be 0`,
                                                condition2: (value, formValues) =>  Number(formValues.amountOrigin) < totalCart || "Change payment type for this amount"
                                            }, required: true}}
                                            render={({
                                                field: {ref, name, onChange, value}, fieldState
                                            }) => (
                                                <div>
                                                    <InputGroup
                                                        inputRef={ref}
                                                        label="paid amount"
                                                        groupLabel="Rp"
                                                        type="text"
                                                        onChange={onChange}
                                                        position="left"
                                                        name={name}
                                                        inputMode="numeric" 
                                                        mask="currency"
                                                        defaultValue={value}
                                                        require={true}
                                                        // register={register}
                                                        // errors={errors}
                                                        placeholder={"0"}
                                                        returnValue={(value) => {
                                                            setChange(value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                            setValue("change", value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                            setValue("partial_amount", value.formatted);
                                                            setValue("amountOrigin", value.origin);
                                                        }}
                                                        
                                                    />
                                                    {fieldState.error && <span className="field-msg-invalid">{fieldState.error.message}</span>}
                                                </div>
                                            )}
                                        />
                                    
                                    ): paymentType.value == "lunas" && getValues('payment_method') ?
                                    (   
                                        <>
                                        <Controller
                                            control={control}
                                            name="paid_amount"
                                            rules={{validate:{
                                                condition1: (value) => Number(value) != 0 || `Paid amount can't be 0`,
                                                condition2: (value, formValues) =>  formValues.amountOrigin >= totalCart || "Jumlah tidak cukup" 
                                            }, required: true}}
                                            render={({
                                                field: {ref, name, onChange, value}, fieldState
                                            }) => (
                                                <div>
                                                    <InputGroup
                                                        inputRef={ref}
                                                        label="paid amount"
                                                        groupLabel="Rp"
                                                        type="text"
                                                        // min={'0'}
                                                        // onChange={onChange}
                                                        position="left"
                                                        name={name}
                                                        inputMode="numeric" 
                                                        mask="currency"
                                                        value={value}
                                                        defaultValue={getValues('paid_amount')}
                                                        require={true}
                                                        // register={register}
                                                        // errors={errors}
                                                        placeholder={"0"}
                                                        returnValue={(value) => {
                                                            // console.log("value => ",value)
                                                            setChange(value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                            setValue("change", value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                            setValue("paid_amount", value.formatted);
                                                            setValue("amountOrigin", value.origin);
                                                        }}
                                                        disabled={getValues("payment_method") == "transfer" ? true : false}
                                                        
                                                    />
                                                    {fieldState.error && <span className="field-msg-invalid">{fieldState.error.message}</span>}
                                                </div>
                                            )}
                                        />
                                        </>
                                    ):""
                                :null
                            }
                            </>
                        ):''
                    }

                     {
                        source == 'delivery_group'  ? 
                        ( 
                            <>
                            <Controller
                                control={control}
                                name="paid_amount"
                                render={({
                                    field: {ref, name, onChange, value}, fieldState
                                }) => (
                                    <div>
                                        <InputGroup
                                            inputRef={ref}
                                            label="jumlah bayar"
                                            groupLabel="Rp"
                                            type="text"
                                            // min={'0'}
                                            // onChange={onChange}
                                            position="left"
                                            name={name}
                                            inputMode="numeric" 
                                            mask="currency"
                                            value={value}
                                            defaultValue={getValues('paid_amount')}
                                            require={true}
                                            // register={register}
                                            // errors={errors}
                                            placeholder={"0"}
                                            returnValue={(value) => {
                                                // console.log("value => ",value)
                                                setChange(value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                setValue("change", value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                setValue("paid_amount", value.formatted);
                                                setValue("amountOrigin", value.origin);
                                            }}
                                            disabled={getValues("payment_method") == "transfer" ? true : false}
                                            
                                        />
                                        {fieldState.error && <span className="field-msg-invalid">{fieldState.error.message}</span>}
                                    </div>
                                )}
                            />
                            <div>
                                <label style={{marginRight: ".3rem"}}>
                                    kembali
                                </label>
                                <label>
                                    <NumberFormat intlConfig={{
                                        value: getValues("amountOrigin") == 0 ? 0 : changeMoneyUI , 
                                        locale: "id-ID",
                                        style: "currency", 
                                        currency: "IDR",
                                        }} 
                                    />
                                </label>
                            </div>
                            </>
                        ):''
                    }
                   
                    { source == 'invoice' || source == 'payment' ?
                        paymentType && getValues('payment_method') ?
                        (
                        <>
                        <Controller
                            control={control}
                            name="pay_amount"
                            rules={{validate:{
                                condition1: (value) => Number(value) != 0 || `Paid amount can't be 0`,
                                // condition2: (value, formValues) =>  formValues.amountOrigin >= totalCart || "Jumlah tidak cukup" 
                            }, required: true}}
                            render={({
                                field: {ref, name, onChange, value}, fieldState
                            }) => (
                                <div>
                                    <InputGroup
                                        inputRef={ref}
                                        label="bayar"
                                        groupLabel="Rp"
                                        type="text"
                                        // min={'0'}
                                        // onChange={onChange}
                                        position="left"
                                        name={name}
                                        inputMode="numeric" 
                                        mask="currency"
                                        value={value}
                                        defaultValue={getValues('pay_amount')}
                                        require={true}
                                        // register={register}
                                        // errors={errors}
                                        placeholder={"0"}
                                        returnValue={(value) => {
                                            // console.log("value => ",value)
                                            setChange(value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                            setValue("change", value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                            setValue("pay_amount", value.formatted);
                                            setValue("amountOrigin", value.origin);
                                        }}
                                        
                                        
                                    />
                                    {fieldState.error && <span className="field-msg-invalid">{fieldState.error.message}</span>}
                                </div>
                            )}
                        />
                        </>
                        ):''
                    :''
                    }

                    {!data.action || data.action !== "update" ? 
                    (
                    <Collapse in={getValues("payment_method") == "cash"}>
                        <div>
                            <label style={{marginRight: ".3rem"}}>
                                kembali
                            </label>
                            <label>
                                <NumberFormat intlConfig={{
                                    value: getValues("amountOrigin") == 0 ? 0 : changeMoneyUI , 
                                    locale: "id-ID",
                                    style: "currency", 
                                    currency: "IDR",
                                    }} 
                                />
                            </label>
                        </div>
                    </Collapse>
                    ):''
                    }
                        
                </form>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary light" onClick={onHide}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit(onSubmit, onError)}>Submit</button>
            </Modal.Footer>
        </Modal>


        {/* toast area */}
        {/* <ToastContainer className="p-3 custom-toast" style={{zIndex: 9999999}}>
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={10000} autohide bg={toastContent.variant}>
                <Toast.Body>{toastContent.msg}</Toast.Body>
            </Toast>
        </ToastContainer> */}
         <Toast ref={toast} />
        </>
    )
}

CreatePayment.propTypes = {
    source: propTypes.oneOf(['invoice','order', 'delivery_group'])
}