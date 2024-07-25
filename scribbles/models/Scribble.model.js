const { Schema, model, trusted } = require("mongoose");
const User = require('./User.model');

const scribbleSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    category: {
      type: String,
      trim: true,
      required: true,
      enum: ['Art Fart', 'Food Corner', 'Game Hub', 'City Vibes']
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: false
    },
    time: { 
      type: Date,
      default: Date.now,
      required: true         
    },
    scribblePicture: {
      data: Buffer,
      contentType: String
    },
    comments: [
      {
      type: Schema.Types.ObjectId,
      ref: 'Comment' // I hope this connects to the comment model, pray for me
  }],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // This references the User model
    }
  },
  {
    timestamps : true
  }
);

const Scribble = model("Scribble", scribbleSchema);

module.exports = Scribble;
