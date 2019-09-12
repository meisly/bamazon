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
    initiateStore();

})
let available_choices = [];
let available_IDs = [];

function initiateStore() {
    conn.query("SELECT item_id, product_name, price FROM products WHERE stock_quantity > 0", function (err, res) {
        if (err) throw err;
        available_choices = [];
        available_IDs = [];


        for (let i = 0; i < res.length; i++) {
            let id = res[i].item_id;
            let name = res[i].product_name;
            let price = "$" + res[i].price.toFixed(2);
            let productDetails = { ID: id, Product: name, Price: price };
            available_choices.push(productDetails);
            available_IDs.push(productDetails.ID)

        }
        let displayChoices = cTable.getTable(available_choices);
        console.log(displayChoices);

        makePurchase(available_choices);
    })
};

function makePurchase(stock) {
    inquire.prompt([{
        type: "number",
        name: "purchase",
        message: "Enter the ID number of the item you wish to purchase.",
        validate: (input) => {
            let selection = parseInt(input);
            return available_IDs.includes(selection) || "That product is not available.  Select another item"
        }
    }, {
        type: "number",
        name: "amount",
        message: "Enter the amount you would like to buy",
        validate: (amount) => {
            var reg = /^\d+$/;
            return reg.test(amount) || "Amount must be a number!";
        },
        when: function (answer) {
            if (answer.purchase) {
                return true
            } else return false;
        }

    }]).then(answers => {
        checkStock(answers.purchase, answers.amount);
    })
}

function checkStock(itemID, itemAMT) {
    conn.query("SELECT * FROM products WHERE item_id=?", itemID, function (err, res) {
        if (err) {
            console.log(err)
        }
        let stock_AMT = res[0].stock_quantity;
        let name = res[0].product_name;
        let price = res[0].price;
        if (stock_AMT >= itemAMT) {
            let total = price * itemAMT;
            console.log(`
            You have successfully completed a purchase order for ${itemAMT} ${name}(s)
            Total cost: $ ${total}.
            Pay on delivery.`)
            let new_Amt = stock_AMT - itemAMT;
            conn.query(`UPDATE products SET stock_quantity = ${new_Amt} WHERE item_id = ${itemID}`, function (err, result) {
                if (err) throw err;
                // console.log(result.affectedRows + " record(s) updated")
            })
            continueShopping();
        } else {
            console.log(`Insufficient Quantity.  There are ${stock_AMT} ${name}(s) remaining.`)
            continueShopping();
        }
    })
};

function continueShopping() {
    inquire.prompt({
        type: "expand",
        name: "continue",
        message: "Would you like to continue shopping? Enter y(yes) or n(no) to choose",
        choices: [{name: "Yes, I would like to keep shopping", value: true, key: "Y"}, {name: "No, I have gotten everything I want", value: false, key: "n"}]
    }).then(answer => {
        if (answer.continue) {
            initiateStore();
        } else {
            conn.end();
        }
    })
};