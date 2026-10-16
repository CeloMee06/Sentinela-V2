const test = require('node:test');
const assert = require('node:assert/strict');
const { mascararEmail } = require('./mascaramento');

test('mascara parte local do e-mail e preserva o domínio', () => {
  assert.equal(mascararEmail('marcelo@gmail.com'), 'mar***@gmail.com');
});

test('mascara e-mails curtos sem revelar o valor completo', () => {
  assert.equal(mascararEmail('a@exemplo.com'), 'a***@exemplo.com');
});

test('retorna máscara para entradas inválidas', () => {
  assert.equal(mascararEmail('invalido'), '***');
  assert.equal(mascararEmail(null), '***');
});
