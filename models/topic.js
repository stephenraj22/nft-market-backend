const mongoose = require('mongoose')

const TopicSchema = mongoose.Schema({
    topicName:{
        type:String,
        required:true,
        maxlength:50
    },
    nFollowers:{
        type:Number,
        required:true,
    }
},{timestamps:true})

module.exports = mongoose.model('Topic', TopicSchema)