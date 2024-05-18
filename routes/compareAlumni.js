const express = require("express");
const router = express.Router();
const Alumni = require("../models/alumni");
const PrevAlumni = require("../models/prevalumni");

// get both data and return compare statements
router.get("/", async (req, res) => {
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
                if (current.company === previous.company) {
                    if (current.job !== previous.job) {
                        changes.push(
                            `${current.name} has changed position from ${previous.job} to ${current.job} at ${current.company}.`
                        );
                    }
                } else {
                    changes.push(
                        `${current.name} moved companies from ${previous.company} to ${current.company}.`
                    );
                }
                
                if (current.location !== previous.location) {
                    changes.push(
                        `${current.name} changed location from ${previous.location} to ${current.location}.`
                    );
                }
                
                if (!changes.some(change => change.startsWith(`${current.name} has changed position`)) && current.job !== previous.job) {
                    changes.push(
                        `${current.name} has started a new job at ${current.company} as a ${current.job}.`
                    );
                }
            }
        });
        res.status(200).json(changes);
    } catch (error) {
        res.status(500).json({
            message: "Error getting both datasets and comparing changes.",
        });
    }
});

module.exports = router;
