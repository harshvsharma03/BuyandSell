const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
  );

module.exports = class Cart{
    static addProduct(id,prodPrice){
        fs.readFile(p,(err,fileContent)=>{
            let cart = {products: [], totalPrice: 0};
            if(!err){
                cart = JSON.parse(fileContent);
            }
            
            // Analysing the cart > find if the added product already exists
            const existingProductIndex = cart.products.findIndex(prod=>prod.id===id);
            const existingProduct = cart.products[existingProductIndex];

            let updatedProduct;
            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty+1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct; 
            }
            else{
                updatedProduct = {id: id, qty: 1};
                cart.products = [...cart.products,updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +prodPrice;
            fs.writeFile(p,JSON.stringify(cart),(err)=>{
                console.log(err);
            })
        })
    }

    static deleteProduct(id,prodPrice){
        fs.readFile(p,(err,fileContent)=>{
            if(err){return;}
            const updatedCart = {...JSON.parse(fileContent)};
            const product = updatedCart.products.find(prod=> prod.id===id);
            if(!product){return;}
            const prodQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod=>prod.id!==id)

            updatedCart.totalPrice = updatedCart.totalPrice - prodPrice*prodQty;
            fs.writeFile(p,JSON.stringify(updatedCart),err=>{console.log(err);});
        });
    }

    static getCart(cb){
        fs.readFile(p,(err,fileContent)=>{
            const cart = JSON.parse(fileContent);
            if(err){cb(null);}
            else{cb(cart);}
        });
    }
}