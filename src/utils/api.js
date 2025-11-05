import { PRODUCTION_API_URL } from '../../config.production.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:8000/api');

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API functions
export const api = {
  // Player/Auth endpoints
  async signup(username, password) {
    const response = await fetch(`${API_BASE_URL}/players/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    return data;
  },

  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/players/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  // Room endpoints
  async createRoom() {
    const response = await fetch(`${API_BASE_URL}/rooms/create`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create room');
    }
    return data;
  },

  async joinRoom(roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomId })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to join room');
    }
    return data;
  },

  async getRoom(roomId) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get room');
    }
    return data;
  }
};

export default api;

