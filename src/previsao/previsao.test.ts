import { expect, test } from 'bun:test';
import { diaDaSemana } from '../calendario';
import {
	aplicavelNoMes,
	aplicarASerie,
	contaNaProjecao,
	definirValorDoDia,
	desvincularPagamento,
	excluirOcorrencia,
	marcarDiaPago,
	ocorreNoDia,
	reverterDia,
	rotuloDiasSemana,
	statusNoDia,
	valorNoDia,
	type Previsao
} from './previsao';

test('a previsão ocorre na frequência e o dia pago não volta para o saldo', () => {
	expect(rotuloDiasSemana([0, 1, 2, 3, 4, 5, 6])).toBe('Semanal');
	expect(rotuloDiasSemana([1, 2, 3, 4, 5])).toBe('Dias Úteis');
	expect(rotuloDiasSemana([1, 3])).toBe('Diário');

	const pontual: Previsao = {
		id: 'p',
		nome: 'Conserto',
		valor: 8000,
		tipo: 'saida',
		frequencia: 'pontual',
		data: '2026-03-01',
		categoria: 'outros'
	};
	expect(ocorreNoDia(pontual, '2026-03-01')).toBe(true);
	expect(ocorreNoDia(pontual, '2026-03-02')).toBe(false);
	expect(contaNaProjecao(pontual, '2026-03-04', '2026-03-04')).toBe(true);
	expect(contaNaProjecao(pontual, '2026-03-01', '2026-03-04')).toBe(false);
	expect(statusNoDia(pontual, '2026-03-01', '2026-03-04')).toBe('atrasada');

	const mensal: Previsao = {
		id: 'm',
		nome: 'Curso',
		valor: 20000,
		tipo: 'saida',
		frequencia: 'mensal',
		data: '2026-01-31',
		dataFim: '2026-04-10',
		categoria: 'educacao'
	};
	expect(ocorreNoDia(mensal, '2026-02-28')).toBe(false);
	expect(aplicavelNoMes(mensal, '2026-02')).toBe(false);
	expect(ocorreNoDia(mensal, '2026-03-31')).toBe(true);
	expect(aplicavelNoMes(mensal, '2026-03')).toBe(true);
	const semMarco = excluirOcorrencia(mensal, '2026-03-31');
	expect(ocorreNoDia(semMarco, '2026-03-31')).toBe(false);
	expect(aplicavelNoMes(semMarco, '2026-03')).toBe(false);
	expect(ocorreNoDia(mensal, '2026-05-31')).toBe(false);

	const terca = '2026-03-03';
	expect(diaDaSemana(terca)).toBe(2);
	const almoco: Previsao = {
		id: 'd',
		nome: 'Almoço',
		valor: 3500,
		tipo: 'saida',
		frequencia: 'diario',
		diasSemana: [2],
		data: '2026-03-01',
		categoria: 'alimentacao'
	};
	expect(aplicavelNoMes(almoco, '2026-03')).toBe(false);
	expect(ocorreNoDia(almoco, terca)).toBe(true);
	expect(ocorreNoDia(almoco, '2026-03-04')).toBe(false);
	const editado = definirValorDoDia(almoco, terca, 2500);
	expect(valorNoDia(editado, terca)).toBe(2500);
	expect(valorNoDia(editado, '2026-03-10')).toBe(3500);
	const pago = marcarDiaPago(editado, terca, 'txn-almoco');
	expect(statusNoDia(pago, terca, '2026-03-03')).toBe('paga');
	expect(contaNaProjecao(pago, terca, '2026-03-01')).toBe(false);
	expect(ocorreNoDia(pago, terca)).toBe(true);
	const revertido = reverterDia(pago, terca);
	expect(revertido.valoresPorDia?.[terca]).toBe(2500);
	expect(statusNoDia(revertido, terca, '2026-03-03')).toBe('prevista');
	expect(desvincularPagamento([pago], 'txn-almoco')[0].statusPorDia?.[terca]).toBeUndefined();

	const serie = aplicarASerie(editado, { ...editado, valor: 4000, nome: 'Almoço novo' });
	expect(serie.valor).toBe(4000);
	expect(serie.valoresPorDia).toBeUndefined();
	expect(serie.id).toBe('d');
});
