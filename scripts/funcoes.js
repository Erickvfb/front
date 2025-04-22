import {
  getDatabase,
  get,
  ref as dbRef,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { db } from "./firebaseConfig.js";

// Salvar usuário no banc
export function salvarUsuario() {
  const instituicao = document.getElementById("instituicao").value;
  const matriculaOriginal = document.getElementById("matricula").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const mensagemDiv = document.getElementById("mensagemCadastro");

  if (!instituicao || !matriculaOriginal || !nome) {
    mensagemDiv.textContent = "Preencha todos os campos.";
    mensagemDiv.style.color = "red";
    return;
  }

  // Validação: matrícula deve conter apenas números
  if (!/^\d+$/.test(matriculaOriginal)) {
    mensagemDiv.textContent = "A matrícula deve conter apenas números.";
    mensagemDiv.style.color = "red";
    return;
  }

  // Validação: nome não pode ser vazio
  if (nome.length === 0) {
    mensagemDiv.textContent = "O nome não pode estar em branco.";
    mensagemDiv.style.color = "red";
    return;
  }

  // Define o código com base na instituição
  let codInstituicao = "";
  if (instituicao === "faeterj") {
    codInstituicao = "100";
  } else if (instituicao === "cefet") {
    codInstituicao = "200";
  } else {
    mensagemDiv.textContent = "Instituição inválida.";
    mensagemDiv.style.color = "red";
    return;
  }

  // Matrícula completa com código da instituição
  const matriculaFinal = codInstituicao + matriculaOriginal;

  const usuarioRef = dbRef(
    db,
    `${instituicao}/${codInstituicao}/usuarios/${matriculaFinal}`
  );

  get(usuarioRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        mensagemDiv.textContent = "Essa matrícula já está cadastrada.";
        mensagemDiv.style.color = "red";
        return;
      }

      set(usuarioRef, {
        matricula: matriculaFinal,
        nome: nome,
      })
        .then(() => {
          mensagemDiv.textContent = "Usuário cadastrado com sucesso!";
          mensagemDiv.style.color = "green";
          document.getElementById("matricula").value = "";
          document.getElementById("nome").value = "";
          document.getElementById("instituicao").value = "";
          if (document.getElementById("tabelaUsuarios")) {
            window.carregarUsuarios();
          }
        })
        .catch((error) => {
          mensagemDiv.textContent = "Erro ao cadastrar usuário.";
          mensagemDiv.style.color = "red";
          console.error("Erro ao salvar no Firebase:", error);
        });
    })
    .catch((error) => {
      mensagemDiv.textContent = "Erro ao verificar matrícula.";
      mensagemDiv.style.color = "red";
      console.error("Erro ao verificar matrícula:", error);
    });
}

// Função para carregar usuários
export function carregarUsuarios() {
  const tabela = document.getElementById("tabelaUsuarios");
  const select = document.getElementById("instituicao");

  if (!select || !select.value) {
    tabela.innerHTML =
      '<tr><td colspan="3">Selecione uma instituição para ver os usuários.</td></tr>';
    return;
  }

  const instituicao = select.value;
  const codigos = {
    faeterj: "100",
    cefet: "200",
  };

  const usuariosRef = dbRef(
    db,
    `${instituicao}/${codigos[instituicao]}/usuarios`
  );

  get(usuariosRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        let html = "";
        Object.keys(dados).forEach((key) => {
          const usuario = dados[key];
          html += `
                <tr>
                  <td>${usuario.matricula}</td>
                  <td>${usuario.nome}</td>
                  <td>${instituicao.toUpperCase()}</td>
                </tr>
              `;
        });
        tabela.innerHTML = html;
      } else {
        tabela.innerHTML =
          '<tr><td colspan="3">Nenhum usuário cadastrado.</td></tr>';
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar usuários:", error);
      tabela.innerHTML =
        '<tr><td colspan="3">Erro ao carregar dados.</td></tr>';
    });
}

