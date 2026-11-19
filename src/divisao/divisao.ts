import { ehDivida } from '../categorias/catalogo';
import { avancarMes } from '../calendario';
import type { Cartao } from '../cartao/cartao';
import type { DivisaoRenda } from '../configuracao/configuracao';
import { filtrarPorMes } from '../ledger/domain/filtrar-lancamentos';
import type { Conta } from '../ledger/domain/conta';
import type { SaldoConta } from '../ledger/domain/saldos';
import type { Transacao } from '../ledger/domain/transacao';
import { aplicavelNoMes as previsaoNoMes, type Previsao } from '../previsao/previsao';
import { calcularEventosFatura } from '../projecao/projecao';
import {
	aplicavelNoMes as recorrenteNoMes,
	dataDaOcorrencia,
	statusNoMes,
	type Recorrente
} from '../recorrencia/recorrencia';

export type OrigemUsoDivida = 'Previsão' | 'Recorrente' | 'Transação' | 'Fatura';

export type RefLinhaDivida =
	| { tipo: 'recorrente'; recorrente: Recorrente; mesRef: string; transacaoPagamentoId?: string }
	| { tipo: 'simulacao'; item: Previsao; dataOcorrencia: string }
	| {
			tipo: 'fatura';
			cartaoId: string;
			faturaReferencia: string;
			valor: number;
			vencimento: string;
	  };

export interface LinhaDivida {
	id: string;
	descricao: string;
	valor: number;
	data: string;
	origem: OrigemUsoDivida;
	acionavel: boolean;
	ref: RefLinhaDivida | null;
}

export interface HorizonteCustoDividas {
	meses: number;
	custoDividas: number;
	baldeAcumulado: number;
	excedente: number;
}

export interface UsoDividas {
	aPagar: LinhaDivida[];
	pagas: LinhaDivida[];
	totalAPagar: number;
	totalPagas: number;
}

export interface ResultadoDivisao {
	totalEntradas: number;
	geral: number;
	dividas: number;
	reserva: number;
}

function porData(a: LinhaDivida, b: LinhaDivida): number {
	if (a.data < b.data) return -1;
	if (a.data > b.data) return 1;
	return 0;
}

function mesEm(
	ano: number,
	mes: number,
	deslocamento: number
): { ano: number; mes: number; mesRef: string } {
	const mesRef = avancarMes(`${ano}-${String(mes).padStart(2, '0')}`, deslocamento);
	const [anoIter, mesIter] = mesRef.split('-').map(Number);
	return { ano: anoIter, mes: mesIter, mesRef };
}

export function calcularDivisao(params: {
	recorrentes: Recorrente[];
	previsoes: Previsao[];
	mes: number;
	ano: number;
	divisao: DivisaoRenda;
}): ResultadoDivisao {
	const { recorrentes, previsoes, mes, ano, divisao } = params;
	const mesRef = `${ano}-${String(mes).padStart(2, '0')}`;
	const totalRecorrentes = recorrentes
		.filter((r) => r.ativa && r.tipo === 'entrada' && recorrenteNoMes(r, mesRef))
		.reduce((total, r) => total + r.valorEsperado, 0);
	const totalPrevisoes = previsoes
		.filter((g) => g.tipo === 'entrada' && previsaoNoMes(g, mesRef))
		.reduce((total, g) => total + g.valor, 0);
	const totalEntradas = totalRecorrentes + totalPrevisoes;
	const dividas = Math.round((totalEntradas * divisao.dividas) / 100);
	const reserva = Math.round((totalEntradas * divisao.reserva) / 100);
	const geral = totalEntradas - dividas - reserva;
	return { totalEntradas, geral, dividas, reserva };
}

