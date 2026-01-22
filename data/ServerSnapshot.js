"use strict";

const { Schema, model} = require('mongoose');

const ServerSnapshotSchema = new Schema({
    timestamp: {
        type: String,
        required: true
    },

    data: {
        everyone: {
            type: String,
            default: "0",
        },
        roles: [],
        channels: [],
    }
})

module.exports = model('ServerSnapshot', ServerSnapshotSchema)