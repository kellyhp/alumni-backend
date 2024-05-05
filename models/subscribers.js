const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
    email: { 
        type: String,
         unique: true, 
         required: true 
    },
    name: { 
        type: String, 
        required: true
    },
    subscribed: { 
        type: Boolean, 
        default: true 
    },
  });
  
const Subscriber = mongoose.model('subscribers', SubscriberSchema);
  
module.exports = Subscriber;