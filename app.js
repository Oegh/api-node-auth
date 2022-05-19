require("dotenv").config();
const morgan = require("morgan");

const cors = require('cors');
const express = require("express");
var cookieParser = require('cookie-parser');
var helmet = require('helmet');


const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

app.use('/api-docs', require('./docs/swagger'));
app.use('/', require('./controllers/user.controller'));

module.exports = app;