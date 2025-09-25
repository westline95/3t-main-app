import React, {useEffect, useRef} from 'react';
import useAuth from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import axios from '../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Toast } from 'primereact/toast';

import Kiwest from "../assets/images/kiwest.png";
import Cloud1 from "../assets/images/cloud1.png";
import Cloud2 from "../assets/images/cloud2.png";
import PhoneImage from "../assets/images/image1.png";

export default function Login() {
    const { setAuth, persist, setPersist } = useAuth();
    const toast = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        setValue,
        getValues,
        setFocus,
        setError,
        trigger,
        clearErrors,
        formState: { errors },
    } = useForm({});

    const togglePersist = () => {
        setPersist(prev => !prev);
    }

    useEffect(() => {
        localStorage.setItem("persist", persist);
    }, [persist])

    const onSubmit = async (formData) => {
        try{
            const user_mail = formData.user_mail;
            const user_pass = formData.user_pass;
            const response = await axios.post('/auth', 
                JSON.stringify({ user_mail, user_pass }),
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Access-Control-Allow-Credentials':true,
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST,GET,DELETE,PATCH,PUT',
                        'Access-Control-Allow-Headers': 'Authorization, Origin, X-Requested-With, Content-Type, Accept, Device',
                    },
                }
            )
            console.log(response.data.roles)
            const access_token = response?.data?.access_token;
            const roles = response?.data?.roles;
            const name = response?.data?.name;
            setAuth({ user_mail, name, user_pass, roles, access_token });
            toast.current.show({
                severity: "success",
                summary: "Sukses",
                detail: "Login berhasil",
                life: 1500,
            }); 
            reset();
            navigate(from, { replace: true });
            console.log({ roles, access_token})
        } catch(err) {
            if(!err?.response){
                console.error('No server response');
                toast.current.show({
                    severity: "error",
                    summary: "Error Server",
                    detail: "No server response",
                    life: 1500,
                }); 
            } else if(err.response?.status == 401){
                console.error('Unauthorized');
                toast.current.show({
                    severity: "error",
                    summary: "Unauthorized",
                    detail: "Tidak diizinkan",
                    life: 1500,
                }); 
            } else {
                console.error('login failed');
                toast.current.show({
                    severity: "error",
                    summary: "Gagal",
                    detail: "Data tidak valid",
                    life: 1500,
                }); 
            }
        }
    };

    const onError = (error) => {
        if(error.user_mail){
            if(error.user_mail.type == 'required'){
                setError('user_mail', {type: 'required', message: 'This field is required'});
            } else if(error.user_mail.type == 'pattern'){
                setError('user_mail', {type: 'pattern', message: 'Invalid email'});
            }
        } 
    }

    return(
        <>
        <div className="d-flex login login-wrapper">
            <div className="login-area">
                <div className="d-flex justify-content-left mt-md-5 mb-3" style={{height: '80px'}}>
                    <img src={Kiwest} alt="logo" style={{
                        width: '115px',
                        height: '27px',
                    }} 
                    />
                </div>
                <div className="d-flex flex-column">
                    <h3 className="title mt-3">Welcome back!</h3>
                    <p className="sub-title">Please fill this form below before enter your dashboard</p>
                    <form action="" className="d-flex flex-column">
                        <div style={{display: 'flex' ,flexDirection:'column', marginBottom: '1rem'}}>
                            <label htmlFor="email">Email</label>
                            <input type="email" name="user_mail" id="emailField" placeholder="Enter your email" required {...register("user_mail", { required: true, pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/})} />
                            {errors ?
                                errors['user_mail'] ? <span className="field-msg-invalid">{errors['user_mail']?.message}</span>:""
                                :""
                            }
                        </div>
                        <div style={{display: 'flex' ,flexDirection:'column'}}>
                            <label htmlFor="password">Password</label>
                            <input type="password" name="user_pass" id="passField" placeholder="Enter your password" required {...register("user_pass", { required: true})} />
                            {errors ?
                                errors['user_pass'] ? <span className="field-msg-invalid">{'This field is required'}</span>:""
                            : "" 
                            }

                        </div>
                        <div className="persistCheck">
                            <input
                                type="checkbox"
                                id="persist"
                                onChange={togglePersist}
                                checked={persist}
                            />
                            <label htmlFor="persist">Trust This Device</label>
                        </div>
                        <button className="login-btn" onClick={handleSubmit(onSubmit, onError)}>Log In Now</button>
                    </form>
                </div>
            </div>
            <div className="image-area">
                <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="image-container">
                        <img src={PhoneImage} alt="illustration-img" />
                    </div>
                    <div className="cloud-container">
                        <img src={Cloud1} alt="" className="cloud1" />
                        <img src={Cloud2} alt="" className="cloud2" />
                    </div>
                </div>
            </div>
        </div>
        
        <Toast ref={toast} />
        </>
    )
}