const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema= new Schema({
  title:{
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  imageUrl:{
    type: String,
    required: true
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User',  // RELATION SETUP
    required: true
  }
});

module.exports = mongoose.model('Product',productSchema);
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;   // TO CONNECT THE DATABASE
// class Product{
//     constructor(title,price,description,imageUrl,id,userId){
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id= id ?new mongodb.ObjectId(id):null;
//         this.userId = userId;
//     }
//     save(){  // CONNECT TO MONGODB
//         const db = getDb(); // Get access to the database
//         let dbop;
//         if(this._id){
//           dbop=db.collection('products')
//           .updateOne({_id: (this._id)},{$set: this});
//         }
//         else{
//           dbop=db.collection('products').insertOne(this);
//         }
//         return dbop
//         .then(result =>{
//           console.log(result);
//         })
//         .catch( err=>{
//           console.log(err);
//         });
//     }

//     static fetchAll(){
//       const db = getDb(); // Get access to the database
//       return db.collection('products').find().toArray()
//       .then(products=>{
//         console.log(products);
//         return products;
//       })
//       .catch(err=>{
//         console.log(err);
//       });
//     }

//     static findById(prodId){
//       const db = getDb(); // Get access to the database
//       return db.collection('products').find({_id: new mongodb.ObjectId(prodId)}).next()
//       .then(product=>{
//         console.log(product);
//         return product;
//       })
//       .catch(err=>{
//         console.log(err);
//       });
//     }

//     static deleteById(prodId){
//       const db = getDb(); // Get access to the database
//       return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
//       .then(result=>{
//         console.log('Deleted');
//       })
//       .catch(err=>{
//         console.log(err);
//       });
//     }
// }

// module.exports = Product;