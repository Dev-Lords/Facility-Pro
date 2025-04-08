import "@testing-library/jest-dom";  // ✅ Add this import
import React from "react";  // ✅ Add this import
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/vite \+ react/i);
  expect(linkElement).toBeInTheDocument();
});
