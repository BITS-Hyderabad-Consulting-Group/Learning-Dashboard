import { supabase } from './supabase'

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  
  if (error) {
    console.error('Error signing in with Google:', error)
    return { error }
  }
  
  return { data }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    return { error }
  }
  
  return { error: null }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return { user: null, error }
  }
  
  return { user, error: null }
}
