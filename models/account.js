const mongoose = require('mongoose')

const AccountSchema = mongoose.Schema({
    walletId:{
        type: String,
        required:true,
        unique:true,
    },
    userName: {
        type:String,
        required:true,
        maxlength:50
    },
    topicsChosen:[
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Topic',
            required:true
        }
    ],
    authToken:{
        type:String,
    }
},{timestamps:true})

module.exports = mongoose.model('Account', AccountSchema)