export function calcularUsoDividas(params: {
	recorrentes: Recorrente[];
	transacoes: Transacao[];
	previsoes: Previsao[];
	cartoes: Cartao[];
	mes: number;
	ano: number;
	hoje: string;
}): UsoDividas {
	const { recorrentes, transacoes, previsoes, cartoes, mes, ano, hoje } = params;
	const mesRef = `${ano}-${String(mes).padStart(2, '0')}`;
	const recorrentesDivida = recorrentes.filter(
		(r) => r.ativa && r.tipo === 'saida' && ehDivida(r.categoria)
	);

	const previsoesAPagar: LinhaDivida[] = previsoes
		.filter((g) => g.tipo === 'saida' && ehDivida(g.categoria) && previsaoNoMes(g, mesRef))
		.map((g) => {
			const dataOcorrencia = g.frequencia === 'mensal' ? `${mesRef}-${g.data.slice(-2)}` : g.data;
			return {
				id: `prev:${g.id}`,
				descricao: g.nome,
				valor: g.valor,
				data: dataOcorrencia,
				origem: 'Previsão',
				acionavel: true,
				ref: { tipo: 'simulacao', item: g, dataOcorrencia }
			};
		});

	const recorrentesAPagar: LinhaDivida[] = recorrentesDivida
		.filter((r) => recorrenteNoMes(r, mesRef) && statusNoMes(r, mesRef) === 'prevista')
		.map((r) => ({
			id: `rec:${r.id}`,
			descricao: r.nome,
			valor: r.valorEsperado,
			data: dataDaOcorrencia(r, mesRef) ?? `${mesRef}-${String(r.diaVencimento).padStart(2, '0')}`,
			origem: 'Recorrente',
			acionavel: true,
			ref: { tipo: 'recorrente', recorrente: r, mesRef }
		}));

	const idsPagamentoRecorrente = new Set(
		recorrentesDivida.flatMap((r) => Object.values(r.pagamentosPorMes ?? {}))
	);

	const faturasAPagar: LinhaDivida[] = calcularEventosFatura({
		cartoes,
		transacoes: transacoes.filter((t) => !idsPagamentoRecorrente.has(t.id)),
		hoje
	})
		.filter((ev) => ev.data.slice(0, 7) === mesRef)
		.map((ev) => ({
			id: `fat:${ev.cartaoId}:${ev.data}`,
			descricao: ev.nome,
			valor: ev.valor,
			data: ev.data,
			origem: 'Fatura' as const,
			acionavel: true,
			ref: {
				tipo: 'fatura' as const,
				cartaoId: ev.cartaoId,
				faturaReferencia: ev.faturaReferencia,
				valor: ev.valor,
				vencimento: ev.data
			}
		}));

	const aPagar = [...previsoesAPagar, ...recorrentesAPagar, ...faturasAPagar];
	const transacoesPorId = new Map(transacoes.map((t) => [t.id, t]));

	const recorrentesPagas: LinhaDivida[] = recorrentesDivida
		.filter((r) => recorrenteNoMes(r, mesRef) && statusNoMes(r, mesRef) === 'paga')
		.map((r) => {
			const transacaoPagamentoId = r.pagamentosPorMes?.[mesRef];
			const transacao = transacaoPagamentoId ? transacoesPorId.get(transacaoPagamentoId) : undefined;
			return {
				id: `rec:${r.id}`,
				descricao: r.nome,
				valor: transacao ? transacao.valor : r.valorEsperado,
				data:
					transacao?.data ??
					dataDaOcorrencia(r, mesRef) ??
					`${mesRef}-${String(r.diaVencimento).padStart(2, '0')}`,
				origem: 'Recorrente' as const,
				acionavel: true,
				ref: { tipo: 'recorrente' as const, recorrente: r, mesRef, transacaoPagamentoId }
			};
		});

	const avulsasPagas: LinhaDivida[] = filtrarPorMes(transacoes, mes, ano)
		.filter((t) => t.tipo === 'saida' && ehDivida(t.categoria) && !idsPagamentoRecorrente.has(t.id))
		.map((t) => ({
			id: `txn:${t.id}`,
			descricao: t.descricao,
			valor: t.valor,
			data: t.data,
			origem: 'Transação' as const,
			acionavel: false,
			ref: null
		}));

	const pagas = [...recorrentesPagas, ...avulsasPagas];
	const soma = (linhas: LinhaDivida[]) => linhas.reduce((total, l) => total + l.valor, 0);
	return {
		aPagar: [...aPagar].sort(porData),
		pagas: [...pagas].sort(porData),
		totalAPagar: soma(aPagar),
		totalPagas: soma(pagas)
	};
}

export function projetarCustoDividas(params: {
	recorrentes: Recorrente[];
	previsoes: Previsao[];
	divisao: DivisaoRenda;
	mes: number;
	ano: number;
	horizontes?: number[];
}): HorizonteCustoDividas[] {
	const { recorrentes, previsoes, divisao, mes, ano } = params;
	const horizontes = (params.horizontes ?? [3, 6, 12]).filter((h) => h > 0);
	if (horizontes.length === 0) return [];
	const maxMeses = Math.max(...horizontes);
	const recorrentesDivida = recorrentes.filter(
		(r) => r.ativa && r.tipo === 'saida' && ehDivida(r.categoria)
	);
	const previsoesDivida = previsoes.filter((g) => g.tipo === 'saida' && ehDivida(g.categoria));

	let custoAcumulado = 0;
	let baldeAcumulado = 0;
	const snapshots: HorizonteCustoDividas[] = [];
	for (let i = 0; i < maxMeses; i++) {
		const alvo = mesEm(ano, mes, i);
		const custoRecorrentes = recorrentesDivida
			.filter((r) => recorrenteNoMes(r, alvo.mesRef))
			.reduce((total, r) => total + r.valorEsperado, 0);
		const custoPrevisoes = previsoesDivida
			.filter((g) => previsaoNoMes(g, alvo.mesRef))
			.reduce((total, g) => total + g.valor, 0);
		custoAcumulado += custoRecorrentes + custoPrevisoes;
		baldeAcumulado += calcularDivisao({
			recorrentes,
			previsoes,
			mes: alvo.mes,
			ano: alvo.ano,
			divisao
		}).dividas;
		const meses = i + 1;
		if (horizontes.includes(meses)) {
			snapshots.push({
				meses,
				custoDividas: custoAcumulado,
				baldeAcumulado,
				excedente: Math.max(0, custoAcumulado - baldeAcumulado)
			});
		}
	}
	return snapshots;
}

export function calcularReservaAcumulada(contas: Conta[], saldos: SaldoConta[]): number {
	const idsReserva = new Set(
		contas
			.filter((c) => c.ativa && c.tipo === 'poupanca' && c.categoria === 'reserva')
			.map((c) => c.id)
	);
	return saldos.filter((s) => idsReserva.has(s.conta.id)).reduce((total, s) => total + s.saldo, 0);
}

export function calcularEntradasProjetadas(
	transacoes: Transacao[],
	mes: number,
	ano: number
): number {
	return filtrarPorMes(transacoes, mes, ano)
		.filter((t) => t.tipo === 'entrada')
		.reduce((total, t) => total + t.valor, 0);
}
