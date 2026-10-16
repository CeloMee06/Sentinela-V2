const express = require("express");
const path = require("path");

const db = require("./database/database");
const usuariosRoutes = require("./routes/usuarios");
const loginRoutes = require("./routes/login");
const perfilRoutes = require("./routes/perfil");
const atividadesRoutes = require("./routes/atividades");
const adminRoutes = require("./routes/admin");
const logoutRoutes = require("./routes/logout");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/atividades", atividadesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/logout", logoutRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const servidor = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Sentinela rodando na porta ${PORT}`);
});

servidor.on("error", (erro) => {
    console.error("Erro no servidor:", erro);
});