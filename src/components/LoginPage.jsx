import React from "react";
import { useState } from "react";
import { signInWithGoogle } from "../../backend/auth/firebase-auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { signInWithEmailAndPassword } from "../../backend/auth/firebase-auth";
import {
  saveUser,
  fetchUser
} from "../../backend/services/userServices.js";
import { FcGoogle } from "react-icons/fc";


const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  async function handleSignInWithGoogle() {
    
    try{
		const result = await signInWithGoogle();
		const user = result.user;
		
		const uid = user.uid;

    // Check if the user exists in Firestore
    const existingUser = await fetchUser(uid);
		
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
    if( !existingUser){
      await saveUser(userData);
    }
		

    const userType = userData.user_type;

    const token = await user.getIdToken();
		localStorage.setItem('authToken', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem("userID",userData.uid);
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
    
  };

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      setError(""); 
      const user = await signInWithEmailAndPassword(formData.email, formData.password);
      
      const uid = user.uid;
      const User = await fetchUser(uid);
      const userType = User.user_type;

      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userType', userType);
      localStorage.setItem("userID",uid);
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
      } catch (error) {
        console.error("Error signing in:", error);
        let message = "Something went wrong.";
        if(error.code == "auth/invalid-credential"){
          message = "Invalid email or password.";
        }
        
          
        setError(message); 

      }
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

          <p className="divider"><strong>or</strong></p>

          <button type="button" className="google-btn" onClick={handleSignInWithGoogle}>
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

export default LoginPage;