const db = require("../backend/database/database");

const email = process.argv[2];

if (!email) {
    console.log("Uso: npm run admin -- email@exemplo.com");
    db.close();
    process.exit(1);
}

const usuario = db
    .prepare("SELECT id, nome, email FROM usuarios WHERE email = ?")
    .get(email);

if (!usuario) {
    console.log("Usuário não encontrado. Faça o cadastro primeiro.");
    db.close();
    process.exit(1);
}

db.prepare("UPDATE usuarios SET tipo = 'admin' WHERE id = ?").run(usuario.id);
console.log(`Usuário ${usuario.nome} agora é administrador.`);
db.close();
