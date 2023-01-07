const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;



router.all('/*',(req,res,next)=>{
    req.app.locals.layout ='home';
    next();
});

router.get('/',(req,res)=>{

   //session 

    // req.session.rishi ='rishi raj';

    // if(req.session.rishi){
    //     console.log(`we found a session ${req.session.rishi}`);
    // }

    const perPage = 10;
    const page = req.query.page || 1;



    Post.find({})
    .skip((perPage*page)-perPage)
    .limit(perPage)
    .populate('user')
    .then(posts=>{
        Post.count({}).then(postCount=>{
            
            
        Category.find({})
        .then(categories=>{
            res.render('home/index',{
                posts:posts, 
                categories:categories,
                current:parseInt(page),
                pages:Math.ceil(postCount/perPage),
            });
        });
        });
    });
});

router.get('/about',(req,res)=>{
    res.render('home/about');
});

router.get('/login',(req,res)=>{
    res.render('home/login');
});

//app login ||  authentication

passport.use(new LocalStrategy({
    usernameField:'email'},(email,password,done)=>{
        User.findOne({email: email}).then(user=>{
            if(!user) return done(null, false, {message: 'User not found. Please register to continue.'})
        
            bcrypt.compare(password,user.password,(err, matched)=>{
                if(err) throw err;
                if(matched){
                    return done(null, user)
                }else{
                    return done(null, false ,{message: 'Incorrect Password!'})
                }   
            });

        });
    
}));



router.post('/login',(req,res,next)=>{

    passport.authenticate('local' ,{
       successRedirect:'/admin',
       failureRedirect: '/login',
       failureFlash:true,  
    })(req,res,next);
});

//logout 

router.get('/logout' ,(req,res)=>{
        req.logout(err=>{
            if(err) return err;
            res.redirect('/login');
        });   
});


//get request 

router.get('/register',(req,res)=>{
    res.render('home/register');
});

router.post('/register',(req,res)=>{

    let errors = [];

    //validation of fields or requirement
        if (!req.body.firstName) {
            errors.push({ message: 'please add a first name' });
        }
        
        if (!req.body.lastName) {
            errors.push({ message: 'please add a second name' });
        }
        if (!req.body.email) {
            errors.push({ message: 'please add a email' });
        }
        if (!req.body.password ){
            errors.push({ message: 'please add a password' });
        }
        if (!req.body.passwordConfirm) {
            errors.push({ message: 'please confirm your password' });
        }
        if (req.body.password !==req.body.passwordConfirm) {
            errors.push({ message: 'password fields doesnt match' });
        }


        if (errors.length > 0) {
            res.render('home/register', {
                errors: errors,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,

            })
        }else{

            User.findOne({email:req.body.email}).then(user=>{
                if(user){
                        req.flash('error_message', 'Entered Email already exist. Please login to continue.');
                        res.redirect('/login');

                }else{
                    const newUser = new User({

                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: req.body.password,
                    });
        
                    bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newUser.password,salt,(err,hash)=>{
                            newUser.password =hash;
                            newUser.save().then(savedUser=>{
        
                                req.flash('success_message' , 'Registered Successfully, Please login to Continue.');
                                res.redirect('/login');
                            });
                        });
                    });
           
                }
            });
  
        }
});

router.get('/post/:slug',(req,res)=>{
    Post.findOne({slug: req.params.slug})
    .populate({path: 'comments', populate: {path: 'user',model: 'users'}})
    .populate('user')
    .then(post=>{
        Category.find({}).then(categories=>{
        res.render('home/post',{post:post, categories:categories});
     });
   });
});


module.exports = router;
