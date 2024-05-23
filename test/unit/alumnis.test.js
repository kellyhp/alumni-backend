const request = require('supertest');
const app = require('../../server');
const Alumni = require('../../models/alumni');
const PrevAlumni = require('../../models/prevalumni');
const Subscriber = require('../../models/subscribers');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let mongoConnection;

describe('Alumni Routes', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const dbUri = mongoServer.getUri();
        mongoConnection = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await Alumni.deleteMany({});
        await PrevAlumni.deleteMany({});
    });
    
    afterEach(async () => {
        if (mongoConnection) {
            const collections = await mongoConnection.connection.db.collections();
            for (const collection of collections) {
                await collection.drop();
            }
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should create a new alumni', async () => {
        const response = await request(app).post('/alumnis').send({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('John Doe');
        expect(response.body.job).toBe('Software Engineer');
    });

    it('should get all alumni with pagination', async () => {
        for (let i = 0; i < 15; i++) {
        await Alumni.create({
            url: `john-doe-${i}`,
            name: `John Doe ${i}`,
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
        }

        const response = await request(app).get('/alumnis?page=1');
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(10);
        expect(response.body.pagination.total_pages).toBe(2);
    });

    it('should get all alumni', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
        const response = await request(app).get('/alumnis/allalumni');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe('John Doe');
    });

    it('should get one specific alumni by URL', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
        const response = await request(app).get('/alumnis/specificalumni?url=john-doe');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe('John Doe');
    });

    it('should update alumni information', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });

        const response = await request(app).put('/alumnis/update').send({
            url: 'john-doe',
            name: 'Jonathan Doe',
            location: 'Mountain View, CA',
            job: 'Senior Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'PhD in Computer Science',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University', 'Researcher at MIT'],
            html: '<p>Updated profile description from LinkedIn</p>',
            errorParsing: true
        });
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Jonathan Doe');
        expect(response.body.location).toBe('Mountain View, CA');
        expect(response.body.job).toBe('Senior Software Engineer');
        expect(response.body.company).toBe('Google');
        expect(response.body.graduationYear).toBe(2020);
        expect(response.body.major).toBe('Computer Science');
        expect(response.body.otherEducation).toBe('PhD in Computer Science');
        expect(response.body.otherJobs).toEqual(['Intern at Facebook', 'TA at Stanford University', 'Researcher at MIT']);
        expect(response.body.html).toBe('<p>Updated profile description from LinkedIn</p>');
        expect(response.body.errorParsing).toBe(true);
    });

    it('should get the count of all alumni', async () => {
        for (let i = 0; i < 15; i++) {
            await Alumni.create({
                url: `Alumni-${i}`,
                name: `Alumni ${i}`,
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020 - i,
                major: 'Computer Science',
                otherEducation: 'MSc in Artificial Intelligence',
                otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            });
        }
    
        const response = await request(app).get('/alumnis/count');
        expect(response.status).toBe(200);
        expect(response.body.count).toBe(15);
    });
    
    it('should get the count of current year alumni', async () => {
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 5; i++) {
            await Alumni.create({
                url: `Alumni-${i}`,
                name: `Alumni ${i}`,
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: currentYear,
                major: 'Computer Science',
                otherEducation: 'MSc in Artificial Intelligence',
                otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            });
        }
        for (let i = 0; i < 15; i++) {
            await Alumni.create({
                url: `Alumni-${i}`,
                name: `Alumni ${i}`,
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020 - i,
                major: 'Computer Science',
                otherEducation: 'MSc in Artificial Intelligence',
                otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            });
        }
    
        const response = await request(app).get('/alumnis/count/current');
        expect(response.status).toBe(200);
        expect(response.body.count).toBe(5);
    });

    it('should get all unique company names', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
            });
        await Alumni.create({
            url: 'jane-smith',
            name: 'Jane Smith',
            location: 'New York, NY',
            job: 'Product Manager',
            company: 'Facebook',
            graduationYear: 2019,
            major: 'Business Administration',
            otherEducation: 'MBA',
            otherJobs: ['Intern at Amazon', 'Consultant at McKinsey'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
        const response = await request(app).get('/alumnis/getAllCompanies');
        expect(response.status).toBe(200);
        expect(response.body).toContain('Google');
        expect(response.body).toContain('Facebook');
        });

    it('should search alumni based on keyword', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });

        const response = await request(app).get('/alumnis/search?keyword=John');
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('John Doe');
    });

    it('should search alumni based on keyword and graduation year', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
    
        const response = await request(app).get('/alumnis/search?keyword=John&graduationYear=2020');
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('John Doe');
    });
    
    it('should search alumni based on keyword and pagination', async () => {
        await Alumni.create([
            {
                url: 'john-doe',
                name: 'John Doe',
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                otherEducation: 'MSc in Artificial Intelligence',
                otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            },
            {
                url: 'jane-smith',
                name: 'Jane Smith',
                location: 'New York, NY',
                job: 'Data Scientist',
                company: 'Microsoft',
                graduationYear: 2019,
                major: 'Computer Science',
                otherEducation: 'PhD in Machine Learning',
                otherJobs: ['Intern at Google', 'Researcher at MIT'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            }
        ]);
    
        const response = await request(app).get('/alumnis/search?keyword=John&page=1');
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('John Doe');
    });

    it('should search alumni based on keyword, graduation year, and pagination', async () => {
        await Alumni.create([
            {
                url: 'john-doe',
                name: 'John Doe',
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                otherEducation: 'MSc in Artificial Intelligence',
                otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            },
            {
                url: 'jane-smith',
                name: 'Jane Smith',
                location: 'New York, NY',
                job: 'Data Scientist',
                company: 'Microsoft',
                graduationYear: 2019,
                major: 'Computer Science',
                otherEducation: 'PhD in Machine Learning',
                otherJobs: ['Intern at Google', 'Researcher at MIT'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            }
        ]);
    
        const response = await request(app).get('/alumnis/search?keyword=John&graduationYear=2020&page=1');
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('John Doe');
    });
    
    it('should get top 5 companies', async () => {
        for (let i = 0; i < 10; i++) {
        const companyName = `Company ${i}`;
        await Alumni.create({
            url: `john-doe-${i}`,
            name: `John Doe ${i}`,
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: companyName,
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
        }

        const response = await request(app).get('/alumnis/top-5-companies');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
    });

    it('should get top 5 locations', async () => {
        const locations = ['New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA', 'San Diego, CA'];
        for (let i = 0; i < locations.length; i++) {
            await Alumni.create({
            url: `alumni-${i}`,
            name: `Alumni ${i}`,
            location: locations[i],
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
            });
        }

        const response = await request(app).get('/alumnis/top-5-locations');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        });

    it('should get top 5 jobs', async () => {
        const jobs = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Software Developer', 'Business Analyst', 'Electrical Engineer'];
        for (let i = 0; i < jobs.length; i++) {
            await Alumni.create({
                url: `alumni-${i}`,
                name: `Alumni ${i}`,
                location: 'San Francisco, CA',
                job: jobs[i],
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                otherEducation: 'MSc in Artificial Intelligence',
                otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
                html: '<p>Profile description from LinkedIn</p>',
                errorParsing: false
            });
        }

        const response = await request(app).get('/alumnis/top-5-jobs');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        });

    it('should delete all alumni information', async () => {
        await Alumni.create({
            url: 'john-doe',
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            otherEducation: 'MSc in Artificial Intelligence',
            otherJobs: ['Intern at Facebook', 'TA at Stanford University'],
            html: '<p>Profile description from LinkedIn</p>',
            errorParsing: false
        });
            const response = await request(app).delete('/alumnis');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('All alumni information deleted successfully.');
        });
}); 


describe('Comparison of Alumni Data', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const dbUri = mongoServer.getUri();
        mongoConnection = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await Alumni.deleteMany({});
        await PrevAlumni.deleteMany({});
    });
    
    afterEach(async () => {
        if (mongoConnection) {
            const collections = await mongoConnection.connection.db.collections();
            for (const collection of collections) {
                await collection.drop();
            }
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should identify no changes', async () => {
        const alumniData = {
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        await Alumni.create(alumniData);
        await PrevAlumni.create(alumniData);

        const response = await request(app).get('/compare');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should identify changes in position', async () => {
        const currentAlumni = {
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Senior Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        const previousAlumni = {
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        await Alumni.create(currentAlumni);
        await PrevAlumni.create(previousAlumni);

        const response = await request(app).get('/compare');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            'John Doe has changed position from Software Engineer to Senior Software Engineer at Google.'
        ]);
    });

    it('should identify changes in company', async () => {
        const currentAlumni = {
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Apple',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        const previousAlumni = {
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        await Alumni.create(currentAlumni);
        await PrevAlumni.create(previousAlumni);

        const response = await request(app).get('/compare');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            'John Doe moved companies from Google to Apple.'
        ]);
    });

    it('should identify changes in location', async () => {
        const currentAlumni = {
            name: 'John Doe',
            location: 'New York, NY',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        const previousAlumni = {
            name: 'John Doe',
            location: 'San Francisco, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        await Alumni.create(currentAlumni);
        await PrevAlumni.create(previousAlumni);

        const response = await request(app).get('/compare');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            'John Doe changed location from San Francisco, CA to New York, NY.'
        ]);
    });

    it('should identify starting a new job', async () => {
        const currentAlumni = {
            name: 'John Doe',
            location: 'San Jose, CA',
            job: 'Senior Software Engineer',
            company: 'Nvidia',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        const previousAlumni = {
            name: 'John Doe',
            location: 'San Jose, CA',
            job: 'Software Engineer',
            company: 'Google',
            graduationYear: 2020,
            major: 'Computer Science',
            url: 'john-doe',
            errorParsing: false
        };
        await Alumni.create(currentAlumni);
        await PrevAlumni.create(previousAlumni);

        const response = await request(app).get('/compare');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            'John Doe moved companies from Google to Nvidia.',
            'John Doe has started a new job at Nvidia as a Senior Software Engineer.'
        ]);
    });
    it('should identify multiple changes and movements', async () => {
        const currentAlumni = [
            {
                name: 'John Doe',
                location: 'San Francisco, CA',
                job: 'Senior Software Engineer',
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                url: 'john-doe',
                errorParsing: false
            },
            {
                name: 'Jane Smith',
                location: 'New York, NY',
                job: 'Software Engineer',
                company: 'Microsoft',
                graduationYear: 2018,
                major: 'Electrical Engineering',
                url: 'jane-smith',
                errorParsing: false
            }
        ];
    
        const previousAlumni = [
            {
                name: 'John Doe',
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                url: 'john-doe',
                errorParsing: false
            },
            {
                name: 'Jane Smith',
                location: 'Los Angeles, CA',
                job: 'Systems Analyst',
                company: 'Apple',
                graduationYear: 2018,
                major: 'Electrical Engineering',
                url: 'jane-smith',
                errorParsing: false
            }
        ];
    
        await Alumni.insertMany(currentAlumni);
        await PrevAlumni.insertMany(previousAlumni);
    
        const response = await request(app).get('/compare');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            'John Doe has changed position from Software Engineer to Senior Software Engineer at Google.',
            'Jane Smith moved companies from Apple to Microsoft.',
            'Jane Smith changed location from Los Angeles, CA to New York, NY.',
            'Jane Smith has started a new job at Microsoft as a Software Engineer.'
        ]);
    });    
});

