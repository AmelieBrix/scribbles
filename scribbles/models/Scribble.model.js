const { Schema, model } = require("mongoose");

const scribbleSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      unique: false
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
      type: String,
      required: false
    },
    scribble_Picture: {
      data: Buffer,
      contentType: String
    },
  }
);

const Scribble = model("Scribble", scribbleSchema);

module.exports = Scribble;