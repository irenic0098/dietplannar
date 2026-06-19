import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, it, expect } from 'vitest';
import Sidebar from './components/Sidebar';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { store } from './store';

describe('Sidebar Component', () => {
  it('renders Sidebar logo when rendered inside router and redux providers', () => {
    render(
      <Provider store={store}>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Sidebar isCollapsed={false} onMouseEnter={() => {}} onMouseLeave={() => {}} />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </Provider>
    );

    // Assert that logo is rendered
    expect(screen.getByText('DietPlanner')).toBeInTheDocument();
  });
});
