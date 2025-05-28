const LOCAL_STORAGE_KEY = 'todoList_tarefas';

// Elementos do DOM
const btnCriarTarefa = document.getElementById('btn-criar-tarefa');
const btnExcluirTarefasConcluidas = document.getElementById('btn-excluir-tarefas-concluidas');
const btnExcluirTarefasPendentes = document.getElementById('btn-excluir-tarefas-pendentes');
const btnExcluirTarefasEmAndamento = document.getElementById('btn-excluir-tarefas-em-andamento');
const mensagemErro = document.getElementById('mensagem-erro');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const modalCriarTarefa = document.getElementById('modal-criar-tarefa');

// Carrega tarefas quando a página é aberta
document.addEventListener('DOMContentLoaded', carregarTarefas);

// Evento para abrir o modal
btnCriarTarefa.addEventListener('click', () => {
    modalCriarTarefa.style.display = 'flex';
});

// Evento para fechar o modal
btnFecharModal.addEventListener('click', () => {
    modalCriarTarefa.style.display = 'none';
    mensagemErro.textContent = '';
    document.getElementById('input-tarefa').value = '';
});

// Formulário para adicionar tarefa
document.getElementById('form-tarefa').addEventListener('submit', (event) => {
    event.preventDefault();
    adicionarTarefa();
});

// Função para adicionar nova tarefa
function adicionarTarefa() {
    const inputTarefa = document.getElementById('input-tarefa');
    const texto = inputTarefa.value.trim();

    if (!texto) {
        mensagemErro.textContent = 'Por favor, insira uma tarefa válida.';
        return;
    }

    // Obtém o status selecionado
    const status = document.querySelector('input[name="andamento-tarefa"]:checked').value;

    // Obtém o nível de importância
    const importancia = document.querySelector('input[name="nivel-importancia"]:checked').value;

    const data = new Date();
    const diaHoraFormatada = data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Cria o objeto da tarefa
    const tarefa = {
        id: diaHoraFormatada,
        texto,
        status,
        importancia
    };

    // Adiciona ao DOM e salva
    adicionarTarefaAoDOM(tarefa);
    salvarTarefas();

    // Limpa o formulário
    inputTarefa.value = '';
    mensagemErro.textContent = '';
    modalCriarTarefa.style.display = 'none';
}

// Adiciona tarefa ao DOM
function adicionarTarefaAoDOM(tarefa) {
    const statusParaContainer = {
        'concluida': 'tarefas-concluidas-container',
        'em-andamento': 'tarefas-em-andamento-container',
        'pendente': 'tarefas-pendentes-container'
    };

    const containerId = statusParaContainer[tarefa.status];
    const container = document.getElementById(containerId);

    const divTarefa = document.createElement('div');
    divTarefa.className = 'tarefa-adicionada';
    divTarefa.dataset.id = tarefa.id;

    const btnLixeira = document.createElement('i');
    btnLixeira.className = 'fa-solid fa-trash';
    btnLixeira.style.cursor = 'pointer';
    btnLixeira.addEventListener('click', function () {
        this.closest('.tarefa-adicionada').remove();
        salvarTarefas();
        atualizarMensagensTarefas();
    });

    const textoTarefa = document.createElement('p');
    // textoTarefa.textContent = tarefa.texto;
    textoTarefa.textContent = tarefa.id + ' - ' + tarefa.texto; // Adiciona o ID antes do texto

    divTarefa.classList.add(`importancia-${tarefa.importancia}`);
    divTarefa.appendChild(btnLixeira);
    divTarefa.appendChild(textoTarefa);

    container.appendChild(divTarefa);
    atualizarMensagensTarefas();
}

// Função para salvar todas as tarefas
function salvarTarefas() {
    const tarefas = {
        concluidas: extrairTarefasDoContainer('tarefas-concluidas-container'),
        emAndamento: extrairTarefasDoContainer('tarefas-em-andamento-container'),
        pendentes: extrairTarefasDoContainer('tarefas-pendentes-container')
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tarefas));
}

// Extrai tarefas de um container
function extrairTarefasDoContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.children.length === 0) return [];

    return Array.from(container.children).map(div => {
        return {
            id: div.dataset.id,
            texto: div.querySelector('p').textContent,
            importancia: div.className.includes('importancia-alto') ? 'alto' :
                div.className.includes('importancia-medio') ? 'medio' : 'baixo',
            status: containerId.includes('concluidas') ? 'concluida' :
                containerId.includes('andamento') ? 'em-andamento' : 'pendente'
        };
    });
}

// Carrega tarefas do localStorage
function carregarTarefas() {
    const tarefasSalvas = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!tarefasSalvas) return;

    try {
        const dados = JSON.parse(tarefasSalvas);
        const concluidas = dados.concluidas || [];
        const emAndamento = dados.emAndamento || [];
        const pendentes = dados.pendentes || [];

        concluidas.forEach(tarefa => adicionarTarefaAoDOM(tarefa));
        emAndamento.forEach(tarefa => adicionarTarefaAoDOM(tarefa));
        pendentes.forEach(tarefa => adicionarTarefaAoDOM(tarefa));

        atualizarMensagensTarefas();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

// Atualiza mensagens quando não há tarefas
function atualizarMensagensTarefas() {
    const containers = [
        'tarefas-concluidas-container',
        'tarefas-em-andamento-container',
        'tarefas-pendentes-container'
    ];

    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        const mensagem = container.parentElement.querySelector('p:not(.tarefa-adicionada p)');
        mensagem.style.display = container.children.length ? 'none' : 'block';
    });

    const textoPrincipal = document.getElementById('texto-tarefas-cadastradas');
    const totalTarefas = document.querySelectorAll('.tarefa-adicionada').length;
    textoPrincipal.textContent = totalTarefas ?
        `Você tem ${totalTarefas} tarefa(s) cadastrada(s).` :
        'Você ainda não tem tarefas cadastradas.';
}

// Eventos para excluir todas as tarefas de cada categoria
btnExcluirTarefasConcluidas.addEventListener('click', () => {
    document.getElementById('tarefas-concluidas-container').innerHTML = '';
    salvarTarefas();
    atualizarMensagensTarefas();
});

btnExcluirTarefasPendentes.addEventListener('click', () => {
    document.getElementById('tarefas-pendentes-container').innerHTML = '';
    salvarTarefas();
    atualizarMensagensTarefas();
});

btnExcluirTarefasEmAndamento.addEventListener('click', () => {
    document.getElementById('tarefas-em-andamento-container').innerHTML = '';
    salvarTarefas();
    atualizarMensagensTarefas();
});