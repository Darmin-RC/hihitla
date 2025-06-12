import { turso } from "../config/turso.js";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult } from "express-validator";

const postControllers = {
  getPosts: async (req, res) => {
    try {
      const result = await turso.execute("SELECT * FROM Posts");
      res.json(result.rows);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Database error occurred");
    }
  },

  getPostById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await turso.execute({
        sql: "SELECT * FROM Posts WHERE id = ?",
        args: [id],
      });

      if (result.rows.length === 0) {
        return res.status(404).send("Post not found");
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Database error occurred");
    }
  },

  createPost: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { author_id, text, image_url, shared_from_post_id } = req.body;

      const id = uuidv4();
      const created_at = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const result = await turso.execute({
        sql: "INSERT INTO Posts (id, author_id, text, image_url, shared_from_post_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, author_id, text, image_url, shared_from_post_id, created_at],
      });

      if (result.rowsAffected === 1) {
        res.status(201).json({
          message: "Post created successfully",
        });
      } else {
        res.status(400).json({ message: "Failed to create post" });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await turso.execute({
        sql: "DELETE FROM Posts WHERE id = ?",
        args: [id],
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({
          message: "Post deleted successfully",
        });
      } else {
        res.status(404).json({
          message: "Post not found or could not be deleted",
        });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Database error occurred");
    }
  },

  updatePost: async (req, res) => {
    try {
      if (req.body.password || req.body.email) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
      }

      const { id } = req.params;
      const { text } = req.body;

      const checkPost = await turso.execute({
        sql: "SELECT id FROM Posts WHERE id = ?",
        args: [id],
      });

      if (checkPost.rows.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      const updateFields = [];
      const updateValues = [];

      if (text !== undefined) {
        updateFields.push("text = ?");
        updateValues.push(text);
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ message: "No fields to update provided" });
      }

      updateValues.push(id);

      const result = await turso.execute({
        sql: `UPDATE Posts SET ${updateFields.join(", ")} WHERE id = ?`,
        args: updateValues,
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({ message: "Post updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update post" });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};

export default postControllers;
