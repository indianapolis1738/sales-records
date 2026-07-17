import { supabase } from "./supabase"

export const signUp = (
  email: string,
  password: string,
  data: { name: string; phone: string }
) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: data.name,
        phone: data.phone,
      },
    },
  });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () =>
  supabase.auth.signOut()
