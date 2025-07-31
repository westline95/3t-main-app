import React, { useState } from 'react';
import Sidebar from '../parts/Sidebar';
import Header from '../parts/Header';

export default function BaseLayout({children}){
    const [ isClose, setClose ] = useState(false);

    return(
        <div className="wrapper">
            <div className="d-flex position-relative">
                <Sidebar show={isClose} />
                <main className={`main-content ${isClose ? "active" : ""}`}>
                    <Header onClick={() => setClose((p) => !p)} />
                    {/* //components from all routes */}
                    {children} 
                </main>
            </div>
        </div>
    )
}