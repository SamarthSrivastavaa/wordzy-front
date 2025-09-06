import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const Hero = () => {
  const navigate = useNavigate()

  const handleLogIn = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  return (
    <div
      className="h-screen w-screen bg-no-repeat flex flex-col"
      style={{
        backgroundImage: "url('/Gemini_Generated_Image_pv2yz4pv2yz4pv2y.png')",
        backgroundPosition: 'center',
        backgroundSize: '100% 100%',
        backgroundColor: '#ffffff'
      }}
    >
     <Navbar />
  
      <div className="flex flex-col items-center justify-center px-6 py-8 mt-0 max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
          <span className="block">Your go-to brain rush</span>
          <span className="block"><span className='text-yellow-300'>CREATE,</span><span className='text-red-500'> JOIN &</span><span className='text-green-400'> COMPETE</span></span>
        </h1>
       
        <p className='text-[22px] text-gray-700 font-semibold max-w-2xl leading-relaxed mt-[20px] mb-[36px]'><span className='text-purple-600'>Challenge your friends in real-time Wordle battles.</span> <span className='text-red-500'>Crack the word, beat the clock, and rise to the top!</span></p>
        
        <button 
          onClick={handleLogIn}
          className='px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-[2px_2px_0px_rgba(1,1,1,1)] hover:shadow-[3px_3px_0px_rgba(1,1,1,1)] w-[200px] transition-all duration-200 transform hover:-translate-y-1'>
          Log In
        </button>
      </div>

      <div className='flex justify-center items-center gap-2'>
          <div className='text-[16px] text-gray-700 font-semibold'>Don't have an account :( ?</div>
        
        <p onClick={handleSignUp} className='text-purple-600 hover:text-purple-700 cursor-pointer'>Sign Up!</p>
       
      </div>

      <div className="mt-auto mb-6">
        <Footer />
      </div>
    </div> 
  )
}

export default Hero