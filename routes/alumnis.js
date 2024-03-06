const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');

// get all alumni
// pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  try {
      const totalCount = await Alumni.countDocuments(); 
      const totalPages = Math.ceil(totalCount / pageSize);

      const currentAlumni = await Alumni.find()
          .skip((page - 1) * pageSize) 
          .limit(pageSize);

      res.status(200).json({
          data: currentAlumni,
          pagination: {
              total_pages: totalPages,
              current_page: page,
              total_count: totalCount
          }
      });
    } catch (error) {
        res.status(500).json({ message: 'Error getting alumni information.' });
    }
});

// get count of all alumni
router.get('/count', async (req, res) => {
  try {
      const count = await Alumni.countDocuments();
      res.status(200).json({ count });
  } catch (error) {
      res.status(500).json({ message: 'Error getting the count of all alumni.' });
  }
});  

// Get count of current alumni (graduate year must be this year)
router.get('/count/current', async (req, res) => {
  try {
      const currentYear = new Date().getFullYear();
      const count = await Alumni.countDocuments({ graduationYear: currentYear });
      res.status(200).json({ count });
  } catch (error) {
      res.status(500).json({ message: `Error getting the count of current alumni for year ${currentYear}.` });
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
  const { keyword, graduationYear, filters, page } = req.query;
  const pageSize = 10;
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

    if (!query.$or) {
      query.$or = [];
    }

    keywordSearchConditions.forEach(condition => {
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
    const totalCount = await Alumni.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);
    const pageNumber = parseInt(page) || 1;

    const foundAlumni = await Alumni.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.status(200).json({
      data: foundAlumni,
      pagination: {
        total_pages: totalPages,
        current_page: pageNumber,
        total_count: totalCount
      }
    });
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