const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

// Health check simple
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// Si no encuentra ruta, devolver index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Builder Bot app running on port ${PORT}`);
});
