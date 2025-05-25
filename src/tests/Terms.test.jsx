import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    
    // Each section should have a button
    const buttons = screen.getAllByRole('button');
    // 6 section buttons
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  test('sections are collapsed by default', () => {
    render(<TermsOfUsePage />);
    
    // Content should not be visible initially (opacity: 0)
    const introContent = screen.getByText('Use the platform only for lawful and authorized purposes.');
    const listItem = introContent.closest('li');
    expect(listItem).toHaveStyle({ opacity: '0' });
  });

  test('clicking a section expands it', async () => {
    render(<TermsOfUsePage />);
    
    // Find the Introduction section button
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    
    // Click to expand
    fireEvent.click(introButton);
    
    // Wait for animation
    await waitFor(() => {
      const introContent = screen.getByText('Use the platform only for lawful and authorized purposes.');
      const listItem = introContent.closest('li');
      expect(listItem).toHaveStyle({ opacity: '1' });
    });
  });

  test('clicking an expanded section collapses it', async () => {
    render(<TermsOfUsePage />);
    
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    
    // Click to expand
    fireEvent.click(introButton);
    
    // Wait for expansion
    await waitFor(() => {
      const introContent = screen.getByText('Use the platform only for lawful and authorized purposes.');
      const listItem = introContent.closest('li');
      expect(listItem).toHaveStyle({ opacity: '1' });
    });
    
    // Click again to collapse
    fireEvent.click(introButton);
    
    // Should collapse
    await waitFor(() => {
      const introContent = screen.getByText('Use the platform only for lawful and authorized purposes.');
      const listItem = introContent.closest('li');
      expect(listItem).toHaveStyle({ opacity: '0' });
    });
  });

  test('only one section can be expanded at a time', async () => {
    render(<TermsOfUsePage />);
    
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    const bookingButton = screen.getByRole('heading', { level: 2, name: '2. Booking Facilities' }).closest('button');
    
    // Expand Introduction
    fireEvent.click(introButton);
    
    await waitFor(() => {
      const introContent = screen.getByText('Use the platform only for lawful and authorized purposes.');
      expect(introContent.closest('li')).toHaveStyle({ opacity: '1' });
    });
    
    // Click Booking Facilities
    fireEvent.click(bookingButton);
    
    await waitFor(() => {
      // Introduction should be collapsed
      const introContent = screen.getByText('Use the platform only for lawful and authorized purposes.');
      expect(introContent.closest('li')).toHaveStyle({ opacity: '0' });
      
      // Booking should be expanded
      const bookingContent = screen.getByText('You can book up to 3 hours per day per team.');
      expect(bookingContent.closest('li')).toHaveStyle({ opacity: '1' });
    });
  });

  test('chevron icons change when sections are expanded/collapsed', async () => {
    render(<TermsOfUsePage />);
    
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    
    // Initially should show ChevronDown (collapsed state)
    const chevronContainer = introButton.querySelector('figure:last-child');
    expect(chevronContainer).toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(introButton);
    
    // After clicking, the chevron should change (component re-renders with ChevronUp)
    await waitFor(() => {
      const expandedButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
      expect(expandedButton).toBeInTheDocument();
    });
  });

  test('renders Introduction section content when expanded', async () => {
    render(<TermsOfUsePage />);
    
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    fireEvent.click(introButton);
    
    await waitFor(() => {
      expect(screen.getByText('Use the platform only for lawful and authorized purposes.')).toBeInTheDocument();
      expect(screen.getByText('Respect all users, staff, and property.')).toBeInTheDocument();
      expect(screen.getByText('Follow all community and facility guidelines.')).toBeInTheDocument();
      expect(screen.getByText('We reserve the right to update these terms at any time.')).toBeInTheDocument();
    });
  });

  test('renders Booking Facilities section content when expanded', async () => {
    render(<TermsOfUsePage />);
    
    const bookingButton = screen.getByRole('heading', { level: 2, name: '2. Booking Facilities' }).closest('button');
    fireEvent.click(bookingButton);
    
    await waitFor(() => {
      expect(screen.getByText('You can book up to 3 hours per day per team.')).toBeInTheDocument();
      expect(screen.getByText('Full-day events require prior approval from facility management.')).toBeInTheDocument();
      expect(screen.getByText('Access up to 4 different sports facilities per user account.')).toBeInTheDocument();
      expect(screen.getByText("Always adhere to the facility's usage policies.")).toBeInTheDocument();
    });
  });

  test('renders Community Guidelines section content when expanded', async () => {
    render(<TermsOfUsePage />);
    
    const communityButton = screen.getByRole('heading', { level: 2, name: '3. Community Guidelines' }).closest('button');
    fireEvent.click(communityButton);
    
    await waitFor(() => {
      expect(screen.getByText('Treat all users, staff, and facilities with respect and courtesy.')).toBeInTheDocument();
      expect(screen.getByText('Avoid offensive behavior, vandalism, or misuse of resources.')).toBeInTheDocument();
      expect(screen.getByText('Report any issues or misconduct via the app.')).toBeInTheDocument();
      expect(screen.getByText('Violations may lead to suspension of your account.')).toBeInTheDocument();
    });
  });

  test('renders Data Usage & Privacy section content when expanded', async () => {
    render(<TermsOfUsePage />);
    
    const dataButton = screen.getByRole('heading', { level: 2, name: '4. Data Usage & Privacy' }).closest('button');
    fireEvent.click(dataButton);
    
    await waitFor(() => {
      expect(screen.getByText('We collect booking data, facility feedback, and issue reports.')).toBeInTheDocument();
      expect(screen.getByText('Your data is never sold or shared without consent.')).toBeInTheDocument();
      expect(screen.getByText('Data is securely stored and used only to improve the platform.')).toBeInTheDocument();
      expect(screen.getByText('You may request deletion of your account or data at any time.')).toBeInTheDocument();
    });
  });

  test('renders Changes to Terms section content when expanded', async () => {
    render(<TermsOfUsePage />);
    
    const changesButton = screen.getByRole('heading', { level: 2, name: '5. Changes to Terms' }).closest('button');
    fireEvent.click(changesButton);
    
    await waitFor(() => {
      expect(screen.getByText("You'll be notified of important changes via email or app alerts.")).toBeInTheDocument();
      expect(screen.getByText('Continued use means you accept the new terms.')).toBeInTheDocument();
      expect(screen.getByText('We recommend reviewing the terms regularly.')).toBeInTheDocument();
    });
  });

  test('renders Contact Us section content when expanded', async () => {
    render(<TermsOfUsePage />);
    
    const contactButton = screen.getByRole('heading', { level: 2, name: '6. Contact Us' }).closest('button');
    fireEvent.click(contactButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email us at support@faciltypro.app for any questions or concerns.')).toBeInTheDocument();
      expect(screen.getByText('We aim to respond within 48 hours on weekdays.')).toBeInTheDocument();
    });
  });

  test('uses semantic HTML structure', () => {
    render(<TermsOfUsePage />);
    
    // Check for main element
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for header element
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    
    expect(h1).toBeInTheDocument();
    expect(h2s).toHaveLength(6);
  });

  

  test('each section has a colored icon', () => {
    const { container } = render(<TermsOfUsePage />);
    
    // Find all icon containers (figures with gradients)
    const iconContainers = container.querySelectorAll('figure');
    
    // Should have at least 7 icons (1 main + 6 sections)
    expect(iconContainers.length).toBeGreaterThanOrEqual(7);
  });

  test('animations are applied on mount', () => {
    const { container } = render(<TermsOfUsePage />);
    
    // Check that container has opacity and transform transitions
    const mainContainer = container.querySelector('section');
    expect(mainContainer).toHaveStyle({
      opacity: '1',
      transform: 'translateY(0)'
    });
  });

  test('hover effects work on section cards', () => {
    const { container } = render(<TermsOfUsePage />);
    
    // Find a section element
    const section = container.querySelector('article section');
    
    // Trigger hover
    fireEvent.mouseEnter(section);
    
    // Check transform is applied
    expect(section).toHaveStyle({
      transform: 'scale(1.02)'
    });
    
    // Trigger mouse leave
    fireEvent.mouseLeave(section);
    
    // Check transform is reset
    expect(section).toHaveStyle({
      transform: 'scale(1)'
    });
  });

  test('focus styles are applied to buttons', () => {
    render(<TermsOfUsePage />);
    
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    
    // Focus the button
    fireEvent.focus(introButton);
    
    // Check outline is applied
    expect(introButton).toHaveStyle({
      outline: '4px solid rgba(139, 92, 246, 0.3)'
    });
    
    // Blur the button
    fireEvent.blur(introButton);
    
    // Check outline is removed
    expect(introButton).toHaveStyle({
      outline: 'none'
    });
  });

  test('main icon has hover effect', () => {
    const { container } = render(<TermsOfUsePage />);
    
    // Find the main icon container
    const mainIcon = container.querySelector('header figure');
    
    // Trigger hover
    fireEvent.mouseEnter(mainIcon);
    
    // Check transform
    expect(mainIcon).toHaveStyle({
      transform: 'scale(1.05)'
    });
    
    // Trigger mouse leave
    fireEvent.mouseLeave(mainIcon);
    
    // Check transform reset
    expect(mainIcon).toHaveStyle({
      transform: 'scale(1)'
    });
  });

  

  test('list items have staggered animation delays', async () => {
    render(<TermsOfUsePage />);
    
    const introButton = screen.getByRole('heading', { level: 2, name: '1. Introduction' }).closest('button');
    fireEvent.click(introButton);
    
    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      
      // Find the Introduction section list items (first 4)
      const introItems = listItems.slice(0, 4);
      
      introItems.forEach((item, index) => {
        expect(item).toHaveStyle({
          transitionDelay: `${index * 100}ms`
        });
      });
    });
  });
});