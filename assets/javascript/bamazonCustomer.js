const MYSQL = require("mysql");
const INQUIRE = require("inquirer")

const CON = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazonDB"
  });
  