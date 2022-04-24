const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  postBlob: {
    data: Buffer,
    contentType: String,
  },
  postDescription: {
    type: String,
    required: true,
    maxlenght: 100,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  ],
  isNFT: {
    type: Boolean,
    required: true,
  },
  isNFTForSale: {
    type: Boolean,
    required: true,
  },
  price: {
    type: Number,
  },
  imgUri: {
    type: String,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  createdAt: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("Post", PostSchema);
