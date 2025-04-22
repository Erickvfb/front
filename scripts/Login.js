import { db } from "./firebaseConfig.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome_login = document.getElementById("username").value.trim();
  const senha = document.getElementById("password").value;

  const adminRef = ref(db, "administradores");

  get(adminRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const admins = snapshot.val();
        let loginSucesso = false;

        for (const key in admins) {
          if (key === "contador") continue; // pula a chave 'contador'

          const admin = admins[key];

          // Compara usando string para evitar problema com tipo
          if (
            String(admin.nome_login) === String(nome_login) &&
            String(admin.senha) === String(senha)
          ) {
            loginSucesso = true;
            break;
          }
        }

        if (loginSucesso) {
          localStorage.setItem("username", nome_login);
          window.location.href = "menu.html";
        } else {
          alert("Usuário ou senha incorretos!");
        }
      } else {
        alert("Nenhum administrador encontrado.");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar administradores:", error);
      alert("Erro ao tentar fazer login.");
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("username");
      window.location.href = "index.html";
    });
  }
});
