
import React from 'react';
import { Navigate } from 'react-router-dom';


function StaffHomePage() {

    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType')
    const isAuthenticated = token && userType === 'staff';

  	if (!isAuthenticated) {
    	return <Navigate to="/" replace />;
  	}
    
    return (

      <h1>This is the Staff HomePage after successful sign-in</h1>

  );
}

export default StaffHomePage;
