const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const Account = require('../../models/account')
const verifyToken = require('../../middleware/auth')

const { OAuth2Client } = require('google-auth-library')

router.post('/signIn', async (req, res)=>{
    try{
        const {user} = req.body
        let flag = false;
        if(!(user)){
            return res.status(400).send("Wallet auth is required!")
        }
        else { 
            try {
                let account = await Account.findOne({ walletId: user.accountId })
                console.log(account, user.accountId)
                if(!account) {
                    flag = true;
                    const newAccount = new Account({
                        userName:user.accountId.split(".")[0],
                        topicsChosen:[],
                        walletId:user.accountId,
                        authToken: null,
                    })
                    account = newAccount
                    try {
                        const accountCreationResult = await newAccount.save()
                    }
                    catch(err) {
                        console.log(err)
                        return res.status(400).json({
                            status: "failure - Error creating new account"
                        })
                    }   
                }
                const token = jwt.sign({
                    accountId: account._id,
                    userName: account.userName,
                    walletId: account.walletId,
                    topicsChosen: account.topicsChosen,
                }, process.env.TOKEN_KEY)
                console.log(token)
                try {
                    const result = await Account.findOneAndUpdate({walletId: user.accountId},{authToken:token})
                    if(result) { 
                        return res.json({
                            token: token,
                            flag : flag
                        }) 
                    }
                }
                catch(err) {
                    console.log(err)
                    return res.status(400).json({
                        status: "failure - Error updating auth token"
                    })
                }
            }
            catch(err) {
                console.log(err)
                return res.status(400).json({
                    status: "failure - Error finding account"
                })
            }

        }
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            status: "failure - Something went wrong"
        })
    }
})

router.post('/search', verifyToken,async (req,res)=>{
    try{
        if(!req.body.searchParam){
            return res.status(400).send({status:"Failure - search param missing"})
        }
        const searchResults = await Account.findOne({email:{$regex:".*"+ req.body.searchParam + ".*"}},{email:1,walletId:1})
        return res.status(200).send(searchResults)
    }
    catch(err){
        console.log(err)
        return res.status(500).send({status:"Failure - error in fetching wallets"})
    }
})

module.exports = router;