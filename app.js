require("dotenv").config();
const connectDB = require("./db/connect");
const express = require("express");
const morgan = require("morgan");
const app = express();
const routes = require("./routes/routes");
app.set("view engine", "ejs");

app.use(morgan("dev"));

app.use("/", routes);

const port = process.env.PORT || 5000;
const start = () => {
  try {
    connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
