function mascararEmail(email) {
    if (typeof email !== "string") return "***";
    const separador = email.lastIndexOf("@");
    if (separador <= 0 || separador === email.length - 1) return "***";

    const usuario = email.slice(0, separador);
    const dominio = email.slice(separador + 1);
    const visivel = usuario.slice(0, Math.min(3, usuario.length));
    return `${visivel}***@${dominio}`;
}

module.exports = { mascararEmail };
