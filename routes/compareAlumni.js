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
            } else {
                if (current.job !== previous.job && current.company === previous.company) {
                    changes.push(`${current.name} has changed position from ${previous.job} to ${current.job} at ${current.company}.`);
                }
                if (current.company !== previous.company) {
                    changes.push(`${current.name} moved companies from ${previous.company} to ${current.company}.`);
                }
                if (current.location !== previous.location) {
                    changes.push(`${current.name} changed location from ${previous.location} to ${current.location}.`);
                }
                if (current.company !== previous.company ) {
                    changes.push(`${current.name} has started a new job at ${current.company} as a ${current.job}.`);
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
// pagination - 10 per page
router.get('/search-and-changes', async (req, res) => {
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
  
      const currentAlumni = await Alumni.find();
      const previousAlumni = await PrevAlumni.find();
  
      const changes = currentAlumni.filter(current => {
        const previous = previousAlumni.find(prev =>
          prev.name === current.name && prev.major === current.major && prev.graduationYear === current.graduationYear
        );
        if (!previous) {
          return false;
        } else {
          return current.job !== previous.job ||
                 current.company !== previous.company ||
                 current.location !== previous.location;
        }
      });
  
      const changesData = changes.map(current => {
        const previous = previousAlumni.find(prev =>
          prev.name === current.name &&
          prev.major === current.major &&
          (prev.location === current.location || (!prev.location && !current.location))
        );
        return { previous, current };
      });
  
      res.status(200).json({ changes: changesData, pagination: { total_pages: totalPages, current_page: pageNumber, total_count: totalCount } });
    } catch (error) {
      res.status(500).json({ message: 'Error searching alumni information.' });
    }
  });
  

module.exports = router;