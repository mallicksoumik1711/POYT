const mongoose = require('mongoose');

let postSchema = mongoose.Schema({
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    user: mongoose.Schema.Types.ObjectId,
    content: String,
    userSubmittedImage: String,
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('post', postSchema);