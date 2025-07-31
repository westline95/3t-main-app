import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PrimeReactProvider } from 'primereact/api';
import 'primeflex/primeflex.css';
// import 'primereact/resources/themes/lara-light-cyan/theme.css';
import "./assets/css/customPrimeReact.css";
import "./assets/zwicon/zwicon.css";
import './App.css';
import './assets/css/style.css';
import "./assets/css/sidebar.css";
import "./assets/css/login.css";
import "boxicons";

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <AuthProvider>
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </AuthProvider>
  // </React.StrictMode>,
)
