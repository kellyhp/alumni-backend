const mongoose = require('mongoose');

const ezenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    foundingDate: {
        type: String,
        required: false
    },
    notableInvestors: {
        type: String,
        required: true
    },
    hq: {
        type: String,
        required: true
    },
    totalFunding: {
        type: String,
        required: false
    },
    fundingRecord: {
        type: [{
            period: String,
            amount: String}],
        required: false
    },
    founders: {
        type: [{
            position: String,
            name: String
        }],
        required: false
    },
    alumnis: {
        type: [
            {
                name: String,
                position: String
            }
        ],
        required: false
    },
    bio: {
        type: String,
        required: true
    },
    ezenLink: {
        type: String,
        required: true
    }
});

const Ezen = mongoose.model("ezen", ezenSchema);

module.exports = Ezen;
