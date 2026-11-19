import { expect, test } from 'bun:test';
import { registrarLinha } from '../ledger/domain/registrar-linha';
import {
	aplicavelNoMes,
	criarRecorrente,
	dataDaOcorrencia,
	desvincularPagamento,
	listarPendentesNoMes,
	marcarComoPaga,
	statusNoMes,
	vincularPagamentosUnicos
} from './recorrencia';

test('a recorrente vale só no intervalo e o pagamento único vira ponteiro', () => {
	const aluguel = criarRecorrente({
		id: 'aluguel',
		criadoEm: '2026-03-22T12:00:00.000Z',
		nome: 'Aluguel',
		categoria: 'moradia',
		tipo: 'saida',
		valorEsperado: -150000,
		diaVencimento: 15,
		dataInicio: '2026-03-22',
		dataFim: '2026-05-10',
		contaId: 'cc'
	});
	expect(aluguel.valorEsperado).toBe(150000);
	expect(aluguel.criadoEm).toBe('2026-03-22T12:00:00.000Z');
	expect(dataDaOcorrencia({ ...aluguel, diaVencimento: 31 }, '2026-02')).toBeNull();
	expect(aplicavelNoMes(aluguel, '2026-03')).toBe(false);
	expect(aplicavelNoMes(aluguel, '2026-04')).toBe(true);
	expect(dataDaOcorrencia(aluguel, '2026-04')).toBe('2026-04-15');
	expect(aplicavelNoMes(aluguel, '2026-05')).toBe(false);

	const paga = marcarComoPaga(aluguel, '2026-04', 'txn-1');
	expect(statusNoMes(paga, '2026-04')).toBe('paga');
	expect(paga.pagamentosPorMes?.['2026-04']).toBe('txn-1');
	expect(listarPendentesNoMes([paga, { ...aluguel, id: 'off', ativa: false }], '2026-04')).toEqual(
		[]
	);

	const revertida = desvincularPagamento([paga], 'txn-1')[0];
	expect(statusNoMes(revertida, '2026-04')).toBe('prevista');
	expect(revertida.pagamentosPorMes?.['2026-04']).toBeUndefined();
	expect(listarPendentesNoMes([revertida], '2026-04').map((r) => r.id)).toEqual(['aluguel']);

	const semPonteiro = {
		...aluguel,
		statusPorMes: { '2026-04': 'paga' as const },
		pagamentosPorMes: {}
	};
	const linha = registrarLinha({
		id: 'txn-unica',
		criadoEm: aluguel.criadoEm,
		data: '2026-04-15',
		descricao: 'Aluguel',
		tipo: 'saida',
		valor: 150000,
		categoria: 'moradia',
		contaId: 'cc'
	});
	const duplicada = { ...linha, id: 'txn-outra' };
	expect(vincularPagamentosUnicos([semPonteiro], [linha, duplicada])[0].pagamentosPorMes).toEqual(
		{}
	);
	expect(vincularPagamentosUnicos([semPonteiro], [linha])[0].pagamentosPorMes?.['2026-04']).toBe(
		'txn-unica'
	);
});
