const express = require("express");
const bcrypt = require("bcrypt");

const db = require("../database/database");
const { verificarSessao } = require("../middleware/auth");

const router = express.Router();


// =========================
// ATUALIZAR PERFIL
// =========================

router.put("/", verificarSessao, (req, res) => {

    const { nome, email } = req.body;

    const id = req.usuarioId;


    if (!nome || !email) {

        return res.status(400).json({
            mensagem: "Nome e e-mail são obrigatórios."
        });

    }


    if (nome.length > 100 || email.length > 100) {

        return res.status(400).json({
            mensagem: "Nome ou e-mail muito longo."
        });

    }


    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
        return res.status(400).json({
            mensagem: "Digite um e-mail válido."
        });
    }


    try {

        const usuario = db
            .prepare(
                "SELECT id FROM usuarios WHERE id = ?"
            )
            .get(id);


        if (!usuario) {

            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });

        }


        const emailExistente = db
            .prepare(`
                SELECT id
                FROM usuarios
                WHERE email = ?
                AND id != ?
            `)
            .get(email, id);


        if (emailExistente) {

            return res.status(409).json({
                mensagem: "Este e-mail já está sendo utilizado."
            });

        }


        db.prepare(`
            UPDATE usuarios
            SET nome = ?, email = ?
            WHERE id = ?
        `).run(
            nome,
            email,
            id
        );

        db.prepare(`
            INSERT INTO atividades (usuario_id, tipo, descricao)
            VALUES (?, ?, ?)
        `).run(
            id,
            "perfil",
            "Dados do perfil atualizados."
        );


        res.status(200).json({

            mensagem: "Dados atualizados com sucesso!",

            usuario: {
                id,
                nome,
                email
            }

        });


    } catch (erro) {

        console.error(
            "Erro ao atualizar perfil:",
            erro
        );


        res.status(500).json({
            mensagem: "Não foi possível atualizar os dados."
        });

    }

});


// =========================
// ALTERAR SENHA
// =========================

router.put(
    "/senha",
    verificarSessao,
    async (req, res) => {

        const { senhaAtual, novaSenha } = req.body;

        const id = req.usuarioId;


        if (!senhaAtual || !novaSenha) {

            return res.status(400).json({
                mensagem:
                    "A senha atual e a nova senha são obrigatórias."
            });

        }


        if (novaSenha.length < 8) {

            return res.status(400).json({
                mensagem:
                    "A nova senha deve ter pelo menos 8 caracteres."
            });

        }

        if (novaSenha.length > 50) {

            return res.status(400).json({
                mensagem:
                    "A nova senha deve ter no máximo 50 caracteres."
            });

        }


        try {

            const usuario = db
                .prepare(
                    "SELECT * FROM usuarios WHERE id = ?"
                )
                .get(id);


            if (!usuario) {

                return res.status(404).json({
                    mensagem: "Usuário não encontrado."
                });

            }


            const senhaAtualCorreta =
                await bcrypt.compare(
                    senhaAtual,
                    usuario.senha
                );


            if (!senhaAtualCorreta) {

                return res.status(401).json({
                    mensagem:
                        "A senha atual está incorreta."
                });

            }


            const novaSenhaHash =
                await bcrypt.hash(
                    novaSenha,
                    12
                );


            db.prepare(`
                UPDATE usuarios
                SET senha = ?
                WHERE id = ?
            `).run(
                novaSenhaHash,
                id
            );

            db.prepare(`
                INSERT INTO atividades (usuario_id, tipo, descricao)
                VALUES (?, ?, ?)
            `).run(
                id,
                "senha",
                "Senha alterada com sucesso."
            );


            res.status(200).json({
                mensagem: "Senha alterada com sucesso!"
            });


        } catch (erro) {

            console.error(
                "Erro ao alterar senha:",
                erro
            );


            res.status(500).json({
                mensagem:
                    "Não foi possível alterar a senha."
            });

        }

    }
);


module.exports = router;