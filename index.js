const express=require('express');
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;
const app=express();
const cors=require('cors');
const port=process.env.PORT||5000;
require('dotenv').config();
// middle ware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrj86.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

 async function run(){
 try{
await client.connect();
console.log('database connected sucessfully')
const database=client.db('babyWalker');
const servicesCollection=database.collection('products');
const reviewsCollection=database.collection('reviews');
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

// Add orders Api
app.post('/orders',async(req,res)=>{
    const order=req.body;
    const result=await orderCollection.insertOne(order);
    res.json(result)
})

// Get Orders Api 
app.get('/orders',async (req,res)=>{
    const cursor=orderCollection.find({});
    const services=await cursor.toArray();
    res.send(services);
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