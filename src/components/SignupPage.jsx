import React, { useState } from 'react';
import "./Login.css";
import { signInWithGoogle } from "../../backend/auth/firebase-auth";
import { useNavigate } from "react-router-dom";
import { signUpWithEmailAndPassword } from '../../backend/auth/firebase-auth';
import { FcGoogle } from "react-icons/fc";
import {
  saveUser
} from "../../backend/services/userServices.js";

const SignupPage = () => {
	 const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name : '',
    email: '',
    password: '',
    phoneNumber : ''
  });
  
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
  setError(""); 
    
    
    if (!formData.email || !formData.password) {
      setError('Please fill out all fields');
      return;
    }
    
   
    signUpWithEmailAndPassword(formData.name,formData.phoneNumber,formData.email, formData.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        
		navigate('/LoginPage');
      })
      .catch((error) => {
       
        let message = "";
        if (error.code === "auth/email-already-in-use") {
            message = "Email already in use. Log in instead.";
        }else if (error.code === "auth/weak-password") {
            message = "Password should have at least 6 characters.";
        } else {
            message = "Signup failed";
}
setError(message);

       
      });
    
  };
  
   async function handleSignUpWithGoogle() {
      
      try{
        const result = await signInWithGoogle();
        const user = result.user;
        
        
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          providerId: user.providerId,
          emailVerified: user.emailVerified,
          user_type: user.user_type || "resident",
          createdAt: new Date().toISOString()
		};
		     await saveUser(userData);
      
        navigate('/resident-home');
        
    
    }
      catch(error){
        
      }
      
    }
  
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
              placeholder="Name and Surname"
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

          <p className="divider"><strong>or</strong></p>

          <button type="button" className="google-btn" onClick={handleSignUpWithGoogle}>
            <section className='google-icon'>
              <FcGoogle/>
            </section>
            Continue with Google
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
};

export default SignupPage;