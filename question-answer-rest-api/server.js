var express = require("express");
var dotenv = require("dotenv");
var connectDatabase = require("./helpers/database/connectDatabase");
var customErrorHandler = require("./middlewares/errors/customErrorHandler");
const path = require("path");

var routers = require("./routers/index");


// enviroment variables
dotenv.config({
    path : "./config/env/config.env"
});

// Mongodb connection
connectDatabase();



var app = express();

// Express-body middleware
app.use(express.json());

var PORT = process.env.PORT;

// routers middleware
app.use("/api",routers);

// Error Handler
app.use(customErrorHandler);


// static files
app.use(express.static(path.join(__dirname,"public")));

app.listen(PORT,()=>{
    console.log(`App Started on ${PORT} : ${process.env.NODE_ENV}`);
});
