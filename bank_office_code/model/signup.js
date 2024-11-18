const mongoose = require("mongoose"); 

const bankDetailsSchema = new mongoose.Schema(
    {
        branchId :
        {
            type:Number , 
            required : true 
        }, 
        branchName:
        {
            required: true , 
            type:String 
        } ,
        branchAddress:
        {
            type:String ,
        },
        empId:
        {
            required:true , 
            type:Number , 
            unique:true,
        }
    },
    {timestamps:true} ,
)

const bankEmpSchema = new mongoose.Schema(
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
        empid :
        {
            required : true , 
            type : Number ,
            unique : true ,

        } ,
        bankId:
        {
            required: true , 
            type: Number, 
        },
        bankAddress:
        {
            required : true , 
            type : String , 
        }
    },
    {timestamps : true},
)

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
Employee = mongoose.model('employee' , bankEmpSchema) ; 
Branch = mongoose.model('branch' , bankDetailsSchema) ; 

module.exports ={User , Account , Loan , Employee , Branch} ; 