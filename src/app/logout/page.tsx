import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export default async function LogoutPage() {
const supabase = supabaseServer()
await supabase.auth.signOut()
redirect('https://www.ableframework.com') // or `/auth/sign-in`
}