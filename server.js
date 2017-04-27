const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const config = require("./config/database");

// Connect to db
mongoose.connect(config.database);

mongoose.connection.on('connected', () =>{
    console.log('Connected to database '+config.database);
});
mongoose.connection.on('error', (error) =>{
    console.log('Database error '+error);
});

const app = express();
const port = 3000;
const users = require('./routes/users');

// CORS Middleware
app.use(cors());

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require("./config/passport")(passport);

app.use('/users', users);

// Index Route
app.get('/', (req,res) => {
    res.send('Welcome');
});

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

// Start Server
app.listen(port, () => {
    console.log('Server started on port '+port);
});
