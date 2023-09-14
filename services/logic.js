
//import db
const { response } = require('express')
const db = require('./db')
const jwt = require('jsonwebtoken')


//logic for register

const register = (username, acno, password) => {
    return db.User.findOne({ acno })
        .then(response => {
            if (response) {
                return {
                    statusCode: 401,
                    message: "Acno already registered"
                };
            } else {
                const newUser = new db.User({
                    username,
                    acno,
                    password,
                    balance: 2000,
                    transactions: []
                });

                // To store the new user in the database
                return newUser.save()
                    .then(() => {
                        return {
                            statusCode: 200,
                            message: "Reg successful"
                        };
                    })
                    .catch(error => {
                        console.error('Error saving new user:', error);
                        return {
                            statusCode: 500,
                            message: "Internal Server Error"
                        };
                    });
            }
        })
        .catch(error => {
            console.error('Error checking acno:', error);
            return {
                statusCode: 500,
                message: "Internal Server Error"
            };
        });
}



//logic for login

const login = (acno,password)=>{
    return db.User.findOne({acno,password}).then((response)=>{
        //if acno and password are present in db
        if (response) {
            //token generation
            const token = jwt.sign({
                loginAcno:acno
            },'secretkey')
            return{
                statusCode:200,
                message:"Login successful",
                currentUser:response.username,
                currentBalance:response.balance,
                token,
                acno
            }
        }
        else {
            return{
                statusCode:401,
                message:'Invalid Login Details'
            }
        }

    })
}

//logic for getting balance
const getBalance =(acno)=>{

    return db.User.findOne({acno}).then((result)=>{
        if (result) {
            return{
                statusCode:200,
                balance:result.balance
            }
        }
        else{
            return{
                statusCode:401,
                message:'Invalid acno'
            }
        }
    })

}

//logic for fund transfer
const fundTransfer=(fromAcno,frompswd,toAcno,amt)=>{
    //convert amt to number
    let amount = parseInt(amt)

    return db.User.findOne({acno:fromAcno,password:frompswd}).then((debit)=>{
        if (debit) {
                //check toAcno in mongodb
            return db.User.findOne({acno:toAcno}).then((credit)=>{
                //fund transfer
                if (credit) {
                    if (debit.balance>=amount) {
                        debit.balance-=amount
                        debit.transactions.push({
                            type:'Debit',
                            amount,
                            fromAcno,
                            toAcno
                        })
                    }
                    else{
                        return{
                            statusCode:401,
                            message:'Insufficient funds'
                        }
                    }
                    //save changes to database
                    debit.save()

                    credit.balance += amount
                    credit.transactions.push({
                        type:'Credit',
                        amount,
                        toAcno,
                        fromAcno
                    })
                    //save changes into database
                    credit.save()

                    //send response back to client
                    return{
                        statusCode:200,
                        message:'FUnd Transfer Successful...'
                    }
                }
                else{
                    return{
                        statusCode:401,
                        message:'Invalid credit details'
                    }
                }
            })
        }
        else{
            return{
                statusCode:401,
                message:'Invalid Debit details'
            }
        }
    })
}

//logic for transaction history
const transactionHistory=(acno)=>{
//check acno present in mongodb
return db.User.findOne({acno}).then((result)=>{
    if (result) {
        return{
            statusCode:200,
            transactions:result.transactions
        }
    }
    else{
        return{
            statusCode:401,
            message:'Invalid data'
        }
    }
})

}

//logic for delete account
const deleteAccount=(acno)=>{
    //account delete from database
    return db.User.deleteOne({acno}).then((result)=>{
        return{
            statusCode: 200,
            message:"Account deleted successfully"
        }
    })
}



module.exports={
    register,
    login,
    getBalance,
    fundTransfer,
    transactionHistory,
    deleteAccount
}


