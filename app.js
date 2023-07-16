const http = require('http');  // CORE MODULE
const path = require('path');  // ""

const express= require('express');             //
const bodyParser = require('body-parser');     // THIRD PARTY MODULE
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore=require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash=require('connect-flash');
const multer = require('multer');

const adminData = require('./routes/admin');
const shopRoute = require('./routes/shop');
const authRoute = require('./routes/auth');
const errorController = require('./controllers/404');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

//const mongoConnect = require('./util/database').mongoConnect; 
const User = require('./models/user');

const MONGODB_URI= 'mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.fajcusn.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}';
// `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.fajcusn.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
// mongodb+srv://harshvardhansharma:124925@cluster0.fajcusn.mongodb.net/
const app = express();
const store=new MongoDBStore({
    uri:MONGODB_URI,
    collection: 'sessions'
})

const csrfProtection=csrf(); 
const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
       cb(null, 'images');
    },
    filename: (req,file,cb)=>{

        cb(null, file.filename+'-'+file.originalname);  // file.filename / new Date().toISOString() REMEMBER!! 
        
    }
});

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype==='image/jpeg'){
        cb(null,true);
    }
    else{
        //console.log('been here');
        cb(null,false);
    }
    
}

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({storage:fileStorage, fileFilter: fileFilter}).single('image'));

app.use(express.static(path.join(__dirname,'public')));
app.use('/images', express.static(path.join(__dirname,'images')));  

app.use(session(
    {secret: 'my secret'
    ,resave: false
    ,saveUninitialized: false
    ,store:store}
    ));
 

app.use(flash());

app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    next();
});



app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user=>{
        if(!user){
            return next();
        }
        req.user = user;
        next();
    })
    .catch(err=>{
        next(new Error(err));
    })
});

app.post('/create-order',isAuth, shopController.postOrder);

app.use(csrfProtection);

app.use((req,res,next)=>{
    res.locals.csrfToken=req.csrfToken();
    next();
});

app.use('/admin',adminData.routes);
app.use(shopRoute);
app.use(authRoute);

app.get('/500', errorController.get500);

app.use(errorController.get404Page);

app.use((error,req,res,next)=>{
   //res.redirect('/500');
    
    res.status(500).render('500',{
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
    });
  
});

mongoose.connect(MONGODB_URI).then(
    result=>{
       app.listen(3000);
    } 
    // process.env.PORT || 
)
.catch(
    err=>{
        console.log(err);
    }
);


