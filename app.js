// ====================================== REQUIREMENTS FOR STARTING THE APP!!! ======================================

// Description:
// This is the main file for the application
// Start mongodb using "brew services start mongodb-community@6.0"
// Use "npm run start" to start the server
// pushing code to git
// - git add .
// - git commit -m "message"
// - git push -u -f origin main

// Importing the express module
const express = require('express');

// Creating an express application
const app = express();

// ====================================== SESSION HANDLING ======================================

// trust first proxy
app.set('trust proxy', 1)

// Importing the express-session module (for session handling)
const session = require('express-session');

// Using the express-session module
app.use(session({
    name: 'sid',
    secret: 'leave-her-johnny-leave-her',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 10000,
    }
}));

// destroying session when logging out
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// app.use((req, res, next) => {
//     res.locals.session = req.session;
// });

// ====================================== DATABASE STUFF ======================================

// Importing the mongoose module (for connecting to the database)
const mongoose = require('mongoose');

// connecting to the database
mongoose.connect('mongodb://localhost:27017/MemberList', { useNewUrlParser: true });

// Importing the database model
const member = require('./models/member'); // MODEL

// Importing the bcrypt module (pswd encryption)
const bcrypt = require('bcrypt');

// Using mongodb libraries to ONLY HANDLE UPDATE WTFF!
const Db = require('mongodb');
const url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0";
const client = new Db.MongoClient(url);


// ====================================== ROUTES STUFF ======================================

// Importing the routes
const membersRouter = require('./routes/members'); // ROUTES

// Using the routes
//app.use('/members', membersRouter);

// ====================================== document formatting goes here ======================================

// Using the json parser
app.use(express.json());

// set view engine using ejs (Embedded JavaScript)
app.set('view engine', 'ejs');

// take form data and pass it to the server
app.use(express.urlencoded({ extended: false }));

// ====================================== file upload ======================================

// Importing the multer module (for file upload)
const multer = require('multer');
const storage = multer.memoryStorage();

const path = require('path');


const photo = multer({ storage: storage });

// ====================================== alerting module ======================================

const alert = require('alert');

// ====================================== connection logs ======================================

// server listening logs
const server = app.listen(8080, "127.0.0.1", function () {
    console.log('Server listening at http://' + server.address().address + ":" + server.address().port + "...");
})

// database connection logs
const con = mongoose.connection;
con.on('open', function () {
    console.log('Connected to the database...');
});

// mongoClient connection logs
client.connect(err => {

    if (err) throw err;
    console.log('Connected to the database...');
    client.close();
})

// ==============================================================================================

// ALL ROUTES GOES HERE, I DON'T KNOW WHY IT DOESN'T REALLY WORK WHEN I PUT IT IN A SEPARATE FILE

// main page route 
app.get('/', (req, res) => {

    res.render('index.ejs');
});

// login page route
app.get('/login', (req, res) => {

    res.render('login.ejs');
});

// register page route
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

// profile page route
app.get('/profile', async (req, res) => {
    const userId = req.session.email;

    if (!userId) {
        // if the user isn't logged in, redirect to the login page
        res.redirect('/login');
    } else {
        // if the user has logged in, fetch user data from the database and render the profile page
        const findEmail = await member.findOne({ email: userId });
        res.render('profile.ejs', { name: findEmail.name, email: findEmail.email, photo: findEmail.photo });
    }
});

// ====================================== REGISTRATION REQUESTS ======================================

// Initialising a post request to add a new member
app.post('/register', photo.single('photo'), async (req, res) => {

    // create a new member with its properties fetched from the form
    const newMember = new member({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        photo: req.file.buffer
    });

    try { // if there is no error, save the new member to the database

        await newMember.save();
        alert("Registration successful.");
        res.redirect('/login');
    }
    catch (err) { // if there is an error, redirect to the register page

        console.log(err);
        res.redirect('/register');
    }
});

// ====================================== LOGIN REQUESTS ======================================

// Initialising a post request to login a member
app.post('/login', async (req, res) => {

    // if there is no error, save the new member to the database
    try {

        // querying the database for existing email
        const findEmail = await member.findOne({ email: req.body.email });
        // if the email is found, check the password
        if (findEmail) {

            // if the password is correct, create session ID and redirect user to the profile page
            if (await bcrypt.compare(req.body.password, findEmail.password)) {

                // create session ID
                req.session.email = findEmail.email;

                // save the session ID
                req.session.save(function (err) {
                    if (err) { 
                        return next(err);
                    }
                });

                res.redirect('/profile');
            }

            // if the password is incorrect, redirect to the login page
            else {

                alert("Password incorrect or not found.");
                res.redirect('/login');
            }
        }

        // if the email is not found, redirect to the login page
        else {

            alert("Email not found.");
            res.redirect('/login');
        }
    }
    // if there is an error, redirect to the login page
    catch (err) {

        console.log(err);
        res.redirect('/login');
    }
});


// ====================================== LIST USER REQUESTS ======================================

app.get('/list', async (req, res) => {

    // fetch all user data from database
    const allMembers = await member.find();

    // render the list page with the data
    res.render('list.ejs', { members: allMembers });
});

app.get('/delete/:id', async (req, res) => {

    // delete the user with the specified id
    await member.findByIdAndDelete(req.params.id);

    // redirect to the list page
    res.redirect('/list');
});

// ====================================== EDIT USER REQUESTS ======================================

app.get('/edit/:id', async (req, res) => {

    // fetch the user with the specified id
    const findMember = await member.findById(req.params.id);

    // render the edit page with the data
    res.render('edit.ejs', { member: findMember });
});

app.post('/edit/:id', async (req, res) => {

    const id = new Db.ObjectId(req.params.id);

    const name = req.body.name;
    console.log("name: " + name);
    await member.db.collection('members').updateOne({ _id: id }, { $set: { name: name } });

    // redirect to the list page
    res.redirect('/list');
});
