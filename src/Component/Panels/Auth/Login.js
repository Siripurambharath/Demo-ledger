import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaStore, FaShoppingCart, FaChartLine, FaTags } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";
import "./Login.css";
import { baseurl } from "../../BaseURL/BaseURL";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import {  } from 'react-google-login';
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();



 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // ✅ Fetch admin credentials from API and check
    const adminRes = await fetch(`${baseurl}/admin`);
    const adminData = await adminRes.json();

    if (
      adminData.success &&
      username.trim() === adminData.admin.email &&
      password === adminData.admin.password
    ) {
      const adminUser = {
        id: 1,
        username: "admin",
        email: adminData.admin.email,
        role: "admin",
        name: "Administrator"
      };

      localStorage.setItem("user", JSON.stringify(adminUser));
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", new Date().toISOString());

      navigate("/admindashboard");
      return;
    }

    // ✅ Normal user login via API
    const response = await fetch(`${baseurl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password: password
      })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", new Date().toISOString());

      if (data.user.role.toLowerCase() === "admin") {
        localStorage.setItem("isAdmin", "true");
      } else if (data.user.role.toLowerCase() === "staff") {
        localStorage.setItem("isStaff", "true");
      } else if (data.user.role.toLowerCase() === "retailer") {
        localStorage.setItem("isRetailer", "true");
      }

      navigate(data.route);
    } else {
      setError(data.error || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      // Decode the Google JWT token
      const decoded = jwtDecode(credentialResponse.credential);

      console.log("Google Login Success:", decoded);

      // Send Google token to your backend for verification
      const response = await fetch(`${baseurl}/accounts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", new Date().toISOString());

        // Role-based flags
        if (data.user.role?.toLowerCase() === "admin") {
          localStorage.setItem("isAdmin", "true");
        } else if (data.user.role?.toLowerCase() === "staff") {
          localStorage.setItem("isStaff", "true");
        } else if (data.user.role?.toLowerCase() === "retailer") {
          localStorage.setItem("isRetailer", "true");
        }

        navigate(data.route || "/dashboard");
      } else {
        // If user doesn't exist, you can register them or show error
        setError(data.error || "User not registered. Please contact administrator.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="login-container">
      {/* Decorative Background Elements */}
      <div className="sales-bg-elements">
        <div className="bg-icon cart-icon"><FaShoppingCart /></div>
        <div className="bg-icon chart-icon"><FaChartLine /></div>
        <div className="bg-icon store-icon"><FaStore /></div>
        <div className="bg-icon wallet-icon"><MdAccountBalanceWallet /></div>
        <div className="bg-icon tag-icon"><FaTags /></div>

        {/* Animated floating elements */}
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-rect rect-1"></div>
        <div className="floating-rect rect-2"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="brand-logo">
          <FaStore />
        </div>
        <h1 className="brand-title">RetailSync</h1>
        <p className="brand-subtitle">Sales & Retail Management Platform</p>

        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Real-time Analytics</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>Sales Tracking</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛒</span>
            <span>Inventory Management</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span>Customer Insights</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Welcome Back! 👋</h2>
            {/* <p className="form-subtitle">Sign in to your retailer account</p> */}
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">📧</span>
              Email or Mobile Number
            </label>
            <input
              type="text"
              id="username"
              placeholder="retailer@example.com or +91 9876543210"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="form-group password-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Forgot Password & Remember Me */}
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="forgot-password-link">
              <Link to="/forgot-password" state={{ email: username.includes("@") ? username : "" }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <span >
                <span className="spinner"></span>
                Logging in...
              </span>
            ) : (
              "Login to Dashboard"
            )}
          </button>

          <div className="google-login-section">
            <div className="divider">
              <span>Or continue with</span>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Divider */}
          {/* <div className="divider">
            <span>New to RetailSync?</span>
          </div> */}

          {/* Register Link */}
          {/* <div className="register-link">
            <p>Don't have an account? <Link to="/register">Register as Retailer</Link></p>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default Login;