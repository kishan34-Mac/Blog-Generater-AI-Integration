import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, tone, wordCount } = await req.json();
    console.log('Generating blog with:', { topic, tone, wordCount });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    // Create the AI prompt
    const systemPrompt = `You are a professional SEO blog writer. Generate well-structured, engaging blog posts optimized for search engines.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON with NO markdown code blocks
2. Do NOT use \`\`\`json or any backticks
3. The content field must use \\n\\n for paragraph breaks (escaped newlines in JSON)
4. Ensure all quotes inside strings are properly escaped

Return this EXACT JSON structure:
{
  "title": "Engaging Title with Emoji 🚀",
  "meta_description": "SEO description under 160 characters",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "Introduction paragraph here.\\n\\n## Main Heading 📊\\n\\nParagraph content here.\\n\\n### Subheading\\n\\nMore content with **bold text** for emphasis.\\n\\n## Another Section 💡\\n\\nFinal content here."
}

Content must follow this structure:
- Opening paragraph introducing the topic
- ## Main Section Heading with Emoji
- Regular paragraphs under each heading
- ### Subheadings for detailed points
- **Bold** text for key points
- Separate all paragraphs and sections with \\n\\n
- Add relevant emojis to all headings (##, ###)
- Write ${wordCount} words in ${tone} tone
- End with strong conclusion and call-to-action`;

    const userPrompt = `Write a ${tone} blog post about "${topic}". Target word count: ${wordCount || 800} words.`;

    console.log('Calling Lovable AI...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log('Streaming AI response...');
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in generate-blog function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});