const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");

const app = express();

dotenv.config();

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1:27017/Trading-cards-website")
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((err) => console.log(err));

const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const { SessionSecret } = require("./configs/config");

require("./middleware/passportAuth")(passport);

app.use(passport.initialize());

app.use(
  session({
    secret: SessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.session());

const usersRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route");
const cardRouter = require("./routes/card.route");
const cardCollectionRouter = require("./routes/cardCollection.route");
const postRouter = require("./routes/post.route");
const commentsRouter = require("./routes/comments.route");
const reportsRouter = require("./routes/reports.route");
const privateMessageRouter = require("./routes/privateMessage.route");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static("./uploads"));
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/cards", cardRouter);
app.use("/card-collection", cardCollectionRouter);
app.use("/posts", postRouter);
app.use("/comments", commentsRouter);
app.use("/reports", reportsRouter);
app.use("/private-messages", privateMessageRouter);

const PORT = 3900;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
