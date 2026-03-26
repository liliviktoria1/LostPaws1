import { render, screen } from '@testing-library/react';
import App from './App';

test('renders site title', () => {
  render(<App />);
  const titleElement = screen.getAllByText(/Lost/i)[0];
  expect(titleElement).toBeInTheDocument();
});
