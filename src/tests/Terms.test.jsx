import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsOfUsePage from '../components/Terms.jsx';

describe('TermsOfUsePage Component', () => {
  
  test('renders the main heading and last updated date', () => {
    render(<TermsOfUsePage />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Use' })).toBeInTheDocument();
    expect(screen.getByText('Last updated: May 25, 2025')).toBeInTheDocument();
  });

  test('renders all section headings with correct numbering', () => {
    render(<TermsOfUsePage />);
    
    const expectedSections = [
      '1. Introduction',
      '2. Booking Facilities',
      '3. Community Guidelines',
      '4. Data Usage & Privacy',
      '5. Changes to Terms',
      '6. Contact Us'
    ];

    expectedSections.forEach(sectionTitle => {
      expect(screen.getByRole('heading', { level: 2, name: sectionTitle })).toBeInTheDocument();
    });
  });

  test('renders all sections with correct structure', () => {
    render(<TermsOfUsePage />);
    
    // Check that we have 6 sections
    const sections = screen.getAllByRole('heading', { level: 2 });
    expect(sections).toHaveLength(6);
    
    // Check that each section has a list
    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(6);
  });

  test('renders Introduction section content', () => {
    render(<TermsOfUsePage />);
    
    expect(screen.getByText('Use the platform only for lawful and authorized purposes.')).toBeInTheDocument();
    expect(screen.getByText('Respect all users, staff, and property.')).toBeInTheDocument();
    expect(screen.getByText('Follow all community and facility guidelines.')).toBeInTheDocument();
    expect(screen.getByText('We reserve the right to update these terms at any time.')).toBeInTheDocument();
  });

  test('renders Booking Facilities section content', () => {
    render(<TermsOfUsePage />);
    
    expect(screen.getByText('You can book up to 3 hours per day per team.')).toBeInTheDocument();
    expect(screen.getByText('Full-day events require prior approval from facility management.')).toBeInTheDocument();
    expect(screen.getByText('Access up to 4 different sports facilities per user account.')).toBeInTheDocument();
    expect(screen.getByText("Always adhere to the facility's usage policies.")).toBeInTheDocument();
  });

  test('renders Community Guidelines section content', () => {
    render(<TermsOfUsePage />);
    
    expect(screen.getByText('Treat all users, staff, and facilities with respect and courtesy.')).toBeInTheDocument();
    expect(screen.getByText('Avoid offensive behavior, vandalism, or misuse of resources.')).toBeInTheDocument();
    expect(screen.getByText('Report any issues or misconduct via the app.')).toBeInTheDocument();
    expect(screen.getByText('Violations may lead to suspension of your account.')).toBeInTheDocument();
  });

  test('renders Data Usage & Privacy section content', () => {
    render(<TermsOfUsePage />);
    
    expect(screen.getByText('We collect booking data, facility feedback, and issue reports.')).toBeInTheDocument();
    expect(screen.getByText('Your data is never sold or shared without consent.')).toBeInTheDocument();
    expect(screen.getByText('Data is securely stored and used only to improve the platform.')).toBeInTheDocument();
    expect(screen.getByText('You may request deletion of your account or data at any time.')).toBeInTheDocument();
  });

  

  test('uses semantic HTML structure', () => {
    render(<TermsOfUsePage />);
    
    // Check for main element
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for header element
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    
    expect(h1).toBeInTheDocument();
    expect(h2s).toHaveLength(6);
  });

  test('applies correct CSS classes for styling', () => {
    const { container } = render(<TermsOfUsePage />);
    
    // Check main container classes
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('max-w-3xl', 'mx-auto', 'px-6', 'py-12', 'space-y-12');
    
    // Check header structure
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    
    // Check h1 classes
    const h1 = container.querySelector('h1');
    expect(h1).toHaveClass('text-4xl', 'font-bold', 'mb-4');
    
    // Check last updated paragraph classes
    const lastUpdated = container.querySelector('p');
    expect(lastUpdated).toHaveClass('text-sm', 'text-muted-foreground');
  });

  test('each section has proper list structure', () => {
    const { container } = render(<TermsOfUsePage />);
    
    const lists = container.querySelectorAll('ul');
    
    lists.forEach(list => {
      expect(list).toHaveClass('list-disc', 'list-inside', 'ml-6', 'space-y-1', 'text-base', 'leading-relaxed');
    });
  });

  test('each section heading has proper classes', () => {
    const { container } = render(<TermsOfUsePage />);
    
    const h2Elements = container.querySelectorAll('h2');
    
    h2Elements.forEach(h2 => {
      expect(h2).toHaveClass('text-2xl', 'font-semibold', 'mb-2');
    });
  });

  test('renders terms data correctly from the data array', () => {
    render(<TermsOfUsePage />);
    
    // Test that specific terms appear in correct sections
    // Introduction section
    expect(screen.getByRole('heading', { name: '1. Introduction' })).toBeInTheDocument();
    
    // Booking section with specific booking limits
    expect(screen.getByText('You can book up to 3 hours per day per team.')).toBeInTheDocument();
    expect(screen.getByText('Access up to 4 different sports facilities per user account.')).toBeInTheDocument();
    
    // Contact section with email
    expect(screen.getByText('Email us at support@faciltypro.app for any questions or concerns.')).toBeInTheDocument();
  });

 
  test('handles empty terms array gracefully', () => {
    // Mock the component with empty terms array for edge case testing
    const TermsWithEmptyData = () => {
      const terms = [];
      
      return (
        <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
          <header>
            <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 25, 2025</p>
          </header>
          {terms.map(({ number, title, bullets }) => (
            <section key={number}>
              <h2 className="text-2xl font-semibold mb-2">
                {number}. {title}
              </h2>
              <ul className="list-disc list-inside ml-6 space-y-1 text-base leading-relaxed">
                {bullets.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      );
    };
    
    render(<TermsWithEmptyData />);
    
    // Should still render header
    expect(screen.getByText('Terms of Use')).toBeInTheDocument();
    expect(screen.getByText('Last updated: May 25, 2025')).toBeInTheDocument();
    
    // Should not have any section headings
    const h2s = screen.queryAllByRole('heading', { level: 2 });
    expect(h2s).toHaveLength(0);
  });
});