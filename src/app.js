import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
    await mongoClient.connect();
} catch (err) {
    console.log(err.message);
}
const db = mongoClient.db();

const app = express();
app.use(express.json());
app.use(cors());