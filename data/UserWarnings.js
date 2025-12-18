'use strict';

const { Schema, model } = require('mongoose');

const UserWarningsSchema = new Schema({
    discordId: {
        type: String,
        required: true,
    },

    nextWarningId: {
        type: Number,
        default: 1,
    },

    warnings: [{
        id: {
            type: Number,
        },
        moderator: {
            type: String,
        },
        reason: {
            type: String,
        },
        timestamp: {
            type: Number,
            default: Date.now().valueOf(),
        }
    }],
})

module.exports = model('UserWarnings', UserWarningsSchema);