describe('Previous Alumni Routes', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const dbUri = mongoServer.getUri();
        mongoConnection = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await Alumni.deleteMany({});
        await PrevAlumni.deleteMany({});
    });
    
    afterEach(async () => {
        if (mongoConnection) {
            const collections = await mongoConnection.connection.db.collections();
            for (const collection of collections) {
                await collection.drop();
            }
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should get all previous alumni', async () => {
        const alumniData = [
            {
                url: 'john-doe',
                name: 'John Doe',
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                errorParsing: false
            },
            {
                url: 'jane-smith',
                name: 'Jane Smith',
                location: 'New York, NY',
                job: 'Product Manager',
                company: 'Microsoft',
                graduationYear: 2019,
                major: 'Business Administration',
                errorParsing: false
            }
        ];
        await PrevAlumni.insertMany(alumniData);

        const response = await request(app).get('/prevalumnis');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should delete all previous alumni', async () => {
        const alumniData = [
            {
                url: 'john-doe',
                name: 'John Doe',
                location: 'San Francisco, CA',
                job: 'Software Engineer',
                company: 'Google',
                graduationYear: 2020,
                major: 'Computer Science',
                errorParsing: false
            },
            {
                url: 'jane-smith',
                name: 'Jane Smith',
                location: 'New York, NY',
                job: 'Product Manager',
                company: 'Microsoft',
                graduationYear: 2019,
                major: 'Business Administration',
                errorParsing: false
            }
        ];
        await PrevAlumni.insertMany(alumniData);

        const response = await request(app).delete('/prevalumnis');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('All alumni information deleted successfully.');
        const allAlumni = await PrevAlumni.find();
        expect(allAlumni.length).toBe(0);
    });

    it('should handle errors when getting previous alumni', async () => {
        jest.spyOn(PrevAlumni, 'find').mockImplementationOnce(() => {
            throw new Error('Mock error while fetching previous alumni');
        });

        const response = await request(app).get('/prevalumnis');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error getting all alumni information.');
    });

    it('should handle errors when deleting previous alumni', async () => {
        jest.spyOn(PrevAlumni, 'deleteMany').mockImplementationOnce(() => {
            throw new Error('Mock error while deleting previous alumni');
        });

        const response = await request(app).delete('/prevalumnis');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error deleting all alumni information.');
    });
});