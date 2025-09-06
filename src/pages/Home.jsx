import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const Home = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [username, setUsername] = useState('Player') // This would come from login/signup

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time as hh:mm:ss
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleCreate = () => {
    navigate('/games')
  }

  const handleJoin = () => {
    navigate('/games')
  }

  const handleLogout = () => {
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
      <nav className="relative z-10 bg-white/90 backdrop-blur-sm border-b-2 border-pink-300 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           {/* Left side - User info */}
           <div className="flex items-center space-x-4">
             <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
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
             <div>
               <h2 className="text-xl font-bold text-gray-900">{username}</h2>
             </div>
           </div>

          {/* Right side - Live time */}
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 font-mono">
              {formatTime(currentTime)}
            </div>
           
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="flex flex-col items-center justify-center">
             <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-pink-300">
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
               
               <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
                 Welcome back!
               </h1>
              <p className="text-2xl text-purple-600 text-center mb-8 font-semibold">
                {username}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleCreate}
                  className="w-full px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xl rounded-lg shadow-[2px_2px_0px_rgba(1,1,1,1)] hover:shadow-[3px_3px_0px_rgba(1,1,1,1)] transition-all duration-200 transform hover:-translate-y-1"
                >
                  CREATE
                </button>
                
                <button
                  onClick={handleJoin}
                  className="w-full px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-lg shadow-[2px_2px_0px_rgba(1,1,1,1)] hover:shadow-[3px_3px_0px_rgba(1,1,1,1)] transition-all duration-200 transform hover:-translate-y-1"
                >
                  JOIN
                </button>
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
          <div className="flex items-center justify-center">
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
      <div className="mt-auto mb-6">
      <div className="w-[55%] mx-auto pb-6">
      <div className="mx-auto w-[92%] md:w-[82%] bg-white/60 backdrop-blur-sm border-2 border-pink-500 rounded-xl px-4 md:px-6 py-3 flex items-center justify-center gap-8 shadow-lg"
           style={{
             boxShadow: '4px 4px 0px rgba(239, 68, 68, 0.4)'
           }}
      >
     
        
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-sm font-medium">A single room can accomodate a total of 10 players.</span>
          
        </div>

        
      </div>
    </div>
      </div>
    </div>
  )
}

export default Home
