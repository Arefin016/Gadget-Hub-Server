const express = require("express")
const app = express()
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
require("dotenv").config()
const port = process.env.PORT || 5000

//middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrdcqgm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect()

    const userCollection = client.db("gadgetHub").collection("users")
    const allCategoriesCollection = client
      .db("gadgetHub")
      .collection("AllCategories")

    // all categories
    app.get("/allCategories", async (req, res) => {
      const filter = req.query
      console.log(filter)
      const query = {}
      const options = {
        sort: {
          price: filter.sort === "asc" ? 1 : -1,
        },
      }

      // This is pagination part
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const result = await allCategoriesCollection
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray()
      res.send(result)
    })

    // reason for pagination
    app.get("/allCategoriesCount", async (req, res) => {
      const count = await allCategoriesCollection.estimatedDocumentCount()
      res.send({ count })
    })

    //specific data get from all categories
    app.get("/allCategories/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: {
          productName: 1,
          productImage: 1,
          description: 1,
          price: 1,
          category: 1,
        },
      }
      const result = await allCategoriesCollection.findOne(query, options)
      res.send(result)
    })

    //user related api
    app.post("/users", async (req, res) => {
      const user = req.body
      //insert email if user doesn't exists:
      // you can do this many ways(1. email unique, 2. upsert 3. simple checking)
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close()
  }
}
run().catch(console.dir)

app.get("/", (req, res) => {
  res.send("GadgetHub server is running")
})

app.listen(port, () => {
  console.log(`GadgetHub server is running ${port}`)
})
