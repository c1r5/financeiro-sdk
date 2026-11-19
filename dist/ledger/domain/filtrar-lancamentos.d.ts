import type { TipoTransacao, Transacao } from './transacao';
export declare function filtrarPorMes(transacoes: Transacao[], mes: number, ano: number): Transacao[];
export declare function filtrarPorTipo(transacoes: Transacao[], tipo: TipoTransacao): Transacao[];
export declare function buscar(transacoes: Transacao[], busca: string): Transacao[];
