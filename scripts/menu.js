import {
  salvarUsuario,
  carregarConteudo as carregar,
  carregarUsuarios,
  carregarSucos,
  carregarRelatorioSucos,
} from "./scripts/funcoes.js";

// Deixa as funções disponíveis globalmente (window)
window.salvarUsuario = salvarUsuario;
window.carregarConteudo = carregar;
window.carregarUsuarios = carregarUsuarios;
window.carregarSucos = carregarSucos;
window.carregarRelatorioSucos = carregarRelatorioSucos;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tabelaUsuarios")) {
    carregarUsuarios();
  }

  // Captura todos os links com atributo data-pagina
  document.querySelectorAll("a[data-pagina]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Impede o recarregamento da página
      const pagina = this.getAttribute("data-pagina");
      carregar(pagina); // Chama a função com o nome da página
    });
  });
});
