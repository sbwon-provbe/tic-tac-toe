import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe board and allows play', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  const squares = screen.getAllByRole('button');
  expect(squares).toHaveLength(9);
  // Simulate a click on the first square
  fireEvent.click(squares[0]);
  expect(squares[0].textContent).toBe('X');
  // Simulate a click on the second square
  fireEvent.click(squares[1]);
  expect(squares[1].textContent).toBe('O');
});
