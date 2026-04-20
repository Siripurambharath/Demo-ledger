// src/Component/RouteGuard/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase();

  if (!isLoggedIn) {
    // Not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in but not authorized for this page
    return <Navigate to="/" replace />;
  }

  // Authorized
  return children;
};

export default PrivateRoute;