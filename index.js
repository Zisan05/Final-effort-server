const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middle wire
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a3cooza.mongodb.net/?retryWrites=true&w=majority`;

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


    // Collections
    const PostCollection = client.db("Final-Effort").collection('Posts');
    const commentsCollection = client.db("Final-Effort").collection('Comments');
    const userCollection = client.db("Final-Effort").collection('Users');
    const announcesCollection = client.db("Final-Effort").collection('announces');

    // Posts

    app.get('/postsCount',async(req,res) => {
      const count = await PostCollection.estimatedDocumentCount();
      res.send({count});
    })

    app.post('/posts',async(req,res) => {
      const newpost = req.body;
      
      const result = await PostCollection.insertOne(newpost);
      res.send(result);
  })

   app.get('/posts',async(req,res) => {
    const filter = req.query;
    const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
    const query = {};
    const options = {
      sort: {
        upVoteCount: filter.sort === 'asc' ? 1 : -1
      }
    }
    const cursor = PostCollection.find(query,options);
    const result = await cursor
    .skip(page * size)
      .limit(size)
    .toArray();
    res.send(result);
   })

   app.get('/posts/:id',async(req,res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
     const result = await PostCollection.findOne(query);
     res.send(result);
   });

   app.delete('/posts/:id',async(req,res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await PostCollection.deleteOne(query);
    res.send(result);
   });

   app.put('/posts/:id',async(req,res) => {
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)};
    const updated = req.body;
      const markUpdate = {
        $set: {
        upVoteCount: updated.upVoteCount,
        downVoteCount: updated.downVoteCount,
         
        }
      } 
      const result = await PostCollection.updateOne(filter,markUpdate);
      res.send(result);
     
   })

//    Comments

app.get('/comments',async(req,res) => {
    const cursor = commentsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
   })

  

   app.post('/comments',async(req,res) => {
    const newComment = req.body;
    
    const result = await commentsCollection.insertOne(newComment);
    res.send(result);
})


// Users
  app.post('/users',async(req,res) => {
   const newUser = req.body;
   const result = await userCollection.insertOne(newUser);
   res.send(result);
  })

  app.get('/users',async(req,res) => {
    const cursor = userCollection.find();
    const result = await cursor.toArray();
    res.send(result);
   })

   app.get('/users/:id',async(req,res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
     const result = await userCollection.findOne(query);
     res.send(result);
   });

   app.put('/users/:id',async(req,res) => {
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)};
    const updated = req.body;
      const updatedAssignment = {
        $set: {
          role: "admin",
        }
      } 
      const result = await userCollection.updateOne(filter,updatedAssignment);
      res.send(result);
     
   })

  //  announces 

  app.post('/announces',async(req,res) => {
    const newAnnounces = req.body;
    const result = await announcesCollection.insertOne(newAnnounces);
    res.send(result);
   })

   app.get('/announces',async(req,res) => {
    const cursor = announcesCollection.find();
    const result = await cursor.toArray();
    res.send(result);
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



app.get('/',(req,res) => {
    res.send("server is running successfully")
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
} )
