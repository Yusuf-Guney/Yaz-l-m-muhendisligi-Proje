const mongoose = require('mongoose');

// Token blacklist schema: stores invalidated JWTs until they expire
const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: document will be removed once expiresAt is reached
      index: { expireAfterSeconds: 0 }
    }
  },
  {
    timestamps: true // records createdAt and updatedAt
  }
);
const blacklist = mongoose.model('Blacklist', blacklistSchema);
module.exports = blacklist;
