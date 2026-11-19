import { somarDias } from '../calendario';
import { gerarResumo } from '../cartao/cartao';
import { isSaida } from '../ledger/domain/classificar-lancamento';
import { contaNaProjecao, valorNoDia } from '../previsao/previsao';
import { aplicavelNoMes, dataDaOcorrencia, statusNoMes } from '../recorrencia/recorrencia';
export const JANELA_GASTO_DIARIO_PADRAO = 60;
export const HORIZONTE_PROXIMA_ENTRADA_DIAS = 62;
function menorTaxaConstante(dias, inicio, fim, margemSeguranca) {
    let minimo = Infinity;
    for (let i = inicio; i <= fim; i++) {
        const taxa = (dias[i].saldoProjetado - margemSeguranca) / (i - inicio + 1);
        if (taxa < minimo)
            minimo = taxa;
    }
    return Math.round(minimo);
}
function contasCorrenteAtivas(contas) {
    return new Set(contas.filter((c) => c.ativa && c.tipo === 'corrente').map((c) => c.id));
}
export function projetarSaldo(params) {
    const { saldoAtual, transacoes, contas, dataInicio, horizonteDias, recorrentes = [], cartoes = [], previsoes = [], diasRetroativos = 0 } = params;
    const contasCorrente = contasCorrenteAtivas(contas);
    const ativas = recorrentes.filter((r) => r.ativa && !r.cartaoId && contasCorrente.has(r.contaId));
    const pontuaisFuturas = transacoes.filter((t) => t.data > dataInicio &&
        contasCorrente.has(t.contaId) &&
        (t.tipo === 'entrada' || isSaida(t.tipo)));
    const dataFimStr = somarDias(dataInicio, horizonteDias);
    const eventosFatura = calcularEventosFatura({ cartoes, transacoes, hoje: dataInicio, dataFimStr });
    const transacoesReais = transacoes.filter((t) => contasCorrente.has(t.contaId) && (t.tipo === 'entrada' || isSaida(t.tipo)));
    const historico = [];
    if (diasRetroativos > 0) {
        const dataInicioJanela = somarDias(dataInicio, -diasRetroativos);
        const somaJanela = transacoesReais
            .filter((t) => t.data >= dataInicioJanela && t.data <= dataInicio)
            .reduce((acc, t) => acc + (t.tipo === 'entrada' ? t.valor : -t.valor), 0);
        let saldoHistorico = saldoAtual - somaJanela;
        for (let i = -diasRetroativos; i < 0; i++) {
            const dataStr = somarDias(dataInicio, i);
            const eventos = [];
            for (const t of transacoesReais) {
                if (t.data !== dataStr)
                    continue;
                const tipo = t.tipo === 'entrada' ? 'entrada' : 'saida';
                eventos.push({ nome: t.descricao, valor: t.valor, tipo });
                saldoHistorico += tipo === 'entrada' ? t.valor : -t.valor;
            }
            historico.push({ data: dataStr, saldoProjetado: saldoHistorico, eventos });
        }
    }
    const resultado = [];
    let saldoAcumulado = saldoAtual;
    for (let i = 0; i <= horizonteDias; i++) {
        const dataStr = somarDias(dataInicio, i);
        const mesRef = dataStr.slice(0, 7);
        const eventos = [];
        for (const rec of ativas) {
            const dataOcorrencia = dataDaOcorrencia(rec, mesRef);
            if (!dataOcorrencia || !aplicavelNoMes(rec, mesRef))
                continue;
            if (statusNoMes(rec, mesRef) !== 'prevista')
                continue;
            const dataEfetiva = dataOcorrencia < dataInicio ? dataInicio : dataOcorrencia;
            if (dataEfetiva !== dataStr)
                continue;
            eventos.push({ nome: rec.nome, valor: rec.valorEsperado, tipo: rec.tipo, simulado: true });
            saldoAcumulado += rec.tipo === 'entrada' ? rec.valorEsperado : -rec.valorEsperado;
        }
        for (const t of pontuaisFuturas) {
            if (t.data !== dataStr)
                continue;
            const tipo = t.tipo === 'entrada' ? 'entrada' : 'saida';
            eventos.push({ nome: t.descricao, valor: t.valor, tipo });
            saldoAcumulado += tipo === 'entrada' ? t.valor : -t.valor;
        }
        for (const previsao of previsoes) {
            if (!contaNaProjecao(previsao, dataStr, dataInicio))
                continue;
            const valorEvento = valorNoDia(previsao, dataStr);
            eventos.push({
                nome: previsao.nome,
                valor: valorEvento,
                tipo: previsao.tipo,
                simulado: true
            });
            saldoAcumulado += previsao.tipo === 'entrada' ? valorEvento : -valorEvento;
        }
        for (const ev of eventosFatura) {
            if (ev.data !== dataStr)
                continue;
            eventos.push({ nome: ev.nome, valor: ev.valor, tipo: 'saida', simulado: true });
            saldoAcumulado -= ev.valor;
        }
        resultado.push({ data: dataStr, saldoProjetado: saldoAcumulado, eventos });
    }
    return [...historico, ...resultado];
}
export function calcularEventosFatura(params) {
    const { cartoes, transacoes, hoje, dataFimStr } = params;
    const transacoesParaFatura = dataFimStr
        ? transacoes.filter((t) => !(t.tipo === 'pagamento-fatura' && t.data > dataFimStr))
        : transacoes;
    const eventos = [];
    for (const cartao of cartoes.filter((c) => c.ativo)) {
        for (const fatura of gerarResumo(cartao, transacoesParaFatura, hoje).faturas) {
            if (fatura.saldo <= 0)
                continue;
            const dataEfetiva = fatura.vencimento < hoje ? hoje : fatura.vencimento;
            if (dataFimStr && dataEfetiva > dataFimStr)
                continue;
            eventos.push({
                data: dataEfetiva,
                nome: `Fatura ${cartao.nome}`,
                valor: fatura.saldo,
                cartaoId: cartao.id,
                faturaReferencia: fatura.referencia
            });
        }
    }
    return eventos;
}
export function calcularGastoDiarioDisponivel(dias, margemSeguranca = 0) {
    return dias.map((diaInicial, k) => {
        const mesRef = diaInicial.data.slice(0, 7);
        let ultimoIndice = k;
        for (let i = k; i < dias.length && dias[i].data.slice(0, 7) === mesRef; i++) {
            ultimoIndice = i;
        }
        return menorTaxaConstante(dias, k, ultimoIndice, margemSeguranca);
    });
}
export function limiteDiarioSustentavel(dias, indiceProximaEntrada, margemSeguranca) {
    if (indiceProximaEntrada === 0) {
        return Math.round(dias[0].saldoProjetado - margemSeguranca);
    }
    return menorTaxaConstante(dias, 0, indiceProximaEntrada - 1, margemSeguranca);
}
export function calcularDataDoAperto(params) {
    const { dias, indiceProximaEntrada, ritmoAtual, limiteDiario, margemSeguranca } = params;
    const reducaoDiariaNecessaria = Math.min(ritmoAtual, Math.max(0, ritmoAtual - limiteDiario));
    if (ritmoAtual <= limiteDiario) {
        return { data: null, diasConfortaveis: null, reducaoDiariaNecessaria: 0 };
    }
    for (let i = 0; i < indiceProximaEntrada; i++) {
        const saldoSimulado = dias[i].saldoProjetado - ritmoAtual * (i + 1);
        if (saldoSimulado < margemSeguranca) {
            return { data: dias[i].data, diasConfortaveis: i, reducaoDiariaNecessaria };
        }
    }
    return { data: null, diasConfortaveis: null, reducaoDiariaNecessaria };
}
export function aplicarGastoHipotetico(dias, valor, indiceInicio = 0) {
    return dias.map((d, i) => i < indiceInicio ? d : { ...d, saldoProjetado: d.saldoProjetado - valor });
}
export function resumirFluxo(dias) {
    let entradas = 0;
    let saidas = 0;
    for (const dia of dias) {
        for (const evento of dia.eventos) {
            if (evento.tipo === 'entrada')
                entradas += evento.valor;
            else
                saidas += evento.valor;
        }
    }
    return { entradas, saidas };
}
export function limiteGastoDiario(entradas, saidas, diasNoMes) {
    if (diasNoMes <= 0)
        return 0;
    return Math.round((entradas - saidas) / diasNoMes);
}
export function proximaEntradaRelevante(dias) {
    for (const dia of dias) {
        const entrada = dia.eventos.find((e) => e.tipo === 'entrada');
        if (entrada)
            return { data: dia.data, nome: entrada.nome, valor: entrada.valor };
    }
    return null;
}
export function saldoDisponivelAteData(dias, data) {
    const dia = dias.find((d) => d.data === data);
    if (!dia)
        return 0;
    const totalEntradas = dia.eventos
        .filter((e) => e.tipo === 'entrada')
        .reduce((total, e) => total + e.valor, 0);
    return dia.saldoProjetado - totalEntradas;
}
export function fluxoRealNoDia(params) {
    const contasCorrente = contasCorrenteAtivas(params.contas);
    let entradas = 0;
    let saidas = 0;
    for (const t of params.transacoes) {
        if (t.data !== params.data || !contasCorrente.has(t.contaId))
            continue;
        if (t.tipo === 'entrada')
            entradas += t.valor;
        else if (isSaida(t.tipo))
            saidas += t.valor;
    }
    return { entradas, saidas };
}
export function calcularGastoAvulsoMedioDiario(params) {
    const { transacoes, contas, recorrentes, dataFim, diasJanela } = params;
    const dataInicio = somarDias(dataFim, -diasJanela + 1);
    const contasCorrente = contasCorrenteAtivas(contas);
    const totalSaidasReais = transacoes
        .filter((t) => t.tipo === 'saida' &&
        contasCorrente.has(t.contaId) &&
        t.data >= dataInicio &&
        t.data <= dataFim)
        .reduce((acc, t) => acc + t.valor, 0);
    const mesesTocados = new Set();
    for (let data = dataInicio; data <= dataFim; data = somarDias(data, 1)) {
        mesesTocados.add(data.slice(0, 7));
    }
    let totalRecorrentesPagas = 0;
    for (const rec of recorrentes) {
        if (rec.cartaoId || rec.tipo !== 'saida' || !contasCorrente.has(rec.contaId))
            continue;
        for (const mesRef of mesesTocados) {
            if (!aplicavelNoMes(rec, mesRef))
                continue;
            if (statusNoMes(rec, mesRef) !== 'paga')
                continue;
            const dataOcorrencia = dataDaOcorrencia(rec, mesRef);
            if (!dataOcorrencia || dataOcorrencia < dataInicio || dataOcorrencia > dataFim)
                continue;
            totalRecorrentesPagas += rec.valorEsperado;
        }
    }
    return Math.round(Math.max(0, totalSaidasReais - totalRecorrentesPagas) / diasJanela);
}
//# sourceMappingURL=projecao.js.map