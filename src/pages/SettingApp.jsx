import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Menu } from 'primereact/menu';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';
import InputWLabel from '../elements/Input/InputWLabel';
import FetchApi from '../assets/js/fetchApi.js';
import { Toast, ToastContainer } from 'react-bootstrap';

export default function SettingApp({handleSidebar, showSidebar}) {
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isClose, setClose ] = useState(false);
    const [ isActiveMenu, setActiveMenu ] = useState('invSett');
    const [ invSett, setInvSett ] = useState(null);
    const [ mailerSett, setMailerSett ] = useState(null);
    const [ showToast, setShowToast ] = useState(false);
    const [ toastContent, setToastContent ] = useState({variant: "", msg: "", title: ""});
    const [ defaultValues, setDefaultValues ] = useState(null);

     const fetchInvSett = () => {
        FetchApi.fetchInvSett()
        .then((res) => {
            setInvSett(res);
        })
        .catch(err => {
            throw new Error(err)
        })
    };
    
    const fetchUpdateInvSett = (id, body) => {
        let bodyData = JSON.stringify(body);
        FetchApi.fetchUpdateInvSett(id,bodyData)
        .then((res) => {
            if(res.length > 0 && res[0] == 1) {
                setInvSett(res[1][0]);
            }
            setToastContent({variant:"success", msg: "Successfully update invoice setting"});
            setShowToast(true);
        })
        .catch(err => {
            throw new Error(err);
        })
    };
    
    const fetchMailerSett = () => {
        FetchApi.fetchMailerSett()
        .then((res) => {
            setMailerSett(res);
        })
        .catch(err => {
            throw new Error(err);
        })
    };

     const fetchUpdateMailerSett = (id, body) => {
        let bodyData = JSON.stringify(body);
        FetchApi.fetchUpdateMailerSett(id,bodyData)
        .then((res) => {
             if(res.length > 0 && res[0] == 1) {
                setMailerSett(res[1][0]);
            }
            setToastContent({variant:"success", msg: "Successfully update mailer setting"});
            setShowToast(true);
        })
        .catch(err => {
            throw new Error(err);
        })
    };

    useEffect(() => {
        if(invSett && mailerSett){
            setIsLoading(false);

            setValue('inv_sett_id', invSett.id);
            setValue('mailer_sett_id', mailerSett.id);
            setValue('weekly_created', invSett.weekly_created);
            setValue('mailer_from_mail', mailerSett.mailer_mail);
            setValue('mailer_host', mailerSett.mailer_host);
            setValue('mailer_mail', mailerSett.mailer_mail);
            setValue('mailer_pass', "");
            setValue('mailer_port', mailerSett.mailer_port);  
            
            // for caching default values
            let df = {
                inv_sett_id: invSett.id,
                mailer_sett_id: mailerSett.id,
                weekly_created: invSett.weekly_created,
                mailer_from_mail: mailerSett.mailer_mail,
                mailer_host: mailerSett.mailer_host,
                mailer_mail: mailerSett.mailer_mail,
                mailer_pass:  "",
                mailer_port: mailerSett.mailer_port  
            }
            setDefaultValues(df);
        }
    }, [invSett, mailerSett]);

    useEffect(() => {
        fetchInvSett();
        fetchMailerSett();
    },[]);

    useEffect(() => {
        if(isLoading){
            return;
        }
    }, [isLoading]);

    const methods = useForm({
        ...invSett,
        ...mailerSett
    });
    const { 
        register, 
        reset, 
        getValues, 
        setValue, 
        watch,
        formState: {errors}, 
        handleSubmit 
    } = methods;
    

    const handleMenu = (e) => {
        setActiveMenu(e.currentTarget.ariaLabel);
    };

    const onSubmit = (formData) => {
        switch (isActiveMenu) {
            case 'invSett':
                if(formData.inv_sett_id){
                    fetchUpdateInvSett(formData.inv_sett_id, {weekly_created:formData.weekly_created});
                }
                break;
            case 'mailerSett':
                if(formData.mailer_sett_id){
                    let mailerModel = {
                        mailer_from_mail: formData.mailer_from_mail,
                        mailer_host: formData.mailer_host,
                        mailer_mail: formData.mailer_mail,
                        mailer_pass: formData.mailer_pass,
                        // mailer_pass: formData.mailer_pass,
                        mailer_port: formData.mailer_port,
                    };
                    fetchUpdateMailerSett(formData.mailer_sett_id, mailerModel);
                }
                break;
            default:
                break;
        }
    }

    const onError = (err) => {
        console.log(err)
    }
    
    

    // console.log(getValues('weekly_created'))
    // console.log(watch('weekly_created'))
    return (
        <>
        {/* <Sidebar show={isClose} /> */}
        {/* <main className={`main-content ${showSidebar ? "active" : ""}`}>
            <Header onClick={() => handleSidebar((p) => !p)} /> */}
            <div className="container-fluid">
                <div className="row mt-4">
                    <div className="v-menu">
                        <div className="pt-2 sidebar-in">
                            <div className="menu">
                                <div className="sidebar-menu">
                                    {/* <li className="menus-group" id="mainMenus"> */}
                                        {/* <a className="menu-title" data-bs-target="#mainMenu" aria-controls="mainMenu">
                                            <span className="menu-label">Billing</span>
                                        </a> */}
                                        {/* <div className="collapse show" data-bs-parent="mainMenus" id="mainMenu"> */}
                                            <ul className="sidebar-menu" style={{display: 'flex', flexDirection:'column', gap: '.3rem'}}>
                                                <li className="menus dropdown-control" aria-label='generalSett' onClick={handleMenu}>
                                                    <div className={`item-menu ${isActiveMenu == 'generalSett' ? 'active' : ''}`}>
                                                        <i className='bx bx-cog' ></i>
                                                        <span className="menu-label">general setting</span>
                                                    </div>
                                                </li> 
                                                <li className="menus dropdown-control" aria-label='mailerSett' onClick={handleMenu}>
                                                    <div className={`item-menu ${isActiveMenu == 'mailerSett' ? 'active' : ''}`}>
                                                        <i className='bx bx-envelope' ></i>
                                                        <span className="menu-label">Mailer setting</span>
                                                    </div>
                                                </li> 
                                                <li className="menus dropdown-control" aria-label='invSett' onClick={handleMenu}>
                                                    <div className={`item-menu ${isActiveMenu == 'invSett' ? 'active' : ''}`}>
                                                        <i className='bx bx-file-blank'></i>
                                                        <span className="menu-label">invoices setting</span>
                                                    </div>
                                                </li> 
                                                <li className="menus dropdown-control" aria-label='receiptSett' onClick={handleMenu}>
                                                    <div className={`item-menu ${isActiveMenu == 'receiptSett' ? 'active' : ''}`}>
                                                        <i className='bx bx-receipt'></i>
                                                        <span className="menu-label">receipt setting</span>
                                                    </div>
                                                </li>
                                            </ul>
                                        {/* </div>
                                    </li> */}
                                </div>
                            </div>
                        </div>
                        <div className="card menu-content">
                            <div style={{display: isActiveMenu == 'mailerSett' ? 'block' : 'none'}}>
                                <p className="card-title mb-4" style={{fontSize: '15px'}}>Mailer setting</p>
                                <FormProvider {...methods}>
                                    <form>
                                        <div className="mb-3" style={{display: 'flex', flexDirection: 'row',alignItems:'center'}}>
                                            <label htmlFor="" style={{width: '25%'}}>Host</label>
                                            <InputWLabel 
                                                type={'text'}
                                                name={'mailer_host'}
                                                inputWidth={'75%'}
                                                register={register}
                                            />
                                        </div>
                                        <div className="mb-3" style={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>
                                            <label htmlFor="" style={{width: '25%'}}>port</label>
                                            <InputWLabel 
                                                type={'text'}
                                                name={'mailer_port'}
                                                inputWidth={'75%'}
                                                register={register}
                                            />
                                        </div>
                                        <div className="mb-3" style={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>
                                            <label htmlFor="" style={{width: '25%'}}>user mail</label>
                                            <InputWLabel 
                                                type={'text'}
                                                name={'mailer_mail'}
                                                inputWidth={'75%'}
                                                register={register}
                                            />
                                        </div>
                                        <div className="mb-3" style={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>
                                            <label htmlFor="" style={{width: '25%'}}>password</label>
                                            <InputWLabel 
                                                type={'text'}
                                                name={'mailer_pass'}
                                                inputWidth={'75%'}
                                                register={register}
                                            />
                                        </div> 
                                        <div className="mb-3" style={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>
                                            <label htmlFor="" style={{width: '25%'}}>From email</label>
                                            <InputWLabel 
                                                type={'email'}
                                                name={'mailer_from_mail'}
                                                inputWidth={'75%'}
                                                register={register}
                                            />
                                        </div>
                                    </form>
                                </FormProvider>

                                {/* button */}
                                <div className="wrapping-table-btn" style={{marginTop: '4rem'}}>
                                    <button type="button" className="btn btn-primary btn-w-icon" onClick={handleSubmit(onSubmit, onError)}>
                                        <i className='bx bxs-save'></i>
                                        save
                                    </button>
                                    <button type="button" className="btn btn-danger btn-w-icon" onClick={() => {defaultValues ? reset(defaultValues) : null}}>
                                        <i className='bx bx-reset' ></i>
                                        reset to default
                                    </button>
                                </div>
                            </div>
                            <div style={{display: isActiveMenu == 'invSett' ? 'block' : 'none'}}>
                                <p className="card-title mb-4" style={{fontSize: '15px'}}>Invoices setting</p>
                                <FormProvider {...methods}>
                                    <form>
                                        <div className='mb-3' style={{display: 'flex', flexDirection: 'row'}}>
                                            <label htmlFor="" style={{width: '25%',alignItems:'center'}}>created weekly?</label>
                                            <InputWLabel 
                                                type={'switch'}
                                                name={'weekly_created'}
                                                label={'Enable/disable'}
                                                style={{alignItems:'center'}}
                                                register={register}
                                            />
                                        </div>
                                        <div className='mb-3' style={{display: 'flex', flexDirection: 'row'}}>
                                            <label htmlFor="" style={{width: '25%',alignItems:'center'}}>tampilkan metode pembayaran</label>
                                            <InputWLabel 
                                                type={'switch'}
                                                name={'acoount_info'}
                                                label={'Enable/disable'}
                                                style={{alignItems:'center'}}
                                                register={register}
                                            />
                                        </div>
                                    </form>
                                </FormProvider>
                                <div className="wrapping-table-btn" style={{marginTop: '4rem'}}>
                                    <button type="button" className="btn btn-primary btn-w-icon" onClick={handleSubmit(onSubmit, onError)}>
                                        <i className='bx bxs-save'></i>
                                        save
                                    </button>
                                    <button type="button" className="btn btn-danger btn-w-icon" onClick={() => {defaultValues ? reset(defaultValues) : null}}>
                                        <i className='bx bx-reset' ></i>
                                        reset to default
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        {/* </main> */}



         {/* toast area */}
        <ToastContainer className="p-3 custom-toast">
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastContent.variant}>
                <Toast.Body>{toastContent.msg}</Toast.Body>
            </Toast>
        </ToastContainer>
        </>
        
    )
}