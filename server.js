const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

// const mysql = require('mysql');
// const { Pool } = require('pg');
const mongoose = require('mongoose')

const cors = require("cors");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors());;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user:process.env.DB_USERNAME,
//     password:process.env.DB_PASSWORD,
//     database:process.env.DB_DBNAME
// });


// app.get("/", (req, res) => {
//     const sql = "SELECT * FROM `details`";
//     db.query(sql, (err, results) => {
//         if (err) return res.json(err);
//         if (results.length > 0) {
//             return res.json(results);
//         } else {
//             return res.json("Failed");
//         }
//     });
// });


// Create a PostgreSQL pool connection
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DBNAME,
//     port: process.env.DB_PORT,
//     ssl: {
//       require: true,
//     },
//     connectionTimeoutMillis: 30000, // 30 seconds
//     idleTimeoutMillis: 30000, // 30 seconds
//   });

// pool.connect((err) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log('Connected to database');
// });
  



//Create mongoosedb atlas connection
const connectDB = async ()=>{
  try{
    await mongoose.connect(process.env.MONGOBD_CONNECT_URL)
    console.log("Connect to MongoDB successfully")
  }catch(error){
    console.log(`Connection failed: ${error.message} `)
  }
}

connectDB()





// Define a Mongoose schema and model for contacts
const detailSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  access_number: String,
});

// Define a Mongoose schema and model for contacts
const contactsSchema = new mongoose.Schema({
  fullName: String,
  userName: String,
  phone: String,
  email: String,
  password: String,
  address: String,
  role: String,
});



const Detail = mongoose.model('vcards', detailSchema, 'details');
const Contacts = mongoose.model('cards',contactsSchema,'contacts')

//Get Request
// Test endpoint
app.get('/', async (req, res) => {
  try {
    const results = await Detail.find();
    console.log(results)
    res.json(results)
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

app.get('/contacts', async (req,res) =>{
  try{
    const results = await Contacts.find()
    console.log(results)
    res.json(results)
  }catch(err){
      console.log(err)
      res.status(500).json(err)
  }
})



//POST Request
app.post('/', async (req, res) => {
  try {
    const results = await Detail.create();
    console.log(results)
    res.json(results)
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

app.post('/add', async (req, res) => {
  try {
    const { name, email, phone, address, access_number } = req.body;
    const newDetail = new Detail({
      name,
      email,
      phone,
      address,
      access_number,
    });
    const savedDetail = await newDetail.save();
    console.log(savedDetail);
    res.status(201).json(savedDetail);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.post('/newContacts',async (req,res)=>{
  try{
    const{fullName,userName,phone, email,password,address,role} = req.body

    const hashedPassword = await bcrypt.hash(password,13)

    const newContacts = new Contacts({
      fullName,
      userName,
      phone,
      email,
      password: hashedPassword,
      address,
      role
    })

    const savedResults = await newContacts.save()
    console.log(savedResults)
    res.status(201).json(savedResults)
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }
})


  // Test endpointz
  // app.get('/', async (req, res) => {
  //   try {
  //     const results = await pool.query('SELECT * FROM contacts');
  //     if (results.rows.length > 0) {
  //       res.json(results.rows);
  //     } else {
  //       res.json('Failed');
  //     }
  //   } catch (err) {
  //     res.json(err);
  //   }
  // });

const PORT = process.env.PORT||3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});