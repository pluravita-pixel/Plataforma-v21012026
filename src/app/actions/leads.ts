'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLead(email: string, source: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('leads')
        .insert([{ email, source }])
        .select()

    if (error) {
        if (error.code === '23505') {
            // email already exists
            return { success: true, message: 'Ya estás registrado para el descuento.' }
        }
        console.error('Error creating lead:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}
