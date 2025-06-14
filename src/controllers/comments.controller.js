import { turso } from "../config/turso.js";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";

const commentsControllers = {
  
getComments: async (req, res) => {
  try {
    const { id: post_id } = req.params;

    if (!post_id) {
      return res.status(400).json({ message: "Missing post_id parameter" });
    }

    const result = await turso.execute({
      sql: `
        SELECT c.*, u.username, u.avatar 
        FROM Comments c
        JOIN Users u ON c.author_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
      `,
      args: [post_id],
    });

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error occurred");
  }
},

  getCommentById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await turso.execute({
        sql: "SELECT * FROM Comments WHERE id = ?",
        args: [id],
      });

      if (result.rows.length === 0) {
        return res.status(404).send("Comment not found");
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).send("Database error occurred");
    }
  },

  createComment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { post_id, author_id, text } = req.body;
      const id = uuidv4();
      const created_at = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const result = await turso.execute({
        sql: "INSERT INTO Comments (id, post_id, author_id, text, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [id, post_id, author_id, text, created_at],
      });

      if (result.rowsAffected === 1) {
        res.status(201).json({ message: "Comment created successfully" });
      } else {
        res.status(400).json({ message: "Failed to create comment" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await turso.execute({
        sql: "DELETE FROM Comments WHERE id = ?",
        args: [id],
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({ message: "Comment deleted successfully" });
      } else {
        res
          .status(404)
          .json({ message: "Comment not found or could not be deleted" });
      }
    } catch (error) {
      res.status(500).send("Database error occurred");
    }
  },

  updateComment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { text } = req.body;

      const checkPost = await turso.execute({
        sql: "SELECT id FROM Comments WHERE id = ?",
        args: [id],
      });

      if (checkPost.rows.length === 0) {
        return res.status(404).json({ message: "Comment not found" });
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
        sql: `UPDATE Comments SET ${updateFields.join(", ")} WHERE id = ?`,
        args: updateValues,
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({ message: "Comment updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update comment" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default commentsControllers;
