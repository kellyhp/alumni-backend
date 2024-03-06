const mongoose = require('mongoose');

const ezenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fundingInfo: {
        type: [{
            period: String,
            amount: String}],
            required: false
    },
    founders: {
        type: [{
            position: String,
            name: String
        }]
    },
    alumnis: {
        type: [
            {
                name: String,
                position: String
            }
        ],
        required: false
    }
});

const Ezen = mongoose.model("ezen", ezenSchema);

module.exports = Ezen;