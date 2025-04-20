import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App.jsx';

// Mock modules
jest.mock('react-dom/client', () => {
  const renderMock = jest.fn();
  return {
    createRoot: jest.fn(() => ({
      render: renderMock,
    })),
  };
});

jest.mock('../App.jsx', () => () => <div>App Component</div>);

describe('Main Application Entry', () => {
  let mockRoot;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRoot = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockImplementation(() => mockRoot);
  });

  afterEach(() => {
    document.getElementById.mockRestore();
  });

  test('renders App component inside StrictMode', () => {
    require('../main.jsx');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(createRoot).toHaveBeenCalledWith(mockRoot);

    const renderMock = createRoot.mock.results[0].value.render;
    expect(renderMock).toHaveBeenCalledTimes(1);

    const strictModeElement = renderMock.mock.calls[0][0];

    // ✅ Fix: check the type directly against StrictMode
    expect(strictModeElement.type).toBe(StrictMode);

    // Check that the child is App
    const appProps = strictModeElement.props.children;
    expect(appProps.type).toBe(App);
  });
});
