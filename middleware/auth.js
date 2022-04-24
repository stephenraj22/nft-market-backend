const jwt = require("jsonwebtoken");
const Account = require('../models/account')
const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({status: "Failure - Unauthorized User"});
  }
  else {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      console.log(decoded)
      const { walletId } = decoded
        if(walletId) {
          Account.findOne({walletId:walletId}).exec((err, user) => {
            if(err) {
              return res.status(401).json({ 
                status: "failure - Unauthorized User"
              })
            } 
            else if(user) {
              req.userTokenObject = user
              return next()
            }
          })
        }
    } catch (err) {
      return res.status(401).send({status: "Failure - Invalid Token"});
    }
  }  
  
};

module.exports = verifyToken;