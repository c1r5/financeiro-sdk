import type { RepositorioDoLivro } from '../ports/repositorio-do-livro.ts';

export async function removerTransacao(
	repositorio: RepositorioDoLivro,
	id: string
): Promise<void> {
	await repositorio.removerTransacao(id);
}
