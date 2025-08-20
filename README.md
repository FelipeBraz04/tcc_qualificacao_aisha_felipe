# SleepTracker: Aplicação Web para Monitoramento e Melhoria do Sono

## Descrição

Este projeto é uma aplicação web para monitoramento manual do sono, com foco em usabilidade e acessibilidade. A plataforma permite que os usuários registrem suas rotinas de sono, visualizem métricas básicas e acompanhem sua evolução ao longo do tempo. O objetivo é desenvolver uma plataforma web que permita o registro e a análise de dados relacionados ao sono, oferecendo recomendações personalizadas para a melhoria da qualidade do descanso, utilizando inteligência artificial para otimização dos padrões de sono dos usuários.

## Funcionalidades

* **Cadastro e Login de Usuários**: Sistema de autenticação seguro para os usuários.
* **Registro Manual do Sono**: Os usuários podem registrar detalhes sobre seu sono, como:
    * Data do sono
    * Horário de dormir e acordar
    * Duração do sono
    * Qualidade do sono (avaliação de 1 a 5)
    * Notas adicionais
* **Dashboard Interativo**: Visualização de métricas, gráficos de tendências e histórico do usuário.
* **Visualização de Dados**:
    * Gráficos de duração e qualidade do sono.
    * Tabela com o histórico de sono.
    * Filtros por período.
* **Recomendações com IA**: Geração de dicas personalizadas para a melhoria da qualidade do sono com base nos dados fornecidos pelo usuário, utilizando a API da OpenAI (GPT-3.5-turbo).
* **CRUD de Registros de Sono**: Funcionalidades para criar, visualizar, editar e excluir registros de sono.

## Tecnologias Utilizadas

### Backend

* **Node.js**: Ambiente de execução JavaScript.
* **Express**: Framework para aplicações web.
* **MongoDB**: Banco de dados NoSQL para armazenamento de dados.
* **Mongoose**: Modelagem de dados do MongoDB para Node.js.
* **JSON Web Token (JWT)**: Para autenticação e autorização.
* **bcryptjs**: Para criptografia de senhas.
* **OpenAI API**: Para geração de dicas de sono com IA.
* **cors**: Para habilitar o Cross-Origin Resource Sharing.
* **dotenv**: Para gerenciamento de variáveis de ambiente.

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript**

## Como Começar

### Pré-requisitos

* Node.js instalado
* MongoDB instalado e em execução

### Instalação

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/felipebraz04/tcc_qualificacao_aisha_felipe.git](https://github.com/felipebraz04/tcc_qualificacao_aisha_felipe.git)
    ```
2.  Navegue até a pasta do backend e instale as dependências:
    ```bash
    cd backend-sleeptracker
    npm install
    ```
3.  Crie um arquivo `.env` na pasta `backend-sleeptracker` e adicione as seguintes variáveis de ambiente:
    ```
    MONGO_URI=<sua_string_de_conexao_mongodb>
    JWT_SECRET=<seu_segredo_jwt>
    OPENAI_API_KEY=<sua_chave_de_api_da_openai>
    ```
4.  Inicie o servidor backend:
    ```bash
    node server.js
    ```
5.  Abra o arquivo `index/index.html` em seu navegador para acessar a aplicação.

## Endpoints da API

A API está disponível em `http://localhost:3000/api`.

### Autenticação

* `POST /api/auth/register`: Registra um novo usuário.
* `POST /api/auth/login`: Autentica um usuário e retorna um token JWT.

### Dados do Sono

* `POST /api/sleep`: Cria um novo registro de sono. (Requer autenticação)
* `GET /api/sleep`: Retorna todos os registros de sono do usuário. (Requer autenticação)
* `GET /api/sleep/:id`: Retorna um registro de sono específico. (Requer autenticação)
* `PUT /api/sleep/:id`: Atualiza um registro de sono. (Requer autenticação)
* `DELETE /api/sleep/:id`: Exclui um registro de sono. (Requer autenticação)
* `POST /api/sleep/dicas`: Gera dicas de sono com base nos dados fornecidos. (Requer autenticação)
