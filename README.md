# **Backend Technology Guide**

## **Overview**

This document provides a comprehensive guide to the backend code for our application, covering architecture, technologies used, dependencies, prerequisites, system requirements, installation steps, configuration parameters, environment setup, external service integration, deployment process, version history, and known issues and limitations.

# Link to frontend and chrome extension
1. [Frontend](https://github.com/kellyhp/alumni-frontend)
2. [Extension](https://github.com/edjohn/alumni-webtools)

## **Architecture**

Our backend code is organized into the following key components:

- **Models Folder**: Contains all the schema definitions using Mongoose for MongoDB.
- **Routes Folder**: Contains the route handlers for the API endpoints.
- **Scraping Scripts**: Separate JavaScript files for web scraping using Puppeteer.
- **Testing Folder:** Contains all of the test cases for the API and scraping code.
- **Server.js**: The main entry point of the application that sets up the Express server and middleware.

## **Technologies Used**

- **Express**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Resend**: A service for sending emails.
- **Node-Cron**: A task scheduler in pure JavaScript for node.js.
- **Node-Fetch**: A light-weight module that brings window.fetch to Node.js.
- **Puppeteer**: A Node library that provides a high-level API to control Chrome or Chromium over the DevTools Protocol.
- **Dotenv**: A zero-dependency module that loads environment variables from a .env file into process.env.

##

##

## **Dependencies**

The backend application has the following dependencies:

"dependencies": { "cors": "^2.8.5", "dotenv": "^16.4.5", "express": "^4.18.2", "i":"^0.3.7", "mongodb": "^6.3.0", "mongoose": "^8.2.0", "node-cron": "^3.0.3", "node-fetch": "^3.3.2", "nodemon": "^3.1.0", "puppeteer": "^22.3.0", "resend": "^3.2.0" },"devDependencies": { "@shelf/jest-mongodb": "^4.3.2", "jest": "^29.7.0","supertest": "^7.0.0" }

## **Prerequisites**

- Node.js (v16.x or later)
- MongoDB (v4.x or later)
- npm (v7.x or later)

## **System Requirements**

- A machine with at least 2GB RAM.
- An active internet connection for fetching data and external integrations.

## **Installation Steps**

**Clone the repository**:

git clone https://github.com/Webtools-Alumni-UC-Davis/alumni-backend

```cd alumni-backend```

**Install dependencies**:

```npm run install```

**Set up environment variables**: Create a .env file in the root directory and add the necessary environment variables as described in the Configuration Parameters section.

**Run the development server**:

```npm run start```

## **Configuration Parameters**

The .env file should contain the following configuration parameters:
```
PORT=3000

MONGODB_URI=mongodb://localhost:27017/yourdb

RESEND_API_KEY=your_resend_api_key

CRON_SCHEDULE=0 0 1 \* \*
```
## **Environment Setup**

1. **MongoDB**: Ensure MongoDB is installed and running on your machine. Use the URI MONGODB_URI in the .env file to connect to your database.
2. **Node.js and npm**: Ensure Node.js and npm are installed.

## **External Service Integration**

- **Resend**: Used for sending emails. Ensure the RESEND_API_KEY is set in your .env file.
- **Puppeteer**: Used for web scraping.

## **Deployment Process**

**Build and package the application**:

```npm run build```

**Deploy to a server**: Copy the files to your server or deploy using a platform like Heroku, AWS, Render, or DigitalOcean. But for this case, it will be deployed onto the server onto UC Davis.

**Start the application**:

```npm run start```

##

## **Version History**

- **v1.0.0**: Initial release with basic CRUD operations for alumni, companies, and subscribers.

## **Known Issues and Limitations**

- **Cron Job Interference**: The server can run indefinitely due to active cron jobs. This is mitigated in testing by using a timeout.
- **Scraping Limitations**: The Puppeteer-based scraping may break if the target websites change their structure.
