import { type Cartao } from '../cartao/cartao';
import type { Conta } from '../ledger/domain/conta';
import type { Transacao } from '../ledger/domain/transacao';
import { type Previsao } from '../previsao/previsao';
import { type Recorrente } from '../recorrencia/recorrencia';
export declare const JANELA_GASTO_DIARIO_PADRAO = 60;
export declare const HORIZONTE_PROXIMA_ENTRADA_DIAS = 62;
export interface EventoProjecao {
    nome: string;
    valor: number;
    tipo: 'entrada' | 'saida';
    simulado?: boolean;
}
export interface DiaProjetado {
    data: string;
    saldoProjetado: number;
    eventos: EventoProjecao[];
}
export interface EventoProximaEntrada {
    data: string;
    nome: string;
    valor: number;
}
export interface DataDoAperto {
    data: string | null;
    diasConfortaveis: number | null;
    reducaoDiariaNecessaria: number;
}
export interface EventoFatura {
    data: string;
    nome: string;
    valor: number;
    cartaoId: string;
    faturaReferencia: string;
}
export declare function projetarSaldo(params: {
    saldoAtual: number;
    transacoes: Transacao[];
    contas: Conta[];
    dataInicio: string;
    horizonteDias: number;
    recorrentes?: Recorrente[];
    cartoes?: Cartao[];
    previsoes?: Previsao[];
    diasRetroativos?: number;
}): DiaProjetado[];
export declare function calcularEventosFatura(params: {
    cartoes: Cartao[];
    transacoes: Transacao[];
    hoje: string;
    dataFimStr?: string;
}): EventoFatura[];
export declare function calcularGastoDiarioDisponivel(dias: DiaProjetado[], margemSeguranca?: number): number[];
export declare function limiteDiarioSustentavel(dias: DiaProjetado[], indiceProximaEntrada: number, margemSeguranca: number): number;
export declare function calcularDataDoAperto(params: {
    dias: DiaProjetado[];
    indiceProximaEntrada: number;
    ritmoAtual: number;
    limiteDiario: number;
    margemSeguranca: number;
}): DataDoAperto;
export declare function aplicarGastoHipotetico(dias: DiaProjetado[], valor: number, indiceInicio?: number): DiaProjetado[];
export declare function resumirFluxo(dias: DiaProjetado[]): {
    entradas: number;
    saidas: number;
};
export declare function limiteGastoDiario(entradas: number, saidas: number, diasNoMes: number): number;
export declare function proximaEntradaRelevante(dias: DiaProjetado[]): EventoProximaEntrada | null;
export declare function saldoDisponivelAteData(dias: DiaProjetado[], data: string): number;
export declare function fluxoRealNoDia(params: {
    transacoes: Transacao[];
    contas: Conta[];
    data: string;
}): {
    entradas: number;
    saidas: number;
};
export declare function calcularGastoAvulsoMedioDiario(params: {
    transacoes: Transacao[];
    contas: Conta[];
    recorrentes: Recorrente[];
    dataFim: string;
    diasJanela: number;
}): number;
