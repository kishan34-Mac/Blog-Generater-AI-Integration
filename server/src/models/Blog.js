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

BlogSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
    },
});

module.exports = mongoose.model('Blog', BlogSchema);
