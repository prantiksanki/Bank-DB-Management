const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session"); 



// Required paths
// const userRoute = require("./route/user") ;
const {User,Account,Loan} = require("./model/signup");
const { cache } = require("ejs");



// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/style", express.static("style"));
app.use(session({                                         // Session configuration
    secret: 'Sanki@2004',  
    resave: false,
    saveUninitialized: true,
}));

// MongoDB connection
function connectToMongoDB(uri) {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });
}

connectToMongoDB("mongodb://localhost:27017/bank-db");


// Routes


app.get("/login", (req, res) => {
    res.render("login");
});


app.post("/login", async (req, res) => {
    const { custid, phone } = req.body;
    const user = await User.findOne({ custid, phone });
    if (!user) {
        return res.status(400).send("Invalid credentials");
    }
    req.session.userName = custid; // Save custid in session
    res.redirect("/");
});
app.get("/", async (req, res) => {
    if (!req.session.userName) {
        return res.redirect("/login");
    }

    try {
        const account = await Account.findOne({ custid: req.session.userName });
        if (!account) {
            return res.status(404).send("Account not found");
        }

        // Pass the full account object, or just the balance
        return res.render("home", {
            user: account  // Now 'user' contains the full account object
        });
    } catch (error) {
        console.error("Error retrieving account:", error);
        return res.status(500).send("An error occurred while retrieving the account.");
    }
});



app.post("/transfer", async (req, res) => {

    try{

        const {recipientAccount, amount } = req.body;
    const fromAccount = await Account.findOne({ custid: req.session.userName });
    const toAccount = await Account.findOne({ custid: recipientAccount });

    if (!fromAccount) {
        return res.status(404).send("Sender account not found");
    }
    if (!toAccount) {
        return res.status(404).send("Recipient account not found");
    }

    if (fromAccount.balance < amount) {
        return res.status(400).send("Insufficient balance");
    }

    const transferAmount = parseFloat(amount);

    fromAccount.balance -= transferAmount;
    toAccount.balance += transferAmount;

    // Save updated balances
    await fromAccount.save();
    await toAccount.save();

    return res.send(`
        <h3> Transfer Successful </h3>
        <p><strong>Account No: </strong> ${recipientAccount}</p>
        <p><strong>Ammount: </strong> ${amount}</p>
        `) ;
    }

    catch(error)
    {
        res.send("Some error generated. Try again later") ; 
        console.log(error) ;
    }
    
});



app.post("/loan", async (req, res) => {
    const { loanType, ammount } = req.body;

    try {
         const min = 1000000000;
        const max = 9999999999;
        const loanId = Math.floor(Math.random() * (max - min + 1)) + min;

        const custid = req.session.userName;
        const stat = "Pending";

         await Loan.create({ custid, loanId, loanType, ammount, stat });

         return res.status(200).send(
            `<p><strong>Customer ID </strong>: ${custid}</p>
             <p><strong>Loan ID : </strong>${loanId}</p>
             <p><strong>Loan Type :</strong> ${loanType}</p>
             <p><strong>Amount :</strong> ${ammount}</p>
             <p><strong>Status</strong> : ${stat}</p>`);

    }
    catch (error) 
    {
        console.error("Error applying for loan. Please try again later: ", error);
        return res.status(500).send("Error applying for loan. Please try again later");
    }
});



app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});