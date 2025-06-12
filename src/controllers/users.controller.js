import { turso } from "../config/turso.js";
import { v4 as uuidv4 } from "uuid";

import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";

export const validateUser = [
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("El nombre de usuario debe tener al menos 3 caracteres"),
];

const userControllers = {
  getUsers: async (req, res) => {
    try {
      const result = await turso.execute("SELECT * FROM Users");
      res.json(result.rows);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Database error occurred");
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await turso.execute({
        sql: "SELECT * FROM Users WHERE id = ?",
        args: [id],
      });

      if (result.rows.length === 0) {
        return res.status(404).send("User not found");
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Database error occurred");
    }
  },

  createUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, gender, password, avatar } = req.body;

      const emailCheck = await turso.execute({
        sql: "SELECT id FROM Users WHERE email = ?",
        args: [email],
      });

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const usernameCheck = await turso.execute({
        sql: "SELECT id FROM Users WHERE username = ?",
        args: [username],
      });

      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const id = uuidv4();
      const created_at = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await turso.execute({
        sql: "INSERT INTO Users (id, username, email, avatar, password, gender, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [id, username, email, avatar, password, gender, created_at],
      });

      if (result.rowsAffected === 1) {
        res.status(201).json({
          message: "User created successfully",
        });
      } else {
        res.status(400).json({ message: "Failed to create user" });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await turso.execute({
        sql: "DELETE FROM Users WHERE id = ?",
        args: [id],
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({
          message: "User deleted successfully",
        });
      } else {
        res.status(404).json({
          message: "User not found or could not be deleted",
        });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Database error occurred");
    }
  },

  updateUser: async (req, res) => {
    try {
      if (req.body.password || req.body.email) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
      }

      const { id } = req.params;
      const { username, email, avatar, gender } = req.body;

      const checkUser = await turso.execute({
        sql: "SELECT id FROM Users WHERE id = ?",
        args: [id],
      });

      if (checkUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateFields = [];
      const updateValues = [];

      if (username !== undefined) {
        if (username) {
          const usernameCheck = await turso.execute({
            sql: "SELECT id FROM Users WHERE username = ? AND id != ?",
            args: [username, id],
          });

          if (usernameCheck.rows.length > 0) {
            return res.status(409).json({ message: "Username already taken" });
          }
        }
        updateFields.push("username = ?");
        updateValues.push(username);
      }
      if (email !== undefined) {
        if (email) {
          const emailCheck = await turso.execute({
            sql: "SELECT id FROM Users WHERE email = ? AND id != ?",
            args: [email, id],
          });

          if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: "Email already in use" });
          }
        }
        updateFields.push("email = ?");
        updateValues.push(email);
      }
      if (avatar !== undefined) {
        updateFields.push("avatar = ?");
        updateValues.push(avatar);
      }
      if (gender !== undefined) {
        updateFields.push("gender = ?");
        updateValues.push(gender);
      }

      // if (password !== undefined) {
      //   const saltRounds = 10;
      //   const hashedPassword = await bcrypt.hash(password, saltRounds);
      //   updateFields.push("password = ?");
      //   updateValues.push(hashedPassword);
      // }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ message: "No fields to update provided" });
      }

      updateValues.push(id);

      const result = await turso.execute({
        sql: `UPDATE Users SET ${updateFields.join(", ")} WHERE id = ?`,
        args: updateValues,
      });

      if (result.rowsAffected === 1) {
        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update user" });
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

  // loginUser: async (req, res) => {
  //   try {
  //     const { email, password } = req.body;

  //     if (!email || !password) {
  //       return res
  //         .status(400)
  //         .json({ message: "Email and password are required" });
  //     }

  //     const result = await turso.execute({
  //       sql: "SELECT * FROM Users WHERE email = ?",
  //       args: [email],
  //     });

  //     if (result.rows.length === 0) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     const user = result.rows[0];
  //     const passwordMatch = await bcrypt.compare(password, user.password);

  //     if (!passwordMatch) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     res.status(200).json({
  //       message: "Login successful",
  //       user: {
  //         id: user.id,
  //         username: user.username,
  //         email: user.email,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // },
};

export default userControllers;
