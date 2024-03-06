const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const Ezen = require('../models/ezen')


// get all the companies with uc davis alumnus
router.get('/', async (req, res) => {
    try {
        const companies = await Ezen.find();
        const alumni = await Alumni.find();

        const companyMatch = companies.filter(company => {
            const match = alumni.find(alum =>
            alum.company === company.name);
            return { company, match }
        });
        res.status(200).json(companyMatch);
    } catch (error) {
        res.status(500).json({ message: 'Error getting all companies with UCD alumnus' });
    }
});


// Add new company and information
router.post('/', async (req, res) => {
    try {
        const newCompany = new Ezen({
            name: req.body.name,
            fundingInfo: req.body.fundingInfo,
            founders: req.body.founders,
            alumnis: req.body.alumnis
        })
        res.status(200).json(newCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Update company information, common use case should be to update alumni info
// received from linkedin
router.put('/', async (req, res) => {
   try {
        const {id} = req.params.id;
        const update = await Ezen.findByIdAndUpdate(id, req.body);
        if (!update) {
            return res.status(404).json({ message: "Not Found"})
        }
        res.status(200).json(update);
   } catch (error) {
       res.status(500).json({ message: 'Error updating alumni information.' });
   }
});

// Delete all equity zen information
router.delete('/', async (req, res) => {
    try {
        Ezen.deleteMany({});
        res.status(200).json({message : "All Equity Zen information deleted" +
                " succesfully."});
    } catch (error) {
        res.status(500).json({ message: 'Error deleting EquityZen information.' });
    }
});

module.exports = router;