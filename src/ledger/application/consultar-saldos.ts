import { calcularSaldos } from '../domain/calcular-saldos.ts';
import type { Saldos } from '../domain/saldos.ts';
import type { Relogio } from '../ports/relogio.ts';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro.ts';

export async function consultarSaldos(
	repositorio: RepositorioDoLivro,
	relogio: Relogio
): Promise<Saldos> {
	const contas = await repositorio.listarContas();
	const transacoes = await repositorio.listarTransacoes();
	return calcularSaldos(contas, transacoes, relogio.hoje());
}
