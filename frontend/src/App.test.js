import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  const shopLink = screen.getByText(/Bolt/i);
  const loginLink = screen.getByText(/Bejelentkezés/i);
  expect(shopLink).toBeInTheDocument();
  expect(loginLink).toBeInTheDocument();
});