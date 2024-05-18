const express = require("express");
const router = express.Router();
const Alumni = require("../models/alumni");
const PrevAlumni = require("../models/prevalumni");
// get all alumni
// pagination
router.get("/", async (req, res) => {
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
                total_count: totalCount,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error getting alumni information." });
    }
});

router.get("/allalumni", async (req, res) => {
    try {
        const allAlumni = await Alumni.find();
        res.status(200).json(allAlumni);
    } catch (error) {
        res.status(500).json({ message: "Error getting alumni information." });
    }
});

// get one specific alumni for a url
router.get("/specificalumni", async (req, res) => {
    try {
        const specificAlumni = await Alumni.find({
            url: req.query.url,
        }).limit(1);
        res.status(200).json(specificAlumni);
    } catch (error) {
        res.status(500).json({ message: "Error getting alumni information." });
    }
});

router.put("/update", async (req, res) => {
    try {
        const updatedAlumni = await Alumni.findOneAndUpdate(
            { url: req.body.url },
            req.body,
            { new: true }
        );
        res.status(200).json(updatedAlumni);
    } catch (error) {
        res.status(500).json({ message: "Error updating alumni information." });
    }
});

// get count of all alumni
router.get("/count", async (req, res) => {
    try {
        const count = await Alumni.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({
            message: "Error getting the count of all alumni.",
        });
    }
});

// Get count of current alumni (graduate year must be this year)
router.get("/count/current", async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const count = await Alumni.countDocuments({
            graduationYear: currentYear,
        });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({
            message: `Error getting the count of current alumni for year ${currentYear}.`,
        });
    }
});

// get all unique company names
router.get("/getAllCompanies", async (req, res) => {
    try {
        const uniqueCompanies = await Alumni.aggregate([
            { $group: { _id: "$company" } },
        ]);

        const companyNames = uniqueCompanies.map((company) => company._id);

        res.status(200).json(companyNames);
    } catch (error) {
        res.status(500).json({
            message: "Error retreiving unique company names.",
        });
    }
});

// find alumni based on keyword
router.get("/search", async (req, res) => {
    try {
        const { keyword, graduationYear, filters, page } = req.query;
        const pageSize = 10;
        let query = {};

        if (keyword) {
            const keywordSearchConditions = [
                { name: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } },
                { job: { $regex: keyword, $options: "i" } },
                { company: { $regex: keyword, $options: "i" } },
                { major: { $regex: keyword, $options: "i" } },
                { otherEducation: { $regex: keyword, $options: "i" } },
            ];

            if (!query.$or) {
                query.$or = [];
            }

            keywordSearchConditions.forEach((condition) => {
                query.$or.push(condition);
            });
        }

        if (graduationYear) {
            query.graduationYear = graduationYear;
        }

        if (filters) {
            // Parse the filters array if it's a string
            const parsedFilters = Array.isArray(filters)
                ? filters
                : JSON.parse(filters);

            if (Array.isArray(parsedFilters)) {
                // Handle each filter value
                const filterConditions = parsedFilters.map((filterValue) => {
                    const fields = [
                        "name",
                        "location",
                        "job",
                        "company",
                        "major",
                        "otherEducation",
                    ];
                    const orConditions = fields.map((field) => ({
                        [field]: { $regex: filterValue, $options: "i" },
                    }));
                    return { $or: orConditions };
                });

                query.$or = query.$or
                    ? [...query.$or, ...filterConditions]
                    : filterConditions;
            }
        }

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
                total_count: totalCount,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error searching alumni information.",
        });
    }
});

// top 5 companies
router.get("/top-5-companies", async (req, res) => {
    try {
        const topCompanies = await Alumni.aggregate([
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        res.status(200).json(topCompanies);
    } catch (error) {
        res.status(500).json({ message: "Error retreiving top 5 companies" });
    }
});

// top 5 locations
router.get("/top-5-locations", async (req, res) => {
    try {
        const topLocations = await Alumni.aggregate([
            { $group: { _id: "$location", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        if (topLocations.length < 5) {
            res.status(200).json(topLocations);
        } else {
            res.status(200).json(topLocations.slice(0, 5));
        }
    } catch (error) {
        res.status(500).json({ message: "Error retreiving top 5 locations." });
    }
});

// top 5 jobs
router.get("/top-5-jobs", async (req, res) => {
    try {
        const topJobs = await Alumni.aggregate([
            { $group: { _id: "$job", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        if (topJobs.length < 5) {
            res.status(200).json(topJobs);
        } else {
            res.status(200).json(topJobs.slice(0, 5));
        }
    } catch (error) {
        res.status(500).json({ message: "Error retreiving top 5 jobs." });
    }
});

// post alumni information
router.post("/", async (req, res) => {
    const newAlumni = new Alumni({
        url: req.body.url,
        name: req.body.name,
        location: req.body.location,
        job: req.body.job,
        company: req.body.company,
        graduationYear: req.body.graduationYear,
        major: req.body.major,
        otherEducation: req.body.otherEducation,
        otherJobs: req.body.otherJobs ? req.body.otherJobs : [],
        html: req.body.html ? req.body.html : "",
        errorParsing: req.body.errorParsing,
    });

    const existingAlumni = new PrevAlumni({
        url: req.body.url,
        name: req.body.name,
        location: req.body.location,
        job: req.body.job,
        company: req.body.company,
        graduationYear: req.body.graduationYear,
        major: req.body.major,
        otherEducation: req.body.otherEducation,
        otherJobs: req.body.otherJobs ? req.body.otherJobs : [],
        html: req.body.html ? req.body.html : "",
        errorParsing: req.body.errorParsing,
    });

    try {
        const alumni = await newAlumni.save();
        await existingAlumni.save();
        res.status(201).json(alumni);
    } catch (error) {
        res.status(400).json({ message: "Error creating alumni information." });
    }
});

// delete all alumni information
router.delete("/", async (req, res) => {
    try {
        await Alumni.deleteMany({});
        res.status(200).json({
            message: "All alumni information deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting alumni information." });
    }
});

module.exports = router;
