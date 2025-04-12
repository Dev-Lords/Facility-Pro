
import React from 'react';
import { Navigate } from 'react-router-dom';


function ResidentHomePage() {

    const token = localStorage.getItem('authToken');
    if(!token){
        return <Navigate to="/" />;
    }
    
    
    return (

      <h1>This is the Resident HomePage after successful sign-in</h1>

  );
}

export default ResidentHomePage;
