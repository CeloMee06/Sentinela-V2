const express = require("express");

const { verificarSessao, removerSessao } = require("../middleware/auth");

const router = express.Router();

router.post("/", verificarSessao, (req, res) => {
    const token = req.headers["x-sessao"];

    removerSessao(token);

    res.status(200).json({
        mensagem: "Sessão encerrada com sucesso."
    });
});

module.exports = router;
