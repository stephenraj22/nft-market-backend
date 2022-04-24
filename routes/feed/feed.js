const express = require('express')
const router = express.Router()
const Post = require('../../models/post')
const Topic = require("../../models/topic")

router.get('/getRelevantFeeds', async (req, res) => {
    try {
        const { _id:accountId, topicsChosen } = req.userTokenObject

        let relevantPosts = await Post.find({
            'topicId': {
                $in: topicsChosen
            },
            'imgUri':null
        }).sort({createdAt:-1}).populate('accountId', { _id: 0,  walletId: 1, userName: 1, createdAt: 1, updatedAt: 1})
        .populate('topicId',{topicName:1})
        const newRelevantPosts = relevantPosts.map((post) => {
            let newPost = JSON.parse(JSON.stringify(post))
            newPost.hasUserLiked = post.likes.includes(accountId)
            newPost.nLikes = post.likes.length
            delete newPost.likes
            return newPost
        })
        return res.status(200).json(newRelevantPosts)
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            status: "failure - error fetching relevant feed"
        })
    }
})

router.post('/createPost', async (req, res) => {
    try {
        const { postDescription, topicId } = req.body
        const newPostObject = new Post({
            postDescription: postDescription,
            likes: [],
            topicId: topicId,
            isNFT: false,
            isNFTForSale:false,
            accountId: req.userTokenObject._id,
            price: null,
            imgUri:null,
            createdAt:(new Date()).getTime() * 1000
        })
        const postCreationResult = await newPostObject.save()
        if(postCreationResult) {
            const resultToReturn = await Post.findOne({_id: postCreationResult._id}).populate("topicId")
            return res.status(200).json(resultToReturn)
        }
        else {
            return res.status(400).json({status: "failure - error creating post"})
        }
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            status: "failure - Error creating new post"
        })
    }
})

router.post('/likePost', async (req, res) => {
    try {
        const { _id:accountId } = req.userTokenObject
        const { postId } = req.body

        let status = ""

        let relevantPost = await Post.findOne({_id: postId})
        if(relevantPost.likes.includes(accountId)) {
            const index = relevantPost.likes.indexOf(accountId)
            relevantPost.likes.splice(index, 1)
            status = "success - user unliked post"
        }
        else {
            relevantPost.likes.push(accountId)
            status = "success - user liked post"
        }

        const updationResult = await Post.updateOne({_id: postId}, {
            $set: {likes: relevantPost.likes}
        })

        if(updationResult.modifiedCount === 1) {
           return  res.status(200).json({
                status: status
            })
        }
        else {
            return res.status(200).json({
                status: "failure - no records were modified"
            })
        }

    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            status: "failure - error updating post like status"
        })
    }
})

router.get('/myPosts', async (req, res) => {
    try {
        const userPosts = await Post.find({ accountId: req.userTokenObject._id, isNFT: false, isNFTForSale:false, imgUri:null }).sort({createdAt:-1}).populate('accountId', { _id: 0, walletId: 1, userName: 1, createdAt: 1, updatedAt: 1 }).populate("topicId");
        const myPosts = userPosts.map((post) => {
            let newPost = JSON.parse(JSON.stringify(post))
            newPost.hasUserLiked = post.likes.includes(req.userTokenObject._id)
            newPost.nLikes = post.likes.length
            delete newPost.likes
            return newPost
        })
        return res.status(200).json(myPosts)
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            status: "failure - error in getting user posts"
        })
    }    
})

router.get('/myNFTs', async (req, res) => {
    try {
        const userNFTs = await Post.find({ accountId:  req.userTokenObject._id, isNFT:true }).sort({createdAt:-1}).populate('accountId', { _id: 0,  walletId: 1, userName: 1, createdAt: 1, updatedAt: 1}).populate("topicId");
        const myNFTs = userNFTs.map((post) => {
            let newPost = JSON.parse(JSON.stringify(post))
            newPost.hasUserLiked = post.likes.includes(req.userTokenObject._id)
            newPost.nLikes = post.likes.length
            delete newPost.likes
            return newPost
        })
        return res.status(200).json(myNFTs)
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            status: "failure - error in getting user NFTS"
        })
    } 
})


router.post('/getMyPost', async (req, res) => {
    try {
        const response = {}
        const userPost = await Post.findOne({ _id: req.body.postId, accountId: req.userTokenObject._id, isNFT: false }).populate('accountId', { _id: 0, walletId: 1, userName: 1, createdAt: 1, updatedAt: 1 }).populate("topicId");
        if (!userPost) {
            return res.status(404).json({
                status: "failure - post not found"
            })
        }
        response.postDescription = userPost.postDescription
        response.postId = userPost._id
        response.accountId = userPost.accountId
        response.topicId = userPost.topicId
        response.createdAt = userPost.createdAt
        return res.status(200).json(response)
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            status: "failure - error in getting user NFTS"
        })
    }
})

module.exports = router