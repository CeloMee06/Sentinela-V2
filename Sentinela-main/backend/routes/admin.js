const express = require("express");

const db = require("../database/database");
const {
    verificarSessao,
    verificarAdministrador
} = require("../middleware/auth");

const router = express.Router();
const protegerAdmin = [verificarSessao, verificarAdministrador];

router.get("/usuarios", protegerAdmin, (req, res) => {
    try {
        const usuarios = db.prepare(`
            SELECT
                id,
                nome,
                email_mascarado AS email,
                tipo,
                bloqueado,
                criado_em
            FROM vw_usuarios_administracao
            ORDER BY criado_em DESC
        `).all();

        res.set("Cache-Control", "no-store");
        res.status(200).json({ usuarios });
    } catch (erro) {
        console.error("Erro ao buscar usuários pela View:", erro);
        res.status(500).json({
            mensagem: "Não foi possível carregar os usuários."
        });
    }
});

router.put("/usuarios/:id/bloquear", protegerAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ mensagem: "Identificador de usuário inválido." });
    }

    try {
        const usuario = db
            .prepare("SELECT id, nome, tipo, bloqueado FROM usuarios WHERE id = ?")
            .get(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        if (usuario.id === req.usuarioId) {
            return res.status(400).json({
                mensagem: "Você não pode bloquear a própria conta."
            });
        }

        if (usuario.tipo === "admin") {
            return res.status(400).json({
                mensagem: "Não é possível bloquear um administrador."
            });
        }

        db.prepare("UPDATE usuarios SET bloqueado = 1 WHERE id = ?").run(id);

        db.prepare(`
            INSERT INTO atividades (usuario_id, tipo, descricao)
            VALUES (?, ?, ?)
        `).run(
            id,
            "bloqueio",
            "A conta foi bloqueada por um administrador."
        );

        res.status(200).json({
            mensagem: "Usuário bloqueado com sucesso."
        });
    } catch (erro) {
        console.error("Erro ao bloquear usuário:", erro);
        res.status(500).json({
            mensagem: "Não foi possível bloquear o usuário."
        });
    }
});

router.put("/usuarios/:id/desbloquear", protegerAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ mensagem: "Identificador de usuário inválido." });
    }

    try {
        const usuario = db
            .prepare("SELECT id FROM usuarios WHERE id = ?")
            .get(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        db.prepare("UPDATE usuarios SET bloqueado = 0 WHERE id = ?").run(id);

        db.prepare(`
            INSERT INTO atividades (usuario_id, tipo, descricao)
            VALUES (?, ?, ?)
        `).run(
            id,
            "desbloqueio",
            "A conta foi desbloqueada por um administrador."
        );

        res.status(200).json({
            mensagem: "Usuário desbloqueado com sucesso."
        });
    } catch (erro) {
        console.error("Erro ao desbloquear usuário:", erro);
        res.status(500).json({
            mensagem: "Não foi possível desbloquear o usuário."
        });
    }
});

router.put("/usuarios/:id/tipo", protegerAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ mensagem: "Identificador de usuário inválido." });
    }
    const { tipo } = req.body;

    if (tipo !== "usuario" && tipo !== "admin") {
        return res.status(400).json({
            mensagem: "Tipo de usuário inválido."
        });
    }

    try {
        const usuario = db
            .prepare("SELECT id, nome, tipo FROM usuarios WHERE id = ?")
            .get(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        if (usuario.id === req.usuarioId && tipo !== "admin") {
            return res.status(400).json({
                mensagem: "Você não pode remover seu próprio acesso de administrador."
            });
        }

        db.prepare("UPDATE usuarios SET tipo = ? WHERE id = ?").run(tipo, id);

        db.prepare(`
            INSERT INTO atividades (usuario_id, tipo, descricao)
            VALUES (?, ?, ?)
        `).run(
            id,
            "alteracao_acesso",
            `O tipo de acesso foi alterado para ${tipo}.`
        );

        res.status(200).json({
            mensagem: "Tipo de usuário atualizado com sucesso."
        });
    } catch (erro) {
        console.error("Erro ao alterar tipo de usuário:", erro);
        res.status(500).json({
            mensagem: "Não foi possível alterar o tipo de usuário."
        });
    }
});

router.delete("/usuarios/:id", protegerAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ mensagem: "Identificador de usuário inválido." });
    }

    try {
        const usuario = db
            .prepare("SELECT id, nome, tipo FROM usuarios WHERE id = ?")
            .get(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        if (usuario.id === req.usuarioId) {
            return res.status(400).json({
                mensagem: "Você não pode remover a própria conta por esta área."
            });
        }

        if (usuario.tipo === "admin") {
            return res.status(400).json({
                mensagem: "Não é possível remover um administrador."
            });
        }

        db.prepare("DELETE FROM atividades WHERE usuario_id = ?").run(id);
        db.prepare("DELETE FROM usuarios WHERE id = ?").run(id);

        res.status(200).json({
            mensagem: "Usuário removido com sucesso."
        });
    } catch (erro) {
        console.error("Erro ao remover usuário:", erro);
        res.status(500).json({
            mensagem: "Não foi possível remover o usuário."
        });
    }
});

module.exports = router;