// Função para carregar sucos cadastrados
window.carregarSucos = function () {
  const tabela = document.getElementById("tabelaSucos");
  tabela.innerHTML = "";

  const sucosRef = dbRef(db, "sucos");

  get(sucosRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const sucos = snapshot.val();
        Object.keys(sucos).forEach((codigo) => {
          const suco = sucos[codigo];
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${suco.codigo_suco}</td>
            <td>${suco.nome}</td>
            <td>${suco.quantidade_saida}</td>
          `;
          tabela.appendChild(tr);
        });
      } else {
        tabela.innerHTML =
          "<tr><td colspan='2'>Nenhum suco encontrado.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar sucos:", error);
    });
};

//Relatórios sucos
window.carregarRelatorioSucos = function (instituicao) {
  const tabelaSucos = document.getElementById("tabelaSucos");
  const tabelaPorcentagem = document.getElementById("tabelaPorcentagem");

  if (!instituicao) {
    tabelaSucos.innerHTML =
      "<tr><td colspan='3'>Selecione a instituição.</td></tr>";
    tabelaPorcentagem.innerHTML =
      "<tr><td colspan='2'>Selecione a instituição.</td></tr>";
    return;
  }

  // Prefixo fixo conforme a instituição
  const prefixos = {
    faeterj: "100",
    cefet: "200",
  };

  const prefixo = prefixos[instituicao];

  if (!prefixo) {
    tabelaSucos.innerHTML =
      "<tr><td colspan='3'>Prefixo não encontrado para esta instituição.</td></tr>";
    tabelaPorcentagem.innerHTML =
      "<tr><td colspan='2'>Prefixo não encontrado para esta instituição.</td></tr>";
    return;
  }

  const sucosRef = dbRef(db, `${instituicao}/${prefixo}/sucos`);

  get(sucosRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const sucos = snapshot.val();
        tabelaSucos.innerHTML = "";
        tabelaPorcentagem.innerHTML = "";

        Object.keys(sucos).forEach((codigo) => {
          const suco = sucos[codigo];
          const nome = suco.nome ?? "Desconhecido";
          const saidas = suco.quantidade_saida ?? 0;
          const nivel = suco.quantidade_suco ?? 0;

          const linhaRelatorio = document.createElement("tr");
          linhaRelatorio.innerHTML = `
                <td>${codigo}</td>
                <td>${nome}</td>
                <td>${saidas}</td>
              `;
          tabelaSucos.appendChild(linhaRelatorio);

          const linhaPorcentagem = document.createElement("tr");
          linhaPorcentagem.innerHTML = `
                <td>${nome}</td>
                <td>
                  ${nivel}%
                  <button style="margin-left: 10px;" onclick="reporSuco('${codigo}', '${instituicao}', '${prefixo}')">Repor</button>
                </td>
              `;
          tabelaPorcentagem.appendChild(linhaPorcentagem);
        });
      } else {
        tabelaSucos.innerHTML =
          "<tr><td colspan='3'>Nenhum suco encontrado.</td></tr>";
        tabelaPorcentagem.innerHTML =
          "<tr><td colspan='2'>Nenhum suco encontrado.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar sucos:", error);
    });
};

//Reposição de suco
window.reporSuco = function (codigo, instituicao, prefixo) {
  const db = getDatabase();
  const sucoRef = dbRef(db, `${instituicao}/${prefixo}/sucos/${codigo}`);

  update(sucoRef, {
    quantidade_suco: 100,
  })
    .then(() => {
      alert("Suco reabastecido com sucesso!");
      carregarRelatorioSucos(instituicao, prefixo);
    })
    .catch((error) => {
      console.error("Erro ao reabastecer suco:", error);
      alert("Erro ao reabastecer suco.");
    });
};

// Exibir o nome do usuário logado
document.addEventListener("DOMContentLoaded", () => {
  //Mostrar nome do usuário logado
  const userName = localStorage.getItem("username");
  if (userName) {
    document.getElementById("userName").textContent = userName;
  } else {
    window.location.href = "index.html"; // redireciona se não estiver logado
  }

  // Evento de logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("username"); // remove usuário
      window.location.href = "index.html"; // redireciona para login
    });
  }
});

// Função para carregar conteudo da pagina
export function carregarConteudo(pagina) {
  const conteudo = document.getElementById("conteudo");

  // Switch de possibilidades de click
  switch (pagina) {
    case "usuario":
      conteudo.innerHTML = `
          <h2>Gestão de Usuários</h2>
          <p>Lista de usuários para utilizar a máquina.</p>
          <label for="instituicao">Instituição:</label>
          <select id="instituicao">
          <option value="">Selecione</option>
          <option value="faeterj">FAETERJ</option>
          <option value="cefet">CEFET</option>
          </select><br><br>

          <table border="1" cellpadding="8" cellspacing="0" style="margin-top: 20px; width: 100%;">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody id="tabelaUsuarios" style="text-align: center; vertical-align: middle;">
              <tr><td colspan="2">Carregando usuários...</td></tr>
            </tbody>
          </table>
        `;
      const selectInstituicao = document.getElementById("instituicao");
      selectInstituicao.addEventListener("change", () => {
        if (document.getElementById("tabelaUsuarios")) {
          window.carregarUsuarios();
        }
      });

      break;

    case "sucos":
      conteudo.innerHTML = `
      <h2>Gestão de Sucos</h2>
      <p>Gerencie os sabores de sucos disponíveis na máquina.</p>
  
      <table border="1" cellpadding="8" cellspacing="0" style="margin-top: 20px; width: 100%;">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Saidas</th>
          </tr>
        </thead>
        <tbody id="tabelaSucos" style="text-align: center; vertical-align: middle;">
          <tr><td colspan="2">Carregando sucos...</td></tr>
        </tbody>
      </table>
    `;
      carregarSucos();
      break;

    case "cadastro":
      conteudo.innerHTML = `
          <h2>Cadastro de Usuários</h2>
          <p>Registre os usuários para o uso da máquina de sucos.</p>
  
          <form id="formCadastro" style="margin-top: 20px;">
      <label for="instituicao">Instituição:</label><br>
      <select id="instituicao" required>
        <option value="">Selecione</option>
        <option value="faeterj">FAETERJ</option>
        <option value="cefet">CEFET</option>
      </select><br><br>

      <label for="matricula">Matrícula:</label><br>
      <input type="text" id="matricula" name="matricula" required><br><br>

      <label for="nome">Nome:</label><br>
      <input type="text" id="nome" name="nome" required><br><br>

      <button type="submit">Salvar</button>
    </form>

    <div id="mensagemCadastro" style="margin-top: 15px; font-weight: bold;"></div>
  `;
      // Evento do Formulário
      document
        .getElementById("formCadastro")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          salvarUsuario();
        });
      break;

    case "relatorios":
      conteudo.innerHTML = `
            <h2>Relatórios</h2>
            <p>Acompanhe os relatórios de uso da máquina.</p>
            <label for="instituicao">Instituição:</label>
            <select id="instituicao" onchange="carregarRelatorioSucos(this.value)">
              <option value="">Selecione</option>
              <option value="faeterj">FAETERJ</option>
              <option value="cefet">CEFET</option>
            </select><br><br>
        
            <table border="1" cellpadding="8" cellspacing="0" style="margin-top: 20px; width: 100%; text-align: center;">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Saídas</th>
                </tr>
              </thead>
              <tbody id="tabelaSucos">
                <tr><td colspan="3">Selecione uma instituição para carregar os dados.</td></tr>
              </tbody>
            </table>
        
            <h3 style="margin-top: 40px;">Percentual dos Sucos (%)</h3>
            <table border="1" cellpadding="8" cellspacing="0" style="margin-top: 10px; width: 100%; text-align: center;">
              <thead>
                <tr>
                  <th>Nome do Suco</th>
                  <th>Nível Atual</th>
                </tr>
              </thead>
              <tbody id="tabelaPorcentagem">
                <tr><td colspan="2">Selecione uma instituição para carregar os dados.</td></tr>
              </tbody>
            </table>
          `;
      break;

    default:
      conteudo.innerHTML = `
          <h2>Bem-vindo ao painel</h2>
          <p>Este é o espaço principal.</p>
        `;
  }
}
