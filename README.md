
# 🍹 Máquina de Sucos Inteligente

Este projeto consiste em um sistema de controle e gerenciamento de uma máquina de sucos voltado para o uso em instituições 
como escolas e universidades. Os administradores podem gerenciar o sistema por meio deste painel web.

## ✨ Funcionalidades

- Cadastro de alunos e controle de acesso.
- Painel web gerencial com relatórios e níveis de estoque.
- Alerta automático quando os níveis de suco estão baixos.
- Integração com Firebase para banco de dados em tempo real.

## 🛠 Tecnologias Utilizadas

- HTML5  
- CSS3  
- JavaScript (ES6)  
- Firebase (Realtime Database)  
- Node.js (para versão local/servidor)

## 🚀 Como usar

### 1. Clonar o repositório

```bash
git clone https://github.com/Erickvfb/front
```

### 2. Abrir o projeto

Abra a pasta do projeto com seu editor de código (VS Code, por exemplo).

### 3. Configurar o Firebase

Crie um projeto no [Firebase](https://console.firebase.google.com/) e substitua as configurações em `scripts/firebaseConfig.js` com as credenciais do seu projeto:

```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DOMINIO.firebaseio.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 4. Executar

Basta abrir o arquivo `menu.html` no navegador para acessar o painel web.

## 🧑‍💻 Autor

- Projeto criado por [Erick Barros](https://github.com/Erickvfb)

---

### ⚠️ Aviso

> Este projeto é educacional, sem fins comerciais, criado como parte de um projeto acadêmico.
