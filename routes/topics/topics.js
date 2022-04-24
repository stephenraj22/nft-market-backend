const express = require('express');
const router = express.Router();
const Topic = require('../../models/topic')
const Account = require('../../models/account')

router.post('/setTopics',  async (req,res)=>{
    try{
        if(!req.body.topics){
            return res.status(400).send({status:"failure - topics field required!"})
        }
        Account.updateOne({_id:req.userTokenObject._id}, {$addToSet:{topicsChosen: req.body.topics}},async (err, docs)=>{
            if(err){
                console.log(err)
                return res.status(401).send({status:"failure - account not found"})
            }
            else if(docs){
                try{
                    const topics = await Topic.updateMany({_id:{$in:req.body.topics}},{ $inc: { nFollowers: 1 }})
                }
                catch{
                    console.log(err)
                }
                return res.status(200).send({status:"success"})
            }
        })
    }catch(err){
        console.log(err)
        return res.status(500).send({status:"Failure - error in setting topics"})
    }
})


router.post('/createTopic', async (req, res)=>{
    try{
        if(!(req.body.topicName)){
            return res.status(400).send({status: "failure - Topic Name required!"})
        }
        const topic  = await Topic.findOne({topicName:req.body.topicName})
        if(topic){
            return res.status(400).send({status:"failure - Topic exists!"})
        }
        const newTopic = await Topic.create({
            topicName:req.body.topicName
        })
        return res.status(200).send({status:"success - Topic created"})
    }
    catch(err){
        console.log(err)
        return res.status(500).send({status:"Failure - error in creating topic"})
    }
})
router.get('/getTopics',  async (req, res)=>{
    try{
        const allTopics = await Topic.find({},{topicName:1, nFollowers:1,_id:1})
        return res.status(200).send(allTopics)
    }
    catch(err){
        console.log(err)
        return res.status(500).send({status:"Failure - error in fetching topic"}) 
    }
})

router.get('/getUnfollowedTopics',  async (req, res)=>{
    try{
        const allTopics = await Topic.find({ _id: { $nin: req.userTokenObject.topicsChosen } }, { topicName: 1, nFollowers: 1 }).limit(3)
        console.log(allTopics)
        return res.status(200).send(allTopics)
    }
    catch(err){
        console.log(err)
        return res.status(500).send({status:"Failure - error in fetching topic"})  
    }
})


module.exports = router