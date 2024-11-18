const mongoose = require("mongoose"); 

const userSchema = new mongoose.Schema(
    {
        name:
        {
            required: true ,
            type: String  ,
        }, 
        phone:
        {
            required : true , 
            type: Number ,
            unique : true ,

        },
        address:
        {
            required : true , 
            type : String,
        },
        custid :
        {
            required : true , 
            type : Number ,
            unique : true ,

        }
    } ,

    {timestamps : true} 
)

const accountSchema = new mongoose.Schema({

    custid :
    {
        reqired : true , 
        type : Number, 
        unique: true ,
    },
    account_type:
    {
        required : true , 
        type: String , 
    },
    balance :
    {
        required : true , 
        type : Number, 
    }
},
{timestamps : true} 

)


const loanSchema = new mongoose.Schema(
    {
        custid:
        {
            required : true ,
            type:Number, 
        },
        loanId:
        {
            required: true , 
            type: Number ,
        } ,
        loanType:
        {
            required: true ,
            type: String,
        } ,
        ammount :
        {
            required: true ,
            type: Number,
        } ,
        stat:
        {
            required : true , 
            type : String ,
        },
    },
    {timestamps : true} 

)


User = mongoose.model("user" , userSchema) ; 
Account = mongoose.model("account" , accountSchema) ;
Loan = mongoose.model('loan' , loanSchema) ; 

module.exports ={User , Account , Loan} ; 