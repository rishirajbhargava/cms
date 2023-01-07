const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const fs = require('fs');
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');



router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

//it will auto find index.handlebars
router.get('/', (req, res) => {
    Post.find({})
    .populate('category')
    .then(posts => {
        
        res.render('admin/posts', { posts: posts });
    });
});

router.get('/my-posts',(req,res)=>{
    Post.find({user: req.user.id})
    .populate('category')
    .then(posts => {
        
        res.render('admin/posts/my-posts', { posts: posts });
    });
});




router.get('/create', (req, res) => {

    Category.find({}).then(categories=>{
        res.render('admin/posts/create' , {categories: categories});
    });
   
});



router.post('/create', (req, res) => {

    let errors = [];

//validation of fields or requirement
    if (!req.body.title) {
        errors.push({ message: 'please add a title' });
    }
    
    if (!req.body.body) {
        errors.push({ message: 'please add a body' });
    }
    
    

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        })
    }

    else {

        let filename = '';

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + ' - ' + file.name;

            let dirName = './public/uploads/';

            file.mv(dirName + filename, (err) => {
                if (err) throw err;
            });
        }

        let allowComment = true;

        if (req.body.allowComments) {
            allowComment = true;
        }
        else {
            allowComment = false;
        }

        const newPost = new Post({
            user:req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComment,
            body: req.body.body,
            category:req.body.category,
            file: filename
            
        });


        newPost.save().then(savedPost => {
            req.flash('success_message', `Post - ${savedPost.title} was created successfully`);
            res.redirect('/admin/posts');
        }).catch(validator => {
            //validator
          //res.render('admin/posts/create', {errors: validator.errors})
        console.log(validator,  + 'could not save post');
        })

    
    }


});




router.get('/edit/:id', (req, res) => {

    Post.findOne({ _id: req.params.id }).then(post => {

        Category.find({}).then(categories=>{
            res.render('admin/posts/edit' , {categories: categories, post: post });
        });
    });

});

router.put('/edit/:id', (req, res) => {


    Post.findOne({ _id: req.params.id }).then(post => {

        let allowComment = true;

        if (req.body.allowComments) {
            allowComment = true;
        }
        else {
            allowComment = false;
        }

        post.user = req.user.id;
        post.title = req.body.title;
        post.allowComments = allowComment;
        post.status = req.body.status;
        post.body = req.body.body;
        post.category=req.body.category;
        
        
        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + ' - ' + file.name;
            post.file= filename;

            let dirName = './public/uploads/';

            file.mv(dirName + filename, (err) => {
                if (err) throw err;
            });
        }



        post.save().then(updatedPost => {
            req.flash('success_message', `Post - ${updatedPost.title} was edited successfully`);
            res.redirect('/admin/posts/my-posts');
        });

    });

});

router.delete('/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
    .populate('comments')
    .then(post => {
        
        if(post.file && post!=null){
            fs.unlink(uploadDir + post.file, (err) => { 
   
            })
        } 

        if(!post.comments.length<1){
            post.comments.forEach(comment=>{
                comment.delete();
            })
        }


        post.remove().then(postRemoved=>{
            req.flash('success_message', `Post - ${post.title} was deleted successfully`);
            res.redirect('/admin/posts/my-posts');
        });
       

    });
});



module.exports = router;