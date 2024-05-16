const cors = require("cors");
const express = require('express');
const app = express();
const { default: mongoose } = require("mongoose");

const alumniRouter = require("./routes/alumnis");
const prevRouter = require('./routes/prevalumnis');
const compareRouter = require('./routes/compareAlumni');
const ezenRouter = require('./routes/ezen');
const emailRouter = require('./routes/sendEmails');

const PORT = process.env.PORT || 3002;

//const connectionString = "mongodb+srv://khphan:jeky123@webtoolfinder.qqct7yi.mongodb.net/Webtool";
const connectionString = "mongodb://127.0.0.1:27017/Webtool";
app.use(cors());
async function connect() {
  try {
    await mongoose.connect(connectionString);
    console.log("Connection established with Mongo DB Database");
  } catch (error) {
    console.log(`Error -> ${error}`);
  }
}

connect();

app.use(express.json());
app.use("/alumnis", alumniRouter);
app.use("/prevalumnis", prevRouter);
app.use("/compare", compareRouter);
app.use("/equity-zen", ezenRouter);
app.use("/emails", emailRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));