import React, { useState } from "react";
import { signInWithGoogle } from "../../backend/services/auth/firebase-auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LoginPage = ({ onSubmit, error }) => {
  const navigate = useNavigate();

  async function handleSignInWithGoogle() {
    
    try{
      const result = await signInWithGoogle();
      const user = result.user;
      console.log("User signed in: ", user);
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      navigate('/admin-home');
    }
    catch(error){
      console.error("Error signing in: ", error);
    }
    
  }

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <main className="login-container">
      <section className="brand-section">
        <h1 className="company-name">Facility Pro</h1>
        <p className="company-tagline"> Plan sport days, without the headache!</p>
      </section>

      <section className="login-panel">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Sign In</button>

          <p className="divider"><span>or</span></p>

          <button type="button" className="google-btn" onClick={handleSignInWithGoogle}>
            Continue with Google
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
};

export default LoginPage;