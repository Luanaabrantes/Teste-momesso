Vamos fazer o **README do backend**. Crie um arquivo chamado:

```txt
README.md
```

na raiz do projeto `backend` e cole este conteúdo:

````md
# Teste Técnico Momesso — Backend

## Descrição

Este projeto é o backend de uma aplicação full stack desenvolvida para o teste técnico da Momesso.

A API foi construída com **NestJS**, **TypeORM**, **PostgreSQL**, autenticação com **JWT** e controle de acesso por perfil de usuário. O projeto permite o gerenciamento de empresas, usuários e máquinas, com regras de permissão para usuários `ADMIN` e `USER`.

## Tecnologias utilizadas

- Node.js
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Docker
- JWT
- Passport
- Bcrypt
- Migrations
- PostgreSQL RLS / Policies

## Funcionalidades implementadas

- CRUD de empresas
- CRUD de usuários
- CRUD de máquinas
- Login com JWT
- Criptografia de senha com bcrypt
- Proteção de rotas autenticadas
- Controle de acesso por perfil
- Filtro de dados por empresa
- Ocultação do campo `password` nas respostas da API
- Migrations com TypeORM
- RLS/Policies no PostgreSQL via migration

## Regras de acesso

O sistema possui dois perfis de usuário:

### ADMIN

Usuários com perfil `ADMIN` podem:

- Criar empresas
- Listar empresas
- Buscar empresa por ID
- Atualizar empresas
- Remover empresas
- Criar usuários
- Listar usuários
- Buscar usuário por ID
- Atualizar usuários
- Remover usuários
- Criar máquinas
- Listar máquinas
- Buscar máquina por ID
- Atualizar máquinas
- Remover máquinas

### USER

Usuários com perfil `USER` podem:

- Visualizar apenas a própria empresa
- Visualizar usuários da própria empresa
- Visualizar máquinas da própria empresa

Usuários comuns não podem criar, editar ou remover registros.

## Estrutura principal do backend

```txt
src/
├── auth/
│   ├── decorators/
│   ├── dto/
│   ├── guards/
│   ├── types/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── jwt.strategy.ts
│
├── company/
│   ├── dto/
│   ├── entities/
│   ├── company.controller.ts
│   ├── company.module.ts
│   └── company.service.ts
│
├── user/
│   ├── dto/
│   ├── entities/
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
│
├── machine/
│   ├── dto/
│   ├── entities/
│   ├── machine.controller.ts
│   ├── machine.module.ts
│   └── machine.service.ts
│
├── database/
│   └── data-source.ts
│
├── migrations/
│   ├── CreateInitialTables
│   └── AddRlsPolicies
│
├── app.module.ts
└── main.ts
````

## Pré-requisitos

Antes de rodar o projeto, é necessário ter instalado:

* Node.js
* npm
* Docker
* Docker Desktop
* PostgreSQL via Docker

## Configuração do banco com Docker

O banco PostgreSQL foi executado em um container Docker.

Exemplo de comando para criar o container:

```bash
docker run --name momesso-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=momesso_db \
  -p 5433:5432 \
  -d postgres:16
```

Verificar se o container está rodando:

```bash
docker ps
```

Acessar o PostgreSQL:

```bash
docker exec -it momesso-postgres psql -U postgres
```

Conectar ao banco:

```sql
\c momesso_db
```

Listar tabelas:

```sql
\dt
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=momesso_db

JWT_SECRET=segredo_momesso_123
JWT_EXPIRES_IN=1d
```

Observação: a porta `5433` foi utilizada porque o container PostgreSQL está mapeado como `5433 -> 5432`.

## Instalação

Instale as dependências:

```bash
npm install
```

## Rodar as migrations

Para executar as migrations:

```bash
npm run migration:run
```

As migrations criam:

* Tabela `company`
* Tabela `user`
* Tabela `machine`
* Relacionamentos entre as tabelas
* Policies de RLS no PostgreSQL

## Rodar o projeto

Para iniciar o backend em modo desenvolvimento:

```bash
npm run start:dev
```

A API ficará disponível em:

```txt
http://localhost:3000
```

## Autenticação

A autenticação é feita via JWT.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "123456"
}
```

Resposta esperada:

```json
{
  "accessToken": "token_jwt",
  "user": {
    "id": "uuid",
    "name": "Usuario Comum",
    "email": "usuario@email.com",
    "role": "USER",
    "companyId": "uuid-da-empresa"
  }
}
```

