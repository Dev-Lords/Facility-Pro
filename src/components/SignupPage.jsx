import React, { useState } from 'react';
import "./Login.css";
import { signInWithGoogle } from "../../backend/services/auth/firebase-auth";
import { useNavigate } from "react-router-dom";
import { User } from "../../backend/services/models/user.js";
import { signUpWithEmailAndPassword } from '../../backend/services/auth/firebase-auth';

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
	console.log('Form submitted with:', formData);
    
    // Example of form validation and error handling
    if (!formData.email || !formData.password) {
      setError('Please fill out all fields');
      return;
    }
    
    // Here you would typically call an API to create a user
    // For example:
    // createUser(formData)
    //   .then(() => navigate('/login'))
    //   .catch(err => setError(err.message));

    signUpWithEmailAndPassword(formData.name,formData.phoneNumber,formData.email, formData.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User signed up:", user);
		navigate('/LoginPage');
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        setError(error.message); // Set error message to state
      });
    
  };
  
   async function handleSignInWithGoogle() {
      
      try{
        const result = await signInWithGoogle();
        const user = result.user;
        console.log("Account created for user signing up with google: ", user);
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
		await User.saveUser(userData);

        navigate('/LoginPage');
    }
      catch(error){
        console.error("Error signing up: ", error);
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

          <button type="button" className="google-btn" onClick={handleSignInWithGoogle}>
            Continue with Google
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
};

export default SignupPage;