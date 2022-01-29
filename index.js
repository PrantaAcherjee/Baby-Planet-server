// make public
const express=require('express');
const { MongoClient } = require('mongodb');
const admin = require("firebase-admin");
const ObjectId=require('mongodb').ObjectId;
const app=express();
const cors=require('cors');
const port=process.env.PORT||5000;
require('dotenv').config();
const stripe=require('stripe')(process.env.STRIPE_SECRET)
// middle ware 
app.use(cors());
app.use(express.json());

 
const serviceAccount = require('./baby-walker-firebase-adminsdk.json');
admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrj86.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// verify token 
async function verifyToken(req,res,next){
if(req.headers?.authorization?.startsWith('Bearer ')){
    const token=req.headers.authorization.split(' ')[1];
    try{
        const decodedUser=await admin.auth().verifyIdToken(token);
        req.decodedEmail=decodedUser.email;

    }
    catch{

    }
}    
next()
}

async function run(){
try{
await client.connect();
console.log('database connected sucessfully')
const database=client.db('babyWalker');
const servicesCollection=database.collection('products');
const reviewsCollection=database.collection('reviews');
const usersCollection=database.collection('users');
const orderCollection=database.collection('orders');

// Get Api 
app.get('/products',async (req,res)=>{
    const cursor=servicesCollection.find({});
    const services=await cursor.toArray();
    res.send(services);
})
 

//Get single service
app.get('/products/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:ObjectId(id)};
    const service=await servicesCollection.findOne(query);
    res.json(service);
})

// post api 
app.post('/products',async(req,res)=>{
const service=req.body;
const result=await servicesCollection.insertOne(service)
res.json(result);
})
// save users to DB
    app.post('/users',async(req,res)=>{
    const user=req.body;
    const result=await usersCollection.insertOne(user)
    res.json(result);
})
// user upsert to DB
app.put('/users',async(req,res)=>{
const user=req.body;
const filter= {email:user.email}
const options={upsert:true}
const updateDoc={$set:user}
const result=await usersCollection.updateOne(filter,updateDoc,options)
res.json(result);
});

// make admin 
app.put('/users/admin',verifyToken, async(req,res)=>{
const user=req.body;
const requester=req.decodedEmail;
if(requester){
    const requesterAccount=await usersCollection.findOne({email:requester})
    if(requesterAccount.role==='admin'){
        const filter={email:user.email};
        const updateDoc={$set:{role:'admin'}};
        const result=await usersCollection.updateOne(filter,updateDoc)
        res.json(result);
    }
}else{
    res.status(403).json({message:'you do not have access to make an admin'})
}


})

// check is admin ?
app.get('/users/:email',async(req,res)=>{
const email=req.params.email;
const query={email:email};
const user=await usersCollection.findOne(query);
let isAdmin=false
if(user?.role==='admin'){
    isAdmin=true
}
res.json({admin:isAdmin})
})

// post reviews api 
app.post('/reviews',async(req,res)=>{
const service=req.body;
const result=await reviewsCollection.insertOne(service)
res.json(result);
})

// Get reviews Api 
app.get('/reviews',async (req,res)=>{
    const cursor=reviewsCollection.find({});
    const services=await cursor.toArray();
    res.send(services);
})
 

 //delete api
app.delete('/orders/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:ObjectId(id)};
    const result=await orderCollection.deleteOne(query);
    res.json(result);
})

 //single get orders api
 app.get('/orders/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:ObjectId(id)};
    const result=await orderCollection.findOne(query);
    res.json(result);
})

// Add orders Api
app.post('/orders',async(req,res)=>{
    const order=req.body;
    const result=await orderCollection.insertOne(order);
    res.json(result)
})

// Get Orders Api by email
app.get('/orders',async (req,res)=>{
    const email=req.query.email;
    const cursor=orderCollection.find({email});
    const order=await cursor.toArray();
    res.send(order);
})

// stripe api 
app.post('/create-payment-intent', async (req, res) =>{
const paymentInfo=req.body;
const amount=paymentInfo.price*100;
const paymentIntent=await stripe.paymentIntents.create({
currency:'usd',
amount:amount,
payment_method_types:['card']
})
res.json({
    clientSecret: paymentIntent.client_secret,
  });

})

  // update orders api when it's paid
   app.put('/orders/:id',async(req,res)=>{
     const id=req.params.id;
     const payment=req.body;
     const query={_id:ObjectId(id)};
     const updateDoc={
         $set:{
             payment:payment
         }
     }
     const result=await orderCollection.updateOne(query,updateDoc);
     res.json(result);
    })

 }
finally{
   // await client.close();
}

};
 run().catch(console.dir);

app.get('/',(req,res)=>{
     res.send('server run on')
 });
 app.listen(port,()=>{   console.log('runingggggggg',port)
});