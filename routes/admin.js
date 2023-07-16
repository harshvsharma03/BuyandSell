const http = require('http');  // CORE MODULE
const path = require('path');  // ""
const { body } = require('express-validator');

const express= require('express');             //
const bodyParser = require('body-parser');     // THIRD PARTY MODUELS 
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
//const product = [];

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProduct);

router.post('/add-product',[
    body('title')
    .isString()
    .isLength({min:3})
    .trim(),
    // body('imageUrl')
    // .isURL(),
    body('price')
    .isFloat(),
    body('description')
    .isLength({min:5,max:400})
    .trim()            
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',[
    body('title')
    .isString()
    .isLength({min:3})
    .trim(),
    // body('imageUrl')
    // .isURL(),
    body('price')
    .isFloat(),
    body('description')
    .isLength({min:5,max:400})
    .trim()            
], isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

exports.routes = router;

//exports.prod = product;