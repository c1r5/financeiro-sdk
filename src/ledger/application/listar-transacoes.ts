import { buscar, filtrarPorMes, filtrarPorTipo } from '../domain/filtrar-lancamentos';
import { ordenar } from '../domain/ordenar-lancamentos';
import type { TipoTransacao, Transacao } from '../domain/transacao';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro';

export interface FiltroDeTransacoes {
	mes?: number;
	ano?: number;
	tipo?: TipoTransacao;
	texto?: string;
}

export async function listarTransacoes(
	repositorio: RepositorioDoLivro,
	filtro: FiltroDeTransacoes = {}
): Promise<Transacao[]> {
	let lista = ordenar(await repositorio.listarTransacoes());
	if (filtro.mes !== undefined && filtro.ano !== undefined) {
		lista = filtrarPorMes(lista, filtro.mes, filtro.ano);
	}
	if (filtro.tipo !== undefined) {
		lista = filtrarPorTipo(lista, filtro.tipo);
	}
	if (filtro.texto !== undefined) {
		lista = buscar(lista, filtro.texto);
	}
	return lista;
}
