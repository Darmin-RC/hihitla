import { turso } from "../config/turso.js";

const likesController = {
  getLikes: async (req, res) => {
    try {
      const result = await turso.execute("SELECT * FROM Post_likes");
      res.json(result.rows);
    } catch (error) {
      res.status(500).send("Database error occurred");
    }
  },

  createLike: async (req, res) => {
    try {
      const { user_id, post_id } = req.body;

      const check = await turso.execute({
        sql: "SELECT * FROM Post_likes WHERE user_id = ? AND post_id = ?",
        args: [user_id, post_id],
      });

      if (check.rows.length > 0) {
        return res.status(400).json({ message: "Like already exists" });
      }

      const result = await turso.execute({
        sql: "INSERT INTO Post_likes (user_id, post_id) VALUES (?, ?)",
        args: [user_id, post_id],
      });

      if (result.rowsAffected === 1) {
        res.status(201).json({ message: "Like created successfully" });
      } else {
        res.status(400).json({ message: "Failed to create like" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteLike: async (req, res) => {
    try {
      const { user_id, post_id } = req.body;

      const result = await turso.execute({
        sql: "DELETE FROM Post_likes WHERE user_id = ? AND post_id = ?",
        args: [user_id, post_id],
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({ message: "Like deleted successfully" });
      } else {
        res.status(404).json({ message: "Like not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Database error occurred" });
    }
  },
};

export default likesController;
