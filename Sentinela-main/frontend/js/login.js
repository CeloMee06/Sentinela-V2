const formulario = document.getElementById("login-form");


formulario.addEventListener("submit", async (evento) => {

    evento.preventDefault();


    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;


    // VALIDAÇÃO DOS CAMPOS

    if (email === "") {

        alert("Digite seu e-mail.");

        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Digite um e-mail válido.");

        return;
    }


    if (senha === "") {

        alert("Digite sua senha.");

        return;
    }


    try {

        const resposta = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })

        });


        const dados = await resposta.json();


        if (!resposta.ok) {

            alert(dados.mensagem);

            return;
        }


        // GUARDA OS DADOS DO USUÁRIO

        localStorage.setItem(
            "usuario",
            JSON.stringify(dados.usuario)
        );


        // GUARDA O TOKEN DA SESSÃO

        localStorage.setItem(
            "tokenSessao",
            dados.token
        );


        alert(dados.mensagem);


        // VAI PARA O DASHBOARD

        window.location.href = "dashboard.html";


    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

});