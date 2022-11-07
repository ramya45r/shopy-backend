const express = require("express")
const dotenv =require('dotenv').config()
const cors =require("cors");
const { errorHandler,notFound  } = require("./middlewares/error/errorHandler");

const userRoutes =require('./route/users/usersRoute')

const dbconfig =require("./config/db/dbConnect")
const PORT =process.env.PORT || 5000;
const connectDB =require("./config/db/dbConnect");
const postRoute = require("./route/posts/postRoute");
const categoryRoute = require("./route/category/categoryRoute");

const commentRoutes = require("./route/comments/commentRoute");
const conversationRoutes = require("./route/conversation/conversationRoute");
const messageRoutes = require("./route/messages/messages");

const app =express()

//middleware
app.use(express.json());
//cors
app.use(cors())

app.use("/api/users",userRoutes);
//Post userRoutes
app.use("/api/posts",postRoute);
// category Route
app.use("/api/category",categoryRoute);

//commentRoute
app.use("/api/comments",commentRoutes)
//conversationRoute
app.use("/api/conversation",conversationRoutes)

//messageRoute
app.use("/api/message",messageRoutes);

//error handler
app.use(notFound )
app.use(errorHandler);







app.listen(PORT,console.log(`server is running ${PORT}`));
//112VmxLmLQr6mWzd