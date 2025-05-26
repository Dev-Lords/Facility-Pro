import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FAQPage from '../components/FAQ.jsx';
import '@testing-library/jest-dom';

import React from 'react';

describe('FAQPage', () => {
  test('renders FAQ page with initial questions', async () => {
    render(<FAQPage />);
    
    // Wait for animation transition (useEffect)
    await waitFor(() => {
      expect(screen.getByText('All Questions')).toBeInTheDocument();
    });

    // Check a known question appears
    expect(screen.getByText(/How do I book a facility/i)).toBeInTheDocument();
  });

  test('filters questions by search term', () => {
    render(<FAQPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'full-day events' }
    });

    expect(screen.getByText(/Can I book facilities for full-day events/i)).toBeInTheDocument();
    expect(screen.queryByText(/How do I book a facility/i)).toBeNull();
  });

  test('filters questions by category', () => {
    render(<FAQPage />);

    fireEvent.click(screen.getByText(/Facilities & Equipment/i));

    expect(screen.getByText(/Do facilities have night lighting/i)).toBeInTheDocument();
    expect(screen.queryByText(/How do I book a facility/i)).toBeNull();
  });

  
});
