const express = require("express");
const cors = require("cors");
const app = express();
const mongoConnect = require("./mongoconnect/mongoconnect");
const dotenv = require("dotenv");
dotenv.config();

//importing routes
const accounts = require("./routes/accounts/accounts");
const topics = require("./routes/topics/topics");
const feed = require("./routes/feed/feed");
const verifyToken = require("./middleware/auth");

app.use(cors());
app.use(express.json());
app.use("/accounts", accounts);
app.use("/topics", verifyToken, topics);

app.use("/feed", verifyToken, feed);

app.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    console.log(err);
  } else {
    mongoConnect();
    console.log(`Listening open PORT ${process.env.PORT}`);
  }
});
