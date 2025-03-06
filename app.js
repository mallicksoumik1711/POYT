    const express = require('express');
    const app = express();
    const path = require('path');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const cookieParser = require('cookie-parser');
    const upload = require('./configs/multerconfig');

    const userModel = require('./models/user');
    const postModel = require('./models/post');

    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser());

    // for basic working of forms
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    // all get routes or routes for rendering...

    app.get('/', function(req, res){
        res.render('frontPage');
    })

    app.get('/registration', function(req, res){
        res.render('index');
    })

    app.get('/login', function(req, res){
        res.render('login');
    })

    app.get('/profile', isLoggedIn, async function(req, res){
        let user = await userModel.findOne({email: req.user.email}).populate('posts');
        res.render('profile', {user});
    })

    app.get('/uploadProfilePic', isLoggedIn, function(req, res){
        res.render('uploadProfilePic');
    })

    app.get('/all-posts', isLoggedIn, async function(req, res){
        let user = await userModel.findOne({email: req.user.email}).populate('posts');
        res.render('allPostsOfUser', {user});
    })

    app.get('/like/:id', isLoggedIn, async function(req, res){
        let user = await userModel.findOne({email: req.user.email});
        let post = await postModel.findOne({_id: req.params.id}).populate('user');

        if(post.likes.indexOf(user._id) === -1){
            post.likes.push(user._id);
        }
        else{
            post.likes.splice(post.likes.indexOf(user._id), 1);
        }
        await post.save();
        res.redirect('/all-posts');
    })

    app.get('/edit/:id', isLoggedIn, async function(req, res){
        let user = await userModel.findOne({email: req.user.email});
        let post = await postModel.findOne({_id: req.params.id});
        res.render('edit', {post, user});
    })

    app.get('/delete/:id', isLoggedIn, async function(req, res){
        let deletedPost = await postModel.findOneAndDelete({_id: req.params.id});
        res.redirect('/all-posts');
    })

    // All post routes for forms
    app.post('/register', async function(req, res){
        let {name, email, password, confirm_password} = req.body;

        if(!name || !email || !password || !confirm_password){
            return res.redirect('/');
        }

        let user = await userModel.findOne({email});
        if(user){
            return res.send('User already exists, try another email');
        }

        if(password != confirm_password){
            return res.send('password is different in both fields');
        }

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(password, salt, async function(err, hash){
                // create your user here...
                let user = await userModel.create({
                    name,
                    email,
                    password: hash,
                    confirm_password: hash
                })

                let token = jwt.sign({email: email, userId: user._id}, 'secretKeithishineedtbtakecare');
                res.cookie('token', token);
                res.redirect('/login');
            })
        })
    })

    app.post('/login', async function(req, res){
        let {email, password} = req.body;

        let user = await userModel.findOne({email});
        if(!user){
            return res.send('there is no user with email -> ' + email);
        }

        bcrypt.compare(password, user.password, function(err, result){
            if(result){
                let token = jwt.sign({email: email, userId: user._id}, 'secretKeithishineedtbtakecare');
                res.cookie('token', token);
                res.redirect('/profile');
            }
            else{
                // return res.send('user cannot login as password is wrong...');
                res.redirect('/login');
            }
        })
    })

    app.post('/create-post', isLoggedIn, upload.single('userSubmittedImage'), async function(req, res){
        // let {content, userSubmittedImage} = req.body; this will not work as image is obtained from multer so req.body is undefined 
        // console.log("Body:", req.body);
        // console.log("File:", req.file);

        if(!req.body.content || !req.file){
            return res.send('details missing');
        }

        let user = await userModel.findOne({email: req.user.email});
        let post = await postModel.create({
            content: req.body.content,
            userSubmittedImage: req.file.filename,
            user: user._id,
        })

        user.posts.push(post._id);
        await user.save();
        res.redirect('/all-posts');
    })

    app.post('/update-post/:id', isLoggedIn, upload.single('userSubmittedImage'), async function(req, res){
        // console.log(req.body);
        // console.log(req.file);
        if(!req.body || !req.file){
            return res.send('Details Missing');
        }
        
        let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content, userSubmittedImage: req.file.filename});
        res.redirect('/all-posts');
    })

    app.post('/upload-profile-picture', isLoggedIn, upload.single('profile_picture'), async function(req, res){
        let user = await userModel.findOne({email: req.user.email});
        if(!req.file){
            return res.send('No photo choosen');
        }
        user.profilepic = req.file.filename;
        await user.save();
        res.redirect('/profile');
        // console.log(req.file);
    })

    // logout route
    app.get('/logout', function(req, res){
        res.cookie('token', '');
        res.redirect('/login');
    })

    // protected route
    function isLoggedIn(req, res, next){
        if(req.cookies.token === ''){
            return res.send('user needs to be logged in first');
        }
        else{
            let data = jwt.verify(req.cookies.token, 'secretKeithishineedtbtakecare');
            req.user = data;
        }
        next();
    }

    // port name
    app.listen(3000, function(err){
        console.log('running....');
    })