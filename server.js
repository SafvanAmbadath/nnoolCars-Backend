require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./config/db");
const userRoutes=require("./routes/userRouter")
const authRoutes=require("./routes/authRouter")
const adminRoutes=require("./routes/adminRouter")

const userDb = require("./models/userSchema");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const socketIo = require('socket.io');


//database connection
db.dbconnection();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(morgan("tiny"));

//routes
app.use("/users",userRoutes);
app.use("/auth",authRoutes)
app.use("/admin",adminRoutes)



const port = process.env.PORT || 8080;

const server=app.listen(port, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});

const io = new socketIo.Server(server, {
    cors: {
        origin: "http://localhost:3000",
      // credentials:true
      methods: ["GET", "POST"],
    },
  });
  
  io.on("connection", (socket) => {
    // console.log(`user Connect: ${socket.id}`);
    socket.on("disconnect", () => {
      // console.log('disconnect socketid', socket.id)
    });
    socket.on("sendMessage", (data) => {
      socket.broadcast.emit("receive_message", data);
    });
  });
