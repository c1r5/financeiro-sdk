import type { Conta } from './conta';
import type { Transacao } from './transacao';
/**
 * Efeito da linha no saldo disponível. Poupança fica de fora. Transferência
 * só altera esse saldo quando cruza corrente e poupança. `gasto-cartao` não
 * altera saldo bancário.
 */
export declare function deltaSaldoDisponivel(t: Transacao, idsCorrente: Set<string>): number;
/**
 * Saldo disponível (contas corrente) logo após cada lançamento, na ordem
 * recebida. Inclui linha futura: quem chama decide o recorte.
 */
export declare function calcularSaldoDisponivelAposCada(contas: Conta[], transacoesAsc: Transacao[]): Map<string, number>;
