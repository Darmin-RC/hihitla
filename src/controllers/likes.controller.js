import { turso } from "../config/turso.js";

const likesController = {
  // Obtener likes por post_id
  getLikes: async (req, res) => {
    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ message: "Post ID es requerido" });
    }

    try {
      const result = await turso.execute(
        "SELECT * FROM Post_likes WHERE post_id = ?",
        [postId]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error al obtener likes del post:", error);
      return res.status(500).json({ message: "Error al acceder a la base de datos" });
    }
  },

  // Crear like si no existe
  createLike: async (req, res) => {
    const { user_id, post_id } = req.body;

    if (!user_id || !post_id) {
      return res.status(400).json({ message: "user_id y post_id son requeridos" });
    }

    try {
      const check = await turso.execute(
        "SELECT * FROM Post_likes WHERE user_id = ? AND post_id = ?",
        [user_id, post_id]
      );

      if (check.rows.length > 0) {
        return res.status(409).json({ message: "El like ya existe" });
      }

      const result = await turso.execute(
        "INSERT INTO Post_likes (user_id, post_id) VALUES (?, ?)",
        [user_id, post_id]
      );

      if (result.rowsAffected === 1) {
        return res.status(201).json({ message: "Like creado exitosamente" });
      } else {
        return res.status(500).json({ message: "No se pudo crear el like" });
      }
    } catch (error) {
      console.error("Error al crear like:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  // Eliminar like
  deleteLike: async (req, res) => {
    const { user_id, post_id } = req.body;

    if (!user_id || !post_id) {
      return res.status(400).json({ message: "user_id y post_id son requeridos" });
    }

    try {
      const result = await turso.execute(
        "DELETE FROM Post_likes WHERE user_id = ? AND post_id = ?",
        [user_id, post_id]
      );

      if (result.rowsAffected === 1) {
        return res.status(200).json({ message: "Like eliminado exitosamente" });
      } else {
        return res.status(404).json({ message: "Like no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar like:", error);
      return res.status(500).json({ message: "Error al eliminar el like" });
    }
  }
};

export default likesController;
