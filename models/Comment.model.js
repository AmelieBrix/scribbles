const { Schema, model, SchemaType } = require("mongoose");

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      required: true
    },
    scribble: {
      type: Schema.Types.ObjectId,
      ref: 'Scribble',
      required: true
    }
  },
  { timestamps: true } 
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;