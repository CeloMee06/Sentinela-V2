// Demonstração dos dois requisitos de banco de dados no terminal.
// Uso:
//   node backend/database/demonstracao-requisitos.js check
//   node backend/database/demonstracao-requisitos.js view

const Database = require("better-sqlite3-multiple-ciphers");

const linha = "=".repeat(64);
const traco = "-".repeat(64);

function criarBanco() {
    const db = new Database(":memory:");

    db.exec(`
        CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            tipo TEXT NOT NULL DEFAULT 'usuario'
                CONSTRAINT ck_usuarios_tipo
                CHECK (tipo IN ('usuario', 'admin')),
            bloqueado INTEGER NOT NULL DEFAULT 0
                CONSTRAINT ck_usuarios_bloqueado
                CHECK (bloqueado IN (0, 1)),
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE VIEW vw_usuarios_administracao AS
        SELECT
            id,
            nome,
            CASE
                WHEN instr(email, '@') > 1 THEN
                    substr(
                        email,
                        1,
                        CASE
                            WHEN instr(email, '@') - 1 < 3
                                THEN instr(email, '@') - 1
                            ELSE 3
                        END
                    ) || '***@' || substr(email, instr(email, '@') + 1)
                ELSE '***'
            END AS email_mascarado,
            tipo,
            bloqueado,
            criado_em
        FROM usuarios;
    `);

    return db;
}

function inserir(db, nome, email, tipo, bloqueado) {
    return db.prepare(`
        INSERT INTO usuarios (nome, email, senha, tipo, bloqueado)
        VALUES (?, ?, ?, ?, ?)
    `).run(nome, email, "hash-bcrypt-ficticio", tipo, bloqueado);
}

function demonstrarCheck() {
    const db = criarBanco();

    console.log(linha);
    console.log("REQUISITO 1 - RESTRIÇÕES DE VALIDAÇÃO (CHECK CONSTRAINTS)");
    console.log(linha);
    console.log("");
    console.log("Estrutura aplicada no banco:");
    console.log("  tipo      -> CHECK (tipo IN ('usuario', 'admin'))");
    console.log("  bloqueado -> CHECK (bloqueado IN (0, 1))");
    console.log("");

    console.log(traco);
    console.log("CASO CORRETO: dados válidos");
    console.log(traco);
    try {
        inserir(db, "Maria Souza", "maria@gmail.com", "usuario", 0);
        console.log("  INSERT tipo=usuario, bloqueado=0  -> ACEITO pelo banco");
    } catch (erro) {
        console.log("  INSERT válido falhou (inesperado):", erro.message);
    }
    console.log("");

    console.log(traco);
    console.log("CASO COM ERRO: tipo de usuário inválido");
    console.log(traco);
    console.log("  INSERT tipo='superadmin'          -> tenta gravar");
    try {
        inserir(db, "Intruso", "intruso@exemplo.com", "superadmin", 0);
        console.log("  RESULTADO: ACEITO (a restrição falhou)");
    } catch (erro) {
        console.log("  RESULTADO: RECUSADO pelo banco");
        console.log("  Erro:", erro.message);
    }
    console.log("");

    console.log(traco);
    console.log("CASO COM ERRO: status de bloqueio inválido");
    console.log(traco);
    console.log("  INSERT bloqueado=2                -> tenta gravar");
    try {
        inserir(db, "Outro", "outro@exemplo.com", "usuario", 2);
        console.log("  RESULTADO: ACEITO (a restrição falhou)");
    } catch (erro) {
        console.log("  RESULTADO: RECUSADO pelo banco");
        console.log("  Erro:", erro.message);
    }
    console.log("");

    console.log(traco);
    console.log("Conteúdo final da tabela (só o registro válido entrou):");
    for (const u of db.prepare("SELECT id, nome, email, tipo, bloqueado FROM usuarios").all()) {
        console.log(`  id=${u.id}  ${u.nome}  ${u.email}  tipo=${u.tipo}  bloqueado=${u.bloqueado}`);
    }
    console.log("");
    console.log("Conclusão: a integridade é garantida pelo próprio banco,");
    console.log("mesmo que a validação do frontend ou do backend seja contornada.");
    console.log("");

    db.close();
}

function demonstrarView() {
    const db = criarBanco();

    inserir(db, "Marcelo Andrade", "marcelo@gmail.com", "usuario", 0);
    inserir(db, "Ana Lima", "ana@empresa.com.br", "admin", 0);

    console.log(linha);
    console.log("REQUISITO 2 - VIEW PARA OCULTAÇÃO ESTRUTURAL");
    console.log(linha);
    console.log("");

    const colunasTabela = db.prepare("PRAGMA table_info(usuarios)").all().map((c) => c.name);
    const colunasView = db.prepare("PRAGMA table_info(vw_usuarios_administracao)").all().map((c) => c.name);

    console.log(traco);
    console.log("Colunas da tabela original 'usuarios':");
    console.log("  " + colunasTabela.join(", "));
    console.log("");
    console.log("Colunas da View 'vw_usuarios_administracao':");
    console.log("  " + colunasView.join(", "));
    console.log("");
    console.log("  A coluna 'senha' está na View? " + (colunasView.includes("senha") ? "SIM" : "NÃO"));
    console.log("");

    console.log(traco);
    console.log("O que a View devolve (e-mail já mascarado):");
    for (const u of db.prepare("SELECT * FROM vw_usuarios_administracao").all()) {
        console.log(`  id=${u.id}  ${u.nome}  ${u.email_mascarado}  tipo=${u.tipo}`);
    }
    console.log("");
    console.log("  O e-mail completo nunca chega ao navegador.");
    console.log("  O hash da senha não é consultado pela listagem administrativa.");
    console.log("");

    console.log(traco);
    console.log("Comparação com a tabela original:");
    const linhaTabela = db.prepare("SELECT email FROM usuarios WHERE id = 1").get();
    const linhaView = db.prepare("SELECT email_mascarado FROM vw_usuarios_administracao WHERE id = 1").get();
    console.log(`  tabela original: ${linhaTabela.email}`);
    console.log(`  View pública:    ${linhaView.email_mascarado}`);
    console.log("");

    console.log(traco);
    console.log("Equivalente ao GRANT do exercício");
    console.log(traco);
    console.log("  O SQLite não possui usuários internos nem GRANT/REVOKE.");
    console.log("  No Sentinela, o controle é feito na rota do backend:");
    console.log("    sem sessão válida            -> 401 Usuário não autenticado");
    console.log("    sessão de usuário comum      -> 403 Acesso apenas para administradores");
    console.log("    sessão de administrador      -> 200 lê a View");
    console.log("  Somente o administrador consegue consultar a View.");
    console.log("");

    db.close();
}

const modo = process.argv[2];

if (modo === "check") {
    demonstrarCheck();
} else if (modo === "view") {
    demonstrarView();
} else {
    console.log("Uso:");
    console.log("  node backend/database/demonstracao-requisitos.js check");
    console.log("  node backend/database/demonstracao-requisitos.js view");
}
