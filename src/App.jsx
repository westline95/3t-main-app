import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "./pages/RequireAuth";
import PersistLogin from "./pages/PersistLogin";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Sales from "./pages/Sales";
import Invoice from "./pages/Invoice";
import Payment from "./pages/Payment";
import SettingApp from "./pages/SettingApp";
import Layout from "./pages/Layout";
import Missing from "./pages/Missing";
import Login from "./pages/Login";
import Delivery from "./pages/Delivery";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Sidebar from "./parts/Sidebar";
import { useState } from "react";
import Employees from "./pages/Employees";
import Department from "./pages/Department";
import DeliveryEmployee from "./pages/DeliveryEmployee";

const roleList = {
    admin: "admin",
    staff: "staff",
    courier: "courier"
};


function App() {
  const [ isClose, setClose ] = useState(false);

  return (
    <>
    <div className="App">
      <BrowserRouter>
      {/* <Routes>
      </Routes> */}

      
        <Routes>
          <Route path="/" element={<Layout />}>

            <Route path="login" element={<Login />} />  
        
            <Route element={<PersistLogin />}>
              {/* <Route element={<Sidebar show={isClose} />}> */}
                <Route element={<RequireAuth allowedRoles={[roleList.admin, roleList.staff]} />}>
                    <Route path="/" element={<Dashboard  />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route exact path="people/customers" element={<Customers />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route exact path="inventory/products" element={<Products />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route exact path="inventory/categories" element={<Categories  />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="sales/order" element={<Sales />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="sales/invoice" element={<Invoice  />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="sales/payment" element={<Payment />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="logistic/delivery" element={<Delivery />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="hrm/department" element={<Department />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="hrm/employees" element={<Employees />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={[roleList.admin]} />}>
                  <Route path="setting/app" element={<SettingApp />} />  
                </Route>

                <Route element={<RequireAuth allowedRoles={[roleList.admin, roleList.staff]} />}>
                  <Route path="/delivery" element={<DeliveryEmployee />} />
                </Route>
              {/* </Route> */}
            </Route>



              {/* </Route> */}
            
            {/* catch all */}
          <Route path="*" element={<Missing />} /> 
          </Route>   
        </Routes>
      </BrowserRouter>
    </div>    
    </>
  )
}

export default App
