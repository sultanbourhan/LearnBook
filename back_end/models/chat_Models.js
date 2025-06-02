const mongoose = require("mongoose");

const simpleChatSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      content: {
        type: String,
        default: "",
      },
      files: [
        {
          url: String,
          name: String,
        },
      ],
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("SimpleChat", simpleChatSchema);
