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

const countWords = (text) => {
    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
};

const buildDummyBlog = (topic, tone, wordCount) => {
    const normalizedTone = tone || 'professional';
    const title = `${topic} | AI Blog Generator`;
    const intro = `## Introduction\n\n${topic} is an important topic in today’s world. This article explains why it matters and how it can impact your audience.`;
    const sections = [
        `## Why ${topic} Matters\n\nWriting about ${topic} helps people understand its value in a practical way. Use this content to educate and inspire.`,
        `## Practical Applications\n\nThere are many practical applications for ${topic}, especially when the goal is to make content more helpful and engaging for readers.`,
        `## Common Challenges\n\nPeople often struggle with ${topic} because it can feel abstract or difficult to apply in everyday scenarios. This section breaks down the key hurdles.`,
        `## Final Thoughts\n\nA thoughtful approach to ${topic} delivers real value. This generated blog can be adapted and expanded into a full article or guide.`,
    ];
    const fillerSentences = [
        `This section expands on the topic with useful examples, keeping the tone ${normalizedTone} and easy to follow.`,
        `Use clear language and practical ideas to keep the reader engaged and informed about ${topic}.`,
        `The writing stays focused and helpful, providing actionable insights without unnecessary fluff.`,
        `Readers gain a fresh perspective on ${topic} through concise explanations and relevant examples.`,
    ];

    let content = [intro, ...sections].join("\n\n");

    while (countWords(content) < wordCount) {
        const nextSentence = fillerSentences[Math.floor(Math.random() * fillerSentences.length)];
        content += `\n\n${nextSentence}`;
    }

    return {
        title,
        meta_description: `A ${wordCount}-word article about ${topic} in a ${normalizedTone} tone.`,
        keywords: [topic, normalizedTone, 'blog writing', 'content marketing'],
        content,
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
