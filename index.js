require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

require("./db");
const authRouter = require("./routers/auth");
const userRouter = require("./routers/users");
const videoRouter = require("./routers/videos");
const commentRouter = require("./routers/comments");

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT;

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/comments", commentRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.listen(PORT, () => {
  console.log("Server up on : ", PORT);
});
