const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');

// get all alumni
router.get('/', async (req, res) => {
    try {
      const allAlumni = await Alumni.find();
      res.status(200).json(allAlumni);
    } catch (error) {
      res.status(500).json({ message: 'Error getting all alumni information.' });
    }
  });

// get all unique company names
router.get('/getAllCompanies', async (req, res) => {
  try {
      const uniqueCompanies = await Alumni.aggregate([
          { $group: { _id: '$company' } } 
      ]);

      const companyNames = uniqueCompanies.map(company => company._id);

      res.status(200).json(companyNames);
  } catch (error) {
      res.status(500).json({ message: 'Error retreiving unique company names.'});
  }
});
  
// find alumni based on keyword
router.get('/search', async (req, res) => {
  const { keyword, graduationYear, filters } = req.query;
  let query = {};

  if (keyword) {
      const keywordSearchConditions = [
          { name: { $regex: keyword, $options: 'i' } },
          { location: { $regex: keyword, $options: 'i' } },
          { job: { $regex: keyword, $options: 'i' } },
          { company: { $regex: keyword, $options: 'i' } },
          { major: { $regex: keyword, $options: 'i' } },
          { otherEducation: { $regex: keyword, $options: 'i' } }
      ];

      keywordSearchConditions.forEach(condition => {
          if (!query.$or) {
              query.$or = [];
          }
          query.$or.push(condition);
      });
  }

  if (graduationYear) {
      query.graduationYear = graduationYear;
  }

  if (filters) {
      const parsedFilters = JSON.parse(filters);
      parsedFilters.forEach(filter => {
          query[filter.field] = filter.value;
      });
  }

  try {
      const foundAlumni = await Alumni.find(query).exec();

      res.status(200).json(foundAlumni);
  } catch (error) {
      res.status(500).json({ message: 'Error searching alumni information.' });
  }
});
  
// top 5 companies
router.get('/top-5-companies', async (req, res) => {
    try {
      const topCompanies = await Alumni.aggregate([
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      res.status(200).json(topCompanies);
    } catch (error) {
      res.status(500).json({ message: 'Error retreiving top 5 companies' });
    }
  });
  
// top 5 locations
router.get('/top-5-locations', async (req, res) => {
    try {
      const topLocations = await Alumni.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      if (topLocations.length < 5) {
        res.status(200).json(topLocations);
      } else {
        res.status(200).json(topLocations.slice(0, 5));
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retreiving top 5 locations.' });
    }
  });
  
// top 5 jobs
router.get('/top-5-jobs', async (req, res) => {
    try {
      const topJobs = await Alumni.aggregate([
        { $group: { _id: '$job', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      if (topJobs.length < 5) {
        res.status(200).json(topJobs);
      } else {
        res.status(200).json(topJobs.slice(0, 5));
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retreiving top 5 jobs.' });
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
      res.status(500).json({ message: 'Error deleting alumni information.' });
  }
  });
  
module.exports = router;