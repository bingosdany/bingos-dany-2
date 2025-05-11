const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { Pool } = require("pg");
const multer = require("multer");
require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.PG_URL,
});

app.post("/enviar", multer.single("archivo"), async (req, res) => {
  const { nombre, correo, cantidad } = req.body;
const archivo = req.file ? req.file.originalname : "archivo.jpg";
  try {
    await pool.query(
      "INSERT INTO usuarios (nombre, correo, cantidad, comprobante, estado) VALUES ($1, $2, $3, $4, $5)",
      [nombre, correo, cantidad, archivo, "pendiente"]
    );
    res.status(200).send("Enviado");
  } catch (err) {
    res.status(500).send("Error al guardar");
  }
});

app.get("/progreso", async (req, res) => {
  try {
    const total = 100; // Total de cartones disponibles
    const result = await pool.query("SELECT SUM(cantidad) AS vendidos FROM usuarios WHERE estado='aprobado'");
    const vendidos = result.rows[0].vendidos || 0;
    const porcentaje = Math.min(100, Math.round((vendidos / total) * 100));
    res.json({ porcentaje });
  } catch (err) {
    res.status(500).send("Error al calcular progreso");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
app.use(express.static("public"));
