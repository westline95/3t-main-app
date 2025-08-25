import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';

export default function BaseLayout({children}){
    const [ isOpen, setOpen ] = useState(false);
    const sidebarOverlayResp = useRef(null);
    const sidebarEl = useRef(null);
    const mainOverlayResp = useRef(null);

    const handleClickedSidebar = (value) => {
        if(value && sidebarEl.current.classList.contains('active')){
            sidebarEl.current.classList.replace('active', 'slideLeft');
            document.querySelector('body').classList.remove("freeze");
            setTimeout(() => {
                setOpen(false);
            },150)
        }
    }

    useEffect(() => {
        if(sidebarOverlayResp.current.classList.contains("active")){
            document.querySelector('body').classList.add("freeze");
            
            sidebarOverlayResp.current.addEventListener("click", () => {
                sidebarEl.current.classList.replace('active', 'slideLeft');
                document.querySelector('body').classList.remove("freeze");
                setTimeout(() => {
                    setOpen(false);
                },150)
            })
        }
    },[sidebarOverlayResp.current])

    return(
        <div className="wrapper" style={{overflowY:'unset'}}>
            <div className="d-flex position-relative" style={{overflowY:'unset'}}>
                <Sidebar ref={sidebarEl} show={isOpen} clickedMenu={(value) => handleClickedSidebar(value)} />
                <main ref={mainOverlayResp} className={`main-content ${isOpen ? "active" : ""}`}>
                    <Header onClick={() => setOpen((p) => !p)} />
                    {/* //components from all routes */}
                    {children} 
                </main>
            <div ref={sidebarOverlayResp} className={`vertical-background ${isOpen ? "active " : ''}`} style={{overflowY:'hidden'}}></div>
            </div>
        </div>
    )
}