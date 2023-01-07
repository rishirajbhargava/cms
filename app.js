const express = require('express');
const app = express();
const path = require('path');
const exphbs= require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const {mongoDbUrl} =require('./config/database');


mongoose.set('strictQuery', true);

mongoose.connect(mongoDbUrl).then((db)=>{

        console.log('MONGO connected');

}).catch(error=>{
        console.log(error);
});



//url 27017 is not working so used 127.0.0.1 local host



//use static css/js files
app.use(express.static(path.join(__dirname,'public')));


//helpers for handlebars
const {select,generateTime , paginate} = require('./helpers/handlebars-helpers');

//set view engine
app.engine('handlebars', exphbs.engine({handlebars: allowInsecurePrototypeAccess(Handlebars),defaultLayout: 'home',helpers:{select: select,generateTime : generateTime, paginate:paginate}}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//upload middleware
app.use(upload());

//BODY parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//method override

app.use(methodOverride('_method'));

//sessions

app.use(session({
        secret:'rishirajbhargava0123',
        resave:true,
        saveUninitialized:true

}));
app.use(flash());

//serialisation of session

passport.serializeUser(function(user, done) {
  done(null,user.id)
});

passport.deserializeUser(function(id, done) {
  User.findById(id,function(err,user){
        done(null, user);
  });
});



// passport
app.use(passport.initialize());
app.use(passport.session());


//creating local variable in local app using middleware
app.use((req,res,next)=>{
        res.locals.user = req.user || null;
        res.locals.success_message = req.flash('success_message');
        res.locals.error_message = req.flash('error_message');
        res.locals.error = req.flash('error');
        next();
});


//load routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const User = require('./models/User');
const  comments = require('./routes/admin/comments');

//Middlware to use all routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);








app.listen(5550, ()=>{
        console.log(`listening on port 5550`)
});