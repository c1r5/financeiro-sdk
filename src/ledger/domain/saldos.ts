import type { Conta } from './conta';

export interface SaldoConta {
	conta: Conta;
	saldo: number;
}

export interface Saldos {
	contas: SaldoConta[];
	totalCorrente: number;
	totalPoupanca: number;
	total: number;
}
