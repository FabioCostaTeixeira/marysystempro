import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const SUPABASE_URL = "https://xyeglzhwmeityzwhqkuh.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdsemh3bWVpdHl6d2hxa3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODUyMzMsImV4cCI6MjA3Mzg2MTIzM30.Sr-TB_ZCBXa9Awo7sM4CoFNEOGlOTt3f04kuW7y04Zw"

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
)