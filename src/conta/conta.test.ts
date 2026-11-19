import { expect, test } from 'bun:test';
import type { Conta } from '../ledger/domain/conta';
import { abrirConta, poupancaDoProposito, poupancasVinculadas } from './conta';

test('a abertura grava saldo zero e o lançamento correspondente', () => {
	const corrente: Conta = {
		id: 'cc',
		tipo: 'corrente',
		nome: 'Nubank',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		criadoEm: '2026-01-01T00:00:00.000Z'
	};
	const reserva: Conta = {
		id: 'pp',
		tipo: 'poupanca',
		nome: 'Reserva',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		contaVinculadaId: 'cc',
		categoria: 'reserva',
		criadoEm: '2026-01-01T00:00:00.000Z'
	};
	const inativa: Conta = { ...reserva, id: 'off', ativa: false, categoria: 'objetivo' };
	expect(poupancasVinculadas([corrente, reserva, inativa], 'cc').map((c) => c.id)).toEqual(['pp']);
	expect(poupancaDoProposito([corrente, reserva], 'cc', 'reserva')?.id).toBe('pp');
	expect(poupancaDoProposito([corrente, reserva], 'cc', 'objetivo')).toBeUndefined();

	const semOrigem = abrirConta({
		id: 'nova',
		lancamentoId: 'lanc',
		criadoEm: '2026-11-19T12:00:00.000Z',
		hoje: '2026-11-19',
		tipo: 'corrente',
		nome: 'Itaú',
		descricao: '',
		saldoInicial: 5000
	});
	expect(semOrigem.conta.saldoInicial).toBe(0);
	expect(semOrigem.lancamento).toMatchObject({
		id: 'lanc',
		tipo: 'entrada',
		valor: 5000,
		data: '2026-11-19',
		contaId: 'nova',
		categoria: 'outros'
	});

	const vinculada = abrirConta({
		id: 'p2',
		lancamentoId: 'dep',
		criadoEm: '2026-11-19T12:00:00.000Z',
		hoje: '2026-11-19',
		tipo: 'poupanca',
		nome: 'Viagem',
		descricao: '',
		saldoInicial: 2000,
		contaVinculadaId: 'cc',
		categoria: 'objetivo'
	});
	expect(vinculada.lancamento).toMatchObject({
		tipo: 'transferencia',
		valor: 2000,
		contaId: 'cc',
		contaDestinoId: 'p2',
		categoria: 'investimento'
	});

	const zerada = abrirConta({
		id: 'z',
		criadoEm: '2026-11-19T12:00:00.000Z',
		hoje: '2026-11-19',
		tipo: 'corrente',
		nome: 'Vazia',
		descricao: '',
		saldoInicial: 0
	});
	expect(zerada.lancamento).toBeUndefined();
});
