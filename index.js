const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 5000

//middlewares
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("GadgetHub server is running")
})

app.listen(port, () => {
  console.log(`GadgetHub server is running ${port}`)
})
