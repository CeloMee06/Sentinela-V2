# Teste dos dois requisitos solicitados

Execute os comandos dentro da pasta `Sentinela-main`.

## Instalação

```powershell
npm.cmd install
```

## Testar somente os dois requisitos

```powershell
npm.cmd run test:requisitos
```

O resultado esperado é:

- CHECK rejeita tipo de usuário inválido;
- CHECK rejeita status de bloqueio inválido;
- View mascara o e-mail e não expõe a senha;
- três testes aprovados e nenhum teste reprovado.

## Requisito 1 - CHECK constraints

A tabela `usuarios` restringe `tipo` aos valores `usuario` e `admin`, e `bloqueado` aos valores `0` e `1`. Isso mantém a integridade mesmo se uma validação da aplicação for contornada.

## Requisito 2 - View e menor privilégio

A View `vw_usuarios_administracao` expõe somente id, nome, e-mail mascarado, tipo, bloqueio e data de criação. A coluna `senha` não faz parte da View.

Como SQLite não implementa `GRANT`, o equivalente é realizado pelo middleware do backend: somente uma sessão autenticada com papel de administrador acessa a rota que consulta a View.
