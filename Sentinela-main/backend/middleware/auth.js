const crypto = require("crypto");

const sessoes = new Map();
const DURACAO_SESSAO = 2 * 60 * 60 * 1000;

function criarSessao(usuarioId) {
    const token = crypto.randomBytes(32).toString("hex");

    sessoes.set(token, {
        usuarioId,
        criadaEm: Date.now()
    });

    return token;
}

function verificarSessao(req, res, next) {
    const token = req.headers["x-sessao"];

    if (!token) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    const sessao = sessoes.get(token);

    if (!sessao) {
        return res.status(401).json({
            mensagem: "Sessão inválida ou expirada."
        });
    }

    if (Date.now() - sessao.criadaEm > DURACAO_SESSAO) {
        sessoes.delete(token);

        return res.status(401).json({
            mensagem: "Sessão expirada. Faça login novamente."
        });
    }

    req.usuarioId = sessao.usuarioId;
    next();
}

function verificarAdministrador(req, res, next) {
    const db = require("../database/database");

    const usuario = db
        .prepare("SELECT id, tipo, bloqueado FROM usuarios WHERE id = ?")
        .get(req.usuarioId);

    if (!usuario) {
        return res.status(401).json({
            mensagem: "Usuário não encontrado."
        });
    }

    if (usuario.bloqueado) {
        return res.status(403).json({
            mensagem: "Esta conta está bloqueada."
        });
    }

    if (usuario.tipo !== "admin") {
        return res.status(403).json({
            mensagem: "Acesso permitido apenas para administradores."
        });
    }

    next();
}

function removerSessao(token) {
    sessoes.delete(token);
}

module.exports = {
    criarSessao,
    verificarSessao,
    verificarAdministrador,
    removerSessao
};
