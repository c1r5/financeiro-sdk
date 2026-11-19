import { expect, test } from 'bun:test';
import { consultarSaldos } from './application/consultar-saldos.ts';
import { listarTransacoes } from './application/listar-transacoes.ts';
import { registrarTransacao } from './application/registrar-transacao.ts';
import { removerTransacao } from './application/remover-transacao.ts';
import type { Conta } from './domain/conta.ts';
import type { Transacao } from './domain/transacao.ts';
import type { GeradorDeId } from './ports/gerador-de-id.ts';
import type { Relogio } from './ports/relogio.ts';
import type { RepositorioDoLivro } from './ports/repositorio-do-livro.ts';

class LivroEmMemoria implements RepositorioDoLivro {
	private contas: Conta[] = [];
	private transacoes: Transacao[] = [];

	async listarContas(): Promise<Conta[]> {
		return [...this.contas];
	}

	async gravarConta(conta: Conta): Promise<void> {
		this.contas.push(conta);
	}

	async listarTransacoes(): Promise<Transacao[]> {
		return [...this.transacoes];
	}

	async incluirTransacao(transacao: Transacao): Promise<void> {
		this.transacoes.push(transacao);
	}

	async removerTransacao(id: string): Promise<void> {
		this.transacoes = this.transacoes.filter((t) => t.id !== id);
	}
}

test('o razão registra, lista, calcula saldo e remove', async () => {
	const livro = new LivroEmMemoria();
	let instante = 0;
	const relogio: Relogio = {
		hoje: () => '2026-11-18',
		agora: () => {
			instante += 1;
			return `2026-11-18T12:00:0${instante}.000Z`;
		}
	};
	let sequencia = 0;
	const ids: GeradorDeId = {
		novoId: () => {
			sequencia += 1;
			return `id-${sequencia}`;
		}
	};
	const corrente: Conta = {
		id: 'cc',
		tipo: 'corrente',
		nome: 'Nubank',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		criadoEm: '2026-01-01T00:00:00.000Z'
	};
	const poupanca: Conta = {
		id: 'pp',
		tipo: 'poupanca',
		nome: 'Reserva',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		criadoEm: '2026-01-01T00:00:00.000Z'
	};
	await livro.gravarConta(corrente);
	await livro.gravarConta(poupanca);

	const salario = await registrarTransacao(livro, relogio, ids, {
		data: '2026-11-01',
		descricao: 'Salário',
		tipo: 'entrada',
		valor: -10000,
		categoria: 'salario',
		contaId: 'cc'
	});
	await registrarTransacao(livro, relogio, ids, {
		data: '2026-12-01',
		descricao: 'Aluguel futuro',
		tipo: 'saida',
		valor: 500,
		categoria: 'moradia',
		contaId: 'cc'
	});
	await registrarTransacao(livro, relogio, ids, {
		data: '2026-11-02',
		descricao: 'Mercado no cartão',
		tipo: 'gasto-cartao',
		valor: 2000,
		categoria: 'mercado',
		contaId: 'card',
		cartaoId: 'card',
		faturaReferencia: '2026-12'
	});
	await registrarTransacao(livro, relogio, ids, {
		data: '2026-11-18',
		descricao: 'Aporte',
		tipo: 'entrada',
		valor: 3000,
		categoria: 'poupanca',
		contaId: 'pp'
	});

	expect(salario.valor).toBe(10000);
	expect(salario.id).toBe('id-1');

	const todas = await listarTransacoes(livro);
	expect(todas.map((t) => t.descricao)).toEqual([
		'Salário',
		'Mercado no cartão',
		'Aporte',
		'Aluguel futuro'
	]);

	const deNovembro = await listarTransacoes(livro, { mes: 11, ano: 2026 });
	expect(deNovembro.map((t) => t.descricao)).toEqual(['Salário', 'Mercado no cartão', 'Aporte']);

	const entradas = await listarTransacoes(livro, { tipo: 'entrada' });
	expect(entradas.map((t) => t.descricao)).toEqual(['Salário', 'Aporte']);

	const busca = await listarTransacoes(livro, { texto: 'salá' });
	expect(busca.map((t) => t.id)).toEqual([salario.id]);

	const saldos = await consultarSaldos(livro, relogio);
	expect(saldos.totalCorrente).toBe(10000);
	expect(saldos.totalPoupanca).toBe(3000);
	expect(saldos.total).toBe(13000);

	await removerTransacao(livro, salario.id);
	const depois = await consultarSaldos(livro, relogio);
	expect(depois.totalCorrente).toBe(0);
	expect(depois.totalPoupanca).toBe(3000);
	expect((await listarTransacoes(livro)).some((t) => t.id === salario.id)).toBe(false);
});
