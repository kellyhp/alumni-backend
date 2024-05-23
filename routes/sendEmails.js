const cron = require('node-cron');
const express = require('express');
const Resend = require('resend').Resend;
const router = express.Router();
const Alumni = require("../models/alumni");
const PrevAlumni = require("../models/prevalumni");
const { Subscriber } = require('../models/subscribers');

let emailSchedule = null;
const resend = new Resend('re_MrGDdqKt_LzmC7r9zFByqWbzwVE741LLM');

// Route to check if a user's email is subscribed
router.get('/check-subscription', async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      const subscriber = await Subscriber.findOne({ email });
      if (!subscriber) {
        return res.json({ subscribed: false });
      }
  
      res.json({ subscribed: subscriber.subscribed });
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

const compareAlumni = async () => {
    try {
        const currentAlumni = await Alumni.find();
        const previousAlumni = await PrevAlumni.find();

        const changes = [];
        currentAlumni.forEach((current) => {
            const previous = previousAlumni.find(
                (prev) =>
                    prev.name === current.name &&
                    prev.major === current.major &&
                    prev.graduationYear === current.graduationYear &&
                    prev.url === current.url
            );
            if (!previous) {
            } else {
                if (
                    current.job !== previous.job &&
                    current.company === previous.company
                ) {
                    changes.push(
                        `${current.name} has changed position from ${previous.job} to ${current.job} at ${current.company}.`
                    );
                }
                if (current.company !== previous.company) {
                    changes.push(
                        `${current.name} moved companies from ${previous.company} to ${current.company}.`
                    );
                }
                if (current.location !== previous.location) {
                    changes.push(
                        `${current.name} changed location from ${previous.location} to ${current.location}.`
                    );
                }
                if (current.company !== previous.company) {
                    changes.push(
                        `${current.name} has started a new job at ${current.company} as a ${current.job}.`
                    );
                }
            }
        });
        return changes;
    } catch (error) {
        throw new Error("Error comparing alumni data.");
    }
};

// Schedule email sending
const scheduleEmails = () => {
    emailSchedule = cron.schedule('0 0 1 * *', async () => {
        try {
            const alumniUpdates = await compareAlumni();
            const subscribers = await Subscriber.find({ subscribed: true });
            subscribers.forEach(async (subscriber) => {
                const message = {
                    from: 'onboarding@resend.dev',
                    to: subscriber.email,
                    subject: 'Monthly Updates',
                    html: `<p>Here are the monthly updates:</p>${alumniUpdates.map(update => `<p>${update}</p>`).join('')}`,
                };
                await resend.emails.send(message);
            });
        } catch (error) {
            console.error('Error scheduling email sending:', error);
        }
    });
};

// Subscribe to email notifications
router.post('/subscribe', async (req, res) => {
    try {
        const { email, name } = req.body;
        let subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            subscriber.subscribed = true;
            await subscriber.save();
        } else {
            subscriber = new Subscriber({
                email,
                name,
                subscribed: true,
            });
            await subscriber.save();
        }

        if (!emailSchedule) {
            scheduleEmails();
        }

        const welcomeMessage = ({
            from: 'onboarding@resend.dev',
            to: email,
            subject: `Welcome, ${name}!`,
            html: `<p>Thank you for subscribing to our monthly updates!</p>`,
        });
        await resend.emails.send(welcomeMessage);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error subscribing to email notifications:', error);
        res.sendStatus(500);
    }
});

// Unsubscribe from email notifications
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            subscriber.subscribed = false;
            await subscriber.save();
        }

        const subscribedCount = await Subscriber.countDocuments({ subscribed: true });
        if (emailSchedule && subscribedCount === 0) {
            emailSchedule.destroy();
            emailSchedule = null;
        }

        const farewellMessage = ({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Goodbye!',
            html: `<p>We're sorry to see you go! You have been unsubscribed from our monthly updates.</p>`,
        });
        await resend.emails.send(farewellMessage);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error unsubscribing from email notifications:', error);
        res.sendStatus(500);
    }
});

module.exports = router;