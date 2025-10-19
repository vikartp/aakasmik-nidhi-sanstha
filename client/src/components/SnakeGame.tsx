import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 15;
const CANVAS_SIZE = 300;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setGameRunning(true);
    setDirection({ x: 1, y: 0 }); // Start moving right
  };

  const pauseGame = () => {
    setGameRunning(false);
  };

  // Game logic
  const updateGame = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
          head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        return currentSnake;
      }

      // Check self collision
      for (const segment of newSnake) {
        if (head.x === segment.x && head.y === segment.y) {
          setGameOver(true);
          setGameRunning(false);
          return currentSnake;
        }
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, generateFood]);

  // Handle keyboard and touch input
  const changeDirection = useCallback((newDirection: Position) => {
    if (!gameRunning) return;
    
    // Prevent reversing into itself
    if (newDirection.x === -direction.x && newDirection.y === -direction.y) return;
    
    setDirection(newDirection);
  }, [gameRunning, direction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) changeDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(updateGame, 150);
    return () => clearInterval(gameInterval);
  }, [updateGame]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = '#4ade80';
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22c55e' : '#4ade80'; // Head darker
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
  }, [snake, food]);

  return (
    <div className="w-full max-w-sm mx-auto mt-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-lg border border-green-200 dark:border-green-800 p-4">
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          🐍 Snake Game
        </h2>
        <div className="text-base font-semibold text-gray-700 dark:text-gray-300">
          Score: {score}
        </div>
      </div>

      <div className="flex justify-center mb-3">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 touch-none"
        />
      </div>

      {/* Mobile Touch Controls */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2 max-w-[150px] mx-auto">
          <div></div>
          <button
            onClick={() => changeDirection({ x: 0, y: -1 })}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center text-lg touch-manipulation"
            disabled={!gameRunning}
          >
            ↑
          </button>
          <div></div>
          
          <button
            onClick={() => changeDirection({ x: -1, y: 0 })}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center text-lg touch-manipulation"
            disabled={!gameRunning}
          >
            ←
          </button>
          <div></div>
          <button
            onClick={() => changeDirection({ x: 1, y: 0 })}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center text-lg touch-manipulation"
            disabled={!gameRunning}
          >
            →
          </button>
          
          <div></div>
          <button
            onClick={() => changeDirection({ x: 0, y: 1 })}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center text-lg touch-manipulation"
            disabled={!gameRunning}
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>

      <div className="text-center space-y-2">
        {!gameRunning && !gameOver && (
          <button
            onClick={startGame}
            className="w-full py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-lg transition-colors touch-manipulation"
          >
            शुरू करें (Start Game)
          </button>
        )}
        
        {gameRunning && (
          <button
            onClick={pauseGame}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white font-semibold rounded-lg transition-colors touch-manipulation"
          >
            रोकें (Pause)
          </button>
        )}

        {gameOver && (
          <div className="space-y-3">
            <div className="text-red-600 dark:text-red-400 font-semibold text-sm">
              खेल समाप्त! अंतिम स्कोर: {score}
            </div>
            <button
              onClick={resetGame}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors touch-manipulation"
            >
              फिर से खेलें (Play Again)
            </button>
          </div>
        )}

        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          बटन दबाकर या ऐरो की का उपयोग करके नियंत्रण करें
        </div>
      </div>
    </div>
  );
}