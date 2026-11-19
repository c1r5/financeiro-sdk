import type { Saldos } from '../domain/saldos';
import type { Relogio } from '../ports/relogio';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro';
export declare function consultarSaldos(repositorio: RepositorioDoLivro, relogio: Relogio): Promise<Saldos>;
