const usuario = JSON.parse(localStorage.getItem("usuario"));
const tokenSessao = localStorage.getItem("tokenSessao");

if (!usuario || !tokenSessao) {

    window.location.href = "index.html";

} else {

    const campoNome =
        document.getElementById("perfil-nome");

    const campoEmail =
        document.getElementById("perfil-email");

    const campoTipo =
        document.getElementById("perfil-tipo");

    const senhaAtual =
        document.getElementById("senha-atual");

    const novaSenha =
        document.getElementById("nova-senha");

    const confirmarNovaSenha =
        document.getElementById("confirmar-nova-senha");

    const botaoSalvar =
        document.getElementById("btn-salvar");

    const botaoSair =
        document.getElementById("btn-sair");


    campoNome.value = usuario.nome;
    campoEmail.value = usuario.email;

    campoTipo.textContent =
        usuario.tipo === "admin"
            ? "Administrador"
            : "Usuário";


    // =========================
    // FUNÇÃO PARA LER RESPOSTA
    // =========================

    async function lerResposta(resposta) {

        const texto = await resposta.text();

        try {

            return JSON.parse(texto);

        } catch (erro) {

            console.error(
                "Resposta inválida do servidor:",
                texto
            );

            return {
                mensagem:
                    "O servidor retornou uma resposta inválida."
            };

        }

    }


    // =========================
    // SALVAR ALTERAÇÕES
    // =========================

    botaoSalvar.addEventListener(
        "click",
        async () => {

            const nome =
                campoNome.value.trim();

            const email =
                campoEmail.value.trim();

            const senhaAtualValor =
                senhaAtual.value;

            const novaSenhaValor =
                novaSenha.value;

            const confirmarNovaSenhaValor =
                confirmarNovaSenha.value;


            // =========================
            // VALIDAÇÕES
            // =========================

            if (nome === "") {

                alert("Digite seu nome.");

                return;

            }


            if (email === "") {

                alert("Digite seu e-mail.");

                return;

            }


            if (nome.length > 100) {

                alert(
                    "O nome deve ter no máximo 100 caracteres."
                );

                return;

            }


            if (email.length > 100) {

                alert(
                    "O e-mail deve ter no máximo 100 caracteres."
                );

                return;

            }


            const alterandoSenha =
                senhaAtualValor !== "" ||
                novaSenhaValor !== "" ||
                confirmarNovaSenhaValor !== "";


            if (alterandoSenha) {

                if (senhaAtualValor === "") {

                    alert(
                        "Digite sua senha atual."
                    );

                    return;

                }


                if (novaSenhaValor === "") {

                    alert(
                        "Digite uma nova senha."
                    );

                    return;

                }


                if (novaSenhaValor.length < 8) {

                    alert(
                        "A nova senha deve ter pelo menos 8 caracteres."
                    );

                    return;

                }


                if (
                    novaSenhaValor !==
                    confirmarNovaSenhaValor
                ) {

                    alert(
                        "As novas senhas não são iguais."
                    );

                    return;

                }

            }


            try {

                // =========================
                // ATUALIZAR NOME E E-MAIL
                // =========================

                const respostaPerfil =
                    await fetch(
                        "/api/perfil",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "x-sessao":
                                    tokenSessao
                            },

                            body: JSON.stringify({
                                nome,
                                email
                            })
                        }
                    );


                const dadosPerfil =
                    await lerResposta(
                        respostaPerfil
                    );


                if (!respostaPerfil.ok) {

                    alert(
                        dadosPerfil.mensagem
                    );

                    return;

                }


                // =========================
                // ALTERAR SENHA
                // =========================

                if (alterandoSenha) {

                    const respostaSenha =
                        await fetch(
                            "/api/perfil/senha",
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "x-sessao":
                                        tokenSessao
                                },

                                body: JSON.stringify({
                                    senhaAtual:
                                        senhaAtualValor,

                                    novaSenha:
                                        novaSenhaValor
                                })
                            }
                        );


                    const dadosSenha =
                        await lerResposta(
                            respostaSenha
                        );


                    if (!respostaSenha.ok) {

                        alert(
                            dadosSenha.mensagem
                        );

                        return;

                    }


                    senhaAtual.value = "";
                    novaSenha.value = "";
                    confirmarNovaSenha.value = "";

                }


                // =========================
                // ATUALIZAR DADOS LOCAIS
                // =========================

                const usuarioAtualizado = {

                    ...usuario,

                    nome:
                        dadosPerfil.usuario.nome,

                    email:
                        dadosPerfil.usuario.email

                };


                localStorage.setItem(
                    "usuario",
                    JSON.stringify(
                        usuarioAtualizado
                    )
                );


                campoNome.value =
                    dadosPerfil.usuario.nome;

                campoEmail.value =
                    dadosPerfil.usuario.email;


                if (alterandoSenha) {

                    alert(
                        "Dados e senha atualizados com sucesso!"
                    );

                } else {

                    alert(
                        "Dados atualizados com sucesso!"
                    );

                }

            } catch (erro) {

                console.error(
                    "Erro ao atualizar perfil:",
                    erro
                );


                alert(
                    "Não foi possível conectar ao servidor."
                );

            }

        }
    );


    // =========================
    // BOTÃO SAIR
    // =========================

    botaoSair.addEventListener(
        "click",
        async () => {

            try {
                await fetch("/api/logout", {
                    method: "POST",
                    headers: {
                        "x-sessao": tokenSessao
                    }
                });
            } catch (erro) {
                console.error("Erro ao encerrar sessão:", erro);
            }

            localStorage.removeItem("usuario");
            localStorage.removeItem("tokenSessao");

            window.location.href = "index.html";
        }
    );

}