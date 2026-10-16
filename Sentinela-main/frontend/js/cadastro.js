const formulario = document.getElementById("cadastro-form");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if (nome === "") {
        alert("Digite seu nome.");
        return;
    }

    if (email === "") {
        alert("Digite seu e-mail.");
        return;
    }

    if (senha === "") {
        alert("Digite uma senha.");
        return;
    }

    if (senha.length < 8) {
        alert("A senha deve ter pelo menos 8 caracteres.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não são iguais.");
        return;
    }

    try {
        const resposta = await fetch("/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem);
            return;
        }

        alert(dados.mensagem);

        formulario.reset();

    } catch (erro) {
        console.error("Erro ao realizar cadastro:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});