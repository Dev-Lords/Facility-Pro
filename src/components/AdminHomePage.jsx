
import React from 'react';
import { Navigate } from 'react-router-dom';


function AdminHomePage() {

    const token = localStorage.getItem('authToken');
    if(!token){
        return <Navigate to="/" />;
    }
    
    
    return (

      <h1>This is the Admin HomePage after successful sign-in</h1>

  );
}

export default AdminHomePage;
