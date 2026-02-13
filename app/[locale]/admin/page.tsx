'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, ArrowRight, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple authentication - in production, use proper auth
    setTimeout(() => {
      if (username === 'admin' && password === 'newbodyline2024') {
        // Store auth token
        localStorage.setItem('admin-auth', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Invalid username or password')
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background Effects - lightweight radial gradient instead of blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full mobile-blur-light" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full mobile-blur-light" />
      </div>

      <div
        className="relative z-10 w-full max-w-md css-fade-in-up"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa] mb-2">Staff Access</h1>
          <p className="text-[#a1a1aa]">NEWBODYLINE2 Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111111] border border-[#27272a] rounded-3xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[#a1a1aa] text-sm mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:border-[#dc2626] focus:outline-none transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:border-[#dc2626] focus:outline-none transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center css-fade-in"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#27272a] text-center">
            <p className="text-[#71717a] text-sm">
              Credentials: admin / newbodyline2024
            </p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-8">
          <a href="/" className="text-[#71717a] hover:text-[#dc2626] transition-colors text-sm">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  )
}