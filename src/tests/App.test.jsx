import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Add this line
import App from '../App.jsx';

test("renders Facility Pro landing page", () => {
  render(<App />);
  
  // Check for the main header
  const headerElement = screen.getByText("Facility Pro");
  expect(headerElement).toBeInTheDocument();
  
  // Test for other key content to ensure the page renders properly
  const taglineElement = screen.getByText(/schedule and manage your local facilities/i);
  expect(taglineElement).toBeInTheDocument();
  
  // Test for button elements
  //const signInButton = screen.getByText("Sign In with Google");
  const signInButton = screen.getByText("Login");
  expect(signInButton).toBeInTheDocument();
  
  //const signUpButton = screen.getByText("Sign Up with Google");
  const signUpButton = screen.getByText("Create Account");

  expect(signUpButton).toBeInTheDocument();
});
