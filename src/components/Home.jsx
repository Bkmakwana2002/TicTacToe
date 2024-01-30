import React, { useState, useEffect, useCallback } from 'react';
import sun from '../assets/sun.svg';
import moon from '../assets/moon.svg';

// Memoized Cell Component
const Cell = React.memo(({ value, index, onClick, darkMode, isWinningCell }) => {
  return (
    <div
      className={`p-4 text-4xl text-center cursor-pointer flex items-center justify-center ${
        isWinningCell && darkMode ? 'text-green-700 bg-green-200 font-bold' : isWinningCell && !darkMode ? 'text-green-200 bg-green-700 font-bold' : ''
      } ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
      style={{ width: '100px', height: '100px' }}
      onClick={() => onClick(index)}
    >
      <p className='font-extrabold'>{value}</p>
    </div>
  );
});

// Main Home Component
const Home = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winningSequence, setWinningSequence] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Handle click on a cell
  const handleCellClick = useCallback((index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const isWinner = checkWinner(newBoard, player);
    if (isWinner) {
      setWinner(player);
      setWinningSequence(winningCombinations[isWinner - 1]);
    } else {
      setPlayer(player === 'X' ? 'O' : 'X');
    }
  }, [board, player, winner, winningCombinations]);

  // Check if there is a winner
  const checkWinner = (currentBoard, currentPlayer) => {
    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (
        currentBoard[a] === currentPlayer &&
        currentBoard[b] === currentPlayer &&
        currentBoard[c] === currentPlayer
      ) {
        return i + 1; // Return the winning combination index
      }
    }
    return 0; // No winner
  };

  // Handle computer move
  const handleComputerMove = useCallback(async () => {
    const response = await fetch('https://hiring-react-assignment.vercel.app/api/bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(board),
    });

    const data = await response.json();
    handleCellClick(data);
  }, [board, handleCellClick]);

  // Effect to make a computer move when player is 'O'
  useEffect(() => {
    if (player === 'O' && !winner) {
      handleComputerMove();
    }
  }, [player, winner, handleComputerMove]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setBoard(Array(9).fill(null));
    setPlayer('X');
    setWinner(null);
    setWinningSequence([]);
  };

  // JSX structure
  return (
    <div className={`flex flex-col justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className={`grid grid-cols-3 gap-2 ${darkMode ? 'dark' : ''}`}>
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            index={index}
            onClick={handleCellClick}
            darkMode={darkMode}
            isWinningCell={winningSequence.includes(index)}
          />
        ))}
      </div>
      <div
        className="mt-4 mr-4 p-2 text-white rounded absolute top-0 right-0 cursor-pointer"
        onClick={toggleDarkMode}
      >
        {darkMode ? (
          <img src={sun} className='h-16 w-16 border-2 border-white bg-orange-400 rounded-full' alt="sun" />
        ) : (
          <img src={moon} className='h-16 w-16 border-2 border-black bg-yellow-200 rounded-full' alt="moon" />
        )}
      </div>
      <button
        className="mt-4 p-2 bg-gray-500 text-white rounded cursor-pointer"
        onClick={handleRefresh}
      >
        Refresh
      </button>
    </div>
  );
};

export default Home;
