import React, { useState } from 'react'
import API from '../lib/api'
import { useAuth } from './useAuth'
import Router from 'next/router'
import { Eye, EyeOff } from 'lucide-react'

export default function SignIn() {
  const setToken = useAuth(state => state.setToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success') // 'success' or 'error'

  async function handle() {
    if (!email || !password) {
      setToastType('error')
      setToastMessage('Email and password are required')
      setTimeout(() => setToastMessage(''), 3000)
      return
    }

    try {
      const res = await API.post('/auth/login', { user_email: email, password })
      setToken(res.data.access_token)

      setToastType('success')
      setToastMessage('Logged in successfully!')
      setTimeout(() => {
        setToastMessage('')
        Router.push('/')
      }, 3000)
    } catch (e) {
      console.error(e)
      setToastType('error')
      setToastMessage('Login failed: Invalid credentials')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 p-6 relative">

      {toastMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 text-center font-semibold
          ${toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toastMessage}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Sign In</h1>

        <label className="block mb-2 text-gray-600 font-medium">Email</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@gmail.com"
          className="w-full mb-4 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />

        <label className="block mb-2 text-gray-600 font-medium">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="********"
            className="w-full mb-6 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition pr-12"
          />
          <div
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="text-gray-400 w-5 h-5" /> : <Eye className="text-gray-400 w-5 h-5" />}
          </div>
        </div>

        <button
          onClick={handle}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Sign In
        </button>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don’t have an account?{' '}
          <a href="/signup" className="text-indigo-600 font-medium hover:underline">
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}
