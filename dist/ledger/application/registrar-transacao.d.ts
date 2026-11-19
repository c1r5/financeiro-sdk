import { type NovaLinha } from '../domain/registrar-linha';
import type { Transacao } from '../domain/transacao';
import type { GeradorDeId } from '../ports/gerador-de-id';
import type { Relogio } from '../ports/relogio';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro';
export type EntradaDeTransacao = Omit<NovaLinha, 'id' | 'criadoEm'>;
export declare function registrarTransacao(repositorio: RepositorioDoLivro, relogio: Relogio, ids: GeradorDeId, entrada: EntradaDeTransacao): Promise<Transacao>;
