const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 2000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6hkmruy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const userCollection = client.db('coffeeDB').collection('user');

    // Coffee APIs
    app.get('/coffee', async(req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });
    app.post('/coffee', async(req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });
    app.put('/coffee/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedCoffeeData = req.body;
        const coffee = {
            $set: {
                name: updatedCoffeeData.name,
                quantity: updatedCoffeeData.quantity,
                supplier: updatedCoffeeData.supplier,
                taste: updatedCoffeeData.taste,
                category: updatedCoffeeData.category,
                details: updatedCoffeeData.details,
                photo: updatedCoffeeData.photo
            }
        };
        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result);
    });
    app.delete('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // User APIs
    app.get('/user', async (req, res) => {
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);
    });
    app.post('/user', async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: 'User already exists', insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
    });
    app.delete('/user/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
    });
    app.patch('/user', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = {
            $set: {
                lastLoggedAt: user.lastLoggedAt
            }
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    app.get('/', (req, res) => {
      res.send('coffee making server is running');
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.listen(port, () => {
      console.log(`coffee server is running on port: ${port}`);
    });

  } catch (error) {
    console.error("Failed to run server:", error);
  }
}
run();