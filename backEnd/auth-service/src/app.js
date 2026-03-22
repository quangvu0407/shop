import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"

import userRouter from "./routes/userRoute.js"
import adminRouter from "./routes/adminRoute.js"

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use(cors())

app.use('/', userRouter)
app.use('/', adminRouter)

const start = async () => {
  try {
    await connectDB()
    app.listen(port, () => {
      console.log('Auth service running on ' + port)
    })
  } catch (err) {
    console.error('Auth service failed to start:', err)
    process.exit(1)
  }
}

start()