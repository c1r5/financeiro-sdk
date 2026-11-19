import { registrarLinha, type NovaLinha } from '../domain/registrar-linha.ts';
import type { Transacao } from '../domain/transacao.ts';
import type { GeradorDeId } from '../ports/gerador-de-id.ts';
import type { Relogio } from '../ports/relogio.ts';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro.ts';

export type EntradaDeTransacao = Omit<NovaLinha, 'id' | 'criadoEm'>;

export async function registrarTransacao(
	repositorio: RepositorioDoLivro,
	relogio: Relogio,
	ids: GeradorDeId,
	entrada: EntradaDeTransacao
): Promise<Transacao> {
	const transacao = registrarLinha({
		...entrada,
		id: ids.novoId(),
		criadoEm: relogio.agora()
	});
	await repositorio.incluirTransacao(transacao);
	return transacao;
}
