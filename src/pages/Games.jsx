import React from 'react'
import { useNavigate } from 'react-router-dom'
import Wordle from '../components/Wordle'

const Games = () => {
  const navigate = useNavigate()

  const handleBackToHero = () => {
    navigate('/')
  }

  return (
    <div 
      className="relative min-h-screen w-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/bg2.png')",
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
 <Wordle />
    </div>
  )
}

export default Games