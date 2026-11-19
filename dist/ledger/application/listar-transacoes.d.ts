import type { TipoTransacao, Transacao } from '../domain/transacao';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro';
export interface FiltroDeTransacoes {
    mes?: number;
    ano?: number;
    tipo?: TipoTransacao;
    texto?: string;
}
export declare function listarTransacoes(repositorio: RepositorioDoLivro, filtro?: FiltroDeTransacoes): Promise<Transacao[]>;
