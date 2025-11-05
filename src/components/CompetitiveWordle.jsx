import React, { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

const CompetitiveWordle = ({ roomId, isOwner, onLeave }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [feedback, setFeedback] = useState([])
  const [isSolved, setIsSolved] = useState(false)
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, active, finished
  const [leaderboard, setLeaderboard] = useState([])
  const [playerStatuses, setPlayerStatuses] = useState([])
  const [timeLeft, setTimeLeft] = useState(null)
  const [players, setPlayers] = useState([])
  const [error, setError] = useState('')
  const [showLeaderboardPopup, setShowLeaderboardPopup] = useState(false)
  const [currentOwner, setCurrentOwner] = useState(isOwner)
  const [canRestart, setCanRestart] = useState(false)
  const inputRef = useRef(null)

  const WORD_LENGTH = 5
  const MAX_GUESSES = 6

  // Submit guess
  const submitGuess = useCallback(() => {
    if (!socket || currentGuess.length !== WORD_LENGTH || isSolved || gameStatus !== 'active') return

    socket.emit('submit-word', {
      roomId,
      playerId: user.userId,
      word: currentGuess
    })
  }, [socket, currentGuess, isSolved, gameStatus, roomId, user])

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== 'active' || isSolved) return
      
      const key = e.key.toUpperCase()
      
      if (key === 'ENTER') {
        e.preventDefault()
        if (currentGuess.length === WORD_LENGTH) {
          submitGuess()
        }
      } else if (key === 'BACKSPACE') {
        e.preventDefault()
        setCurrentGuess(prev => prev.slice(0, -1))
      } else if (/^[A-Z]$/.test(key)) {
        e.preventDefault()
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(prev => prev + key)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentGuess, gameStatus, isSolved, submitGuess])

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      // Authenticate and join room
      newSocket.emit('authenticate', {
        token: localStorage.getItem('token'),
        playerId: user.userId
      })

      newSocket.emit('join-room', {
        roomId,
        playerId: user.userId,
        username: user.username
      })
    })

    newSocket.on('authenticated', (data) => {
      console.log('Authenticated:', data)
    })

    newSocket.on('room-joined', (data) => {
      console.log('Room joined:', data)
      setPlayers(data.room.players || [])
      // Update owner status
      if (data.room?.owner) {
        const ownerId = data.room.owner._id?.toString() || data.room.owner.toString()
        const isOwnerNow = ownerId === user.userId
        setCurrentOwner(isOwnerNow)
        console.log('Owner status updated on room join:', { ownerId, userId: user.userId, isOwnerNow })
      }
    })

    newSocket.on('player-joined', (data) => {
      console.log('Player joined:', data)
      setPlayers(data.room.players || [])
    })

    newSocket.on('player-left', (data) => {
      console.log('Player left:', data)
      // Immediately update players list
      if (data.room && data.room.players) {
        setPlayers(data.room.players || [])
      }
      // Update owner status if owner left
      if (data.room && data.room.owner) {
        const ownerId = data.room.owner._id?.toString() || data.room.owner.toString()
        setCurrentOwner(ownerId === user.userId)
      }
    })

    newSocket.on('owner-changed', (data) => {
      console.log('Owner changed:', data)
      setError('')
      // Show notification about new owner
      const isNewOwner = data.newOwnerId === user.userId
      setCurrentOwner(isNewOwner)
      if (isNewOwner) {
        setError(`You are now the room owner!`)
        setTimeout(() => setError(''), 5000)
      }
    })

    newSocket.on('room-disbanded', (data) => {
      console.log('Room disbanded:', data)
      setError('Room has been disbanded. Redirecting...')
      setTimeout(() => {
        onLeave()
      }, 2000)
    })

    newSocket.on('player-disconnected', (data) => {
      console.log('Player disconnected:', data)
      // Immediately update players list
      if (data.room && data.room.players) {
        setPlayers(data.room.players || [])
      }
      // Update owner status if owner disconnected
      if (data.room && data.room.owner) {
        const ownerId = data.room.owner._id?.toString() || data.room.owner.toString()
        setCurrentOwner(ownerId === user.userId)
      }
    })

    newSocket.on('game-started', (data) => {
      console.log('Game started:', data)
      setGameState(data.gameState)
      setGameStatus('active')
      setGuesses([])
      setCurrentGuess('')
      setFeedback([])
      setIsSolved(false)
      setTimeLeft(data.gameState.timeLimit)
      setError('')
      setCanRestart(false) // Can't restart during active game
      // Clear previous leaderboard when new game starts
      setLeaderboard([])
      // Initialize player statuses from game state
      if (data.gameState.players) {
        setPlayerStatuses(data.gameState.players.map(p => ({
          playerId: p.playerId,
          username: p.username,
          status: 'active',
          guesses: 0,
          isSolved: false
        })))
      }
    })

    newSocket.on('word-feedback', (data) => {
      console.log('Word feedback:', data)
      setFeedback(prev => [...prev, data.feedback])
      setGuesses(prev => [...prev, data.word])
      setCurrentGuess('')
    })

    newSocket.on('word-solved', (data) => {
      console.log('Word solved:', data)
      if (data.playerId === user.userId) {
        setIsSolved(true)
      }
      // Show popup leaderboard when someone solves
      setShowLeaderboardPopup(true)
      setTimeout(() => setShowLeaderboardPopup(false), 5000)
    })

    newSocket.on('player-failed', (data) => {
      console.log('Player failed:', data)
      // Show popup leaderboard when someone fails
      setShowLeaderboardPopup(true)
      setTimeout(() => setShowLeaderboardPopup(false), 5000)
    })

    newSocket.on('leaderboard-update', (data) => {
      console.log('Leaderboard update:', data)
      setLeaderboard(data.leaderboard || [])
      setPlayerStatuses(data.playerStatuses || [])
      
      // Show popup if someone just finished
      if (data.leaderboard && data.leaderboard.some(entry => entry.isSolved || entry.status === 'failed')) {
        setShowLeaderboardPopup(true)
        // Auto-hide after 5 seconds
        setTimeout(() => setShowLeaderboardPopup(false), 5000)
      }
    })

    newSocket.on('timer-update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    newSocket.on('game-ended', async (data) => {
      console.log('Game ended - Full data:', data)
      console.log('Can restart value from backend:', data.canRestart)
      
      // Refresh owner status from room data when game ends
      // This ensures that if owner changed mid-game, we have the correct status
      try {
        const roomData = await api.getRoom(roomId)
        if (roomData.room?.owner) {
          const ownerId = roomData.room.owner._id?.toString() || roomData.room.owner.toString()
          const isOwnerNow = ownerId === user.userId
          setCurrentOwner(isOwnerNow)
          console.log('Owner status refreshed on game end:', { ownerId, userId: user.userId, isOwnerNow })
          // Also update players list
          if (roomData.room.players) {
            setPlayers(roomData.room.players)
          }
        }
      } catch (error) {
        console.error('Error refreshing owner status:', error)
      }
      
      console.log('Current owner status after refresh:', currentOwner)
      setGameStatus('finished')
      // Explicitly check for canRestart
      const canRestartValue = data.canRestart === true || data.canRestart === 'true'
      console.log('Setting canRestart to:', canRestartValue)
      setCanRestart(canRestartValue)
      // Update game state with target word
      if (data.gameState) {
        setGameState(prev => ({ ...prev, targetWord: data.targetWord }))
      }
      // Ensure all entries have usernames and time info
      const leaderboardWithWord = data.leaderboard.map(entry => ({
        ...entry,
        targetWord: data.targetWord,
        username: entry.username || 'Unknown',
        timeFormatted: entry.timeFormatted || (entry.solveTime ? formatTime(entry.solveTime) : '0s')
      }))
      setLeaderboard(leaderboardWithWord)
    })

    newSocket.on('error', (data) => {
      console.error('Socket error:', data)
      setError(data.message)
    })

    newSocket.on('player-guess', (data) => {
      console.log('Player guess:', data)
      // Show notification that another player made a guess
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [roomId, user])

  // Handle keyboard input (for virtual keyboard)
  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== 'active' || isSolved) return

    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess()
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess, gameStatus, isSolved, submitGuess])

  // Start game (owner only)
  const startGame = () => {
    if (!socket || !isOwner) return
    socket.emit('start-game', {
      roomId,
      playerId: user.userId
    })
  }

  // Get letter status for coloring
  const getLetterStatus = (letter, position, guessIndex) => {
    if (!feedback[guessIndex]) return 'empty'
    const letterFeedback = feedback[guessIndex][position]
    if (letterFeedback === 2) return 'correct'
    if (letterFeedback === 1) return 'present'
    return 'absent'
  }

  // Keyboard layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  // Get keyboard key status
  const getKeyStatus = (key) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'special'
    
    let status = 'unused'
    guesses.forEach((guess, guessIndex) => {
      guess.split('').forEach((letter, index) => {
        if (letter === key) {
          const letterStatus = getLetterStatus(letter, index, guessIndex)
          if (letterStatus === 'correct') status = 'correct'
          else if (letterStatus === 'present' && status !== 'correct') status = 'present'
          else if (letterStatus === 'absent' && status === 'unused') status = 'absent'
        }
      })
    })
    return status
  }

  // Format time
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-purple-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 tracking-tight">
                <span className="text-purple-600">
                  Wordzy
                </span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-500">Room:</span>
                <span className="font-mono font-bold text-sm sm:text-base md:text-lg bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-lg border border-purple-200">
                  {roomId}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {timeLeft !== null && gameStatus === 'active' && (
                <div className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 rounded-xl shadow-lg">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-mono tracking-wider">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}

              {currentOwner && gameStatus === 'waiting' && (
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg text-sm sm:text-base"
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span>▶</span>
                    <span className="hidden sm:inline">Start Game ({players.length}/7)</span>
                    <span className="sm:hidden">Start ({players.length}/7)</span>
                  </span>
                </button>
              )}

              <button
                onClick={onLeave}
                className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Leave Room</span>
                <span className="sm:hidden">Leave</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 sm:px-5 py-3 sm:py-4 rounded-lg text-xs sm:text-sm font-semibold shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Game Board - Left Side */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            {gameStatus === 'waiting' && (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border border-purple-100 text-center relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  {/* Animated icon */}
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="relative">
                      <div className="text-5xl sm:text-6xl md:text-7xl animate-pulse">🎮</div>
                      <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-30 animate-ping"></div>
                    </div>
                  </div>
                  
                  {/* Main heading */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 text-purple-600">
                    Waiting for players...
                  </h2>
                  
                  {/* Subtitle */}
                  <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 font-medium">
                    {currentOwner ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Click "Start Game" when ready!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        Waiting for room owner to start...
                      </span>
                    )}
                  </p>
                  
                  {/* Players section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1 max-w-xs"></div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Players in Room</p>
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1 max-w-xs"></div>
                    </div>
                    
                    {players.length > 0 ? (
                      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                        {players.map((player, idx) => (
                          <div
                            key={idx}
                            className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            {player.username}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic text-sm sm:text-base">No players yet...</div>
                    )}
                    
                    {/* Player count badge */}
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                      <span className="text-sm font-semibold text-purple-700">
                        {players.length} / 7 players
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameStatus === 'active' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Game Grid */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-pink-300">
                  <div className="grid gap-1.5 sm:gap-2 max-w-md mx-auto">
                    {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex gap-1.5 sm:gap-2">
                        {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
                          const letter = rowIndex < guesses.length 
                            ? guesses[rowIndex][colIndex] 
                            : rowIndex === guesses.length 
                              ? currentGuess[colIndex] || '' 
                              : ''
                          const status = rowIndex < guesses.length 
                            ? getLetterStatus(letter, colIndex, rowIndex) 
                            : 'empty'

                          return (
                            <div
                              key={colIndex}
                              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-2 rounded-md sm:rounded-lg flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-300 ${
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

                {/* Virtual Keyboard */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 sm:p-4 shadow-xl border-2 border-pink-300">
                  {keyboardRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                      {row.map((key) => {
                        const status = getKeyStatus(key)
                        const isSpecial = key === 'ENTER' || key === 'BACKSPACE'
                        
                        return (
                          <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className={`px-2 sm:px-3 py-2 sm:py-3 md:py-4 lg:py-5 rounded-md sm:rounded-lg font-semibold transition-all duration-200 text-xs sm:text-sm md:text-base ${
                              isSpecial 
                                ? 'bg-gray-400 hover:bg-gray-500 text-white' 
                                : status === 'correct' 
                                  ? 'bg-green-500 text-white' 
                                  : status === 'present' 
                                    ? 'bg-yellow-500 text-white' 
                                    : status === 'absent' 
                                      ? 'bg-gray-500 text-white' 
                                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            } ${
                              key === 'ENTER' ? 'px-3 sm:px-4 md:px-6 text-xs sm:text-sm' : key === 'BACKSPACE' ? 'px-2 sm:px-3 md:px-4' : 'w-8 sm:w-10 md:w-12 lg:w-14'
                            }`}
                          >
                            {key === 'BACKSPACE' ? '⌫' : key}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>

                {isSolved && (
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-center">
                    <p className="text-green-800 font-bold text-base sm:text-lg">🎉 You solved it!</p>
                    <p className="text-green-700 text-sm sm:text-base">Waiting for others to finish...</p>
                  </div>
                )}
              </div>
            )}

            {gameStatus === 'finished' && (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl border border-purple-100 relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 sm:mb-8 text-center text-purple-600">
                    Game Over!
                  </h2>
                  
                  {gameState?.targetWord && (
                    <div className="mb-6 sm:mb-8 text-center">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">The word was</p>
                      <div className="inline-block">
                        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-purple-600 tracking-wider">
                          {gameState.targetWord}
                        </p>
                      </div>
                    </div>
                  )}

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1 max-w-xs"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-yellow-500">🏆</span>
                      Leaderboard
                    </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1 max-w-xs"></div>
                  </div>
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg ${
                        entry.rank === 1 
                          ? 'bg-yellow-50 border-2 border-yellow-400 shadow-lg' 
                          : entry.rank === 2 
                            ? 'bg-gray-50 border-2 border-gray-400 shadow-md' 
                            : entry.rank === 3 
                              ? 'bg-orange-50 border-2 border-orange-400 shadow-md' 
                              : 'bg-white border-2 border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg shadow-md flex-shrink-0 ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {entry.rank || '-'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm sm:text-base md:text-lg text-gray-800 truncate">{entry.username || 'Unknown'}</p>
                          {entry.isSolved && entry.timeFormatted && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              {entry.solveAttempts}/6 attempts • {entry.timeFormatted}
                            </p>
                          )}
                          {entry.status === 'failed' && entry.timeFormatted && (
                            <p className="text-xs sm:text-sm text-red-600">
                              Failed (6/6 attempts) • {entry.timeFormatted}
                            </p>
                          )}
                          {entry.status === 'failed' && !entry.timeFormatted && (
                            <p className="text-xs sm:text-sm text-red-600">Failed (6/6 attempts)</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {entry.isSolved && (
                          <span className="text-green-600 text-lg sm:text-xl font-bold">✓</span>
                        )}
                        {entry.status === 'failed' && (
                          <span className="text-red-600 text-lg sm:text-xl font-bold">✗</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Start Again Button for Owner */}
                {currentOwner && canRestart && (
                  <div className="mt-4 sm:mt-6 flex justify-center">
                    <button
                      onClick={() => {
                        if (socket) {
                          socket.emit('start-again', {
                            roomId,
                            playerId: user.userId
                          })
                          setError('')
                        }
                      }}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    >
                      🎮 Start Again
                    </button>
                  </div>
                )}
                
                {/* Debug info - remove in production */}
                {gameStatus === 'finished' && (
                  <div className="mt-4 text-xs text-gray-400 text-center">
                    Debug: currentOwner={currentOwner ? 'true' : 'false'}, canRestart={canRestart ? 'true' : 'false'}
                  </div>
                )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Players & Leaderboard */}
          <div className="space-y-4 sm:space-y-5 order-2 lg:order-2">
            {/* Players List */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border border-purple-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-bold text-base sm:text-lg text-gray-800">Players</h3>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 sm:px-2.5 py-1 rounded-full">
                  {players.length}/7
                </span>
              </div>
              <div className="space-y-2">
                {players.map((player, idx) => {
                  const playerId = player._id?.toString() || player._id || player.toString()
                  const playerStatus = playerStatuses.find(p => 
                    p.playerId === playerId || 
                    p.playerId === player._id?.toString() ||
                    p.playerId === player._id
                  )
                  const isActive = !playerStatus || playerStatus?.status === 'active'
                  const isSolved = playerStatus?.status === 'solved'
                  const isFailed = playerStatus?.status === 'failed'
                  const currentAttempts = playerStatus?.guesses || playerStatus?.currentAttempts || 0
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        player._id === user.userId 
                          ? 'bg-purple-100 border-2 border-purple-300 shadow-md' 
                          : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            player._id === user.userId ? 'bg-purple-500 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                          <p className={`font-semibold text-sm sm:text-base truncate ${
                            player._id === user.userId ? 'text-purple-700' : 'text-gray-700'
                          }`}>
                            {player.username || 'Unknown'}
                            {player._id === user.userId && (
                              <span className="ml-2 text-xs font-normal text-purple-500 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {/* Status indicator */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {isSolved && (
                            <div className="flex items-center gap-1 text-green-600">
                              <span className="text-base sm:text-lg">✓</span>
                              <span className="text-xs font-medium whitespace-nowrap">
                                {playerStatus.solveAttempts}/6 in {playerStatus.timeFormatted}
                              </span>
                            </div>
                          )}
                          {isFailed && (
                            <div className="flex items-center gap-1 text-red-600">
                              <span className="text-base sm:text-lg">✗</span>
                              <span className="text-xs font-medium whitespace-nowrap">
                                6/6 failed
                              </span>
                            </div>
                          )}
                          {isActive && (
                            <div className="flex items-center gap-1">
                              {/* Animated jumping dots */}
                              <div className="flex gap-0.5">
                                <span className="animate-bounce text-purple-600 text-xs sm:text-sm" style={{ animationDelay: '0s' }}>.</span>
                                <span className="animate-bounce text-purple-600 text-xs sm:text-sm" style={{ animationDelay: '0.2s' }}>.</span>
                                <span className="animate-bounce text-purple-600 text-xs sm:text-sm" style={{ animationDelay: '0.4s' }}>.</span>
                              </div>
                              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                {currentAttempts}/6
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Live Leaderboard - Show during active game */}
            {gameStatus === 'active' && leaderboard.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border border-purple-100">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">🏆</span>
                  Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        entry.rank === 1 ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' :
                        entry.rank === 2 ? 'bg-gray-50 border border-gray-300 shadow-sm' :
                        entry.rank === 3 ? 'bg-orange-50 border border-orange-300 shadow-sm' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white shadow-lg' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {entry.rank || '-'}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{entry.username || 'Unknown'}</span>
                      </div>
                      <div className="flex-shrink-0">
                        {entry.isSolved && entry.timeFormatted && (
                          <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                            {entry.solveAttempts}/6 in {entry.timeFormatted}
                          </span>
                        )}
                        {entry.status === 'failed' && (
                          <span className="text-xs text-red-600 font-medium whitespace-nowrap">✗ Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Leaderboard - Show when game is finished */}
            {gameStatus === 'finished' && leaderboard.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl border border-purple-100">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">🏆</span>
                  Final Leaderboard
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        entry.rank === 1 ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' :
                        entry.rank === 2 ? 'bg-gray-50 border border-gray-300 shadow-sm' :
                        entry.rank === 3 ? 'bg-orange-50 border border-orange-300 shadow-sm' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white shadow-lg' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {entry.rank || '-'}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{entry.username || 'Unknown'}</span>
                      </div>
                      <div className="flex-shrink-0">
                        {entry.isSolved && entry.timeFormatted && (
                          <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                            {entry.solveAttempts}/6 in {entry.timeFormatted}
                          </span>
                        )}
                        {entry.status === 'failed' && entry.timeFormatted && (
                          <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                            Failed • {entry.timeFormatted}
                          </span>
                        )}
                        {entry.status === 'failed' && !entry.timeFormatted && (
                          <span className="text-xs text-red-600 font-medium whitespace-nowrap">✗ Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Popup Modal */}
      {showLeaderboardPopup && gameStatus === 'active' && leaderboard.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-pink-300 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Leaderboard Update</h2>
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-400' :
                    entry.rank === 2 ? 'bg-gray-100 border-2 border-gray-400' :
                    entry.rank === 3 ? 'bg-orange-100 border-2 border-orange-400' :
                    'bg-gray-50 border border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                      entry.rank === 1 ? 'bg-yellow-500 text-white' :
                      entry.rank === 2 ? 'bg-gray-400 text-white' :
                      entry.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {entry.rank || '-'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm sm:text-base text-gray-800 truncate">{entry.username || 'Unknown'}</p>
                      {entry.isSolved && entry.timeFormatted && (
                        <p className="text-xs text-gray-600">
                          {entry.solveAttempts}/6 attempts • {entry.timeFormatted}
                        </p>
                      )}
                      {entry.status === 'failed' && (
                        <p className="text-xs text-red-600">Failed (6/6 attempts)</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {entry.isSolved && (
                      <span className="text-green-600 text-lg sm:text-xl">✓</span>
                    )}
                    {entry.status === 'failed' && (
                      <span className="text-red-600 text-lg sm:text-xl">✗</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLeaderboardPopup(false)}
              className="mt-4 w-full px-4 py-2.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm sm:text-base"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitiveWordle

