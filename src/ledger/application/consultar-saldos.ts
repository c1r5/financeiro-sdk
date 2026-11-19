import { calcularSaldos } from '../domain/calcular-saldos';
import type { Saldos } from '../domain/saldos';
import type { Relogio } from '../ports/relogio';
import type { RepositorioDoLivro } from '../ports/repositorio-do-livro';

export async function consultarSaldos(
	repositorio: RepositorioDoLivro,
	relogio: Relogio
): Promise<Saldos> {
	const contas = await repositorio.listarContas();
	const transacoes = await repositorio.listarTransacoes();
	return calcularSaldos(contas, transacoes, relogio.hoje());
}
