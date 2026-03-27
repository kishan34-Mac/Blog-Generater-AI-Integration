const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    tone: { type: String, default: 'professional' },
    title: { type: String, required: true },
    meta_description: { type: String },
    content: { type: String },
    keywords: { type: [String], default: [] },
    word_count: { type: Number },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', BlogSchema);
