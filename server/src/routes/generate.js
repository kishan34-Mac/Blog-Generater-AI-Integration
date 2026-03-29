const express = require('express');
const router = express.Router();

const LOVABLE_API_KEY =
    process.env.LOVABLE_API_KEY ||
    process.env.LOVABLE_KEY ||
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY;
const AI_ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const parseJsonFromText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    if (!jsonMatch) return null;

    try {
        return JSON.parse(jsonMatch[0]);
    } catch {
        return null;
    }
};

const buildDummyBlog = (topic, tone, wordCount) => {
    const title = `${topic} | AI Blog Generator`;
    return {
        title,
        meta_description: `A generated article about ${topic} in a ${tone || 'professional'} tone.`,
        keywords: [topic, tone || 'professional', 'blog writing', 'content marketing'],
        content: `## Introduction\\n\\n${topic} is an important topic in today’s world. This article explains why it matters and how it can impact your audience.\\n\\n## Why ${topic} Matters\\n\\nWriting about ${topic} helps people understand its value in a practical way. Use this content to educate and inspire.\\n\\n## Main Takeaways\\n\\n- Focus on clarity and structure.\\n- Keep your sentences concise.\\n- Use examples when possible.\\n\\n## Conclusion\\n\\nIn conclusion, ${topic} is a powerful subject that deserves attention. This generated blog can be used as a starting point for your final article.`,
    };
};

router.post('/', async (req, res) => {
    try {
        const { topic, tone, wordCount } = req.body;
        if (!topic || !topic.trim()) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const normalizedTone = tone || 'professional';
        const normalizedWordCount = Number(wordCount) || 800;

        if (LOVABLE_API_KEY) {
            const systemPrompt = `You are a professional blog writer and SEO expert. Return ONLY valid JSON. Do NOT include markdown code fences. Use escaped newlines (\\n\\n) for paragraphs. Return EXACT JSON with keys title, meta_description, keywords, and content.`;
            const userPrompt = `Create a ${normalizedTone} blog post about "${topic}" with approximately ${normalizedWordCount} words. Respond with valid JSON only.`;

            const response = await fetch(AI_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${LOVABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    max_tokens: 1400,
                    temperature: 0.7,
                    stream: false,
                }),
            });

            const payload = await response.json();
            if (!response.ok) {
                const error = payload?.error?.message || payload?.error || 'AI generation failed';
                return res.status(response.status).json({ error });
            }

            const content =
                payload?.choices?.[0]?.message?.content ||
                payload?.choices?.[0]?.delta?.content ||
                '';
            const parsed = parseJsonFromText(content) ||
                (typeof content === 'string' ? (() => {
                    try {
                        return JSON.parse(content);
                    } catch {
                        return null;
                    }
                })() : null);

            if (parsed && parsed.title && parsed.content) {
                return res.json({
                    title: parsed.title,
                    meta_description: parsed.meta_description || parsed.description || `A generated article about ${topic}`,
                    keywords: parsed.keywords || [],
                    content: parsed.content,
                });
            }

            return res.json({
                title: `Blog about ${topic}`,
                meta_description: `A generated blog post about ${topic}.`,
                keywords: [],
                content: content || `A blog post about ${topic}.`,
            });
        }

        const blog = buildDummyBlog(topic, normalizedTone, normalizedWordCount);
        return res.json(blog);
    } catch (error) {
        console.error('Generate API error:', error);
        return res.status(500).json({ error: 'Failed to generate blog' });
    }
});

module.exports = router;
