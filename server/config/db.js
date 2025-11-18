import mongoose from 'mongoose'
import { env } from './env.js'

export const connectDb = async () => {
    const mongoUrl = `mongodb://localhost:27017/${env.DB_NAME}`
    await mongoose.connect(mongoUrl)
}

export const disconnectDb = async () => {
    await mongoose.disconnect()
}