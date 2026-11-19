import type { Conta } from './conta';
import type { Saldos } from './saldos';
import type { Transacao } from './transacao';
/**
 * Saldo de cada conta ativa. Linha com data posterior a `hoje` permanece no
 * razão e não entra neste saldo. `gasto-cartao` não posta em conta bancária.
 */
export declare function calcularSaldos(contas: Conta[], transacoes: Transacao[], hoje: string): Saldos;