Para acessar rotas protegidas, envie o token no header:

```http
Authorization: Bearer token_jwt
```

## Rotas da API

### Auth

```txt
POST /auth/login
```

### Company

```txt
POST   /company
GET    /company
GET    /company/:id
PATCH  /company/:id
DELETE /company/:id
```

### User

```txt
POST   /user
GET    /user
GET    /user/:id
PATCH  /user/:id
DELETE /user/:id
```

### Machine

```txt
POST   /machine
GET    /machine
GET    /machine/:id
PATCH  /machine/:id
DELETE /machine/:id
```

## Exemplos de testes HTTP

### Login ADMIN

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "luanab.admin@email.com",
  "password": "123456"
}
```

### Login USER

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "123456"
}
```

### Listar usuários autenticado

```http
GET http://localhost:3000/user
Authorization: Bearer token_jwt
```

### Criar empresa com ADMIN

```http
POST http://localhost:3000/company
Content-Type: application/json
Authorization: Bearer token_jwt

{
  "name": "CIAG",
  "cnpj": "22222222000199"
}
```

### Tentativa de criação com USER

```http
POST http://localhost:3000/company
Content-Type: application/json
Authorization: Bearer token_jwt_user

{
  "name": "Empresa Bloqueada",
  "cnpj": "33333333000199"
}
```

Resposta esperada:

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

## Segurança

O projeto implementa as seguintes camadas de segurança:

### JWT

Após o login, o usuário recebe um token JWT contendo:

* ID do usuário
* Email
* Role
* CompanyId

Esse token é utilizado para autenticar as próximas requisições.

### AuthGuard

As rotas protegidas utilizam:

```ts
@UseGuards(AuthGuard('jwt'))
```

Isso garante que apenas usuários autenticados acessem as rotas.

### RolesGuard

Foi criado um guard específico para controle de perfil:

```ts
@UseGuards(AuthGuard('jwt'), RolesGuard)
```

As rotas de criação, atualização e remoção usam:

```ts
@Roles('ADMIN')
```

Assim, apenas usuários `ADMIN` podem executar operações de escrita.

### Filtro por empresa

Usuários `USER` visualizam apenas registros da própria empresa, com base no `companyId` presente no token JWT.

### Senhas

As senhas são criptografadas com bcrypt antes de serem salvas no banco.

Além disso, o campo `password` foi configurado com:

```ts
@Column({ select: false })
password!: string;
```

Dessa forma, a senha não aparece nas respostas da API.

## RLS / Policies no PostgreSQL

Foi implementada uma migration específica para ativar **Row Level Security** no PostgreSQL.

As policies foram criadas para as tabelas:

* `company`
* `user`
* `machine`

A migration responsável é:

```txt
AddRlsPolicies
```

As policies utilizam variáveis de sessão do PostgreSQL:

```sql
app.current_user_role
app.current_company_id
```

Exemplo conceitual:

```sql
SET app.current_user_role = 'USER';
SET app.current_company_id = 'uuid-da-empresa';
```

Regras previstas nas policies:

* `ADMIN` pode acessar todos os registros.
* `USER` pode visualizar apenas registros vinculados à própria empresa.

A aplicação também aplica essas regras via JWT, `RolesGuard` e filtros por `companyId`.

## Migrations implementadas

### CreateInitialTables

Cria as tabelas principais:

* `company`
* `user`
* `machine`

Também cria os relacionamentos:

* Uma empresa possui vários usuários.
* Uma empresa possui várias máquinas.
* Usuários pertencem a uma empresa.
* Máquinas pertencem a uma empresa.

### AddRlsPolicies

Ativa Row Level Security e cria as policies de acesso no PostgreSQL.

## Comandos úteis

Gerar migration:

```bash
npm run migration:generate -- src/migrations/NomeDaMigration
```

Criar migration vazia:

```bash
npm run typeorm -- migration:create src/migrations/NomeDaMigration
```

Executar migrations:

```bash
npm run migration:run
```

Reverter última migration:

```bash
npm run migration:revert
```

Rodar projeto:

```bash
npm run start:dev
```

## Observações para avaliação

Este backend foi desenvolvido priorizando:

* Separação de responsabilidades
* Organização por módulos
* Uso de DTOs
* Uso de entities
* Autenticação JWT
* Controle de acesso por perfil
* Segurança em nível de aplicação
* Segurança adicional em nível de banco com RLS/Policies
* Migrations versionadas
* Senhas criptografadas
* Respostas sem exposição de senha

```
