import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const Home = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [roomId, setRoomId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCreateRoom = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await api.createRoom()
      navigate(`/games?roomId=${response.roomId}&isOwner=true`)
    } catch (err) {
      setError(err.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room code')
      return
    }

    setError('')
    setLoading(true)
    try {
      const response = await api.joinRoom(roomId.toUpperCase())
      navigate(`/games?roomId=${response.roomId}&isOwner=false`)
    } catch (err) {
      setError(err.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  // Format time as hh:mm:ss
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Doodle Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/doodle.ong.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Custom Navbar */}
      <nav className="relative z-10 bg-white/90 backdrop-blur-sm border-b-2 border-pink-300 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
           {/* Left side - User info */}
           <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
               <svg 
                 width="24" 
                 height="24" 
                 viewBox="0 0 24 24" 
                 fill="none" 
                 stroke="white" 
                 strokeWidth="2" 
                 strokeLinecap="round" 
                 strokeLinejoin="round"
               >
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                 <circle cx="12" cy="7" r="4"/>
               </svg>
             </div>
             <div className="min-w-0">
               <h2 className="text-sm sm:text-xl font-bold text-gray-900 truncate">{user?.username || 'Player'}</h2>
             </div>
           </div>

          {/* Right side - Live time */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 font-mono">
              {formatTime(currentTime)}
            </div>
           
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="flex flex-col items-center justify-center w-full">
             <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-pink-300">
               {/* Profile Doodle */}
               <div className="flex justify-center mb-4">
                 <div className="w-16 h-16 flex items-center justify-center">
                   <svg 
                     width="48" 
                     height="48" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="black" 
                     strokeWidth="2" 
                     strokeLinecap="round" 
                     strokeLinejoin="round"
                     className="drop-shadow-sm"
                   >
                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                     <circle cx="12" cy="7" r="4"/>
                   </svg>
                 </div>
               </div>
               
               <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-2">
                 Welcome back!
               </h1>
              <p className="text-xl sm:text-2xl text-purple-600 text-center mb-6 sm:mb-8 font-semibold">
                {user?.username || 'Player'}
              </p>
              
              {error && (
                <div className="mb-4 bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-base sm:text-xl rounded-lg shadow-[2px_2px_0px_rgba(1,1,1,1)] hover:shadow-[3px_3px_0px_rgba(1,1,1,1)] transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creating...' : 'CREATE ROOM'}
                </button>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 5)
                      setRoomId(value)
                    }}
                    placeholder="Enter room code"
                    maxLength={5}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors duration-200 text-gray-900 font-medium text-center text-xl sm:text-2xl tracking-widest disabled:opacity-50"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={loading}
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-base sm:text-xl rounded-lg shadow-[2px_2px_0px_rgba(1,1,1,1)] hover:shadow-[3px_3px_0px_rgba(1,1,1,1)] transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Joining...' : 'JOIN ROOM'}
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleLogout}
                  className="text-purple-600 hover:text-purple-700 cursor-pointer text-sm font-semibold underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Empty space for Animation */}
          <div className="flex items-center justify-center w-full hidden lg:flex">
            <div className="w-full h-96 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-pink-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-2xl font-bold text-purple-600 mb-2">Animation Zone!</p>
                <p className="text-gray-700 font-semibold">Interactive content will be here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* footer */}
      <div className="mt-auto mb-4 sm:mb-6">
      <div className="w-full sm:w-[90%] md:w-[70%] lg:w-[55%] mx-auto pb-4 sm:pb-6 px-4">
      <div className="mx-auto w-full sm:w-[92%] md:w-[82%] bg-white/60 backdrop-blur-sm border-2 border-pink-500 rounded-xl px-4 md:px-6 py-3 flex items-center justify-center gap-4 sm:gap-8 shadow-lg"
           style={{
             boxShadow: '4px 4px 0px rgba(239, 68, 68, 0.4)'
           }}
      >
     
        
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-gray-700 text-xs sm:text-sm font-medium text-center">A single room can accomodate a total of 10 players.</span>
          
        </div>

        
      </div>
    </div>
      </div>
    </div>
  )
}

export default Home
