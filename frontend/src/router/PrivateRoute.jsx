import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("access_token"); // Check if token exists

  return isAuthenticated ? element : <Navigate to="/signIn" replace />;
};

export default PrivateRoute;
