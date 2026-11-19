import { expect, test } from 'bun:test';
import { criarCartao, registrarGasto } from '../cartao/cartao';
import type { Conta } from '../ledger/domain/conta';
import { registrarLinha } from '../ledger/domain/registrar-linha';
import type { Previsao } from '../previsao/previsao';
import { criarRecorrente, marcarComoPaga } from '../recorrencia/recorrencia';
import {
	HORIZONTE_PROXIMA_ENTRADA_DIAS,
	JANELA_GASTO_DIARIO_PADRAO,
	aplicarGastoHipotetico,
	calcularDataDoAperto,
	calcularGastoAvulsoMedioDiario,
	calcularGastoDiarioDisponivel,
	fluxoRealNoDia,
	limiteDiarioSustentavel,
	limiteGastoDiario,
	projetarSaldo,
	proximaEntradaRelevante,
	resumirFluxo,
	saldoDisponivelAteData,
	type DiaProjetado
} from './projecao';

test('a projeção gasta o caixa, a fatura no vencimento e a margem antes do rateio', () => {
	expect(JANELA_GASTO_DIARIO_PADRAO).toBe(60);
	expect(HORIZONTE_PROXIMA_ENTRADA_DIAS).toBe(62);

	const criadoEm = '2026-03-01T12:00:00.000Z';
	const corrente: Conta = {
		id: 'cc',
		tipo: 'corrente',
		nome: 'Nubank',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		criadoEm
	};
	const poupanca: Conta = {
		id: 'pp',
		tipo: 'poupanca',
		nome: 'Reserva',
		descricao: '',
		saldoInicial: 0,
		ativa: true,
		criadoEm
	};
	const nubank = criarCartao({
		id: 'nubank',
		criadoEm,
		nome: 'Nubank',
		limite: 500000,
		diaFechamento: 20,
		diaVencimento: 25,
		cor: '#3B82F6'
	});
	const visa = criarCartao({
		id: 'visa',
		criadoEm,
		nome: 'Visa',
		limite: 200000,
		diaFechamento: 5,
		diaVencimento: 3,
		cor: '#111111'
	});
	const internet = criarRecorrente({
		id: 'internet',
		criadoEm,
		nome: 'Internet',
		categoria: 'contas',
		tipo: 'saida',
		valorEsperado: 10000,
		diaVencimento: 5,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const aluguel = criarRecorrente({
		id: 'aluguel',
		criadoEm,
		nome: 'Aluguel',
		categoria: 'moradia',
		tipo: 'saida',
		valorEsperado: 30000,
		diaVencimento: 15,
		dataInicio: '2026-01-01',
		contaId: 'cc'
	});
	const noCartao = criarRecorrente({
		id: 'assinatura',
		criadoEm,
		nome: 'Assinatura',
		categoria: 'assinaturas',
		tipo: 'saida',
		valorEsperado: 90000,
		diaVencimento: 10,
		dataInicio: '2026-01-01',
		contaId: 'cc',
		cartaoId: 'nubank'
	});
	const naPoupanca = criarRecorrente({
		id: 'objetivo',
		criadoEm,
		nome: 'Objetivo',
		categoria: 'poupanca',
		tipo: 'saida',
		valorEsperado: 90000,
		diaVencimento: 10,
		dataInicio: '2026-01-01',
		contaId: 'pp'
	});
	const ontem = registrarLinha({
		id: 'ontem',
		criadoEm,
		data: '2026-03-09',
		descricao: 'Mercado',
		tipo: 'saida',
		valor: 5000,
		categoria: 'mercado',
		contaId: 'cc'
	});
	const freelance = registrarLinha({
		id: 'freela',
		criadoEm,
		data: '2026-03-12',
		descricao: 'Freelance',
		tipo: 'entrada',
		valor: 20000,
		categoria: 'freelance',
		contaId: 'cc'
	});
	const reserva = registrarLinha({
		id: 'reserva',
		criadoEm,
		data: '2026-03-12',
		descricao: 'Guardar',
		tipo: 'saida',
		valor: 50000,
		categoria: 'poupanca',
		contaId: 'pp'
	});
	const compraNubank = registrarGasto({
		id: 'compra-nubank',
		criadoEm,
		cartao: nubank,
		data: '2026-03-05',
		descricao: 'Mercado no cartão',
		valor: 40000,
		categoria: 'mercado'
	});
	const compraVisa = registrarGasto({
		id: 'compra-visa',
		criadoEm,
		cartao: visa,
		data: '2026-02-01',
		descricao: 'Compra antiga',
		valor: 8000,
		categoria: 'lazer'
	});
	const conserto: Previsao = {
		id: 'conserto',
		nome: 'Conserto',
		valor: 7000,
		tipo: 'saida',
		frequencia: 'pontual',
		data: '2026-03-01'
	};
	const almoco: Previsao = {
		id: 'almoco',
		nome: 'Almoço',
		valor: 1500,
		tipo: 'saida',
		frequencia: 'diario',
		diasSemana: [2],
		data: '2026-03-01'
	};
	const cafe: Previsao = {
		...almoco,
		id: 'cafe',
		nome: 'Café',
		valor: 9999,
		statusPorDia: {
			'2026-03-10': 'paga',
			'2026-03-17': 'paga',
			'2026-03-24': 'paga'
		}
	};

	const dias = projetarSaldo({
		saldoAtual: 100000,
		transacoes: [ontem, freelance, reserva, compraNubank, compraVisa],
		contas: [corrente, poupanca],
		dataInicio: '2026-03-10',
		horizonteDias: 20,
		recorrentes: [internet, aluguel, noCartao, naPoupanca],
		cartoes: [nubank, visa],
		previsoes: [conserto, almoco, cafe],
		diasRetroativos: 1
	});
	const porData = (data: string) => dias.find((d) => d.data === data);
	const nomes = (data: string) => porData(data)?.eventos.map((e) => e.nome) ?? [];

	expect(porData('2026-03-09')?.saldoProjetado).toBe(100000);
	expect(nomes('2026-03-09')).toEqual(['Mercado']);
	expect(porData('2026-03-10')?.saldoProjetado).toBe(73500);
	expect(nomes('2026-03-10')).toEqual(['Internet', 'Conserto', 'Almoço', 'Fatura Visa']);
	expect(nomes('2026-03-12')).toEqual(['Freelance']);
	expect(porData('2026-03-12')?.saldoProjetado).toBe(93500);
	expect(porData('2026-03-15')?.saldoProjetado).toBe(63500);
	expect(porData('2026-03-17')?.saldoProjetado).toBe(62000);
	expect(porData('2026-03-24')?.saldoProjetado).toBe(60500);
	expect(nomes('2026-03-25')).toEqual(['Fatura Nubank']);
	expect(porData('2026-03-25')?.saldoProjetado).toBe(20500);
	expect(dias.flatMap((d) => d.eventos.map((e) => e.nome))).not.toContain('Guardar');
	expect(dias.flatMap((d) => d.eventos.map((e) => e.nome))).not.toContain('Café');
	expect(dias.flatMap((d) => d.eventos.map((e) => e.nome))).not.toContain('Mercado no cartão');

	const serie: DiaProjetado[] = [
		{ data: '2026-03-01', saldoProjetado: 10000, eventos: [] },
		{
			data: '2026-03-02',
			saldoProjetado: 10000,
			eventos: [{ nome: 'Salário', valor: 1000, tipo: 'entrada' }]
		},
		{ data: '2026-03-03', saldoProjetado: 7000, eventos: [] }
	];
	expect(calcularGastoDiarioDisponivel(serie, 1000)).toEqual([2000, 3000, 6000]);
	expect(limiteDiarioSustentavel(serie, 2, 1000)).toBe(4500);
	expect(limiteDiarioSustentavel(serie, 0, 1000)).toBe(9000);
	expect(
		calcularDataDoAperto({
			dias: serie,
			indiceProximaEntrada: 2,
			ritmoAtual: 5000,
			limiteDiario: 2000,
			margemSeguranca: 1000
		})
	).toEqual({ data: '2026-03-02', diasConfortaveis: 1, reducaoDiariaNecessaria: 3000 });
	expect(aplicarGastoHipotetico(serie, 100, 1)[0].saldoProjetado).toBe(10000);
	expect(aplicarGastoHipotetico(serie, 100, 1)[1].saldoProjetado).toBe(9900);
	expect(resumirFluxo(serie)).toEqual({ entradas: 1000, saidas: 0 });
	expect(limiteGastoDiario(300, 100, 30)).toBe(7);
	expect(proximaEntradaRelevante(serie)).toEqual({
		data: '2026-03-02',
		nome: 'Salário',
		valor: 1000
	});
	expect(saldoDisponivelAteData(serie, '2026-03-02')).toBe(9000);
	expect(
		fluxoRealNoDia({
			transacoes: [ontem, reserva, compraNubank],
			contas: [corrente, poupanca],
			data: '2026-03-09'
		})
	).toEqual({ entradas: 0, saidas: 5000 });

	const paga = marcarComoPaga(
		criarRecorrente({
			id: 'padaria',
			criadoEm,
			nome: 'Padaria',
			categoria: 'alimentacao',
			tipo: 'saida',
			valorEsperado: 2000,
			diaVencimento: 5,
			dataInicio: '2026-01-01',
			contaId: 'cc'
		}),
		'2026-03',
		'ontem'
	);
	expect(
		calcularGastoAvulsoMedioDiario({
			transacoes: [ontem, reserva],
			contas: [corrente, poupanca],
			recorrentes: [paga],
			dataFim: '2026-03-10',
			diasJanela: 10
		})
	).toBe(300);
});
