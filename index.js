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
// const orderCollection=database.collection('orders')
// Get Api 
// app.get('/products',async (req,res)=>{
//     const cursor=servicesCollection.find({});
//     const services=await cursor.toArray();
//     res.send(services);
// })

// //Get single service
// app.get('/services/:id',async(req,res)=>{
//     const id=req.params.id;
//     const query={_id:ObjectId(id)};

//     const service=await servicesCollection.findOne(query)
//     res.json(service);
// })

// post api 
app.post('/products',async(req,res)=>{

const service=req.body;
//  console.log('hit the post',service)
const result=await servicesCollection.insertOne(service)
res.json(result)
})
 //delete api
// app.delete('/services/:id',async(req,res)=>{
//     const id=req.params.id;
//     const query={_id:ObjectId(id)};
//     const result=await servicesCollection.deleteOne(query);
//     res.json(result);
// })
// // Add orders Api
// app.post('/orders',async(req,res)=>{
//     const order=req.body;
//     const result=await orderCollection.insertOne(order);
//     res.json(result)
// })

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