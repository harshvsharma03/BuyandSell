const { validationResult } = require('express-validator');
const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (req,res,next)=>{
    //res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><button type="submit">ADD PRODUCT</button></form>')
    
    res.render('admin/edit-product',{
     pageTitle: 'Add Product'
    ,path:'/admin/add-product'
    , editing: false
    , hasError: false
    , errorMessage: null
    , validationErrors:[]
    });
};

exports.postAddProduct = (req,res,next)=>{
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if(!image){
        return res.status(422).render('admin/edit-product',{
            pageTitle: 'Add Product'
            ,path:'/admin/add-product'
            ,formsCSS: true
            ,productCSS: true
            , activeAddProduct: true
            , editing: false
            , hasError: true
            , product: {
                title: title,
                price: price,
                description: description
            }
            , errorMessage: 'Attached file is not an image'
            , validationErrors: []
          });
    }
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(422).render('admin/edit-product',{
        pageTitle: 'Add Product'
        ,path:'/admin/add-product'
        ,formsCSS: true
        ,productCSS: true
        , activeAddProduct: true
        , editing: false
        , hasError: true
        , product: {
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description
        }
        , errorMessage: errors.array()[0].msg
        , validationErrors: errors.array()
      });
    }

    const imageUrl = image.path;

    const prod = new Product({
        title:title,
        price:price,
        description:description,
        imageUrl:imageUrl,
        userId: req.user
    });
    prod.save()
    .then(result =>{
        console.log("Create Product");
        res.redirect('/admin/products');
    })
    .catch(err =>{
        // return res.status(500).render('admin/edit-product',{
        //     pageTitle: 'Add Product'
        //     ,path:'/admin/add-product'
        //     ,formsCSS: true
        //     ,productCSS: true
        //     , activeAddProduct: true
        //     , editing: false
        //     , hasError: true
        //     , product: {
        //         title: title,
        //         imageUrl: imageUrl,
        //         price: price,
        //         description: description
        //     }
        //     , errorMessage: 'Database operations failed, please try again'
        //     , validationErrors: []      
        //   });
        //res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);

    });
};

exports.getEditProduct = (req,res,next)=>{
    const editMode = req.query.edit;
    if(!editMode){res.redirect('/');}
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product=>{
    if(!product){return res.redirect('/');}
    res.render('admin/edit-product',{pageTitle: 'Edit Product'
    ,path:'/admin/edit-product'
    ,formsCSS: true
    ,productCSS: true
    , activeAddProduct: true
    , editing: editMode
    , product: product
    , hasError: false 
    , errorMessage: null
    , validationErrors: []
});
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);
    });
};

exports.postEditProduct = (req,res,next)=>{
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(422).render('admin/edit-product',{
        pageTitle: 'Edit Product'
        ,path:'/admin/edit-product'
        ,formsCSS: true
        ,productCSS: true
        , activeAddProduct: true
        , editing: true
        , hasError: true
        , product: {
            title: updatedTitle,
            price: updatedPrice,
            description: updatedDesc,
            _id: prodId
        }
        , errorMessage: errors.array()[0].msg
        , validationErrors: errors.array()
      });
    }

    Product.findById(prodId).then(product=>{
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price=updatedPrice;
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl=image.path;
        }
        
        product.description=updatedDesc;
        return product.save()
        .then(
            result=>{
                console.log('Updated')
                res.redirect('/admin/products');
            }
        );
    })
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);
    });
};

exports.getProduct = (req,res,next)=>{
     Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId','name')
    .then(
        (product)=>{
            console.log(product);
            res.render('admin/products',{prods: product,
                pageTitle: 'Admin Products',
                path:'/admin/products',
                hasProducts: product.length>0,
                activeShop: true,
                productCSS: true,
            //    isAuthenticated: req.session.isLoggedIn
            });
        }
    )
    .catch(err=>{
        const error = new Error(err);
        error.httpStatusCode=500;
        return next(error);
    });
};

exports.deleteProduct = (req,res,next)=>{
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product=>{
        if(!product){
            return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id:prodId,userId:req.user._id})
    })
    .then(()=>{
        console.log('Deleted Product');
        //res.redirect('/admin/products');
        res.status(200).json({message:'Success!'});
    })
    .catch(err=>{
        res.status(500).json({message:'Deleting product failed.'});
    });
};