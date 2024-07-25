const { Schema, model, SchemaType } = require("mongoose");

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId
    },
    createdAt: {
      type: Date,
      default: Date.now
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