'use strict';

const { Schema, model } = require('mongoose');

const UserVerificationSchema = new Schema({
    discordId: {
        type: String,
        required: true,
    },
    robloxId: {
        type: String,
        required: true,
        default: "",
    },
    robloxName: {
        type: String,
        default: "",
    },
    UTCOffset: {
        type: Number,
        default: 0,
    }
});

module.exports = model('UserVerification', UserVerificationSchema);