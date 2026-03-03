import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export const createClient = () => {
    if (client) return client

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    client = createSupabaseClient(supabaseUrl, supabaseAnonKey)
    return client
}
