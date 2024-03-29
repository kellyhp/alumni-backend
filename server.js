const cors = require("cors");
const express = require('express');
const app = express();
const { default: mongoose } = require("mongoose");

const alumniRouter = require("./routes/alumnis");
const prevRouter = require('./routes/prevalumnis');
const compareRouter = require('./routes/compareAlumni');
const ezenRouter = require('./routes/ezen')

const PORT = process.env.PORT || 3001;

const connectionString = "mongodb+srv://khphan:jeky123@webtoolfinder.qqct7yi.mongodb.net/Webtool";

app.use(cors());
async function connect() {
  try {
    await mongoose.connect(connectionString);
    console.log("Connection with Mongo DB");
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

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));