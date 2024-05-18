const express = require('express');
const router = express.Router();
const Alumni = require('../models/alumni');
const Ezen = require('../models/ezen')
const cron = require('node-cron');
const scrape = require('../scrollingEzen');



// get all the companies that are in the database
router.get('/', async (req, res) => {
    try {
        const companies = await Ezen.find().sort({name: 1});
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Error getting all companies with UCD alumnus' });
    }
});


// Add new company and information
router.post('/', async (req, res) => {
    try {
        const company = new Ezen({
            name: req.body.name,
            foundingDate: req.body.foundingDate,
            notableInvestors: req.body.notableInvestors,
            hq: req.body.hq,
            totalFunding: req.body.totalFunding,
            fundingRecord: req.body.fundingRecord,
            founders: req.body.founders,
            alumnis: req.body.alumnis,
            bio: req.body.bio,
            ezenLink: req.body.ezenLink
        })
        company.save();
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Update company information, common use case should be to update alumni info
// received from LinkedIn
router.put('/', async (req, res) => {
   try {
        const {id} = req.params.id;
        const update = await Ezen.findByIdAndUpdate(id, req.body);
        if (!update) {
            return res.status(404).json({ message: "Not Found"})
        }
        res.status(200).json(update);
   } catch (error) {
       res.status(500).json({ message: 'Error updating Ezen information.' });
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

const findAlumni = async () => {
    try {
        const alumnis = await Alumni.find();
        const ezen = await Ezen.find();

        for (const alumni of alumnis) {
            const matchFound = ezen.find(ezenMatch => ezenMatch.name === alumni.company);

            if (matchFound) {
                matchFound.alumnis.push({ name: alumni.name, position:
                    alumni.job, url: alumni.url});
            }
        }
        console.log("Update completed successfully");
    } catch (error) {
        throw new Error("Error getting company match for alumni.");
    }
}

const passiveScraping = async() => {
    try {
        const results = await scrape();
        const ezen = await Ezen.find();

        for(let result of results) {
            let duplicate = ezen.find(ezenMatch => result.name === ezenMatch.name);

            if (!duplicate) {
                const company = new Ezen({
                    name: result.name,
                    foundingDate: result.foundingDate,
                    notableInvestors: result.notableInvestors,
                    hq: result.hq,
                    totalFunding: result.totalFunding,
                    fundingRecord: result.fundingRecord,
                    founders: result.founders,
                    alumnis: result.alumnis,
                    bio: result.bio,
                    ezenLink: result.ezenLink
                })
                company.save();
            }
        }
    } catch (error) {
        console.error("Error scraping Equity Zen");
    }
}

const scrapeAndPost = async () => {
    try {
        await passiveScraping();
        await findAlumni();
    } catch (error) {
        console.error("Error scraping data and posting to database");
    }
}

if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 0 * * 1', async () => {
        try {
            await scrapeAndPost();
            console.log('Scraping and posting completed successfully');
        } catch (error) {
            console.error('Error scraping data and posting to database:', error.message);
        }
}, {
    timezone
});
}

module.exports = router;
