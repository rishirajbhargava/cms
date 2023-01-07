const express = require('express');
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const router = express.Router();
const {faker} =require('@faker-js/faker');
const {userAuthenticated} = require('../../helpers/authentication');



router.all('/*',userAuthenticated,(req,res,next)=>{
    req.app.locals.layout ='admin';
    next();
});



router.get('/',(req,res)=>{
    Post.count({}).then(postCount=>{
        Category.count({}).then(categoryCount=>{
            Comment.count({}).then(commentCount=>{
                User.count({}).then(userCount=>{

                    res.render('admin/index',{postCount:postCount,categoryCount:categoryCount, commentCount:commentCount,userCount:userCount});
                });
            });
        });
    });
});

router.post('/generate-fake-posts', (req,res)=>{

        for(let i=0;i<req.body.amount;i++){
             let post = new Post();

             post.title= faker.address.city();
             post.status='public';
             post.allowComments=0;
             post.body=faker.lorem.paragraphs();
             post.slug= faker.address.city();
            
             post.save().then(savedPost=>{});

             
            }

            res.redirect('/admin/posts');


})





module.exports = router;
