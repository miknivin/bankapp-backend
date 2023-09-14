const express = require('express');
const cors = require('cors');
const logic = require('./services/logic');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const server = express();

server.use(cors({
    origin: 'http://localhost:4200'
}));

server.use(express.json());
//application-level middleware
// const appMiddleware = (req,res,next)=>{
//     console.log('Application level middleware');
//     next();
// }
// server.use(appMiddleware)

//Router level middleware
const jwtMiddleware = (req,res,next)=>{
    console.log("Router-level middleware");

try {
    const token = req.headers['verify-token']
    console.log(token);
    const data = jwt.verify(token,'secretkey')
    console.log(data);
    req.currentAcno=data.loginAcno;
    next()
}

catch{
    res.status(401).json({message:"Please login"})
}

}

// server.use(jwtMiddleware)

// Connect to MongoDB and listen for 'connected' event
mongoose.connect('mongodb://127.0.0.1:27017/Register_data')
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Register API route
        server.post('/register', (req, res) => {
            console.log('Inside register API call');
            console.log('Request Body:', req.body);

            logic.register(req.body.username, req.body.acno, req.body.password)
                .then(response => {
                    console.log('Register API response:', response);
                    res.status(response.statusCode).json(response);
                })
                .catch(error => {
                    console.error('Register API error:', error);
                    res.status(500).json({ message: "Internal Server Error" });
                });
        });
        
        // Start the server after connecting to MongoDB
        server.listen(5000, () => {
            console.log('Server listening on port 5000');
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

server.get('/', (req, res) => res.send('Welcome to backend'));

// ... other API routes

// Handle other API calls here
server.post('/login',(req,res)=>{
    console.log('Inside login API call');
    console.log(req.body);
    //logic to resolve login request
    logic.login(req.body.acno,req.body.password).then((response)=>{
        res.status(response.statusCode).json(response)
    });
});

// ... other API routes

//to get the balance-localhost:5000/balance
server.get('/getbalance/:acno',jwtMiddleware,(req,res)=>{
    console.log(('Inside balance API call'));
    console.log(req.params);
    logic.getBalance(req.params.acno).then((response)=>{
        res.status(response.statusCode).json(response)
    })
})

//fund transfer - localhost:5000/fund-transfer
server.post('/fundtransfer',jwtMiddleware,(req,res)=>{
    console.log('Inside fund transfer api call');
    console.log(req.body);
    logic.fundTransfer(req.currentAcno,req.body.password,req.body.toAcno,req.body.amount).then((response)=>{
        res.status(response.statusCode).json(response)
    })
})

//transaction - localhost:5000/transactions
server.get('/transactions',jwtMiddleware,(req,res)=>{
    console.log('Inside Transaction api call');
    logic.transactionHistory(req.currentAcno).then((response)=>{
        res.status(response.statusCode).json(response)
    })
})

//delete account
server.delete('/deleteAccount',jwtMiddleware,(req,res)=>{
    console.log('Inside delete api call');
    logic.deleteAccount(req.currentAcno).then((response)=>{
        res.status(response.statusCode).json(response)
    })
})