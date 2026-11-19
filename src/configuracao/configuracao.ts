import { ErroDeDominio } from '../ledger/domain/erro';

export interface DivisaoRenda {
	geral: number;
	dividas: number;
	reserva: number;
}

export interface Configuracao {
	moeda: string;
	divisao: DivisaoRenda;
	margemSeguranca: number;
}

export function validarConfiguracao(configuracao: Configuracao): Configuracao {
	const { geral, dividas, reserva } = configuracao.divisao;
	if (geral + dividas + reserva !== 100) {
		throw new ErroDeDominio('divisao_invalida');
	}
	return configuracao;
}
