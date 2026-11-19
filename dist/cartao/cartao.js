import { avancarMes, dataUtc, diasNoMes, partes } from '../calendario';
import { Dinheiro } from '../ledger/domain/dinheiro';
import { ErroDeDominio } from '../ledger/domain/erro';
import { registrarLinha } from '../ledger/domain/registrar-linha';
export const DESCRICAO_AJUSTE_FATURA_ATUAL = 'Saldo inicial da fatura';
export const DESCRICAO_VALOR_BASE_FATURA = 'Valor base da fatura';
export function criarCartao(entrada) {
    return {
        id: entrada.id,
        nome: entrada.nome,
        limite: Dinheiro.from(entrada.limite).value,
        diaFechamento: entrada.diaFechamento,
        diaVencimento: entrada.diaVencimento,
        cor: entrada.cor,
        ativo: true,
        criadoEm: entrada.criadoEm
    };
}
export function calcularFaturaReferencia(data, cartao) {
    const { ano, mes, dia } = partes(data);
    const referencia = `${ano}-${String(mes).padStart(2, '0')}`;
    if (dia > cartao.diaFechamento)
        return avancarMes(referencia, 1);
    return referencia;
}
export function avancarReferencia(referencia, meses) {
    return avancarMes(referencia, meses);
}
export function proximaReferencia(referencia) {
    return avancarMes(referencia, 1);
}
export function referenciaAtual(cartao, hoje) {
    return calcularFaturaReferencia(hoje, cartao);
}
export function listarReferencias(hoje) {
    const mesAtual = hoje.slice(0, 7);
    const refs = [];
    for (let i = -6; i <= 2; i++)
        refs.push(avancarMes(mesAtual, i));
    return refs;
}
/**
 * Vencimento no mês da referência, ou no seguinte quando o dia de vencimento
 * não passa do fechamento. Dia maior que o mês cai no último dia desse mês.
 */
