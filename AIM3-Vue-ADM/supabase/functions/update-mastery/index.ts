import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { cardId, isLearned, userId } = await req.json();
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            throw new Error("Supabase config missing");
        }

        const delta = isLearned ? 0.15 : -0.25; // Negative bias for review priority

        // 1. Get current mastery
        const getRes = await fetch(`${SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}&select=mastery_score`, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });
        const currentData = await getRes.json();
        const oldScore = currentData[0]?.mastery_score ?? 0.5;
        const newScore = Math.max(0, Math.min(1.0, oldScore + delta));

        // 2. Update mastery
        await fetch(`${SUPABASE_URL}/rest/v1/flashcards?id=eq.${cardId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({ mastery_score: newScore })
        });

        return new Response(JSON.stringify({ status: "success", mastery_score: newScore }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
