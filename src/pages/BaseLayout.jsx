import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';

export default function BaseLayout({children}){
    const [ isOpen, setOpen ] = useState(false);
    const sidebarOverlayResp = useRef(null);
    const mainOverlayResp = useRef(null);

    useEffect(() => {
        if(sidebarOverlayResp.current.classList.contains("active")){
            mainOverlayResp.current.classList.add("freeze");
            console.log(mainOverlayResp)
            sidebarOverlayResp.current.addEventListener("click", () => {
                setOpen(false);
            })
        }
    },[sidebarOverlayResp.current])

    return(
        <div className="wrapper" style={{overflowY:'unset'}}>
            <div className="d-flex position-relative" style={{overflowY:'unset'}}>
                <Sidebar show={isOpen} />
                <main ref={mainOverlayResp} className={`main-content ${isOpen ? "active" : ""}`} style={{overflowY:'unset'}}>
                    <Header onClick={() => setOpen((p) => !p)} />
                    {/* //components from all routes */}
                    {children} 
                </main>
            <div ref={sidebarOverlayResp} className={`vertical-background ${isOpen ? "active " : ''}`}></div>
            </div>
        </div>
    )
}