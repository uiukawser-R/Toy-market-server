const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// 
// 






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.opp4yua.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const toysCollection = client.db('Toy_Market').collection('toys');
        const categoriesCollection = client.db('Toy_Market').collection('categories');



        app.get('/toy', async (req, res) => {
            console.log(req.query);
            const page =parseInt(req.query.page) || 0;
            const limit =parseInt(req.query.limit) || 20;
            const skip=page * limit;

            const result =await toysCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        })


        app.get('/categories', async (req, res) => {
            const cursor = categoriesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/categories/:id', async (req, res) => {
            const id = parseInt(req.params.id);
            // console.log(id);
            if (id === 1) {
                const cursor = toysCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                // const query = { categoryId: new ObjectId(id) }
                const selectedToys=await toysCollection.find({categoryId: id}).toArray();
                // const selectedToys=await toysCollection.find({ $expr: { $eq: [{ $toInt: "$categoryId" }, parseInt(id)] } }).toArray();
                res.send(selectedToys);
                // console.log(selectedToys);
            }

        })


        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const toys = await toysCollection.findOne(query);
            res.send(toys);
        })



        // adding 
        app.post('/toys', async(req,res)=>{
            const add=req.body;
            // console.log(add);
            const result =await toysCollection.insertOne(add);
            res.send(result);
        })


        // get some data by using user email 
        app.get('/toys',async(req, res)=>{
            // console.log(req.query.email);

            let query={};
            if(req.query?.email){
                query={sellerEmail : req.query.email}
            }
            const result=await toysCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/totalToys',async(req,res)=>{
            const result=await toysCollection.estimatedDocumentCount();
            res.send({totalToys: result})
        })



        // delete 
        app.delete('/toys/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId(id)}
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })

        // update 
        app.put('/toys/:id',async(req,res)=>{
            const id=req.params.id;
            const filter= {_id: new ObjectId(id)}   
            const option={upsert:true};
            const updateToy=req.body;
            const Toy={
                $set:{
                    price: updateToy.price,
                    availableQuantity: updateToy.availableQuantity,
                    toyDetails:updateToy.toyDetails
                }
            }   

            const result=await toysCollection.updateOne(filter,Toy,option);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } 
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Toy Market is running');
})



app.listen(port, () => {
    console.log(`Toy Market is running on port: ${port}`);
})