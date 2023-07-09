import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";

dotenv.config();

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
app.listen(5000);

app.get("/", async (req, res) => {
  return res.send(await db.collection("test").find().toArray());
});

const signUpSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(3),
});

app.post("/signup", async (req, res) => {

  try {
    const validation = signUpSchema.validate(req.body, { abortEarly: false });
    console.log(req.body);
    if (validation.error) {
      const errors = validation.error.details.map((detail) => detail.message);
      return res.status(422).send(errors);
    }

    let alreadyExist = await db
      .collection("users")
      .findOne({ email: req.body.email });

    if (alreadyExist) {
      return res.sendStatus(409);
    } else {
      await db.collection("users").insertOne({
        name: req.body.name,
        email: req.body.email,
        hashPassword: bcrypt.hashSync(req.body.password, 10),
      });

      return res.sendStatus(201);
    }
  } catch (error) {
    return res.sendStatus(520).send(error);
  }
});
