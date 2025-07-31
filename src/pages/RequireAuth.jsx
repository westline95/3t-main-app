import { useLocation, Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import BaseLayout from "./BaseLayout";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();
   
    console.log(auth.roles)
    return(
        auth?.roles && allowedRoles?.includes(auth?.roles)
        ? 
        <BaseLayout>
          <Outlet />
        </BaseLayout>
        : auth?.access_token
          ? <Navigate to="/unauthorized" state={{ from: location }} replace />
          : <Navigate to="/login" state={{ from: location }} replace />

    );
}

export default RequireAuth;