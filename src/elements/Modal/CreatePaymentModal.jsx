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
            payment_date: new Date(),
            payment_type: '',
            payment_method:'',
            paid_amount: '0',
            partial_amount: '0',
            amountOrigin: 0,
            pay_amount_default: totalCart,
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
            console.log(res)
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
        console.log(body)
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
            console.log(error)
        })
    };

    

    const onError = (errors) => {
        console.log(errors)
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

    const onSubsssmit =  (formData) => {
        console.log("validated")
        // const formData = getValues();
        // if(formData.payment_type != ""){
        //     clearErrors('payment_type');
            
        //     if(formData.payment_type !== 'unpaid' ){
        //         if(formData.amountOrigin == 0){
        //             setError('amount', {type: 'custom', message: `Paid amount can't be 0`})
        //              trigger('amount', {shouldFocus: true});
        //         }
        //         if(formData.payment_type === 'cash'){
        //             if(formData.amountOrigin < totalCart){
        //                 setError('amount', {type: 'custom', message: 'Incorrect paid amount'})
        //                  trigger('amount', {shouldFocus: true});
        //             }
        //         }

        //         if(formData.paymentMethod){
        //             if(data){
        //                 let paymentModel = {
        //                     customer_id: data.items.customer_id,
        //                     invoice_id: data.items.invoice_id,
        //                     payment_date: formData.payment_date,
        //                     amount_paid: formData.amountOrigin,
        //                     payment_method: formData.payment_type,
        //                     note: formData.note,
        //                     payment_ref: formData.payment_ref,
        //                 };
        //                 console.log(paymentModel);
        //                 // fetchInsertPayment(paymentModel, formData);
        //             }
        //         }
        //     } else {
        //         returnValue(formData);
        //         onHide();
        //     }
        // } else {
        //     setError('payment_type', {type: 'custom', message: 'Incorrect paid amount'})       
        // }
        // if(formData.paymentMethod){
        //     if(data){
        //         let paymentModel = {
        //             customer_id: data.items.customer_id,
        //             invoice_id: data.items.invoice_id,
        //             payment_date: formData.payment_date,
        //             amount_paid: formData.amountOrigin,
        //             payment_method: formData.payment_type,
        //             note: formData.note,
        //             payment_ref: formData.payment_ref,
        //         };
        //         console.log(paymentModel);
        //         // fetchInsertPayment(paymentModel, formData);
        //     }
        // } else {
        //     returnValue(formData);
        //     onHide();
        // }
    }

    const onSubmit = async (formData) => {
        const isValid = await trigger();

        if(isValid){
            // console.log(formData)
            returnValue(formData);
            onHide();
        }
            
    }

    const handleAmount = (e) => {
        console.log(e)
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

    useEffect(() => {
        if(getValues('payment_method') == 'transfer'){
            setValue('pay_amount_default', totalCart);
            // setValue('pay_amount_default', totalCart);
            // setValue('partial_amount', totalCart);
            // setValue('paid_amount', totalCart);

            // setDefaultVal(totalCart);
        } else{
            setValue('pay_amount_default', '0');
            // setValue('pay_amount_default', '0');
            // setDefaultVal(0);
            // setValue('partial_amount', 0);
            // setValue('paid_amount', 0);
        }
    },[getValues('payment_method')]);

    const handlePaidAmount = (paymenMethod) => {
        if(paymenMethod == 'transfer'){
            setValue('pay_amount_default', totalCart);
            // setValue('pay_amount', value.formatted);
            // setValue('pay_amount_default', totalCart);
            // setValue('partial_amount', totalCart);
            // setValue('paid_amount', totalCart);
            
            // setDefaultVal(totalCart);
        } else{
            console.log("bukan tf")
            setValue('pay_amount_default', 0);
            // setValue('pay_amount', '0');
            // setValue('pay_amount_default', '0');
            // setDefaultVal(0);
            // setValue('partial_amount', 0);
            // setValue('paid_amount', 0);
        }
    }

    // console.log(getValues('pay_amount_default'))
console.log(getValues('payment_method'))
console.log(totalCart)
    return(
        <>
        <Modal size='md' show={show} onHide={onHide} scrollable={false} centered={true}>
            <Modal.Header closeButton>
                <Modal.Title>{source == 'order' ? 'create' : 'add'} payment</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: '600px', overflowY: getValues('payment_method') ? 'auto' : 'unset'}}>
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
                <form style={{display: 'flex', flexDirection: 'column', gap: '1.4rem'}}>
                    <InputWLabel 
                        label="Payment date" 
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
                            <InputWSelect
                                label={'payment method'}
                                name={"payment_method"}
                                selectLabel={"Select payment method"}
                                options={DataStatic.invPayMethod}
                                optionKeys={["id", "type"]}
                                value={(selected) => {
                                    setPaymentType(selected);
                                    // setValue('payTypeId', selected.id);
                                    setValue('payment_method', selected.value);
                                    console.log(selected)
                                    handlePaidAmount(selected.value);
                                    // selected.value == 'cash' ? setValue('pay_amount_default', 0) : setValue('pay_amount_default', totalCart);
                                   
                                    // selected.value != "" ? clearErrors("payTypeId"):null;
                                }}
                                require={true}
                                register={register}
                                errors={errors}
                                // watch={watch('payTypeId')}
                            />
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
                            </>

                        ) : source == "order" ?
                        (
                            <InputWSelect
                                label={'payment type'}
                                name={"payment_type"}
                                selectLabel={"Select payment type"}
                                options={DataStatic.orderPayMethod}
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
                        label="note" 
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
                            
                            <Collapse in={getValues('payment_type') && getValues('payment_type') !== "unpaid"}>
                                <div>
                                    <InputWSelect
                                        label={'payment method'}
                                        name="payment_method"
                                        selectLabel="Select payment Method"
                                        options={DataStatic.invPayMethod}
                                        optionKeys={["id", "type"]}
                                        value={(selected) => {
                                            setPaymentMethod(selected);
                                            // setValue('payMethodId', selected.id);
                                            setValue('payment_method', selected.value);
                                            selected.value == 'transfer' ? setValue('paid_amount', totalCart) : '0';
                                            selected.value != "" ? clearErrors("payment_method"):null;
                                        }}
                                        require={getValues('payment_type') !== "unpaid" ? true : false}
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
                                paymentType && paymentType.value !== "unpaid" ?
                                    paymentType.value == "partial" && getValues('payment_method') ?
                                    (
                                        <Controller
                                            control={control}
                                            name="partial_amount"
                                            rules={{validate:{
                                                condition1: (value) => value != "0" || `Paid amount can't be 0`,
                                                condition2: (value, formValues) =>  Number(formValues.amountOrigin) <= totalCart || "Change payment type for this amount"
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
                                                        register={register}
                                                        errors={errors}
                                                        placeholder={"0"}
                                                        returnValue={(value) => {
                                                            setChange(value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                            setValue("change", value.origin >= totalCart ? (value.origin - totalCart) : 0);
                                                            setValue("partial_amount", value.formatted);
                                                            setValue("amountOrigin", value.origin);
                                                        }}
                                                        disabled={getValues("payment_method") == "transfer" ? true : false}
                                                        
                                                    />
                                                    {fieldState.error && <span className="field-msg-invalid">{fieldState.error.message}</span>}
                                                </div>
                                            )}
                                        />
                                    
                                    ): paymentType.value == "paid" && getValues('payment_method') ?
                                    (   
                                        <>
                                        <Controller
                                            control={control}
                                            name="paid_amount"
                                            rules={{validate:{
                                                condition1: (value) => Number(value) != 0 || `Paid amount can't be 0`,
                                                // condition2: (value, formValues) =>  formValues.amountOrigin >= totalCart || "Incorrect amount" 
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
                                                        // require={true}
                                                        // register={register}
                                                        // errors={errors}
                                                        placeholder={"0"}
                                                        returnValue={(value) => {
                                                            console.log("value => ",value)
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
                   
                    { source == 'invoice' || source == 'payment' ?
                        paymentType && getValues('payment_method') ?
                        (
                        <>
                        
                        <InputGroup
                            label="paid amount"
                            groupLabel="Rp"
                            type="text"
                            position="left"
                            name="pay_amount"
                            inputMode="numeric" 
                            mask="currency"
                            placeholder={"0"}
                            defaultValue={watch('pay_amount_default')}
                            returnValue={(value) => {
                                setChange(value.origin >= totalCart ? Number(value.origin - totalCart) : 0);
                                setValue("pay_amount", value.formatted);
                                setValue("amountOrigin", value.origin);
                            }}
                            require={true}
                            register={register}
                            errors={errors}
                            disabled={getValues('payment_method') == 'transfer' ? true : false}
                        />
                        </>
                        ):''
                    :''
                    }

                    <Collapse in={getValues("payment_method") == "cash"}>
                        <div>
                            <label style={{marginRight: ".3rem"}}>
                                change
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
    source: propTypes.oneOf(['invoice','order'])
}