const usuario = JSON.parse(localStorage.getItem("usuario"));
const tokenSessao = localStorage.getItem("tokenSessao");

if (!usuario || !tokenSessao) {

    window.location.href = "index.html";

} else {

    const titulo = document.querySelector(".dashboard-welcome h2");

    titulo.textContent = `Bem-vindo, ${usuario.nome}!`;

    const cardAdmin = document.getElementById("card-admin");

    if (usuario.tipo === "admin") {
        cardAdmin.style.display = "block";
    }

    const botaoSair = document.getElementById("btn-sair");

    botaoSair.addEventListener("click", async () => {

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
    });
}