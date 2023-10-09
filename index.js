require("dotenv").config();
const express = require('express');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000


// middleware
app.use(express.json());
app.use(cors());

// mongodb connection
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vahgs6d.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const jewelryCollection = client.db("jewelry").collection("jewels");
    const cartCollection = client.db("jewelry").collection("carts");
    const usersCollection = client.db("jewelry").collection("users");

    // get all jewelry data
    app.get("/jewelry", async (req, res)=>{
        const query = {};
        const result = await jewelryCollection.find(query).toArray();
        res.send(result);
    });

    //get single jewelry data
    app.get("/jewelry/:id", async (req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await jewelryCollection.findOne(query);
        res.send(result);
    });

    // get all jewelry of a single user
    app.get("/my-jewelry", async (req, res)=>{
        let query = {};

        if(req.query?.email){
            query = {email: req.query.email}
        }else{
            res.status(403).send({message: "Bad request"})
        }

        const result = await jewelryCollection.find(query).toArray();
        res.send(result);
    });

    // add a jewelry
    app.post("/jewelry", async(req, res)=>{
      const data = req.body;
      const result = await jewelryCollection.insertOne(data);
      res.send(result);
    });

    // add to cart
    app.post("/cart", async (req, res)=>{
      const data = req.body;
      const query = {product_id: data.product_id}
      const findProduct = await cartCollection.findOne(query);

      if(!findProduct){
        const result = await cartCollection.insertOne(data);
        res.send(result);
      }
      
      res.send({message: "Product already exits on your cart"});
    });

    // update a product
    app.patch("/jewelry/:id", async (req, res)=>{
      const data = req.body;
      const id = req.params.id;
      console.log(data)

      const query = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          picture: data.photo,
          title: data.title,
          price: data.price,
          description: data.description
        }
      }

      const result = await jewelryCollection.updateOne(query, updateDoc)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// root route
app.get("/", (req, res)=>{
    res.send("server running");
});

app.listen(port, ()=>{
    console.log(`visit http://localhost:${port}`);
});