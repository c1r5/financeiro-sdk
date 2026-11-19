import { diaDaSemana, diasNoMes, partes } from '../calendario';
import type { CategoriaTransacao } from '../ledger/domain/transacao';

export type Frequencia = 'pontual' | 'diario' | 'mensal';

export interface Previsao {
	id: string;
	nome: string;
	valor: number;
	tipo: 'entrada' | 'saida';
	frequencia: Frequencia;
	diasSemana?: number[];
	dataFim?: string;
	statusPorDia?: Record<string, 'paga'>;
	pagamentosPorDia?: Record<string, string>;
	valoresPorDia?: Record<string, number>;
	ocorrenciasExcluidas?: string[];
	data: string;
	categoria?: CategoriaTransacao;
}

export function rotuloDiasSemana(diasSemana: number[]): string {
	const set = new Set(diasSemana);
	if ([0, 1, 2, 3, 4, 5, 6].every((d) => set.has(d))) return 'Semanal';
	if ([1, 2, 3, 4, 5].every((d) => set.has(d)) && !set.has(0) && !set.has(6)) return 'Dias Úteis';
	return 'Diário';
}

export function valorNoDia(previsao: Previsao, data: string): number {
	if (previsao.frequencia !== 'diario') return previsao.valor;
	return previsao.valoresPorDia?.[data] ?? previsao.valor;
}

/** Ocorrência de calendário. Dia pago continua na série; dia excluído não. */
export function ocorreNoDia(previsao: Previsao, data: string): boolean {
	if (previsao.frequencia === 'pontual') return data === previsao.data;
	if (previsao.ocorrenciasExcluidas?.includes(data)) return false;
	if (previsao.frequencia === 'mensal') {
		if (data < previsao.data) return false;
		if (previsao.dataFim && data > previsao.dataFim) return false;
		return partes(data).dia === partes(previsao.data).dia;
	}
	if (data < previsao.data) return false;
	return (previsao.diasSemana ?? []).includes(diaDaSemana(data));
}

/**
 * Entra no saldo projetado. Pontual vencida conta em `dataInicio`.
 * Diário já pago não entra de novo.
 */
export function contaNaProjecao(previsao: Previsao, data: string, dataInicio: string): boolean {
	if (previsao.frequencia === 'pontual') {
		const efetiva = previsao.data < dataInicio ? dataInicio : previsao.data;
		return data === efetiva;
	}
	if (previsao.frequencia === 'diario' && previsao.statusPorDia?.[data] === 'paga') return false;
	return ocorreNoDia(previsao, data);
}

export function statusNoDia(
	previsao: Previsao,
	data: string,
	hoje: string
): 'paga' | 'prevista' | 'atrasada' | null {
	if (!ocorreNoDia(previsao, data)) return null;
	if (previsao.frequencia === 'diario' && previsao.statusPorDia?.[data] === 'paga') return 'paga';
	if (data < hoje) return 'atrasada';
	return 'prevista';
}

/** Diário fica de fora: não é um valor mensal único. */
export function aplicavelNoMes(previsao: Previsao, mesRef: string): boolean {
	if (previsao.frequencia === 'diario') return false;
	if (previsao.frequencia === 'mensal') {
		if (mesRef < previsao.data.slice(0, 7)) return false;
		const [ano, mes] = mesRef.split('-').map(Number);
		const dia = partes(previsao.data).dia;
		if (dia > diasNoMes(ano, mes)) return false;
		const ocorrencia = `${mesRef}-${previsao.data.slice(-2)}`;
		if (previsao.dataFim && ocorrencia > previsao.dataFim) return false;
		if (previsao.ocorrenciasExcluidas?.includes(ocorrencia)) return false;
		return true;
	}
	return previsao.data.slice(0, 7) === mesRef;
}

export function excluirOcorrencia(previsao: Previsao, data: string): Previsao {
	return {
		...previsao,
		ocorrenciasExcluidas: [...(previsao.ocorrenciasExcluidas ?? []), data]
	};
}

export function definirValorDoDia(previsao: Previsao, data: string, valor: number): Previsao {
	return {
		...previsao,
		valoresPorDia: { ...previsao.valoresPorDia, [data]: valor }
	};
}

export function aplicarASerie(original: Previsao, editado: Previsao): Previsao {
	const serie: Previsao = { ...editado, id: original.id };
	delete serie.valoresPorDia;
	return serie;
}

export function marcarDiaPago(previsao: Previsao, data: string, transacaoId: string): Previsao {
	return {
		...previsao,
		statusPorDia: { ...previsao.statusPorDia, [data]: 'paga' },
		pagamentosPorDia: { ...previsao.pagamentosPorDia, [data]: transacaoId }
	};
}

export function reverterDia(previsao: Previsao, data: string): Previsao {
	const statusPorDia = { ...previsao.statusPorDia };
	const pagamentosPorDia = { ...previsao.pagamentosPorDia };
	delete statusPorDia[data];
	delete pagamentosPorDia[data];
	return { ...previsao, statusPorDia, pagamentosPorDia };
}

export function desvincularPagamento(previsoes: Previsao[], transacaoId: string): Previsao[] {
	let mudou = false;
	const novas = previsoes.map((item) => {
		const dias = Object.entries(item.pagamentosPorDia ?? {})
			.filter(([, id]) => id === transacaoId)
			.map(([dia]) => dia);
		if (dias.length === 0) return item;
		mudou = true;
		return dias.reduce((atual, dia) => reverterDia(atual, dia), item);
	});
	return mudou ? novas : previsoes;
}
