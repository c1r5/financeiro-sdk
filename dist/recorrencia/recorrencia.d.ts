import type { CategoriaTransacao, Transacao } from '../ledger/domain/transacao';
export interface Recorrente {
    id: string;
    nome: string;
    categoria: CategoriaTransacao;
    tipo: 'entrada' | 'saida';
    valorEsperado: number;
    diaVencimento: number;
    dataInicio: string;
    dataFim?: string;
    contaId: string;
    cartaoId?: string;
    ativa: boolean;
    statusPorMes: Record<string, 'prevista' | 'paga'>;
    pagamentosPorMes?: Record<string, string>;
    criadoEm: string;
}
export declare function criarRecorrente(entrada: {
    id: string;
    criadoEm: string;
    nome: string;
    categoria: CategoriaTransacao;
    tipo: 'entrada' | 'saida';
    valorEsperado: number;
    diaVencimento: number;
    dataInicio: string;
    dataFim?: string;
    contaId: string;
    cartaoId?: string;
}): Recorrente;
export declare function statusNoMes(recorrente: Recorrente, mesRef: string): 'prevista' | 'paga';
export declare function marcarComoPaga(recorrente: Recorrente, mesRef: string, transacaoId: string): Recorrente;
export declare function marcarComoPrevista(recorrente: Recorrente, mesRef: string): Recorrente;
/** `null` quando o mês não tem o dia (31 em fevereiro). */
export declare function dataDaOcorrencia(recorrente: Recorrente, mesRef: string): string | null;
export declare function aplicavelNoMes(recorrente: Recorrente, mesRef: string): boolean;
export declare function listarPendentesNoMes(recorrentes: Recorrente[], mesRef: string): Recorrente[];
export declare function desvincularPagamento(recorrentes: Recorrente[], transacaoId: string): Recorrente[];
/**
 * Mês já `paga` sem ponteiro ganha o id quando existe exatamente uma linha
 * compatível. Zero ou mais de um candidato deixa o mês sem ponteiro.
 */
export declare function vincularPagamentosUnicos(recorrentes: Recorrente[], transacoes: Transacao[]): Recorrente[];
