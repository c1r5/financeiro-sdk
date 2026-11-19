import type { Cartao } from '../cartao/cartao';
import type { DivisaoRenda } from '../configuracao/configuracao';
import type { Conta } from '../ledger/domain/conta';
import type { SaldoConta } from '../ledger/domain/saldos';
import type { Transacao } from '../ledger/domain/transacao';
import { type Previsao } from '../previsao/previsao';
import { type Recorrente } from '../recorrencia/recorrencia';
export type OrigemUsoDivida = 'Previsão' | 'Recorrente' | 'Transação' | 'Fatura';
export type RefLinhaDivida = {
    tipo: 'recorrente';
    recorrente: Recorrente;
    mesRef: string;
    transacaoPagamentoId?: string;
} | {
    tipo: 'simulacao';
    item: Previsao;
    dataOcorrencia: string;
} | {
    tipo: 'fatura';
    cartaoId: string;
    faturaReferencia: string;
    valor: number;
    vencimento: string;
};
export interface LinhaDivida {
    id: string;
    descricao: string;
    valor: number;
    data: string;
    origem: OrigemUsoDivida;
    acionavel: boolean;
    ref: RefLinhaDivida | null;
}
export interface HorizonteCustoDividas {
    meses: number;
    custoDividas: number;
    baldeAcumulado: number;
    excedente: number;
}
export interface UsoDividas {
    aPagar: LinhaDivida[];
    pagas: LinhaDivida[];
    totalAPagar: number;
    totalPagas: number;
}
export interface ResultadoDivisao {
    totalEntradas: number;
    geral: number;
    dividas: number;
    reserva: number;
}
export declare function calcularDivisao(params: {
    recorrentes: Recorrente[];
    previsoes: Previsao[];
    mes: number;
    ano: number;
    divisao: DivisaoRenda;
}): ResultadoDivisao;
export declare function calcularUsoDividas(params: {
    recorrentes: Recorrente[];
    transacoes: Transacao[];
    previsoes: Previsao[];
    cartoes: Cartao[];
    mes: number;
    ano: number;
    hoje: string;
}): UsoDividas;
export declare function projetarCustoDividas(params: {
    recorrentes: Recorrente[];
    previsoes: Previsao[];
    divisao: DivisaoRenda;
    mes: number;
    ano: number;
    horizontes?: number[];
}): HorizonteCustoDividas[];
export declare function calcularReservaAcumulada(contas: Conta[], saldos: SaldoConta[]): number;
export declare function calcularEntradasProjetadas(transacoes: Transacao[], mes: number, ano: number): number;
