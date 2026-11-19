import { expect, test } from 'bun:test';
import { ErroDeDominio } from '../ledger/domain/erro';
import { validarConfiguracao } from './configuracao';

test('a configuração exige percentuais que somam 100', () => {
	const valida = validarConfiguracao({
		moeda: 'BRL',
		divisao: { geral: 70, dividas: 20, reserva: 10 },
		margemSeguranca: 10000
	});
	expect(valida.margemSeguranca).toBe(10000);
	expect(valida.divisao.geral + valida.divisao.dividas + valida.divisao.reserva).toBe(100);

	expect(() =>
		validarConfiguracao({
			moeda: 'BRL',
			divisao: { geral: 70, dividas: 20, reserva: 20 },
			margemSeguranca: 10000
		})
	).toThrow(ErroDeDominio);
});
