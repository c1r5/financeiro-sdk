import { expect, test } from 'bun:test';
import { criarCartao, registrarGasto } from '../cartao/cartao';
import type { Conta } from '../ledger/domain/conta';
import { registrarLinha } from '../ledger/domain/registrar-linha';
import type { SaldoConta } from '../ledger/domain/saldos';
import type { Previsao } from '../previsao/previsao';
import { criarRecorrente, marcarComoPaga } from '../recorrencia/recorrencia';
import {
	calcularDivisao,
	calcularEntradasProjetadas,
	calcularReservaAcumulada,
	calcularUsoDividas,
	projetarCustoDividas
} from './divisao';

test('a divisão guarda o resíduo em geral e a dívida usa o valor pago', () => {
	const criadoEm = '2026-03-01T12:00:00.000Z';
	const divisao = { geral: 70, dividas: 20, reserva: 10 };
	const salario = criarRecorrente({
		id: 'salario',
		criadoEm,
		nome: 'Salário',
		categoria: 'salario',
		tipo: 'entrada',
		valorEsperado: 10001,
		diaVencimento: 5,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const diario: Previsao = {
		id: 'diario',
		nome: 'Extra diário',
		valor: 99999,
		tipo: 'entrada',
		frequencia: 'diario',
		diasSemana: [1, 2, 3, 4, 5],
		data: '2026-03-01'
	};
	expect(
		calcularDivisao({
			recorrentes: [salario],
			previsoes: [diario],
			mes: 3,
			ano: 2026,
			divisao
		})
	).toEqual({ totalEntradas: 10001, geral: 7001, dividas: 2000, reserva: 1000 });

	const nubank = criarCartao({
		id: 'nubank',
		criadoEm,
		nome: 'Nubank',
		limite: 500000,
		diaFechamento: 10,
		diaVencimento: 20,
		cor: '#3B82F6'
	});
	const anuidadeCartao = criarCartao({
		id: 'anuidade-cartao',
		criadoEm,
		nome: 'Anuidade',
		limite: 100000,
		diaFechamento: 10,
		diaVencimento: 20,
		cor: '#111111'
	});
	const fatura = registrarGasto({
		id: 'fatura',
		criadoEm,
		cartao: nubank,
		data: '2026-03-05',
		descricao: 'Compra',
		valor: 5000,
		categoria: 'lazer'
	});
	const gastoAnuidade = registrarGasto({
		id: 'gasto-anuidade',
		criadoEm,
		cartao: anuidadeCartao,
		data: '2026-03-05',
		descricao: 'Anuidade',
		valor: 2000,
		categoria: 'divida'
	});
	const emprestimo = criarRecorrente({
		id: 'emprestimo',
		criadoEm,
		nome: 'Empréstimo',
		categoria: 'divida',
		tipo: 'saida',
		valorEsperado: 4000,
		diaVencimento: 2,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const mercado = criarRecorrente({
		id: 'mercado',
		criadoEm,
		nome: 'Mercado',
		categoria: 'alimentacao',
		tipo: 'saida',
		valorEsperado: 9000,
		diaVencimento: 2,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const pagamento = registrarLinha({
		id: 'pagamento',
		criadoEm,
		data: '2026-03-08',
		descricao: 'Consignado',
		tipo: 'saida',
		valor: 1500,
		categoria: 'divida',
		contaId: 'cc'
	});
	const consignado = marcarComoPaga(
		criarRecorrente({
			id: 'consignado',
			criadoEm,
			nome: 'Consignado',
			categoria: 'divida',
			tipo: 'saida',
			valorEsperado: 9999,
			diaVencimento: 8,
			dataInicio: '2026-01-01',
			contaId: 'cc'
		}),
		'2026-03',
		'pagamento'
	);
	const anuidade = marcarComoPaga(
		criarRecorrente({
			id: 'anuidade',
			criadoEm,
			nome: 'Anuidade',
			categoria: 'divida',
			tipo: 'saida',
			valorEsperado: 2000,
			diaVencimento: 5,
			dataInicio: '2026-01-01',
			contaId: 'cc',
			cartaoId: 'anuidade-cartao'
		}),
		'2026-03',
		'gasto-anuidade'
	);
	const multa = registrarLinha({
		id: 'multa',
		criadoEm,
		data: '2026-03-04',
		descricao: 'Multa',
		tipo: 'saida',
		valor: 800,
		categoria: 'impostos',
		contaId: 'cc'
	});
	const iptu: Previsao = {
		id: 'iptu',
		nome: 'IPTU',
		valor: 3000,
		tipo: 'saida',
		frequencia: 'pontual',
		data: '2026-03-10',
		categoria: 'impostos'
	};
	const almocoDivida: Previsao = {
		id: 'almoco',
		nome: 'Almoço',
		valor: 99999,
		tipo: 'saida',
		frequencia: 'diario',
		diasSemana: [1],
		data: '2026-03-01',
		categoria: 'divida'
	};

	const uso = calcularUsoDividas({
		recorrentes: [emprestimo, mercado, consignado, anuidade],
		transacoes: [fatura, gastoAnuidade, pagamento, multa],
		previsoes: [iptu, almocoDivida],
		cartoes: [nubank, anuidadeCartao],
		mes: 3,
		ano: 2026,
		hoje: '2026-03-01'
	});
	expect(uso.aPagar.map((l) => l.descricao)).toEqual(['Empréstimo', 'IPTU', 'Fatura Nubank']);
	expect(uso.aPagar.map((l) => l.data)).toEqual(['2026-03-02', '2026-03-10', '2026-03-20']);
	expect(uso.totalAPagar).toBe(12000);
	expect(uso.pagas.map((l) => [l.descricao, l.valor, l.data])).toEqual([
		['Multa', 800, '2026-03-04'],
		['Anuidade', 2000, '2026-03-05'],
		['Consignado', 1500, '2026-03-08']
	]);
	expect(uso.totalPagas).toBe(4300);
	expect(uso.aPagar.some((l) => l.descricao === 'Fatura Anuidade')).toBe(false);
	expect(uso.pagas.some((l) => l.id === 'txn:pagamento')).toBe(false);

	const renda = criarRecorrente({
		id: 'renda',
		criadoEm,
		nome: 'Renda',
		categoria: 'salario',
		tipo: 'entrada',
		valorEsperado: 10000,
		diaVencimento: 5,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const parcela = criarRecorrente({
		id: 'parcela',
		criadoEm,
		nome: 'Parcela',
		categoria: 'divida',
		tipo: 'saida',
		valorEsperado: 5000,
		diaVencimento: 10,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const aVista: Previsao = {
		id: 'avista',
		nome: 'À vista',
		valor: 500,
		tipo: 'saida',
		frequencia: 'pontual',
		data: '2026-03-12',
		categoria: 'divida'
	};
	expect(
		projetarCustoDividas({
			recorrentes: [renda, parcela],
			previsoes: [aVista, almocoDivida],
			divisao,
			mes: 3,
			ano: 2026,
			horizontes: [1, 3]
		})
	).toEqual([
		{ meses: 1, custoDividas: 5500, baldeAcumulado: 2000, excedente: 3500 },
		{ meses: 3, custoDividas: 15500, baldeAcumulado: 6000, excedente: 9500 }
	]);

	const reserva: Conta = {
		id: 'reserva',
		tipo: 'poupanca',
		nome: 'Reserva',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		categoria: 'reserva',
		criadoEm
	};
	const objetivo: Conta = { ...reserva, id: 'objetivo', categoria: 'objetivo' };
	const corrente: Conta = { ...reserva, id: 'cc', tipo: 'corrente', categoria: undefined };
	const saldos: SaldoConta[] = [
		{ conta: reserva, saldo: 7000 },
		{ conta: objetivo, saldo: 3000 },
		{ conta: corrente, saldo: 10000 }
	];
	expect(calcularReservaAcumulada([reserva, objetivo, corrente], saldos)).toBe(7000);

	const entrada = registrarLinha({
		id: 'entrada',
		criadoEm,
		data: '2026-03-05',
		descricao: 'Pix',
		tipo: 'entrada',
		valor: 2500,
		categoria: 'freelance',
		contaId: 'cc'
	});
	expect(calcularEntradasProjetadas([entrada, multa], 3, 2026)).toBe(2500);
});