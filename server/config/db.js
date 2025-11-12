import mongoose from 'mongoose'
import { env } from './env.js'

export const connectDb = async () => {
    await mongoose.connect(`mongodb://localhost:27017/${env.DB_NAME}`)
}

export const disconnectDb = async () => {
    await mongoose.disconnect()
}