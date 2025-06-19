import React, { useState } from 'react';
import './App.css';

function Square({ value, onClick, highlight }) {
  return (
    <button className={highlight ? "square highlight" : "square"} onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ xScore, oScore, drawScore, onReset }) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [localScores, setLocalScores] = useState({ x: xScore, o: oScore, draw: drawScore });
  const [lastWinner, setLastWinner] = useState(null);

  function handleClick(i) {
    if (squares[i] || gameOver) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    const result = calculateWinner(nextSquares);
    if (result) {
      setGameOver(true);
      setLastWinner(result.winner);
      if (result.winner === 'X') setLocalScores(s => ({ ...s, x: s.x + 1 }));
      if (result.winner === 'O') setLocalScores(s => ({ ...s, o: s.o + 1 }));
    } else if (nextSquares.every(Boolean)) {
      setGameOver(true);
      setLastWinner('Draw');
      setLocalScores(s => ({ ...s, draw: s.draw + 1 }));
    }
  }

  function handleReset() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setLastWinner(null);
    if (onReset) onReset(localScores);
  }

  const result = calculateWinner(squares);
  let status;
  if (result) {
    status = 'Winner: ' + result.winner;
  } else if (squares.every(Boolean)) {
    status = 'Draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  function renderSquare(i) {
    const highlight = result && result.line && result.line.includes(i);
    return (
      <Square value={squares[i]} onClick={() => handleClick(i)} highlight={highlight} />
    );
  }

  return (
    <div className="game">
      <div className="scoreboard">
        <span className="score x">X: {localScores.x}</span>
        <span className="score o">O: {localScores.o}</span>
        <span className="score draw">Draw: {localScores.draw}</span>
      </div>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}{renderSquare(1)}{renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}{renderSquare(4)}{renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}{renderSquare(7)}{renderSquare(8)}
      </div>
      <button className="reset-btn" onClick={handleReset}>Reset Game</button>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

function App() {
  // Track scores at the App level for persistence if needed
  const [scores, setScores] = useState({ x: 0, o: 0, draw: 0 });

  function handleScoreUpdate(localScores) {
    setScores(localScores);
  }

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <Board xScore={scores.x} oScore={scores.o} drawScore={scores.draw} onReset={handleScoreUpdate} />
    </div>
  );
}

export default App;
