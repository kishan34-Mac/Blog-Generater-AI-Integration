const express = require('express');
const { Readable } = require('stream');

const router = express.Router();

const getSupabaseUrl = () => {
    return (
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        process.env.SUPABASE_PROJECT_URL ||
        ''
    ).trim().replace(/\/+$/, '');
};

const getSupabaseKey = () => {
    return (
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.VITE_SUPABASE_KEY ||
        ''
    ).trim();
};

router.post('/', async (req, res) => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const supabaseKey = getSupabaseKey();

        if (!supabaseUrl || !supabaseKey) {
            return res
                .status(500)
                .json({ error: 'Supabase function configuration missing on backend' });
        }

        const functionUrl = `${supabaseUrl}/functions/v1/generate-blog`;
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).send(text);
        }

        response.headers.forEach((value, name) => {
            if (name.toLowerCase() === 'transfer-encoding') return;
            res.setHeader(name, value);
        });
        res.status(response.status);

        if (!response.body) {
            return res.end();
        }

        const nodeStream = Readable.fromWeb(response.body);
        nodeStream.pipe(res);
    } catch (error) {
        console.error('Backend generate proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy generate request' });
    }
});

module.exports = router;
