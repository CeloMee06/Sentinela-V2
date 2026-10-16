# Sentinela

Sistema web acadêmico desenvolvido para a disciplina de Segurança em Sistemas da Informação.

O **Sentinela** demonstra conceitos de autenticação, autorização, controle de acesso, proteção de senhas, validação de dados e registro de atividades.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- SQLite criptografado com SQLCipher (better-sqlite3-multiple-ciphers)
- bcrypt
- Git e GitHub
- Visual Studio Code

## Funcionalidades

### Usuário
- Cadastro de conta
- Login
- Sessão autenticada
- Dashboard
- Consulta e atualização do perfil
- Alteração de senha
- Consulta das atividades da própria conta
- Logout

### Administrador
- Listagem de usuários
- Consulta de status das contas
- Bloqueio e desbloqueio
- Alteração do tipo de acesso
- Remoção de usuários
- Proteção das rotas administrativas no backend

## Segurança aplicada

- Senhas armazenadas com hash usando bcrypt (custo 12); o salt é administrado pelo bcrypt.
- Banco SQLite criptografado em repouso com SQLCipher; a chave é fornecida por variável de ambiente e não fica no código-fonte.
- Permissões restritas no arquivo do banco em sistemas POSIX e orientação para restringir permissões NTFS no Windows.
- Mascaramento de e-mails na resposta da listagem administrativa.
- Restrições no banco para valores válidos de tipo de usuário e status de bloqueio.
- Validação no frontend e também no backend.
- Consultas SQLite parametrizadas para evitar injeção SQL.
- Controle de autenticação por sessão.
- Controle de autorização no backend, e não apenas na interface.
- Mensagens de erro sem exposição de senha ou outros segredos.
- Dados sensíveis não ficam no código-fonte.
- Limites de tamanho nos campos.
- Registro de atividades importantes.
- Sessões com expiração de 2 horas.
- Logout invalida a sessão no servidor.
- Usuário comum não consegue acessar as rotas administrativas.
- Um administrador não pode bloquear, remover ou retirar o próprio acesso de administrador pela área administrativa.

## Como executar

### 1. Instalar as dependências

```bash
npm install
```

No PowerShell do Windows, caso `npm` seja bloqueado pela política de execução, use:

```bash
npm.cmd install
```

### 2. Configurar a chave de criptografia do banco

Copie `.env.example` para `.env`. Gere uma chave forte com o comando abaixo no PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Cole o resultado em `DB_ENCRYPTION_KEY` no arquivo `.env` (64 caracteres hexadecimais). Mantenha esse arquivo privado; ele já está listado no `.gitignore`. Não use a chave de exemplo. Sem a chave correta, o sistema não inicia nem consegue ler o banco criptografado.

O banco é criado criptografado pelo SQLCipher. A senha/chave não deve ser colocada no código nem enviada ao GitHub. Guarde-a em local seguro, pois perder a chave significa perder acesso aos dados.

### 3. Iniciar o sistema

```bash
npm start
```

ou no PowerShell:

```bash
npm.cmd start
```

Acesse:

`http://localhost:3000`

## Criar um administrador para teste

Primeiro faça um cadastro normalmente pela tela de cadastro.

Depois execute:

```bash
npm run admin -- email@exemplo.com
```

No PowerShell:

```bash
npm.cmd run admin -- email@exemplo.com
```

Substitua o e-mail pelo usuário cadastrado.

## Estrutura

```text
Sentinela/
├── frontend/
│   ├── index.html
│   ├── cadastro.html
│   ├── dashboard.html
│   ├── perfil.html
│   ├── atividades.html
│   ├── admin.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── login.js
│       ├── cadastro.js
│       ├── dashboard.js
│       ├── perfil.js
│       ├── atividades.js
│       └── admin.js
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── database/
│   └── server.js
├── scripts/
│   └── tornar-admin.js
├── .gitignore
├── README.md
└── package.json
```

## Observação acadêmica

O projeto utiliza sessões em memória para manter a implementação simples para o trabalho acadêmico. Por isso, as sessões ativas são encerradas quando o servidor é reiniciado.

O objetivo do projeto é demonstrar, de forma prática, os conceitos de **entender, proteger, controlar, detectar e testar** segurança em um sistema.


## Os quatro requisitos de segurança do armazenamento

1. **Criptografia em repouso:** o projeto usa `better-sqlite3-multiple-ciphers` com o modo SQLCipher. A chave de 32 bytes é configurada por `DB_ENCRYPTION_KEY` no `.env`.
2. **Hashing de senhas:** cadastro e alteração de senha usam `bcrypt` com custo 12. A senha original não é armazenada.
3. **Menor privilégio:** rotas administrativas exigem sessão e papel de administrador no servidor. O banco aplica restrições `CHECK`; o arquivo deve ficar acessível apenas à conta do sistema operacional que executa o servidor. No Windows, configure as permissões de segurança do arquivo/pasta `backend\database` para limitar o acesso à sua conta e à conta do serviço, se houver.
4. **Mascaramento:** a listagem administrativa devolve e-mails mascarados, por exemplo `mar***@gmail.com`, em vez de enviar o endereço completo desnecessariamente.

### Banco antigo sem criptografia

Não copie um arquivo SQLite antigo sem criptografia para o local do banco novo e não reutilize um banco existente sem antes fazer backup. Um banco SQLite comum não abre diretamente como SQLCipher. Para dados que precisem ser preservados, faça uma exportação/migração controlada com a ferramenta SQLCipher e valide a cópia antes de substituir o arquivo original. Para a entrega acadêmica, se não houver dados que precisem ser mantidos, faça backup e deixe o sistema criar um banco novo após configurar a chave.

### Limites importantes

A criptografia protege o arquivo quando está fechado/fora do uso da aplicação; não protege contra alguém que já controla o servidor e consegue ler a chave ou consultar o banco por meio do próprio processo. A chave precisa de gestão segura e backups também precisam ser protegidos. A sessão atual permanece em memória e termina quando o servidor reinicia.

## Teste para apresentação

1. Cadastre um usuário.
2. Faça login.
3. Mostre o dashboard.
4. Mostre o perfil e altere o nome.
5. Mostre a alteração de senha.
6. Mostre as atividades registradas.
7. Promova um segundo usuário a administrador.
8. Entre com o administrador e mostre a área administrativa.
9. Bloqueie/desbloqueie um usuário.
10. Mostre que um usuário comum não possui autorização para a área administrativa.
11. Faça logout.

## Git

O projeto possui histórico de commits desde a criação da estrutura inicial. Antes da entrega, revise as alterações pendentes com:

```bash
git status
```

Depois, registre as alterações finais com commits descritivos e envie o repositório para o GitHub.
