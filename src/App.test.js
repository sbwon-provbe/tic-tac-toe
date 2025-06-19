import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe board and allows play', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  const squares = screen.getAllByRole('button', { name: '' });
  expect(squares).toHaveLength(9);
  // Simulate a click on the first square
  fireEvent.click(squares[0]);
  expect(squares[0].textContent).toBe('X');
  // Simulate a click on the second square
  fireEvent.click(squares[1]);
  expect(squares[1].textContent).toBe('O');
});

test('reset button resets the board and updates scores', () => {
  render(<App />);
  const squares = screen.getAllByRole('button', { name: '' });
  // X wins
  fireEvent.click(squares[0]); // X
  fireEvent.click(squares[3]); // O
  fireEvent.click(squares[1]); // X
  fireEvent.click(squares[4]); // O
  fireEvent.click(squares[2]); // X wins
  expect(screen.getByText(/Winner: X/i)).toBeInTheDocument();
  expect(screen.getByText(/X: 1/)).toBeInTheDocument();
  // Highlighted squares
  expect(squares[0].className).toMatch(/highlight/);
  expect(squares[1].className).toMatch(/highlight/);
  expect(squares[2].className).toMatch(/highlight/);
  // Reset
  fireEvent.click(screen.getByText(/Reset Game/i));
  expect(screen.getByText(/Next player: X/i)).toBeInTheDocument();
  // Board is cleared
  squares.forEach(sq => expect(sq.textContent).toBe(''));
});

test('renders mode toggle and persistent scores', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/PvP/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Vs AI/)).toBeInTheDocument();
});

test('AI makes a move in AI mode', async () => {
  render(<App />);
  // Set names and start
  fireEvent.change(screen.getByPlaceholderText('Player X name'), { target: { value: 'A' } });
  fireEvent.change(screen.getByPlaceholderText('Player O name'), { target: { value: 'B' } });
  fireEvent.click(screen.getByText('Start'));
  fireEvent.click(screen.getByLabelText(/Vs AI/));
  // X move
  const squares = screen.getAllByRole('button', { name: '' });
  fireEvent.click(squares[0]);
  // Wait for AI move
  await waitFor(() => {
    const oSquares = screen.getAllByText('O');
    expect(oSquares.length).toBeGreaterThan(0);
  });
});
