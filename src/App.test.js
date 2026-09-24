import { render, screen } from '@testing-library/react';
import App from './App';

// axios, react-markdown and html-react-parser ship ESM only, which jest can't parse.
jest.mock('axios', () => ({ create: () => ({}) }));
jest.mock('react-markdown', () => ({ children }) => children);
jest.mock('html-react-parser', () => () => null);

test('renders profile name', () => {
  render(<App />);
  const nameElement = screen.getByText('Carlo Toribio');
  expect(nameElement).toBeInTheDocument();
});
