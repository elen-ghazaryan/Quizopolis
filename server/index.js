import express from "express"
import cors from "cors"
import { authRouter } from "./routes/auth.js"
import { env } from "./config/env.js"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true 

}))

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())




app.use("/auth", authRouter)


app.listen(4002, () => console.log("http://localhost:4002"))