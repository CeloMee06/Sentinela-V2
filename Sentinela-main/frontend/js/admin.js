const usuario = JSON.parse(localStorage.getItem("usuario"));
const tokenSessao = localStorage.getItem("tokenSessao");

if (!usuario || !tokenSessao) {

    window.location.href = "index.html";

} else {

    const listaUsuarios = document.getElementById("lista-usuarios");
    const botaoSair = document.getElementById("btn-sair");

    const totalUsuarios = document.getElementById("total-usuarios");
    const totalAdmins = document.getElementById("total-admins");
    const totalAtivos = document.getElementById("total-ativos");
    const totalBloqueados = document.getElementById("total-bloqueados");


    // =========================
    // CARREGAR USUÁRIOS
    // =========================

    async function carregarUsuarios() {

        try {

            const resposta = await fetch("/api/admin/usuarios", {

                headers: {
                    "x-sessao": tokenSessao
                }

            });


            const dados = await resposta.json();


            if (!resposta.ok) {

                listaUsuarios.innerHTML = `
                    <div class="account-status">

                        <h3>🚫 Acesso negado</h3>

                        <p>
                            ${dados.mensagem}
                        </p>

                    </div>
                `;

                return;
            }


            const usuarios = dados.usuarios;


            // =========================
            // ATUALIZA OS RESUMOS
            // =========================

            totalUsuarios.textContent =
                usuarios.length;


            totalAdmins.textContent =
                usuarios.filter(
                    usuarioLista =>
                        usuarioLista.tipo === "admin"
                ).length;


            totalAtivos.textContent =
                usuarios.filter(
                    usuarioLista =>
                        usuarioLista.bloqueado === 0
                ).length;


            totalBloqueados.textContent =
                usuarios.filter(
                    usuarioLista =>
                        usuarioLista.bloqueado === 1
                ).length;


            // =========================
            // LIMPA A LISTA
            // =========================

            listaUsuarios.innerHTML = "";


            // =========================
            // CRIA OS CARDS
            // =========================

            usuarios.forEach((usuarioLista) => {

                const card =
                    document.createElement("div");

                card.className =
                    "admin-user-card";


                const tipoUsuario =
                    usuarioLista.tipo === "admin"
                        ? "👑 Administrador"
                        : "👤 Usuário";


                const bloqueado =
                    usuarioLista.bloqueado === 1;


                const statusUsuario =
                    bloqueado
                        ? "🔴 Bloqueado"
                        : "🟢 Ativo";


                card.innerHTML = `

                    <div class="admin-user-info">

                        <h3>
                            ${usuarioLista.nome}
                        </h3>

                        <p>
                            📧 ${usuarioLista.email}
                        </p>

                        <p>
                            ${tipoUsuario}
                        </p>

                        <p>
                            ${statusUsuario}
                        </p>

                    </div>


                    <div class="admin-user-actions">

                        ${
                            usuarioLista.tipo !== "admin"

                                ? `

                                    <button
                                        class="admin-btn ${bloqueado
                                            ? "btn-desbloquear"
                                            : "btn-bloquear"}"

                                        data-id="${usuarioLista.id}"

                                        data-acao="${bloqueado
                                            ? "desbloquear"
                                            : "bloquear"}"
                                    >

                                        ${
                                            bloqueado
                                                ? "🔓 Desbloquear"
                                                : "🔒 Bloquear"
                                        }

                                    </button>


                                    <button
                                        class="admin-btn btn-tipo"

                                        data-id="${usuarioLista.id}"

                                        data-tipo="admin"
                                    >

                                        👑 Tornar admin

                                    </button>


                                    <button
                                        class="admin-btn btn-remover"

                                        data-id="${usuarioLista.id}"
                                    >

                                        🗑️ Remover

                                    </button>

                                `

                                : `

                                    <button
                                        class="admin-btn btn-remover-admin"

                                        data-id="${usuarioLista.id}"
                                    >

                                        👤 Remover admin

                                    </button>

                                `
                        }

                    </div>

                `;


                listaUsuarios.appendChild(card);

            });


            adicionarEventos();


        } catch (erro) {

            console.error(
                "Erro ao carregar usuários:",
                erro
            );


            listaUsuarios.innerHTML = `

                <div class="account-status">

                    <p>
                        Não foi possível carregar os usuários.
                    </p>

                </div>

            `;

        }

    }


    // =========================
    // EVENTOS DOS BOTÕES
    // =========================

    function adicionarEventos() {


        // =========================
        // BLOQUEAR / DESBLOQUEAR
        // =========================

        const botoesBloqueio =
            document.querySelectorAll("[data-acao]");


        botoesBloqueio.forEach((botao) => {

            botao.addEventListener(
                "click",
                async () => {

                    const id =
                        botao.dataset.id;

                    const acao =
                        botao.dataset.acao;


                    const confirmacao =
                        confirm(
                            acao === "bloquear"

                                ? "Deseja realmente bloquear este usuário?"

                                : "Deseja desbloquear este usuário?"
                        );


                    if (!confirmacao) {
                        return;
                    }


                    try {

                        const resposta =
                            await fetch(
                                `/api/admin/usuarios/${id}/${acao}`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "x-sessao": tokenSessao
                                    }
                                }
                            );


                        const dados =
                            await resposta.json();


                        if (!resposta.ok) {

                            alert(
                                dados.mensagem
                            );

                            return;
                        }


                        alert(
                            dados.mensagem
                        );


                        carregarUsuarios();

                    } catch (erro) {

                        console.error(
                            "Erro ao alterar status:",
                            erro
                        );


                        alert(
                            "Não foi possível realizar a operação."
                        );

                    }

                }
            );

        });


        // =========================
        // TORNAR ADMIN
        // =========================

        const botoesTipo =
            document.querySelectorAll(".btn-tipo");


        botoesTipo.forEach((botao) => {

            botao.addEventListener(
                "click",
                async () => {

                    const id =
                        botao.dataset.id;


                    const confirmacao =
                        confirm(
                            "Deseja tornar este usuário administrador?"
                        );


                    if (!confirmacao) {
                        return;
                    }


                    try {

                        const resposta =
                            await fetch(
                                `/api/admin/usuarios/${id}/tipo`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        "x-sessao":
                                            tokenSessao
                                    },

                                    body: JSON.stringify({
                                        tipo: "admin"
                                    })
                                }
                            );


                        const dados =
                            await resposta.json();


                        if (!resposta.ok) {

                            alert(
                                dados.mensagem
                            );

                            return;
                        }


                        alert(
                            dados.mensagem
                        );


                        carregarUsuarios();

                    } catch (erro) {

                        console.error(
                            "Erro ao alterar tipo:",
                            erro
                        );


                        alert(
                            "Não foi possível alterar o tipo de usuário."
                        );

                    }

                }
            );

        });


        // =========================
        // REMOVER ADMIN
        // =========================

        const botoesRemoverAdmin =
            document.querySelectorAll(
                ".btn-remover-admin"
            );


        botoesRemoverAdmin.forEach((botao) => {

            botao.addEventListener(
                "click",
                async () => {

                    const id =
                        botao.dataset.id;


                    const confirmacao =
                        confirm(
                            "Deseja remover o acesso de administrador deste usuário?"
                        );


                    if (!confirmacao) {
                        return;
                    }


                    try {

                        const resposta =
                            await fetch(
                                `/api/admin/usuarios/${id}/tipo`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        "x-sessao":
                                            tokenSessao
                                    },

                                    body: JSON.stringify({
                                        tipo: "usuario"
                                    })
                                }
                            );


                        const dados =
                            await resposta.json();


                        if (!resposta.ok) {

                            alert(
                                dados.mensagem
                            );

                            return;
                        }


                        alert(
                            dados.mensagem
                        );


                        carregarUsuarios();

                    } catch (erro) {

                        console.error(
                            "Erro ao remover administrador:",
                            erro
                        );


                        alert(
                            "Não foi possível remover o acesso de administrador."
                        );

                    }

                }
            );

        });


        // =========================
        // REMOVER USUÁRIO
        // =========================

        const botoesRemover =
            document.querySelectorAll(
                ".btn-remover"
            );


        botoesRemover.forEach((botao) => {

            botao.addEventListener(
                "click",
                async () => {

                    const id =
                        botao.dataset.id;


                    const confirmacao =
                        confirm(
                            "Deseja realmente remover este usuário?"
                        );


                    if (!confirmacao) {
                        return;
                    }


                    try {

                        const resposta =
                            await fetch(
                                `/api/admin/usuarios/${id}`,
                                {
                                    method: "DELETE",

                                    headers: {
                                        "x-sessao":
                                            tokenSessao
                                    }
                                }
                            );


                        const dados =
                            await resposta.json();


                        if (!resposta.ok) {

                            alert(
                                dados.mensagem
                            );

                            return;
                        }


                        alert(
                            dados.mensagem
                        );


                        carregarUsuarios();

                    } catch (erro) {

                        console.error(
                            "Erro ao remover usuário:",
                            erro
                        );


                        alert(
                            "Não foi possível remover o usuário."
                        );

                    }

                }
            );

        });

    }


    // =========================
    // BOTÃO SAIR
    // =========================

    botaoSair.addEventListener(
        "click",
        () => {

            localStorage.removeItem("usuario");

            localStorage.removeItem(
                "tokenSessao"
            );

            window.location.href =
                "index.html";

        }
    );


    // =========================
    // INICIAR
    // =========================

    carregarUsuarios();

}