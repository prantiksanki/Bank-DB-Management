const express = require("express");
const app = express();
const PORT = 80;
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session"); 



// Required paths
// const userRoute = require("./route/user") ;
const {User,Account,Loan,Employee,Branch} = require("./model/signup");
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
app.get("/signup", (req, res) => {
    return res.render("signup");
});

app.post("/signup", async (req, res) => {
    const { name, phone, address, bankId , bankAddress } = req.body;
    try {
        let min = 100000000000;  
        let max = 999999999999;  
        const empid = Math.floor(Math.random() * (max - min + 1)) + min;

       await Employee.create({ name, phone, address, empid , bankId , bankAddress  });
    //    await Branch.create({bankId ,bankAddress, bankAddress ,empid}) ;
       await Branch.create({
        branchId : bankId,
        branchName : bankAddress,
        bankAddress : bankAddress ,
        empId : empid 
    });
        return res.send(`<h3>Employee Registered Successfully</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Employee ID:</strong> ${empid}</p>
            <p><strong>Bank ID:</strong> ${bankId}</p>
            <p><strong>Bank Address:</strong> ${bankAddress}</p>`);
    } 
    catch (error) 
    {
        console.error(error);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0]; // Get the field causing the duplicate error
            return res.status(400).send(`Error: ${field} already exists.`);
        }

        // General error handling
        return res.status(500).send("An unexpected error occurred during signup: " + error.message);
    }
});


app.get("/login", (req, res) => {
    res.render("login");
});


app.post("/login", async (req, res) => {
    const { empid, phone , bankId} = req.body;
    const user = await Employee.findOne({ empid, phone,bankId });
    if (!user) {
        return res.status(400).send("Invalid credentials");
    }
    req.session.userName = empid; // Save custid in session
    res.redirect("/");
});

app.get("/", async (req, res) => {
    if (!req.session.userName) {
        return res.redirect("/login");
    }

    try {
        const account = await Employee.findOne({ empid: req.session.userName });
        if (!account) {
            return res.status(404).send("Account not found");
        }

        //  return res.render("home", {
        //     user: account.balance.toString(),
        // });

        return res.render("home") ; 
    } catch (error) {
        console.error("Error retrieving account:", error);
        return res.status(500).send("An error occurred while retrieving the account.");
    }
});


app.post("/transfer", async (req, res) => {
    const {recipientAccount,senderAccount, amount } = req.body;
    const fromAccount = await Account.findOne({ custid: senderAccount });
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

    res.send("Transfer successful");
});


app.get("/bankTransfer", (req, res) => {
    return res.render("selfTransfer");
});


app.post("/bankTransfer", async (req, res) => {
    const { recipientAccount, amount } = req.body;

    try{

        const toAccount = await Account.findOne({ custid: recipientAccount });

    if (!toAccount) {
        return res.status(404).send("Recipient account not found");
    }

     const transferAmount = parseFloat(amount);

     if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).send("Invalid transfer amount");
    }

     toAccount.balance += transferAmount;

     await toAccount.save();

     return res.send(`
        <h3> Transfer Successful </h3>
        <p><strong>Account No: </strong> ${recipientAccount}</p>
        <p><strong>Ammount: </strong> ${amount}</p>
        `) ;
    }
    catch(error){

        console.log(error) ; 
        return res.send("Payment Error" , error) ;
    }
     
});


app.post("/loan", async (req, res) => {
    const { loanId } = req.body;

    try {
        const loanDetails = await Loan.findOne({ loanId: loanId });
        if (!loanDetails) {
            return res.status(404).send("Loan application not found.");
        }

        if (loanDetails.stat !== "Approved") {
            const loanApplication = await Loan.findOneAndUpdate(
                { loanId: loanId },
                { $set: { stat: "Approved" } },
                { new: true }  
            );

            const custId = loanDetails.custid;
            const amount = loanDetails.ammount;  
            const accountUpdate = await Account.findOneAndUpdate(
                { custid: custId },
                { $inc: { balance: amount } }, 
                { new: true }  
            );

            if (!accountUpdate) {
                return res.status(404).send("Customer account not found.");
            }

            // Set the necessary variables for the response
            const { loanType, stat, balance } = loanApplication;

            return res.status(200).send(`
                Customer ID : ${custId}<br>
                Loan ID     : ${loanId}<br>
                Loan Type   : ${loanType}<br>
                Amount      : ${amount}<br>
                Status      : ${stat}<br>
            `);
        }

        return res.status(400).send("Loan application already approved.");

    } catch (error) {
        console.error("Error approving loan. Please try again later: ", error);
        return res.status(500).send("Error approving loan. Please try again later.");
    }
});






app.post("/newAccount" , async(req,res) =>
{
    const {name , phone , address} = req.body ; 
    try {
        let min = 100000000000;  
        let max = 999999999999;  
        const custid = Math.floor(Math.random() * (max - min + 1)) + min;
        await User.create({ name, phone, address, custid });

        const account_type = "savings";
        const balance = 0;
        await Account.create({ custid, account_type, balance });
        return res.send(`<h3>Employee Registered Successfully</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Customer ID:</strong> ${custid}</p>
            <p><strong>Account Type:</strong> ${account_type}</p>
            `);
    } 
    catch (error) 
    {
        console.error(error);
        return res.status(400).send("Error during signup: " + error.message);
    }
}) 



app.get('/allLoanDetails', async (req, res) => {
    try {
        const Loans = await Loan.find() || [];  
        res.render('allLoanDetails', { Loans });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching loan details');
    }
});






app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
