const test = require("node:test");
const assert = require("node:assert/strict");
const Database = require("better-sqlite3-multiple-ciphers");

function criarBancoTeste() {
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

test("requisito 1: CHECK rejeita tipo de usuário inválido", () => {
    const db = criarBancoTeste();

    assert.throws(() => {
        db.prepare(`
            INSERT INTO usuarios (nome, email, senha, tipo, bloqueado)
            VALUES (?, ?, ?, ?, ?)
        `).run("Teste", "tipo@exemplo.com", "hash", "superadmin", 0);
    }, /CHECK constraint failed/);

    db.close();
});

test("requisito 1: CHECK rejeita status de bloqueio inválido", () => {
    const db = criarBancoTeste();

    assert.throws(() => {
        db.prepare(`
            INSERT INTO usuarios (nome, email, senha, tipo, bloqueado)
            VALUES (?, ?, ?, ?, ?)
        `).run("Teste", "bloqueio@exemplo.com", "hash", "usuario", 2);
    }, /CHECK constraint failed/);

    db.close();
});

test("requisito 2: View mascara e-mail e não expõe senha", () => {
    const db = criarBancoTeste();

    db.prepare(`
        INSERT INTO usuarios (nome, email, senha, tipo, bloqueado)
        VALUES (?, ?, ?, ?, ?)
    `).run("Marcelo", "marcelo@gmail.com", "hash-secreto", "usuario", 0);

    const usuario = db.prepare(`
        SELECT * FROM vw_usuarios_administracao
    `).get();

    assert.equal(usuario.email_mascarado, "mar***@gmail.com");
    assert.equal(Object.prototype.hasOwnProperty.call(usuario, "senha"), false);

    db.close();
});
