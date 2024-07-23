const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } 
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;