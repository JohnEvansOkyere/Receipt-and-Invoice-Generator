/**
 * Authentication utilities
 */
import api from './api'

export interface User {
  id: number
  email: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

export async function login(credentials: LoginCredentials) {
  const formData = new FormData()
  formData.append('username', credentials.email)
  formData.append('password', credentials.password)
  
  const response = await api.post('/api/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token)
  }
  
  return response.data
}

export async function register(data: RegisterData) {
  const response = await api.post('/api/auth/register', data)
  return response.data
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/api/auth/me')
  return response.data
}

export function logout() {
  localStorage.removeItem('access_token')
  window.location.href = '/'
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token')
}
