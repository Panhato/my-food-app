import { createClient } from '@supabase/supabase-js'

// 🔥 ដាក់ URL និង Key របស់បងនៅទីនេះ
const supabaseUrl = 'https://qnnffsllzmnnsjwddryq.supabase.co'
const supabaseKey = 'sb_publishable_eFftcCBv86pjSXNB75D7nA_R_fZz0F1'

export const supabase = createClient(supabaseUrl, supabaseKey)