export function calcularVencimento(cartao, referencia) {
    let alvo = referencia;
    if (cartao.diaVencimento <= cartao.diaFechamento)
        alvo = avancarMes(referencia, 1);
    const [ano, mes] = alvo.split('-').map(Number);
    const dia = Math.min(cartao.diaVencimento, diasNoMes(ano, mes));
    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
export function registrarGasto(entrada) {
    return registrarLinha({
        id: entrada.id,
        criadoEm: entrada.criadoEm,
        data: entrada.data,
        descricao: entrada.descricao,
        tipo: 'gasto-cartao',
        valor: entrada.valor,
        categoria: entrada.categoria,
        contaId: entrada.cartao.id,
        cartaoId: entrada.cartao.id,
        faturaReferencia: calcularFaturaReferencia(entrada.data, entrada.cartao)
    });
}
export function registrarGastoParcelado(entrada) {
    if (entrada.ids.length !== entrada.totalParcelas) {
        throw new ErroDeDominio('parcelas_sem_id');
    }
    const total = entrada.totalParcelas;
    const valorTotal = Dinheiro.from(entrada.valorTotal).value;
    const valorParcela = Math.floor(valorTotal / total);
    const primeira = calcularFaturaReferencia(entrada.data, entrada.cartao);
    let restante = valorTotal;
    return entrada.ids.map((id, indice) => {
        const ultima = indice === total - 1;
        const valor = ultima ? restante : valorParcela;
        restante -= valor;
        const linha = registrarLinha({
            id,
            criadoEm: entrada.criadoEm,
            data: entrada.data,
            descricao: entrada.descricao,
            tipo: 'gasto-cartao',
            valor,
            categoria: entrada.categoria,
            contaId: entrada.cartao.id,
            cartaoId: entrada.cartao.id,
            faturaReferencia: avancarReferencia(primeira, indice)
        });
        linha.parcela = { atual: indice + 1, total };
        linha.grupoParcelamentoId = entrada.grupoId;
        return linha;
    });
}
export function registrarParcelamentoEmAndamento(entrada) {
    if (entrada.ids.length !== entrada.parcelasRestantes) {
        throw new ErroDeDominio('parcelas_sem_id');
    }
    const totalParcelas = entrada.totalParcelas ?? entrada.parcelasRestantes;
    const parcelaInicial = totalParcelas - entrada.parcelasRestantes + 1;
    const referenciaBase = entrada.referenciaBase ?? referenciaAtual(entrada.cartao, entrada.hoje);
    return entrada.ids.map((id, indice) => {
        const linha = registrarLinha({
            id,
            criadoEm: entrada.criadoEm,
            data: entrada.hoje,
            descricao: entrada.descricao,
            tipo: 'gasto-cartao',
            valor: entrada.valorParcela,
            categoria: entrada.categoria,
            contaId: entrada.cartao.id,
            cartaoId: entrada.cartao.id,
            faturaReferencia: avancarReferencia(referenciaBase, indice + 1)
        });
        linha.parcela = { atual: parcelaInicial + indice, total: totalParcelas };
        linha.grupoParcelamentoId = entrada.grupoId;
        return linha;
    });
}
export function registrarPagamento(entrada) {
    return registrarLinha({
        id: entrada.id,
        criadoEm: entrada.criadoEm,
        data: entrada.data,
        descricao: `Pgto fatura ${entrada.cartao.nome} - ${entrada.faturaReferencia}`,
        tipo: 'pagamento-fatura',
        valor: entrada.valor,
        categoria: 'cartao-credito',
        contaId: entrada.contaId,
        cartaoId: entrada.cartao.id,
        faturaReferencia: entrada.faturaReferencia
    });
}
export function encontrarValorBase(cartaoId, transacoes, referencia) {
    return transacoes.find((t) => t.cartaoId === cartaoId &&
        t.faturaReferencia === referencia &&
        t.descricao === DESCRICAO_VALOR_BASE_FATURA &&
        (t.tipo === 'gasto-cartao' || t.tipo === 'pagamento-fatura'));
}
export function criarValorBase(entrada) {
    return registrarLinha({
        id: entrada.id,
        criadoEm: entrada.criadoEm,
        data: `${entrada.referencia}-01`,
        descricao: DESCRICAO_VALOR_BASE_FATURA,
        tipo: 'gasto-cartao',
        valor: entrada.valor,
        categoria: 'cartao-credito',
        contaId: entrada.cartao.id,
        cartaoId: entrada.cartao.id,
        faturaReferencia: entrada.referencia
    });
}
export function encontrarAjusteFaturaAtual(cartao, transacoes, hoje) {
    const referencia = referenciaAtual(cartao, hoje);
    return transacoes.find((t) => t.cartaoId === cartao.id &&
        t.faturaReferencia === referencia &&
        t.tipo === 'gasto-cartao' &&
        t.descricao === DESCRICAO_AJUSTE_FATURA_ATUAL);
}
export function criarAjusteFaturaAtual(entrada) {
    return registrarLinha({
        id: entrada.id,
        criadoEm: entrada.criadoEm,
        data: entrada.hoje,
        descricao: DESCRICAO_AJUSTE_FATURA_ATUAL,
        tipo: 'gasto-cartao',
        valor: entrada.valor,
        categoria: 'cartao-credito',
        contaId: entrada.cartao.id,
        cartaoId: entrada.cartao.id,
        faturaReferencia: referenciaAtual(entrada.cartao, entrada.hoje)
    });
}
/** No dia de fechamento a fatura já está fechada: `hoje >= data de fechamento`. */
export function gerarFatura(cartao, transacoes, referencia, hoje) {
    const gastos = transacoes.filter((t) => t.cartaoId === cartao.id && t.faturaReferencia === referencia && t.tipo === 'gasto-cartao');
    const pagamentos = transacoes.filter((t) => t.cartaoId === cartao.id &&
        t.faturaReferencia === referencia &&
        t.tipo === 'pagamento-fatura');
    const totalGastos = gastos.reduce((acc, t) => acc + t.valor, 0);
    const totalPagamentos = pagamentos.reduce((acc, t) => acc + t.valor, 0);
    const [refAno, refMes] = referencia.split('-').map(Number);
    const dataFechamento = dataUtc(refAno, refMes, cartao.diaFechamento);
    const base = encontrarValorBase(cartao.id, transacoes, referencia);
    const valorPrevisto = base
        ? base.tipo === 'pagamento-fatura'
            ? -base.valor
            : base.valor
        : undefined;
    return {
        cartaoId: cartao.id,
        referencia,
        gastos,
        pagamentos,
        totalGastos,
        totalPagamentos,
        saldo: totalGastos - totalPagamentos,
        fechada: hoje >= dataFechamento,
        vencimento: calcularVencimento(cartao, referencia),
        valorPrevisto
    };
}
export function gerarResumo(cartao, transacoes, hoje) {
    const doCartao = transacoes.filter((t) => t.cartaoId === cartao.id);
    const refAtual = referenciaAtual(cartao, hoje);
    const referencias = [
        ...new Set(doCartao.map((t) => t.faturaReferencia).filter((ref) => Boolean(ref)))
    ];
    if (!referencias.includes(refAtual))
        referencias.push(refAtual);
    referencias.sort();
    const faturas = referencias.map((ref) => gerarFatura(cartao, transacoes, ref, hoje));
    const faturaAtual = faturas.find((f) => f.referencia === refAtual) ?? gerarFatura(cartao, transacoes, refAtual, hoje);
    const limiteUsado = Math.max(0, faturas.reduce((acc, f) => acc + f.saldo, 0));
    return {
        cartao,
        limiteUsado,
        limiteDisponivel: cartao.limite - limiteUsado,
        faturaAtual,
        faturas
    };
}
//# sourceMappingURL=cartao.js.map