import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';

export default function BaseLayout({children}){
    const [ isOpen, setOpen ] = useState(false);
    const sidebarOverlayResp = useRef(null);

    useEffect(() => {
        if(sidebarOverlayResp.current.classList.contains("active")){
            sidebarOverlayResp.current.addEventListener("click", () => {
                setOpen(false);
            })
        }
    },[sidebarOverlayResp.current])

    return(
        <div className="wrapper">
            <div className="d-flex position-relative">
                <Sidebar show={isOpen} />
                <main className={`main-content ${isOpen ? "active" : ""}`}>
                    <Header onClick={() => setOpen((p) => !p)} />
                    {/* //components from all routes */}
                    {children} 
                </main>
            </div>
            <div ref={sidebarOverlayResp} className={`vertical-background ${isOpen ? "active " : ''}`}></div>
        </div>
    )
}