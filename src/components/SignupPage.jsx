import React, { useState } from 'react';
import "./Login.css";
import { signUpWithEmailAndPassword } from '../../backend/services/auth/firebase-auth';

const SignUpForm = ({ onSubmit, signInWithGoogle, error }) => {
  const [formData, setFormData] = useState({
    name : '',
    email: '',
    password: '',
    phoneNumber : ''
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    signUpWithEmailAndPassword(formData.name,formData.phoneNumber,formData.email, formData.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User signed up:", user);
        onSubmit(user); // Call the parent component's onSubmit function
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        setError(error.message); // Set error message to state
      });
    
  };
  
  return (
    <main className="login-container">
      <section className="brand-section">
        <h1 className="company-name">Facility Pro</h1>
        <p className="company-tagline">Plan sport days, without the headache!</p>
      </section>

      <section className="login-panel">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>

          
        <label>
            <input
              type="name"
              name="name"
              placeholder="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>


          <label>
          
            <input
              type="phoneNumber"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required/>
          
          </label>

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

          <button type="submit">Create Account</button>

          <p className="divider"><span>or</span></p>

          <button type="button" className="google-btn" onClick={signInWithGoogle}>
            Continue with Google
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
};

export default SignUpForm;