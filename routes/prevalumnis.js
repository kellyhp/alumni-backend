const express = require('express');
const router = express.Router();
const Alumni = require('../models/prevalumni');

// get all alumni
router.get('/', async (req, res) => {
    try {
      const allAlumni = await Alumni.find();
      res.status(200).json(allAlumni);
    } catch (error) {
      res.status(500).json({ message: 'Error getting all alumni information.' });
    }
});

// post alumni information
router.post('/', async (req, res) => {
    console.log(req.body)
    const newAlumni = new Alumni({
      name: req.body.name,
      location: req.body.location,
      job: req.body.job,
      company: req.body.company,
      graduationYear: req.body.graduationYear,
      major: req.body.major,
      otherEducation: req.body.otherEducation
    });
    try {
      const alumni = await newAlumni.save();
      res.status(201).json(alumni);
    } catch (error) {
      res.status(400).json({ message: 'Error creating alumni information.' });
    }
});  

  // delete all alumni information
router.delete('/', async (req, res) => {
    try {
        await Alumni.deleteMany({});
        res.status(200).json({ message: 'All alumni information deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message:'Error deleting all alumni information.' });
    }
});

module.exports = router;