const Database = require("better-sqlite3-multiple-ciphers");
const fs = require("fs");
const path = require("path");

const caminhoBanco = process.env.DATABASE_PATH || path.join(__dirname, "sentinela.db");
const chave = process.env.DB_ENCRYPTION_KEY;

// O banco é aberto com SQLCipher. A chave deve ser definida em .env e nunca
// deve ser enviada ao GitHub. Exigimos a chave para não criar um banco sem proteção.
if (!chave || !/^[a-fA-F0-9]{64}$/.test(chave)) {
    throw new Error(
        "DB_ENCRYPTION_KEY ausente ou inválida. Configure uma chave hexadecimal de 64 caracteres no arquivo .env. Consulte .env.example e README.md."
    );
}

fs.mkdirSync(path.dirname(caminhoBanco), { recursive: true });
const db = new Database(caminhoBanco);

// SQLCipher: aplica a chave antes de qualquer consulta ao banco.
db.pragma("cipher = 'sqlcipher'");
db.pragma(`key = "x'${chave}'"`);

// Uma consulta força a validação da chave e falha se o arquivo não puder ser lido.
try {
    db.pragma("cipher_integrity_check");
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
} catch (erro) {
    db.close();
    throw new Error(
        `Não foi possível abrir o banco criptografado. Se este for um banco antigo sem criptografia, siga a seção de migração do README.md. Detalhe: ${erro.message}`
    );
}

// Restringe permissões do arquivo em sistemas POSIX. No Windows, configure também
// as permissões NTFS para a conta que executa o servidor.
try {
    if (process.platform !== "win32" && fs.existsSync(caminhoBanco)) {
        fs.chmodSync(caminhoBanco, 0o600);
    }
} catch (erro) {
    console.warn("Não foi possível ajustar as permissões do arquivo do banco:", erro.message);
}

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'usuario' CHECK (tipo IN ('usuario', 'admin')),
        bloqueado INTEGER NOT NULL DEFAULT 0 CHECK (bloqueado IN (0, 1)),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS atividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        tipo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
`);

module.exports = db;
