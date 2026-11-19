import type { CategoriaTransacao } from '../ledger/domain/transacao';
export type Frequencia = 'pontual' | 'diario' | 'mensal';
export interface Previsao {
    id: string;
    nome: string;
    valor: number;
    tipo: 'entrada' | 'saida';
    frequencia: Frequencia;
    diasSemana?: number[];
    dataFim?: string;
    statusPorDia?: Record<string, 'paga'>;
    pagamentosPorDia?: Record<string, string>;
    valoresPorDia?: Record<string, number>;
    ocorrenciasExcluidas?: string[];
    data: string;
    categoria?: CategoriaTransacao;
}
export declare function rotuloDiasSemana(diasSemana: number[]): string;
export declare function valorNoDia(previsao: Previsao, data: string): number;
/** Ocorrência de calendário. Dia pago continua na série; dia excluído não. */
export declare function ocorreNoDia(previsao: Previsao, data: string): boolean;
/**
 * Entra no saldo projetado. Pontual vencida conta em `dataInicio`.
 * Diário já pago não entra de novo.
 */
export declare function contaNaProjecao(previsao: Previsao, data: string, dataInicio: string): boolean;
export declare function statusNoDia(previsao: Previsao, data: string, hoje: string): 'paga' | 'prevista' | 'atrasada' | null;
/** Diário fica de fora: não é um valor mensal único. */
export declare function aplicavelNoMes(previsao: Previsao, mesRef: string): boolean;
export declare function excluirOcorrencia(previsao: Previsao, data: string): Previsao;
export declare function definirValorDoDia(previsao: Previsao, data: string, valor: number): Previsao;
export declare function aplicarASerie(original: Previsao, editado: Previsao): Previsao;
export declare function marcarDiaPago(previsao: Previsao, data: string, transacaoId: string): Previsao;
export declare function reverterDia(previsao: Previsao, data: string): Previsao;
export declare function desvincularPagamento(previsoes: Previsao[], transacaoId: string): Previsao[];
