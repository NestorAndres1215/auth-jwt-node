import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User, Role } from "../models/index.js";

dotenv.config();
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Usamos el alias "role" tal como está en el modelo
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Token inválido o expirado." });
  }
};
