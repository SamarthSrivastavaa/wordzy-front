import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Hero from './components/Hero'
import Home from './pages/Home'
import Games from './pages/Games'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/games" element={<Games />} />
      </Routes>
    </Router>
  )
}

export default App
