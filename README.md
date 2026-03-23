# PhotoOpp | Sistema de Gestão de Capturas Nexlab

O PhotoOpp é uma plataforma de monorepo desenvolvida para a gestão e processamento de capturas fotográficas em eventos. O sistema é composto por uma API robusta em Node.js e um painel administrativo dinâmico desenvolvido em React.

## Requisitos Prévios

Para a execução deste projeto, é necessário possuir instalado no ambiente local:

* **Node.js** (Versão 20 ou superior)
* **npm** (Gerenciador de pacotes do Node)

## Estrutura do Projeto

O repositório está organizado como um monorepo:

* `/backend`: API REST, Integração Prisma ORM e Processamento de Imagens.
* `/frontend`: Dashboard Administrativo e Interface do Usuário.

---

## Passo a Passo para Instalação

### 1. Clonagem do Repositório
Realize o clone do projeto para sua máquina local e acesse a pasta:
```bash
git clone https://github.com/ojotaeme/PhotoOpp.git
cd PhotoOpp
```
### 2. Configuração do Backend
Acesse o diretório do servidor e realize a instalação das dependências:
```bash
cd backend
npm install
```
### 3. Preparação do Banco de Dados
Ainda na pasta /backend, execute os comandos do Prisma para sincronizar o schema e gerar o cliente de dados:
```bash
npx prisma generate
npx prisma db push
```
### 4. Configuração do Frontend
Abra um novo terminal na raiz do projeto, acesse a pasta do cliente e instale as dependências:
```bash
cd frontend
npm install
```
## Execução do Projeto
Para rodar o sistema completo, é necessário manter dois terminais ativos:

### Iniciar o Backend
Dentro da pasta /backend, execute:
```bash
npx tsx src/server.ts
```
### Iniciar o Frontend
Dentro da pasta /frontend, execute:
```bash
npm run dev
```
Usuários de teste:
admin@nexlab.com | senha admin123
promotor@nexlab.com | senha promotor123

O sistema estará disponível nos seguintes endereços:

Frontend: http://localhost:5173

API: http://localhost:3000

## Notas de Implementação
Processamento de Imagem: O sistema utiliza a biblioteca Sharp para composição de frames. Certifique-se de que a pasta public/uploads possui permissões de escrita.

Segurança: As rotas administrativas são protegidas por Middleware de autenticação JWT e verificação de nível de acesso (Role-Based Access Control).

Logs: O sistema registra automaticamente todas as interações críticas na tabela de auditoria para conformidade de segurança.
