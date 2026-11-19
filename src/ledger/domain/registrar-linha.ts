import { DataCivil } from './data-civil';
import { Dinheiro } from './dinheiro';
import type { CategoriaTransacao, Parcela, TipoTransacao, Transacao } from './transacao';

export interface NovaLinha {
	id: string;
	criadoEm: string;
	data: string;
	descricao: string;
	tipo: TipoTransacao;
	valor: number;
	categoria: CategoriaTransacao;
	contaId: string;
	contaDestinoId?: string;
	cartaoId?: string;
	faturaReferencia?: string;
	parcela?: Parcela;
	grupoParcelamentoId?: string;
}

export function registrarLinha(params: NovaLinha): Transacao {
	const transacao: Transacao = {
		id: params.id,
		data: DataCivil.from(params.data).value,
		descricao: params.descricao,
		tipo: params.tipo,
		valor: Dinheiro.from(params.valor).value,
		categoria: params.categoria,
		contaId: params.contaId,
		criadoEm: params.criadoEm
	};
	if (params.contaDestinoId !== undefined) transacao.contaDestinoId = params.contaDestinoId;
	if (params.cartaoId !== undefined) transacao.cartaoId = params.cartaoId;
	if (params.faturaReferencia !== undefined) transacao.faturaReferencia = params.faturaReferencia;
	if (params.parcela !== undefined) transacao.parcela = params.parcela;
	if (params.grupoParcelamentoId !== undefined) {
		transacao.grupoParcelamentoId = params.grupoParcelamentoId;
	}
	return transacao;
}
