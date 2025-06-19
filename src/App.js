import React, { useState, useEffect } from 'react';
import './App.css';

function Square({ value, onClick, highlight }) {
  return (
    <button className={highlight ? "square highlight" : "square"} onClick={onClick} aria-label={value ? `Square ${value}` : 'Empty square'}>
      {value}
    </button>
  );
}

function Board({ xName, oName, history, stepNumber, xIsNext, onPlay, winnerInfo, isAI, aiMove }) {
  const current = history[stepNumber];
  useEffect(() => {
    if (isAI && !winnerInfo && !xIsNext) {
      // AI is always O
      const emptyIndices = current.squares.map((sq, i) => sq ? null : i).filter(i => i !== null);
      if (emptyIndices.length > 0) {
        const aiChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        setTimeout(() => aiMove(aiChoice), 500);
      }
    }
    // eslint-disable-next-line
  }, [isAI, xIsNext, winnerInfo, current]);

  function handleClick(i) {
    if (current.squares[i] || winnerInfo || (isAI && !xIsNext)) return;
    const nextSquares = current.squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  function renderSquare(i) {
    const highlight = winnerInfo && winnerInfo.line && winnerInfo.line.includes(i);
    return (
      <Square key={i} value={current.squares[i]} onClick={() => handleClick(i)} highlight={highlight} />
    );
  }

  const boardRows = [0, 1, 2].map(row => (
    <div className="board-row" key={row}>
      {[0, 1, 2].map(col => renderSquare(row * 3 + col))}
    </div>
  ));

  return <div>{boardRows}</div>;
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

function getInitialScores() {
  const stored = localStorage.getItem('tttScores');
  if (stored) return JSON.parse(stored);
  return { x: 0, o: 0, draw: 0 };
}

function App() {
  const [xName, setXName] = useState('Player X');
  const [oName, setOName] = useState('Player O');
  const [nameInputs, setNameInputs] = useState({ x: '', o: '' });
  const [namesSet, setNamesSet] = useState(false);
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState(getInitialScores());
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'ai'
  const [gameScored, setGameScored] = useState(false);

  useEffect(() => {
    localStorage.setItem('tttScores', JSON.stringify(scores));
  }, [scores]);

  const current = history[stepNumber];
  const winnerInfo = calculateWinner(current.squares);
  const isDraw = !winnerInfo && current.squares.every(Boolean);

  useEffect(() => {
    if (!gameScored) {
      if (winnerInfo) {
        setScores(s => ({ ...s, [winnerInfo.winner.toLowerCase()]: s[winnerInfo.winner.toLowerCase()] + 1 }));
        setGameScored(true);
      } else if (isDraw) {
        setScores(s => ({ ...s, draw: s.draw + 1 }));
        setGameScored(true);
      }
    }
  }, [winnerInfo, isDraw, gameScored]);

  function handlePlay(nextSquares) {
    const newHistory = history.slice(0, stepNumber + 1).concat([{ squares: nextSquares }]);
    setHistory(newHistory);
    setStepNumber(newHistory.length - 1);
    setXIsNext(!xIsNext);
    setGameScored(false); // Reset scoring for new move
  }

  function handleAIMove(i) {
    if (current.squares[i] || winnerInfo) return;
    const nextSquares = current.squares.slice();
    nextSquares[i] = 'O';
    handlePlay(nextSquares);
  }

  function jumpTo(step) {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
    setGameScored(false); // Reset scoring when time traveling
  }

  function handleReset() {
    setHistory([{ squares: Array(9).fill(null) }]);
    setStepNumber(0);
    setXIsNext(true);
    setGameScored(false); // Reset scoring for new game
  }

  function handleNameSubmit(e) {
    e.preventDefault();
    setXName(nameInputs.x || 'Player X');
    setOName(nameInputs.o || 'Player O');
    setNamesSet(true);
  }

  function handleModeChange(e) {
    setMode(e.target.value);
    handleReset();
  }

  function handleResetScores() {
    setScores({ x: 0, o: 0, draw: 0 });
    localStorage.setItem('tttScores', JSON.stringify({ x: 0, o: 0, draw: 0 }));
  }

  // Move history
  const moves = history.map((step, move) => {
    const desc = move ? `Go to move #${move}` : 'Go to game start';
    return (
      <li key={move}>
        <button className="history-btn" onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  let status;
  if (winnerInfo) {
    status = `Winner: ${winnerInfo.winner === 'X' ? xName : oName}`;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = `Next player: ${xIsNext ? xName : oName}`;
  }

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      <div className="mode-toggle">
        <label>
          <input type="radio" value="pvp" checked={mode === 'pvp'} onChange={handleModeChange} /> PvP
        </label>
        <label>
          <input type="radio" value="ai" checked={mode === 'ai'} onChange={handleModeChange} /> Vs AI
        </label>
      </div>
      {!namesSet && (
        <form className="name-form" onSubmit={handleNameSubmit}>
          <input className="name-input" placeholder="Player X name" value={nameInputs.x} onChange={e => setNameInputs({ ...nameInputs, x: e.target.value })} />
          <input className="name-input" placeholder="Player O name" value={nameInputs.o} onChange={e => setNameInputs({ ...nameInputs, o: e.target.value })} />
          <button className="name-submit" type="submit">Start</button>
        </form>
      )}
      {namesSet && (
        <>
          <div className="scoreboard">
            <span className="score x">{xName}: {scores.x}</span>
            <span className="score o">{oName}: {scores.o}</span>
            <span className="score draw">Draws: {scores.draw}</span>
            <button className="reset-scores-btn" onClick={handleResetScores}>Reset Scores</button>
          </div>
          <div className="game">
            <div className="status" aria-live="polite">{status}</div>
            <Board
              xName={xName}
              oName={oName}
              history={history}
              stepNumber={stepNumber}
              xIsNext={xIsNext}
              onPlay={handlePlay}
              winnerInfo={winnerInfo}
              isAI={mode === 'ai'}
              aiMove={handleAIMove}
            />
            <button className="reset-btn" onClick={handleReset}>Reset</button>
            <div className="history">
              <h2>Move History</h2>
              <ol>{moves}</ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
