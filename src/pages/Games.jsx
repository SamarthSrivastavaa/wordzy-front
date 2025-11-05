import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CompetitiveWordle from '../components/CompetitiveWordle'
import { useAuth } from '../context/AuthContext'

const Games = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('roomId')
  const isOwner = searchParams.get('isOwner') === 'true'

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!roomId) {
      navigate('/home')
    }
  }, [user, roomId, navigate])

  const handleLeave = () => {
    navigate('/home')
  }

  if (!roomId) {
    return null
  }

  return (
    <CompetitiveWordle 
      roomId={roomId} 
      isOwner={isOwner}
      onLeave={handleLeave}
    />
  )
}

export default Games