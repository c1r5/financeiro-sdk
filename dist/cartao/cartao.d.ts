import type { CategoriaTransacao, Transacao } from '../ledger/domain/transacao';
export declare const DESCRICAO_AJUSTE_FATURA_ATUAL = "Saldo inicial da fatura";
export declare const DESCRICAO_VALOR_BASE_FATURA = "Valor base da fatura";
export interface Cartao {
    id: string;
    nome: string;
    limite: number;
    diaFechamento: number;
    diaVencimento: number;
    cor: string;
    ativo: boolean;
    criadoEm: string;
}
export interface Fatura {
    cartaoId: string;
    referencia: string;
    gastos: Transacao[];
    pagamentos: Transacao[];
    totalGastos: number;
    totalPagamentos: number;
    saldo: number;
    fechada: boolean;
    vencimento: string;
    valorPrevisto?: number;
}
export interface ResumoCartao {
    cartao: Cartao;
    limiteUsado: number;
    limiteDisponivel: number;
    faturaAtual: Fatura;
    faturas: Fatura[];
}
export interface NovoCartao {
    id: string;
    criadoEm: string;
    nome: string;
    limite: number;
    diaFechamento: number;
    diaVencimento: number;
    cor: string;
}
export declare function criarCartao(entrada: NovoCartao): Cartao;
export declare function calcularFaturaReferencia(data: string, cartao: Cartao): string;
export declare function avancarReferencia(referencia: string, meses: number): string;
export declare function proximaReferencia(referencia: string): string;
export declare function referenciaAtual(cartao: Cartao, hoje: string): string;
export declare function listarReferencias(hoje: string): string[];
/**
 * Vencimento no mês da referência, ou no seguinte quando o dia de vencimento
 * não passa do fechamento. Dia maior que o mês cai no último dia desse mês.
 */
export declare function calcularVencimento(cartao: Cartao, referencia: string): string;
export declare function registrarGasto(entrada: {
    id: string;
    criadoEm: string;
    cartao: Cartao;
    data: string;
    descricao: string;
    valor: number;
    categoria: CategoriaTransacao;
}): Transacao;
export declare function registrarGastoParcelado(entrada: {
    grupoId: string;
    ids: string[];
    criadoEm: string;
    cartao: Cartao;
    data: string;
    descricao: string;
    valorTotal: number;
    totalParcelas: number;
    categoria: CategoriaTransacao;
}): Transacao[];
export declare function registrarParcelamentoEmAndamento(entrada: {
    grupoId: string;
    ids: string[];
    criadoEm: string;
    hoje: string;
    cartao: Cartao;
    descricao: string;
    valorParcela: number;
    categoria: CategoriaTransacao;
    parcelasRestantes: number;
    totalParcelas?: number;
    referenciaBase?: string;
}): Transacao[];
export declare function registrarPagamento(entrada: {
    id: string;
    criadoEm: string;
    cartao: Cartao;
    contaId: string;
    data: string;
    valor: number;
    faturaReferencia: string;
}): Transacao;
export declare function encontrarValorBase(cartaoId: string, transacoes: Transacao[], referencia: string): Transacao | undefined;
export declare function criarValorBase(entrada: {
    id: string;
    criadoEm: string;
    cartao: Cartao;
    referencia: string;
    valor: number;
}): Transacao;
export declare function encontrarAjusteFaturaAtual(cartao: Cartao, transacoes: Transacao[], hoje: string): Transacao | undefined;
export declare function criarAjusteFaturaAtual(entrada: {
    id: string;
    criadoEm: string;
    hoje: string;
    cartao: Cartao;
    valor: number;
}): Transacao;
/** No dia de fechamento a fatura já está fechada: `hoje >= data de fechamento`. */
export declare function gerarFatura(cartao: Cartao, transacoes: Transacao[], referencia: string, hoje: string): Fatura;
export declare function gerarResumo(cartao: Cartao, transacoes: Transacao[], hoje: string): ResumoCartao;
