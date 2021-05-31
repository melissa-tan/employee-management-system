const util = require("util");
const mysql = require('mysql');

require('dotenv').config();

//Creating a connection to mysql
const connection = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("MySQL connected!")
});

connection.query = util.promisify(connection.query);

module.exports = connection;