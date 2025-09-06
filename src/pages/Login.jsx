import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login data:', formData)
    navigate('/home')
  }

  const handleBackToHero = () => {
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


      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Login Form */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-pink-300">
              <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
                Welcome Back!
              </h1>
              <p className="text-lg text-purple-600 text-center mb-8 font-semibold">
                Ready to <span className="text-yellow-500">CREATE</span>, <span className="text-red-500">JOIN</span> & <span className="text-green-500">COMPETE</span>?
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors duration-200 text-gray-900 font-medium"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors duration-200 text-gray-900 font-medium"
                    placeholder="Enter your password"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-[2px_2px_0px_rgba(1,1,1,1)] hover:shadow-[3px_3px_0px_rgba(1,1,1,1)] transition-all duration-200 transform hover:-translate-y-1"
                >
                  Log In
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-700 font-semibold">
                  Don't have an account? 
                  <span 
                    onClick={handleBackToHero}
                    className="text-purple-600 hover:text-purple-700 cursor-pointer ml-1 underline"
                  >
                    Sign Up!
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Empty space for GIF/Video */}
          <div className="flex items-center justify-center">
            <div className="w-full h-96 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-pink-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-2xl font-bold text-purple-600 mb-2">Coming Soon!</p>
                <p className="text-gray-700 font-semibold">Interactive content will be here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto mb-6">
        <Footer />
      </div>
    </div>
  )
}

export default Login
