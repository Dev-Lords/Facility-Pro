import React, { useState } from "react";
import { signInWithGoogle } from "../../backend/services/auth/firebase-auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { User } from "../../backend/services/models/user.js";


const LoginPage = ({ onSubmit, error }) => {
  const navigate = useNavigate();

  async function handleSignInWithGoogle() {
    
    try{
		const result = await signInWithGoogle();
		const user = result.user;
		console.log("User signed in: ", user);
		const token = await user.getIdToken();
		localStorage.setItem('authToken', token);
		const uid = user.uid;

        // Check if the user exists in Firestore
        const existingUser = await User.getByUid(uid);
		
		const userData = {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
			phoneNumber: user.phoneNumber,
			providerId: user.providerId,
			emailVerified: user.emailVerified,
			createdAt: new Date().toISOString()
		};
		if (existingUser) {
            userData.user_type = existingUser.user_type; 
        } else {
            userData.user_type = "resident";  
        }
		await User.saveUser(userData);

		const userType = await User.getUserType(uid);
		if(userType == "admin"){
			navigate('/admin-home');			
		}
		else if(userType =="resident"){
			navigate('/resident-home');
		}
		else if(userType=="staff"){
			navigate('/staff-home');
		}
		else{
			navigate('/');
		}
		

		
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