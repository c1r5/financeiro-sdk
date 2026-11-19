import type { TipoTransacao, Transacao } from './transacao.ts';

export function filtrarPorMes(transacoes: Transacao[], mes: number, ano: number): Transacao[] {
	const mesStr = String(mes).padStart(2, '0');
	const prefixo = `${ano}-${mesStr}`;
	return transacoes.filter((t) => t.data.startsWith(prefixo));
}

export function filtrarPorTipo(transacoes: Transacao[], tipo: TipoTransacao): Transacao[] {
	return transacoes.filter((t) => t.tipo === tipo);
}

export function buscar(transacoes: Transacao[], busca: string): Transacao[] {
	const buscaLower = busca.toLowerCase();
	return transacoes.filter(
		(t) =>
			t.descricao.toLowerCase().includes(buscaLower) ||
			t.categoria.toLowerCase().includes(buscaLower)
	);
}
