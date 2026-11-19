import { expect, test } from 'bun:test';
import { ErroDeDominio } from '../ledger/domain/erro';
import {
	calcularFaturaReferencia,
	calcularVencimento,
	criarCartao,
	criarValorBase,
	gerarFatura,
	registrarGasto,
	registrarGastoParcelado,
	registrarPagamento
} from './cartao';

test('a fatura fecha no dia, vence no mês certo e a parcela guarda o resíduo', () => {
	const criadoEm = '2026-03-01T12:00:00.000Z';
	const cartao = criarCartao({
		id: 'c1',
		criadoEm,
		nome: 'Nubank',
		limite: 500000,
		diaFechamento: 20,
		diaVencimento: 10,
		cor: '#3B82F6'
	});

	expect(calcularFaturaReferencia('2026-03-20', cartao)).toBe('2026-03');
	expect(calcularFaturaReferencia('2026-03-21', cartao)).toBe('2026-04');
	expect(calcularVencimento(cartao, '2026-03')).toBe('2026-04-10');
	expect(
		calcularVencimento(
			{ ...cartao, diaFechamento: 5, diaVencimento: 31 },
			'2026-02'
		)
	).toBe('2026-02-28');

	const base = criarValorBase({
		id: 'base',
		criadoEm,
		cartao,
		referencia: '2026-03',
		valor: 100000
	});
	const gasto = registrarGasto({
		id: 'gasto',
		criadoEm,
		cartao,
		data: '2026-03-05',
		descricao: 'Mercado',
		valor: 50000,
		categoria: 'mercado'
	});
	const pagamento = registrarPagamento({
		id: 'pgto',
		criadoEm,
		cartao,
		contaId: 'cc',
		data: '2026-04-10',
		valor: 20000,
		faturaReferencia: '2026-03'
	});
	expect(gasto.faturaReferencia).toBe('2026-03');
	expect(gasto.tipo).toBe('gasto-cartao');
	expect(pagamento.tipo).toBe('pagamento-fatura');
	expect(pagamento.categoria).toBe('cartao-credito');
	expect(pagamento.descricao).toBe('Pgto fatura Nubank - 2026-03');
	expect(pagamento.contaId).toBe('cc');

	const aberta = gerarFatura(cartao, [base, gasto, pagamento], '2026-03', '2026-03-19');
	expect(aberta.fechada).toBe(false);
	expect(aberta.totalGastos).toBe(150000);
	expect(aberta.totalPagamentos).toBe(20000);
	expect(aberta.saldo).toBe(130000);
	expect(aberta.valorPrevisto).toBe(100000);
	expect(aberta.vencimento).toBe('2026-04-10');

	const fechada = gerarFatura(cartao, [base, gasto, pagamento], '2026-03', '2026-03-20');
	expect(fechada.fechada).toBe(true);

	const parcelas = registrarGastoParcelado({
		grupoId: 'grupo',
		ids: ['p1', 'p2', 'p3'],
		criadoEm,
		cartao,
		data: '2026-03-05',
		descricao: 'Notebook',
		valorTotal: 100,
		totalParcelas: 3,
		categoria: 'lazer'
	});
	expect(parcelas.map((p) => p.valor)).toEqual([33, 33, 34]);
	expect(parcelas.map((p) => p.faturaReferencia)).toEqual(['2026-03', '2026-04', '2026-05']);
	expect(parcelas[2].parcela).toEqual({ atual: 3, total: 3 });
	expect(parcelas[0].grupoParcelamentoId).toBe('grupo');
	expect(parcelas.reduce((s, p) => s + p.valor, 0)).toBe(100);

	expect(() =>
		registrarGastoParcelado({
			grupoId: 'grupo',
			ids: ['p1'],
			criadoEm,
			cartao,
			data: '2026-03-05',
			descricao: 'Notebook',
			valorTotal: 100,
			totalParcelas: 3,
			categoria: 'lazer'
		})
	).toThrow(ErroDeDominio);
});
