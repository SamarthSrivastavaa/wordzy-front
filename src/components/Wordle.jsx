import React, { useState, useEffect, useCallback } from 'react'

const Wordle = () => {
  // Game state
  const [word, setWord] = useState('')
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // 'playing', 'won', 'lost'
  const [streak, setStreak] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintCost, setHintCost] = useState(10)
  const [tokens, setTokens] = useState(100)

  // Word list - replace with your theme words
  const wordList = [
    'BRAIN', 'SMART', 'COOL', 'FUN', 'RUSH', 'GENIUS', 'QUICK', 'SHARP',
    'CLEVER', 'WITTY', 'AGILE', 'SWIFT', 'BRIGHT', 'SHARP', 'FAST', 'SMART'
  ]

  // Game constants
  const WORD_LENGTH = 5
  const MAX_GUESSES = 6

  // Initialize game with daily word
  useEffect(() => {
    initializeGame()
  }, [])

  // Initialize or reset the game
  const initializeGame = () => {
    const today = new Date().toDateString()
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const randomIndex = seed % wordList.length
    const dailyWord = wordList[randomIndex]
    
    setWord(dailyWord)
    setGuesses([])
    setCurrentGuess('')
    setGameStatus('playing')
    setShowHint(false)
  }

  // Handle key input
  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return

    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess, gameStatus])

  // Submit a guess
  const submitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) return

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    setCurrentGuess('')

    // Check if won
    if (currentGuess === word) {
      setGameStatus('won')
      setStreak(prev => prev + 1)
      setTokens(prev => prev + 50) // Reward for winning
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost')
      setStreak(0)
    }
  }

  // Get letter status for coloring
  const getLetterStatus = (letter, position) => {
    if (word[position] === letter) return 'correct'
    if (word.includes(letter)) return 'present'
    return 'absent'
  }

  // Handle hint
  const useHint = () => {
    if (tokens >= hintCost) {
      setTokens(prev => prev - hintCost)
      setShowHint(true)
      // Hide hint after 3 seconds
      setTimeout(() => setShowHint(false), 3000)
    }
  }

  // Keyboard keys layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  // Get keyboard key status
  const getKeyStatus = (key) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'special'
    
    let status = 'unused'
    guesses.forEach(guess => {
      guess.split('').forEach((letter, index) => {
        if (letter === key) {
          const letterStatus = getLetterStatus(letter, index)
          if (letterStatus === 'correct') status = 'correct'
          else if (letterStatus === 'present' && status !== 'correct') status = 'present'
          else if (letterStatus === 'absent' && status === 'unused') status = 'absent'
        }
      })
    })
    return status
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      {/* Game Header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          <span className="text-purple-600">Word</span>
          <span className="text-pink-500">zy</span>
        </h1>
        <p className="text-gray-600 mb-4">Your daily brain rush - 6 chances to guess the word!</p>
        
        {/* Stats Bar */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="bg-white/80 px-4 py-2 rounded-lg border border-purple-200">
            <span className="text-purple-600 font-semibold">Streak: {streak}</span>
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-lg border border-pink-200">
            <span className="text-pink-600 font-semibold">Tokens: {tokens}</span>
          </div>
          <button
            onClick={useHint}
            disabled={tokens < hintCost}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tokens >= hintCost 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Hint ({hintCost} tokens)
          </button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="max-w-md mx-auto mb-8">
        <div className="grid gap-2">
          {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
                const letter = rowIndex < guesses.length 
                  ? guesses[rowIndex][colIndex] 
                  : rowIndex === guesses.length 
                    ? currentGuess[colIndex] 
                    : ''
                const status = rowIndex < guesses.length 
                  ? getLetterStatus(letter, colIndex) 
                  : 'empty'

                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                      status === 'correct' 
                        ? 'bg-green-500 border-green-600 text-white' 
                        : status === 'present' 
                          ? 'bg-yellow-500 border-yellow-600 text-white' 
                          : status === 'absent' 
                            ? 'bg-gray-500 border-gray-600 text-white' 
                            : 'border-gray-300 bg-white'
                    }`}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hint Display */}
      {showHint && (
        <div className="max-w-md mx-auto mb-6 text-center">
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2">
            <p className="text-blue-800 font-medium">
              Hint: The word contains the letter "{word[0]}" at the beginning!
            </p>
          </div>
        </div>
      )}

      {/* Game Status Message */}
      {gameStatus !== 'playing' && (
        <div className="max-w-md mx-auto mb-6 text-center">
          <div className={`rounded-lg px-6 py-4 ${
            gameStatus === 'won' 
              ? 'bg-green-100 border border-green-300' 
              : 'bg-red-100 border border-red-300'
          }`}>
            <h3 className={`text-lg font-bold mb-2 ${
              gameStatus === 'won' ? 'text-green-800' : 'text-red-800'
            }`}>
              {gameStatus === 'won' ? '🎉 You Won!' : ' Game Over!'}
            </h3>
            <p className={`${
              gameStatus === 'won' ? 'text-green-700' : 'text-red-700'
            }`}>
              {gameStatus === 'won' 
                ? `The word was "${word}"! Great job!` 
                : `The word was "${word}". Better luck next time!`
              }
            </p>
            <button
              onClick={initializeGame}
              className="mt-3 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="max-w-2xl mx-auto">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 mb-2">
            {row.map((key) => {
              const status = getKeyStatus(key)
              const isSpecial = key === 'ENTER' || key === 'BACKSPACE'
              
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`px-3 py-4 rounded-lg font-semibold transition-all duration-200 ${
                    isSpecial 
                      ? 'bg-gray-400 hover:bg-gray-500 text-white text-sm' 
                      : status === 'correct' 
                        ? 'bg-green-500 text-white' 
                        : status === 'present' 
                          ? 'bg-yellow-500 text-white' 
                          : status === 'absent' 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } ${
                    key === 'ENTER' ? 'px-6' : key === 'BACKSPACE' ? 'px-4' : 'w-12'
                  }`}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Web3 Integration Placeholder */}
      <div className="max-w-md mx-auto mt-8 text-center">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg px-4 py-3">
          <p className="text-gray-700 text-sm">
            🚀 Web3 features coming soon! Connect wallet for NFT rewards.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Wordle
