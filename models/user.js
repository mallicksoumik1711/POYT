const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Multer_with_jwt_authentication');
// mongoose.connect('mongodb+srv://soumikmallick1711:Mymongodbpassword-12345@cluster0.k389e.mongodb.net/Multer_with_jwt_authentication')
//     .then(() => console.log('MongoDB connected successfully'))
//     .catch(err => console.error('MongoDB connection error:', err));

let userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    confirm_password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ],
    profilepic: {
        type: String,
        default: 'default.avif'
    }
})

module.exports = mongoose.model('user', userSchema);