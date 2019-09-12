const mysql = require("mysql");
const inquire = require("inquirer");
const cTable = require("console.table");

const conn = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazonDB"
});

conn.connect(function (err) {
    if (err) throw err;
    console.log(`
                                            Welcome to
        ****************************************************************************************   
        ▀█████████▄     ▄████████   ▄▄▄▄███▄▄▄▄      ▄████████  ▄███████▄   ▄██████▄  ███▄▄▄▄   
          ███    ███   ███    ███ ▄██▀▀▀███▀▀▀██▄   ███    ███ ██▀     ▄██ ███    ███ ███▀▀▀██▄ 
          ███    ███   ███    ███ ███   ███   ███   ███    ███       ▄███▀ ███    ███ ███   ███ 
         ▄███▄▄▄██▀    ███    ███ ███   ███   ███   ███    ███  ▀█▀▄███▀▄▄ ███    ███ ███   ███ 
        ▀▀███▀▀▀██▄  ▀███████████ ███   ███   ███ ▀███████████   ▄███▀   ▀ ███    ███ ███   ███ 
          ███    ██▄   ███    ███ ███   ███   ███   ███    ███ ▄███▀       ███    ███ ███   ███ 
          ███    ███   ███    ███ ███   ███   ███   ███    ███ ███▄     ▄█ ███    ███ ███   ███ 
        ▄█████████▀    ███    █▀   ▀█   ███   █▀    ███    █▀   ▀████████▀  ▀██████▀   ▀█   █▀  
        ****************************************************************************************
                    The world's most popular command line storefront mockup
`);
    queryUser();

})
let userOptions = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"];
// * List a set of menu options:
function queryUser() {
    inquire.prompt({
        type: "list",
        name: "prompt",
        message: "What would you like to do?",
        choices: userOptions
    }).then((answer) => {
        switch (answer.prompt) {
            case userOptions[0]:
                viewProducts();
                break;
            case userOptions[1]:
                viewLowInv();
                break;
            case userOptions[2]:
                addToInv();
                break;
            case userOptions[3]:
                addNewProd();
                break;
            default:
                console.log("Oopsies, something has gone wrong. Please try again later");
                break;
        }

    })
}
// * View Products for Sale
function viewProducts() {
    conn.query("SELECT * FROM products", (err, res) => {
        if (err) {
            console.log(err);
        }
        let formatted = res.map(product => {
            return {
                ID: product.item_id,
                Product_Name: product.product_name,
                Department: product.department_name,
                Price: product.price.toFixed(2),
                Stock_Quantity: product.stock_quantity
            }
        })
        console.table(formatted);

        keepGoing();
    });
}
// * View Low Inventory
function viewLowInv() {
    conn.query("SELECT * FROM products WHERE stock_quantity <=?", 5, (err, res) => {
        if (err) {
            console.log(err);
        }
        console.table(res);
        keepGoing();
    });

}
// * Add to Inventory
function addToInv() {
    let itemIDs = [];
    conn.query("SELECT * FROM products", (err, res) => {
        if (err) {
            console.log(err);
        }
        for (let i = 0; i < res.length; i++) {
            let id = parseInt(res[i].item_id);
            itemIDs.push(id);
        }
        reorderPrompt(itemIDs).then((answers) => {
            let itemID = answers.product;
            let orderAmt = answers.orderAmt;
            conn.query(`UPDATE products SET stock_quantity = stock_quantity + ${orderAmt} WHERE item_id = ${itemID}`, (err, response) => {
                if (err) {
                    console.log(err);
                }
                console.log(response.affectedRows + " record(s) updated");
                keepGoing();
            })
        });
    });

}
// * Add New Product
function addNewProd() {
    newProductPrompt().then((answers) => {
        let productName = answers.productName;
        let departmentName = answers.departmentName;
        let productPrice = answers.price;
        let stockQuant = answers.quantity;
        conn.query('INSERT INTO products SET ?', {
            product_name: productName,
            department_name: departmentName,
            price: productPrice,
            stock_quantity: stockQuant
        }, (err, response) => {
            if (err) throw err;
            console.log(response.affectedRows + " record(s) updated")
            keepGoing();
        })
    })
}
function newProductPrompt() {
    return inquire.prompt([{
        type: "input",
        message: "Enter the new product name.",
        name: "productName"
    }, {
        type: "input",
        message: "Enter the department of the new product",
        name: "departmentName"
    }, {
        type: "number",
        message: "Enter the price per unit of the new product",
        name: "price",
        validate: (input) => {
            return !isNaN(input) || "Please enter a valid numeric price"
        }
    }, {
        type: "number",
        message: "Enter the amount of the product in stock",
        name: "quantity",
        validate: (input) => {
            if (input >= 0) {
                return Number.isInteger(input) || "Please enter a valid integer"
            } else {
                return "Please enter a valid positive integer"
            }
        }
    }])
};

function reorderPrompt(itemIDs) {
    return inquire.prompt([{
        type: "number",
        message: "Enter the item ID of the product you wish to restock",
        name: "product",
        validate: (input) => {
            return itemIDs.includes(input) || "That is not a valid item ID.  Please re-enter a valid item ID."
        }
    }, {
        type: "list",
        name: "orderAmt",
        message: "Choose an amount to reorder.",
        choices: [{ name: "5", value: 5 }, { name: "10", value: 10 }, { name: "50", value: 50 }, { name: "100", value: 100 }]

    }])
}

function keepGoing () {
    inquire.prompt({
        type: "confirm",
        message: "Would you like to perform another task?",
        name: "keepGoing",
    }).then((answers)=>{
        if(answers.keepGoing){
            queryUser();
        } else {
            conn.end();
        }
    })
}