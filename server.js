const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

// const mysql = require('mysql');
// const { Pool } = require('pg');
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const vCardsJS = require('vcards-js')
// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors());
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
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOBD_CONNECT_URL);
    console.log("Connect to MongoDB successfully");
  } catch (error) {
    console.log(`Connection failed: ${error.message} `);
  }
};

connectDB();

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

const Detail = mongoose.model("vcards", detailSchema, "details");
const Contacts = mongoose.model("cards", contactsSchema, "contacts");

//Get Request

//Api to get all Details in the details table
// Test endpoint
app.get("/", async (req, res) => {
  try {
    const results = await Detail.find();
    console.log(results);
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//Api to get all Contacts in the contacts table
app.get("/contacts", async (req, res) => {
  try {
    const results = await Contacts.find({},`-password -userName`);
    console.log(results);
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.get('/contacts/:userName',async (req,res)=>{
  try{
     userName = req.params.userName
    const results = await Contacts.find({ userName },'-password')

    if(!results){
      return res.status(400).json("User not found" ); 
    }
    
    console.log(results)
    res.json(results)
  }catch(err){
    console.log(err);
    res.status(500).json(err);
  }
})

//Api to download contact details as a vcard

app.get('/qr-redirect/:username', async (req, res) => {
  const userAgent = req.headers['user-agent'];
  const userName = req.params.username;

  try {
    const contact = await Contacts.findOne({ userName });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Create a vCard
    const vCard = vCardsJS();
    vCard.firstName = contact.fullName;
    vCard.cellPhone = contact.phone;
    vCard.email = contact.email;
    vCard.workAddress = contact.address;
    vCard.title = contact.role;

    const vCardString = vCard.getFormattedString();

    if (/iphone|ipad/i.test(userAgent)) {
      // User agent indicates an iPhone
      res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename=${contact.fullName}.vcf`);
      res.send(vCardString);
    } else if (/android/i.test(userAgent)) {
      // User agent indicates an Android phone
      // const vCardUri = encodeURIComponent(vCardString);
      // const intentUri = `intent://create_contact/#Intent;scheme=data;action=android.intent.action.INSERT;type=text/x-vcard;S.vcard=${vCardUri};end`;
      
const formHtml2=`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
  <title>Add Contact</title>

<style>
    body{
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    form{
        box-shadow: 0px 1px 7px 5px  rgb(212, 211, 211);
        padding: 0.5rem;
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top:1rem ;
    }

.box{
    background-color: rgb(218, 214, 214);
    border-radius: 5rem;
    padding: 0.5rem;

}

.box>a{
    color: black;
}

.box a>span{
    font-size: 2.2rem;
}
.contact-pic, .second-box{
    display: flex;
    justify-content: center;
}

.contact-pic>span{
    font-size: 15rem;
}

.address{
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    font-size: 1.2rem;
    gap: 0.5rem;
}

.address a, .details span{
    color: rgb(0, 60, 255);
}

.details{
    display: flex;
    gap: 1rem;
    font-size: 1.2rem;
}

section{
    width: 40%;
}

.upper-box{
    box-shadow: 0px 1px 7px 5px  rgb(212, 211, 211);
    padding-bottom: 1rem;
}


.btn{
    padding: 1rem;
    width: 10rem;
}
</style>
  </style>

</head>
<body>

<section>


    <div class="upper-box">
        
            <div class="contact-pic">
            <span class="material-symbols-outlined">person</span>
            </div>

    <div class="second-box">
        <div class="details">
            <label for="name">${contact.fullName}</label>
            <label for="address">Role: <span>${contact.role}</span></label>
        </div>

        </div>
        

        <div class="address">
                <span for="address">Address:</span>
               <a href="geo:0,0?q=${encodeURIComponent(contact.address)}">${contact.address}</a>
        </div>
        

    </div>
  

<form id="contact-form">

      <div class="box">
        <a href="tel:${contact.phone}"><span class="material-symbols-outlined">call</span></a><br>
    </div>

    <div class="box">
        <a href="mailto:${contact.email}"><span class="material-symbols-outlined">mail</span></a><br>
    </div>
  
   
</form>
</section>

<p>Or click below to download:</p>

  <div class="download">
 <button class="btn" type="button">Add to contacts</button>
  </div>

  <p id="instructions" style="display: none;">The vCard has been downloaded. Please open it from your downloads folder to add it to your contacts.</p>

    <script>
          document.querySelector(".btn").addEventListener("click", function() {
            const vCardData = \`${vCardString}\`;
            const blob = new Blob([vCardData], { type: 'text/vcard' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = '${contact.fullName}.vcf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            // Show instructions to the user
            document.getElementById('instructions').style.display = 'block';
          });
        </script>
      </body>
      </html>

</body>

`


      // const formHtml = `
      // <!DOCTYPE html>
      // <html lang="en">
      // <head>
      //   <meta charset="UTF-8">
      //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //   <title>Add Contact</title>
      // </head>
      // <body>
      //   <h1>Add Contact</h1>
      //   <form id="contact-form">
      //     <label for="name">Name:</label><br>
      //     <a href="mailto:${contact.email}">${contact.fullName}</a><br>
      //     <label for="phone">Phone:</label><br>
      //     <a href="tel:${contact.phone}">${contact.phone}</a><br>
      //     <label for="email">Email:</label><br>
      //     <a href="mailto:${contact.email}">${contact.email}</a><br>
      //     <label for="address">Address:</label><br>
      //     <a href="geo:0,0?q=${encodeURIComponent(contact.address)}">${contact.address}</a><br>
      //     <label for="role">Role:</label><br>
      //     <a href="#">${contact.role}</a><br><br>
      //     <button class="btn" type="button">Add to contacts</button>
      //     <br><br>
      //     <p id="instructions" style="display: none;">The vCard has been downloaded. Please open it from your downloads folder to add it to your contacts.</p>
      //   </form>

      //   <script>
      //     document.querySelector(".btn").addEventListener("click", function() {
      //       const vCardData = \`${vCardString}\`;
      //       const blob = new Blob([vCardData], { type: 'text/vcard' });
      //       const url = window.URL.createObjectURL(blob);
      //       const a = document.createElement('a');
      //       a.style.display = 'none';
      //       a.href = url;
      //       a.download = '${contact.fullName}.vcf';
      //       document.body.appendChild(a);
      //       a.click();
      //       window.URL.revokeObjectURL(url);

      //       // Show instructions to the user
      //       document.getElementById('instructions').style.display = 'block';
      //     });
      //   </script>
      // </body>
      // </html>
      // `;
    res.send(formHtml2);

      // res.send(intentUri);
    } else {
      // User agent indicates a sensor or other device
      res.json(contact ? true : false);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/qr-redirect/:username', async (req, res) => {
//   const userAgent = req.headers['user-agent'];
//   const userName = req.params.username;

// if (/mobile|iphone|ipad/i.test(userAgent)) {
//   // User agent indicates a phone
//   try {
//     const contact = await Contacts.findOne({ userName });
  
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     // Create a vCard
//     const vCard = vCardsJS();
//     vCard.firstName = contact.fullName;
//     vCard.cellPhone = contact.phone;
//     vCard.email = contact.email;
//     vCard.workAddress = contact.address;
//     vCard.title = contact.role;

//     // Set the headers for vCard download
//     res.setHeader('Content-Type', 'text/plain; charset=utf-8');
//     // res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
//     res.setHeader('Content-Disposition', `inline; filename=${contact.fullName}.vcf`);
//     // res.setHeader('Content-Disposition', `attachment; filename=${contact.fullName}.vcf`);

//     // Send the vCard as a response
//     res.send(vCard.getFormattedString());
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// } else if(/mobile|android/i.test(userAgent)){
//   try {
//     const contact = await Contacts.findOne({ userName });
  
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     // Create a vCard
//     const vCard = vCardsJS();
//     vCard.firstName = contact.fullName;
//     vCard.cellPhone = contact.phone;
//     vCard.email = contact.email;
//     vCard.workAddress = contact.address;
//     vCard.title = contact.role;

//     // Set the headers for vCard download
//     // res.setHeader('Content-Type', 'text/vcard');
//     // res.setHeader('Content-Disposition', `inline; filename=${contact.fullName}.vcf`);
//     // res.setHeader('Content-Disposition', `attachment; filename=${contact.fullName}.vcf`);

//     // Send the vCard as a response
//     // res.send(vCard.getFormattedString());

//     const vCardString = vCard.getFormattedString();
//     const base64VCard = Buffer.from(vCardString).toString('base64');
//     const dataUri = `data:text/vcard;base64,${base64VCard}`;

//     // Set the headers to open the vCard directly in a new tab
//     res.setHeader('Content-Type', 'text/html');
//     res.send(`
//       <!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Download Contact</title>
//         </head>
//         <body>
//           <a href="${dataUri}" download="${contact.fullName}.vcf" id="download-link">Download vCard</a>
//           <script>
//             document.getElementById('download-link').click();
//           </script>
//         </body>
//       </html>
//     `);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }else {
//   // User agent indicates a sensor or other device
//   try {
//     const contact = await Contacts.findOne({ userName });
    
//     if (contact) {
//       return res.status(200).json(true);
//     } else {
//       return res.status(200).json(false);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// }
// });



// app.get('/vcard/:userName', async (req, res) => {
//   try {
//      userName = req.params.userName;

//     // Fetch contact details from database using the contactId
//     const contact = await Contacts.findOne({userName});

//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     const vCard = vCardsJS();
//     vCard.firstName = contact.fullName;
//     vCard.email = contact.email;
//     vCard.cellPhone = contact.phone;
//     vCard.workPhone = contact.phone;
//     vCard.homeAddress = contact.address;
//     vCard.title = contact.role;

//     // Set response headers to download the vCard
//     res.setHeader('Content-Type', 'text/vcard');
//     res.setHeader('Content-Disposition', `attachment; filename=${contact.fullName}.vcf`);
//     res.send(vCard.getFormattedString());
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });


/////

// app.get('/qr-redirect', (req, res) => {
//   const userAgent = req.headers['user-agent'];

//   if (/mobile|android|iphone|ipad/i.test(userAgent)) {
//     // User agent indicates a phone
//     res.redirect('https://backend2-0weq.onrender.com/contacts/MT');
//   } else {
//     // User agent indicates a sensor or other device
//     res.redirect('https://backend2-0weq.onrender.com/contacts');
//   }
// });

//Api to get contact details of a user from the `:username` params and convert the details to a vcard and download directly
// app.get('/qr-redirect/:username', async (req, res) => {

//   const userAgent = req.headers['user-agent'];
//   let userName 

//   if (/mobile|android|iphone|ipad/i.test(userAgent)) {
//     // User agent indicates a phone
//     userName = req.params.username;
//   } else {
//     // User agent indicates a sensor or other device
//     userName = ''; // Use the appropriate ID or criteria for sensors
//   }

//   try {
//     const contact = await Contacts.findOne({userName});

//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     // Create a vCard
//     const vCard = vCardsJS();
//     vCard.firstName = contact.fullName;
//     vCard.cellPhone = contact.phone;
//     vCard.email = contact.email;
//     vCard.workAddress = contact.address;
//     vCard.title = contact.role;

//     // Set the headers for vCard download
//     res.setHeader('Content-Type', 'text/vcard');
//       // res.setHeader('Content-Type', 'text/plain; charset=utf-8');
//     // res.setHeader('Content-Disposition', `inline; filename=${contact.fullName}.vcf`);
//     res.setHeader('Content-Disposition', `attachment; filename=${contact.fullName}.vcf`);

//     // Send the vCard as a response
//     // res.send(vCard.getFormattedString());
//     res.send(vCard);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

            //POST Request
// app.post('/', async (req, res) => {
//   try {
//     const results = await Detail.create();
//     console.log(results)
//     res.json(results)
//   } catch (err) {
//     console.log(err)
//     res.status(500).json(err);
//   }
// });

//Api to add new details to the details table
app.post("/add", async (req, res) => {
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

//Api to add an new Contact to the database
app.post("/newContacts", async (req, res) => {
  try {

     req.body.password = await bcrypt.hash(req.body.password, 13);

    const newContacts = new Contacts(req.body)
    const savedResults = await newContacts.save();
    console.log(savedResults);
    res.status(201).json(savedResults);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


//Api to compare the email and password to that in the database and returns any entry match those fields
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await Contacts.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If the password matches, return the user details
    res.status(200).json({
      user,
      // fullName: user.fullName,
      // userName: user.userName,
      // phone: user.phone,
      // email: user.email,
      // address: user.address,
      // role: user.role,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
