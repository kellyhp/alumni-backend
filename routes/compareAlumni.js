const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const PrevAlumni = require('../models/prevalumni');

// get both data and return compare statements
router.get('/', async (req, res) => {
    try {
        const currentAlumni = await Alumni.find();
        const previousAlumni = await PrevAlumni.find();

        const changes = [];
        currentAlumni.forEach(current => {
            const previous = previousAlumni.find(prev => prev.name === current.name && prev.major === current.major && prev.graduationYear === current.graduationYear);
            if (!previous) {
                changes.push(`${current.name} (${current.location}) added to current database`);
            } else {
                if (current.job !== previous.job) {
                    changes.push(`${current.name} (${current.location}) changed job from ${previous.job} to ${current.job}`);
                }
                if (current.company !== previous.company) {
                    changes.push(`${current.name} (${current.location}) changed company from ${previous.company} to ${current.company}`);
                }
                if (current.location !== previous.location) {
                    changes.push(`${current.name} (${current.location}) changed location from ${previous.location} to ${current.location}`);
                }
                // add more comparisons for other fields if needed
            }
        });
        res.status(200).json(changes);
    } catch (error) {
        res.status(500).json({ message: 'Error getting both datasets and comparing changes.' });
    }
});

// compare alumni data and return changes including new and removed data
router.get('/changes', async (req, res) => {
    try {
        const currentAlumni = await Alumni.find();
        const previousAlumni = await PrevAlumni.find();

        const changes = currentAlumni.filter(current => {
            const previous = previousAlumni.find(prev =>
                prev.name === current.name && prev.major === current.major && prev.graduationYear === current.graduationYear
            );
            if (!previous) {
                return true; 
            } else {
                return current.job !== previous.job ||
                       current.company !== previous.company ||
                       current.location !== previous.location;
            }
        });

        const removedData = previousAlumni.filter(previous => {
            return !currentAlumni.some(current =>
                previous.name === current.name && previous.major === current.major && previous.graduationYear === current.graduationYear
            );
        });

        const changesData = changes.map(current => {
            const previous = previousAlumni.find(prev =>
                prev.name === current.name &&
                prev.major === current.major &&
                (prev.location === current.location || (!prev.location && !current.location))
            );
            if (previous) {
                return { previous, current };
            } else {
                return { new: current };
            }
        });

        res.status(200).json({ changes: changesData, removed: removedData });
    } catch (error) {
        res.status(500).json({ message: 'Error comparing data to find new/old data.' });
    }
});

module.exports = router;