import express from "express";
import cors from "cors";
import config from "./config/config.js";
import userRoutes from "./routes/users.routes.js";
import postRoutes from "./routes/posts.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import likesRoutes from "./routes/likes.routes.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
});)

// rutas de usuarios brow
app.use(userRoutes);

// rutas de posts brow
app.use(postRoutes);

// rutas de comentariois brow
app.use(commentRoutes);

// rutas de likes brooodaa
app.use(likesRoutes);

app.listen(
  config.port,
  console.log(`server listening on port: ${config.port}`)
);
