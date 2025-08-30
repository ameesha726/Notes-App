import React, { useState } from 'react'
import API from '../lib/api'
import Router from 'next/router'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

export default function SignUp() {
  const setToken = useAuth(state => state.setToken)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [nameError, setNameError] = useState('')
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(value && !value.endsWith('@gmail.com') ? 'Email must end with @gmail.com' : '')
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    setPasswordError(value && value.length < 7 ? 'Password must be at least 7 characters' : '')
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    setNameError(!value ? 'Name is required' : '')
  }

  async function handle() {
    let hasError = false
    if (!name) { setNameError('Name is required'); hasError = true }
    if (!email) { setEmailError('Email is required'); hasError = true }
    if (!password) { setPasswordError('Password is required'); hasError = true }
    if (email && !email.endsWith('@gmail.com')) { setEmailError('Only @gmail.com emails are allowed'); hasError = true }
    if (password && password.length < 7) { setPasswordError('Password must be at least 7 characters'); hasError = true }
    if (hasError) return

    try {
      await API.post('/auth/register', { user_name: name, user_email: email, password })

     
      setSuccessMessage('Registered successfully! Redirecting to Sign in...')
      setTimeout(() => Router.push('/signin'), 3000)

    } catch (e) {
      console.error(e)
      setServerError(e.response?.data?.detail || 'Unknown error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-purple-50 to-white p-6 relative">

   
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-center font-semibold">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Create Account</h1>

        {serverError && <p className="text-red-500 mb-4 text-center">{serverError}</p>}

        <label className="block mb-2 text-gray-600 font-medium">Full Name</label>
        <input
          value={name}
          onChange={handleNameChange}
          placeholder="Name"
          className="w-full mb-3 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        {nameError && <p className="text-red-500 text-sm mb-3">{nameError}</p>}

        <label className="block mb-2 text-gray-600 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="name@gmail.com"
          className="w-full mb-3 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        {emailError && <p className="text-red-500 text-sm mb-3">{emailError}</p>}

        <label className="block mb-2 text-gray-600 font-medium">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            placeholder="At least 7 characters"
            className="w-full mb-3 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition pr-12"
          />
          <div
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="text-gray-400 w-5 h-5" /> : <Eye className="text-gray-400 w-5 h-5" />}
          </div>
        </div>
        {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}

        <button
          onClick={handle}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all mt-2"
        >
          Sign Up
        </button>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account? <a href="/signin" className="text-indigo-600 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
