'use strict';

const { Schema, model } = require('mongoose');

const UserStatsSchema = new Schema({
    discordId: {
        type: String,
        required: true,
    },

    hostedOps: {
        type: Number,
        default: 0,
    },
    coHostedOps: {
        type: Number,
        default: 0,
    },
    hostedTrainings: {
        type: Number,
        default: 0,
    },
    coHostedTrainings: {
        type: Number,
        default: 0,
    },
    warnos: {
        type: Number,
        default: 0,
    },

    currentOp: {
        type: String,
        default: "None",
    },
    currentWarno: {
        type: Number,
        default: "None",
    },

    promoPoints: {
        type: Number,
        default: 0,
    },
    nextDailyAt: {
        type: Number,
        default: 0,
    }
});

module.exports = model('UserStats', UserStatsSchema);