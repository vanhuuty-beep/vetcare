const { createClient } = supabase;

const db = createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_KEY
);