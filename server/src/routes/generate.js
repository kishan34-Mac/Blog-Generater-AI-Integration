const express = require('express');
const router = express.Router();

// 🔥 Simple blog generator (replace later with AI API)
router.post('/', async (req, res) => {
    try {
        const { topic, tone, words } = req.body;

        // ✅ Validation
        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        // ✅ Generate blog (dummy logic for now)
        const blog = `
📝 Blog Topic: ${topic}

Tone: ${tone || "Informative"}
Length: ${words || 500} words

---

${topic} is an important subject in today’s world. In this blog, we explore key aspects of ${topic} in a ${tone || "clear and informative"} manner.

1. Introduction  
${topic} has gained significant attention due to its impact and relevance.

2. Key Insights  
Understanding ${topic} helps individuals and businesses make better decisions.

3. Conclusion  
In conclusion, ${topic} continues to evolve and plays a vital role in modern development.

---

✨ This is a sample generated blog. Integrate AI API for real content.
`;

        res.json({
            success: true,
            blog
        });

    } catch (error) {
        console.error("🔥 Generate Error:", error);
        res.status(500).json({ error: "Failed to generate blog" });
    }
});

module.exports = router;