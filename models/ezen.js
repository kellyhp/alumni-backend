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
        required: false
    },
    hq: {
        type: String,
        required: false
    },
    totalFunding: {
        type: String,
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
                position: String,
                url: String
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
    },
    industries: {
        type: [ String ],
        required: false
    },
    favorite: {
        type: Boolean,
        required: false
    }
});

const Ezen = mongoose.model('ezen', ezenSchema);

module.exports = Ezen;
