export type TipoConta = 'corrente' | 'poupanca';

export type CategoriaConta = 'reserva' | 'objetivo';

/**
 * Conta referida por um lançamento. Não guarda saldo corrente.
 * `saldoInicial` é a abertura, somada antes das linhas.
 */
export interface Conta {
	id: string;
	tipo: TipoConta;
	nome: string;
	descricao: string;
	saldoInicial: number;
	ativa: boolean;
	contaVinculadaId?: string;
	categoria?: CategoriaConta;
	criadoEm: string;
}
