import { render, screen } from '@testing-library/react';
import App from './App';

// react-markdown ships as ESM only, which CRA's Jest setup can't load
jest.mock('react-markdown', () => ({ children }) => children);

beforeAll(() => {
  process.env.REACT_APP_GREETING_PROMPT = 'Hello!';
  process.env.REACT_APP_NO_TOKENS_PROMPT = 'Out of questions.';
});

test('renders the hero heading and the chat input', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /Hi, I'm Carlo\./ })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Type your question')).toBeInTheDocument();
});
