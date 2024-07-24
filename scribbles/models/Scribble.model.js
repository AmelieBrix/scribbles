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
      type: date,
      required: false
    },
    /* scribble_Picture: {
      data: Buffer,
      contentType: String
    }, */
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment' // I hope this connects to the comment model, pray for me
                        //but why do we need this here ?
  }]
  }
);

const Scribble = model("Scribble", scribbleSchema);

module.exports = Scribble;
