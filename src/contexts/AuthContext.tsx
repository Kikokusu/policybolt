import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: { name: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, set loading to false and return
    if (!supabase) {
      setSession(null)
      setUser(null)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Handle invalid refresh token error by clearing the session
      if (error && error.message === 'Invalid Refresh Token: Refresh Token Not Found') {
        supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData?: { name: string }) => {
    if (!supabase) {
      return { error: new Error('Authentication service not available') }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData ? {
          full_name: userData.name,
        } : undefined,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Authentication service not available') }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Authentication service not available') }
    }

    try {
      const { error } = await supabase.auth.signOut()
      
      // If the session doesn't exist on the server, treat it as a successful logout
      // since the user is effectively already logged out
      if (error && error.message === 'Session from session_id claim in JWT does not exist') {
        return { error: null }
      }
      
      return { error }
    } catch (exception: any) {
      // Handle cases where the Supabase client throws an exception
      // for sessions that don't exist on the server
      if (exception.message && exception.message.includes('Session from session_id claim in JWT does not exist')) {
        return { error: null }
      }
      
      // Re-throw other unexpected exceptions
      throw exception
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}