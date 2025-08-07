'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { LoginFormValues, RegisterFormValues } from '@/lib/validations/auth'
import { useToast } from '@/hooks/use-toast'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const hasInitialSessionRef = useRef(false)
  const previousUserRef = useRef<User | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        hasInitialSessionRef.current = !!session
        previousUserRef.current = session?.user ?? null
      }
      
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        const previousUser = previousUserRef.current
        
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        // Update refs
        previousUserRef.current = session?.user ?? null

        // Only show welcome toast for actual new logins, not session refresh
        if (event === 'SIGNED_IN' && !hasInitialSessionRef.current && !previousUser) {
          toast({
            title: "Welkom!",
            description: "Succesvol ingelogd.",
          })
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Uitgelogd",
            description: "Succesvol uitgelogd.",
          })
          router.push('/login')
          hasInitialSessionRef.current = false
          previousUserRef.current = null
        } else if (event === 'SIGNED_IN' && session) {
          // Silent session refresh - update hasInitialSession but don't show toast
          hasInitialSessionRef.current = true
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router, toast])

  const signIn = async (values: LoginFormValues) => {
    try {
      setIsAuthenticating(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: error.message || "Er is een onverwachte fout opgetreden.",
      })
      
      return { data: null, error }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signUp = async (values: RegisterFormValues) => {
    try {
      setIsAuthenticating(true)
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Controleer je e-mail",
          description: "We hebben je een bevestigingslink gestuurd om je registratie te voltooien.",
        })
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      toast({
        variant: "destructive",
        title: "Registratie mislukt",
        description: error.message || "Er is een onverwachte fout opgetreden.",
      })
      
      return { data: null, error }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const signOut = async () => {
    try {
      setIsAuthenticating(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      
      toast({
        variant: "destructive",
        title: "Uitloggen mislukt",
        description: error.message || "Er is een onverwachte fout opgetreden.",
      })
      
      return { error }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsAuthenticating(true)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Controleer je e-mail",
        description: "We hebben je een wachtwoord reset link gestuurd.",
      })

      return { data, error: null }
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      toast({
        variant: "destructive",
        title: "Wachtwoord reset mislukt",
        description: error.message || "Er is een onverwachte fout opgetreden.",
      })
      
      return { data: null, error }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const updatePassword = async (password: string) => {
    try {
      setIsAuthenticating(true)
      
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Wachtwoord bijgewerkt",
        description: "Je wachtwoord is succesvol bijgewerkt.",
      })

      return { data, error: null }
    } catch (error: any) {
      console.error('Password update error:', error)
      
      toast({
        variant: "destructive",
        title: "Wachtwoord bijwerken mislukt",
        description: error.message || "Er is een onverwachte fout opgetreden.",
      })
      
      return { data: null, error }
    } finally {
      setIsAuthenticating(false)
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticating,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}