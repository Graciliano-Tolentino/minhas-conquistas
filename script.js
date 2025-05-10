/*
  =========================================================================================
  📄 Arquivo: script.js
  🎓 Projeto: Minha Lista de Tarefas – Trabalho Acadêmico
  👨‍🎓 Aluno: Graciliano Augusto Nobre Tolentino
  🏫 Curso: Desenvolvimento de Software Multiplataforma – 1º Período | FATEC Cotia
  👨‍🏫 Professora: Semirames Pereira das Flores
  📅 Data: 10/05/2025
  📚 Descrição: Script principal da aplicação. Controla inserção, visualização,
                marcação, exclusão, filtragem e progresso das tarefas.
                Estruturado com modularidade, acessibilidade e responsividade.
  =========================================================================================
*/

// ===== SELETORES BASE =====
const inputTarefa = document.getElementById('tarefaInput');
const botaoAdicionar = document.getElementById('adicionarBtn');
const listaTarefas = document.getElementById('listaTarefas');

// ===== EVENTO DE ADIÇÃO (Clique + Enter) =====
botaoAdicionar.addEventListener('click', adicionarTarefa);
inputTarefa.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') adicionarTarefa();
});

// ===== FUNÇÃO: ADICIONAR NOVA TAREFA =====
function adicionarTarefa() {
  const texto = inputTarefa.value.trim();

  if (texto === '') {
    alert('Por favor, digite uma tarefa.');
    return;
  }

  criarTarefa(texto);
  inputTarefa.value = '';
  inputTarefa.focus();

  atualizarProgresso(); // (será definida em módulo futuro)
}
// ===== FUNÇÃO: CRIAÇÃO E RENDERIZAÇÃO DE NOVA TAREFA =====
function criarTarefa(texto) {
  const li = document.createElement('li');
  li.classList.add('tarefa-item');
  li.setAttribute('tabindex', '0');
  li.setAttribute('role', 'listitem');
  li.setAttribute('aria-label', `Tarefa pendente: ${texto}`);
  li.textContent = texto;

  // ===== Acessibilidade: marcação por teclado =====
  li.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      li.click();
    }
  });

  // ===== Alternar conclusão ao clicar =====
  li.addEventListener('click', () => {
    li.classList.toggle('concluida');

    const status = li.classList.contains('concluida')
      ? 'Tarefa marcada como concluída'
      : 'Tarefa marcada como pendente';

    li.setAttribute('aria-label', `${status}: ${texto}`);
    atualizarProgresso(); // (será definida em módulo futuro)
  });

  // ===== Criar botão de remoção e anexar =====
  const botaoRemover = document.createElement('button');
  botaoRemover.textContent = '×';
  botaoRemover.setAttribute('aria-label', 'Remover tarefa');
  botaoRemover.style.marginLeft = 'auto';
  botaoRemover.style.background = 'none';
  botaoRemover.style.border = 'none';
  botaoRemover.style.color = '#999';
  botaoRemover.style.fontSize = '1.25rem';
  botaoRemover.style.cursor = 'pointer';

  botaoRemover.addEventListener('click', (event) => {
    event.stopPropagation(); // impede marcar como concluída ao clicar em remover
    listaTarefas.removeChild(li);
    atualizarProgresso(); // (será definida em módulo futuro)
  });

  li.appendChild(botaoRemover);
  listaTarefas.appendChild(li);
}
// ===== FUNÇÃO: ATUALIZAR INDICADOR DE PROGRESSO =====
function atualizarProgresso() {
  const tarefas = listaTarefas.querySelectorAll('li');
  const total = tarefas.length;
  const concluidas = [...tarefas].filter(t => t.classList.contains('concluida')).length;
  const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  // Atualiza valores numéricos
  document.getElementById('progressoAtual').textContent = concluidas;
  document.getElementById('progressoTotal').textContent = total;

  // Atualiza barra visual
  const barra = document.getElementById('barraProgresso');
  barra.style.width = `${percentual}%`;
  barra.setAttribute('aria-valuenow', percentual);
}
// ===== FUNÇÃO: APLICA O FILTRO SELECIONADO À LISTA =====
function aplicarFiltro(filtro) {
  const tarefas = listaTarefas.querySelectorAll('li');

  tarefas.forEach((tarefa) => {
    const estaConcluida = tarefa.classList.contains('concluida');

    switch (filtro) {
      case 'pendentes':
        tarefa.style.display = estaConcluida ? 'none' : 'flex';
        break;
      case 'concluidas':
        tarefa.style.display = estaConcluida ? 'flex' : 'none';
        break;
      default:
        tarefa.style.display = 'flex';
    }
  });
}
// ===== BOTÃO: LIMPAR TODAS AS TAREFAS CONCLUÍDAS =====
document.getElementById('limparConcluidasBtn').addEventListener('click', () => {
  const concluidas = listaTarefas.querySelectorAll('li.concluida');
  concluidas.forEach((tarefa) => tarefa.remove());
  atualizarProgresso();
});
// ===== BOTÃO: EXPORTAR LISTA COMO PDF (simulação textual) =====
document.getElementById('exportarPdfBtn').addEventListener('click', () => {
  const tarefas = [...listaTarefas.querySelectorAll('li')].map((li) => {
    const status = li.classList.contains('concluida') ? '[✔]' : '[ ]';
    return `${status} ${li.firstChild.textContent.trim()}`;
  });

  const blob = new Blob([tarefas.join('\n')], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'minhas_tarefas.txt';
  link.click();
});
// ===== BOTÃO: FAZER BACKUP EM LOCALSTORAGE =====
document.getElementById('backupBtn').addEventListener('click', () => {
  const tarefas = [...listaTarefas.querySelectorAll('li')].map((li) => ({
    texto: li.firstChild.textContent.trim(),
    concluida: li.classList.contains('concluida'),
  }));

  localStorage.setItem('minhasTarefasDSM', JSON.stringify(tarefas));
  alert('Backup realizado com sucesso!');
});
// ===== FUNÇÃO: RESTAURA TAREFAS DO LOCALSTORAGE AO INICIAR =====
window.addEventListener('DOMContentLoaded', () => {
  const backup = localStorage.getItem('minhasTarefasDSM');
  if (!backup) return;

  try {
    const tarefas = JSON.parse(backup);

    tarefas.forEach((tarefa) => {
      criarTarefa(tarefa.texto);
      const ultimaTarefa = listaTarefas.lastElementChild;
      if (tarefa.concluida) {
        ultimaTarefa.classList.add('concluida');
        ultimaTarefa.setAttribute('aria-label', `Tarefa marcada como concluída: ${tarefa.texto}`);
      }
    });

    atualizarProgresso();
  } catch (erro) {
    console.error('Erro ao carregar tarefas salvas:', erro);
  }
});

/*
  =========================================================================================
  🔚 Fim do Documento JS – script.js

  ✅ Script finalizado com modularidade, clareza e acessibilidade.
  ✅ Gerencia inserção, conclusão, remoção, filtragem e progresso das tarefas.
  ✅ Integra funcionalidades de backup local, exportação de dados e restauração automática.
  ✅ Estruturado com foco em boas práticas, manutenção futura e compatibilidade com PWA.
  ✅ Pronto para avaliação acadêmica e evolução multiplataforma.

  🔰 Aluno: Graciliano Augusto Nobre Tolentino | Curso: DSM 1º ciclo – FATEC Cotia
  =========================================================================================
*/
