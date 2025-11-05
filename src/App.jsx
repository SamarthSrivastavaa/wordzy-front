import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import Hero from './components/Hero'
import Home from './pages/Home'
import Games from './pages/Games'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/games" element={<Games />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
