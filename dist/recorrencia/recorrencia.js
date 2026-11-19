import { diasNoMes } from '../calendario';
import { Dinheiro } from '../ledger/domain/dinheiro';
export function criarRecorrente(entrada) {
    const recorrente = {
        id: entrada.id,
        nome: entrada.nome,
        categoria: entrada.categoria,
        tipo: entrada.tipo,
        valorEsperado: Dinheiro.from(entrada.valorEsperado).value,
        diaVencimento: entrada.diaVencimento,
        dataInicio: entrada.dataInicio,
        contaId: entrada.contaId,
        ativa: true,
        statusPorMes: {},
        criadoEm: entrada.criadoEm
    };
    if (entrada.dataFim)
        recorrente.dataFim = entrada.dataFim;
    if (entrada.cartaoId)
        recorrente.cartaoId = entrada.cartaoId;
    return recorrente;
}
export function statusNoMes(recorrente, mesRef) {
    return recorrente.statusPorMes[mesRef] === 'paga' ? 'paga' : 'prevista';
}
export function marcarComoPaga(recorrente, mesRef, transacaoId) {
    return {
        ...recorrente,
        statusPorMes: { ...recorrente.statusPorMes, [mesRef]: 'paga' },
        pagamentosPorMes: { ...recorrente.pagamentosPorMes, [mesRef]: transacaoId }
    };
}
export function marcarComoPrevista(recorrente, mesRef) {
    const statusPorMes = { ...recorrente.statusPorMes };
    delete statusPorMes[mesRef];
    const pagamentosPorMes = { ...recorrente.pagamentosPorMes };
    delete pagamentosPorMes[mesRef];
    return { ...recorrente, statusPorMes, pagamentosPorMes };
}
/** `null` quando o mês não tem o dia (31 em fevereiro). */
export function dataDaOcorrencia(recorrente, mesRef) {
    const [ano, mes] = mesRef.split('-').map(Number);
    if (recorrente.diaVencimento > diasNoMes(ano, mes))
        return null;
    return `${mesRef}-${String(recorrente.diaVencimento).padStart(2, '0')}`;
}
export function aplicavelNoMes(recorrente, mesRef) {
    const data = dataDaOcorrencia(recorrente, mesRef);
    if (!data)
        return false;
    if (data < recorrente.dataInicio)
        return false;
    if (recorrente.dataFim && data > recorrente.dataFim)
        return false;
    return true;
}
export function listarPendentesNoMes(recorrentes, mesRef) {
    return recorrentes.filter((r) => r.ativa && aplicavelNoMes(r, mesRef) && statusNoMes(r, mesRef) === 'prevista');
}
export function desvincularPagamento(recorrentes, transacaoId) {
    let mudou = false;
    const novas = recorrentes.map((recorrente) => {
        const meses = Object.entries(recorrente.pagamentosPorMes ?? {})
            .filter(([, id]) => id === transacaoId)
            .map(([mes]) => mes);
        if (meses.length === 0)
            return recorrente;
        mudou = true;
        return meses.reduce((atual, mes) => marcarComoPrevista(atual, mes), recorrente);
    });
    return mudou ? novas : recorrentes;
}
/**
 * Mês já `paga` sem ponteiro ganha o id quando existe exatamente uma linha
 * compatível. Zero ou mais de um candidato deixa o mês sem ponteiro.
 */
export function vincularPagamentosUnicos(recorrentes, transacoes) {
    const usados = new Set();
    for (const recorrente of recorrentes) {
        for (const id of Object.values(recorrente.pagamentosPorMes ?? {}))
            usados.add(id);
    }
    return recorrentes.map((recorrente) => {
        const pagamentosPorMes = { ...(recorrente.pagamentosPorMes ?? {}) };
        let mudou = false;
        for (const [mesRef, status] of Object.entries(recorrente.statusPorMes)) {
            if (status !== 'paga' || pagamentosPorMes[mesRef])
                continue;
            const candidatos = transacoes.filter((t) => {
                if (usados.has(t.id))
                    return false;
                if (t.data.slice(0, 7) !== mesRef)
                    return false;
                if (t.valor !== recorrente.valorEsperado)
                    return false;
                if (t.categoria !== recorrente.categoria)
                    return false;
                if (recorrente.cartaoId) {
                    return t.tipo === 'gasto-cartao' && t.cartaoId === recorrente.cartaoId;
                }
                if (recorrente.tipo === 'entrada') {
                    return t.tipo === 'entrada' && t.contaId === recorrente.contaId;
                }
                return ((t.tipo === 'saida' || t.tipo === 'pagamento-fatura') && t.contaId === recorrente.contaId);
            });
            if (candidatos.length !== 1)
                continue;
            pagamentosPorMes[mesRef] = candidatos[0].id;
            usados.add(candidatos[0].id);
            mudou = true;
        }
        if (!mudou)
            return recorrente;
        return { ...recorrente, pagamentosPorMes };
    });
}
//# sourceMappingURL=recorrencia.js.map