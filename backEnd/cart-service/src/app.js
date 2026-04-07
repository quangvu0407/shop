import express from "express"
import cors from "cors"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"

const app = express()
const port = process.env.PORT || 3004

app.use(express.json())
app.use(cors())
app.use('/', cartRouter)

app.listen(port, () => {
  console.log("Cart service running on " + port);
});
