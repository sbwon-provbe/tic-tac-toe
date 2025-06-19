import React, { useState } from 'react';
import './App.css';

function Square({ value, onClick, highlight }) {
  return (
    <button className={highlight ? "square highlight" : "square"} onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ xName, oName, history, stepNumber, xIsNext, onPlay, winnerInfo }) {
  const current = history[stepNumber];
  function handleClick(i) {
    if (current.squares[i] || winnerInfo) return;
    const nextSquares = current.squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  function renderSquare(i) {
    const highlight = winnerInfo && winnerInfo.line && winnerInfo.line.includes(i);
    return (
      <Square value={current.squares[i]} onClick={() => handleClick(i)} highlight={highlight} />
    );
  }

  let status;
  if (winnerInfo) {
    status = `Winner: ${winnerInfo.winner === 'X' ? xName : oName}`;
  } else if (current.squares.every(Boolean)) {
    status = 'Draw!';
  } else {
    status = `Next player: ${xIsNext ? xName : oName}`;
  }

  return (
    <div className="game">
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
  const [xName, setXName] = useState('Player X');
  const [oName, setOName] = useState('Player O');
  const [nameInput, setNameInput] = useState({ x: '', o: '' });
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  const current = history[stepNumber];
  const winnerInfo = calculateWinner(current.squares);

  function handlePlay(nextSquares) {
    const newHistory = history.slice(0, stepNumber + 1).concat([{ squares: nextSquares }]);
    setHistory(newHistory);
    setStepNumber(newHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(step) {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  }

  function handleNameChange(e) {
    const { name, value } = e.target;
    setNameInput(prev => ({ ...prev, [name]: value }));
  }

  function handleNameSubmit(e) {
    e.preventDefault();
    if (nameInput.x) setXName(nameInput.x);
    if (nameInput.o) setOName(nameInput.o);
    setNameInput({ x: '', o: '' });
  }

  const moves = history.map((step, move) => {
    const desc = move ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button className="history-btn" onClick={() => jumpTo(move)} disabled={move === stepNumber}>{desc}</button>
      </li>
    );
  });

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <form className="name-form" onSubmit={handleNameSubmit}>
        <input
          name="x"
          type="text"
          placeholder="Player X name"
          value={nameInput.x}
          onChange={handleNameChange}
          className="name-input"
        />
        <input
          name="o"
          type="text"
          placeholder="Player O name"
          value={nameInput.o}
          onChange={handleNameChange}
          className="name-input"
        />
        <button type="submit" className="name-submit">Set Names</button>
      </form>
      <Board
        xName={xName}
        oName={oName}
        history={history}
        stepNumber={stepNumber}
        xIsNext={xIsNext}
        onPlay={handlePlay}
        winnerInfo={winnerInfo}
      />
      <div className="history">
        <h2>Move History</h2>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

export default App;
