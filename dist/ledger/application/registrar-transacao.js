import { registrarLinha } from '../domain/registrar-linha';
export async function registrarTransacao(repositorio, relogio, ids, entrada) {
    const transacao = registrarLinha({
        ...entrada,
        id: ids.novoId(),
        criadoEm: relogio.agora()
    });
    await repositorio.incluirTransacao(transacao);
    return transacao;
}
//# sourceMappingURL=registrar-transacao.js.map