import type { Conta } from './conta';
import type { Transacao } from './transacao';

/**
 * Efeito da linha no saldo disponível. Poupança fica de fora. Transferência
 * só altera esse saldo quando cruza corrente e poupança. `gasto-cartao` não
 * altera saldo bancário.
 */
export function deltaSaldoDisponivel(t: Transacao, idsCorrente: Set<string>): number {
	if (t.tipo === 'entrada') return idsCorrente.has(t.contaId) ? t.valor : 0;
	if (t.tipo === 'saida' || t.tipo === 'pagamento-fatura') {
		return idsCorrente.has(t.contaId) ? -t.valor : 0;
	}
	if (t.tipo === 'transferencia') {
		const origemCorrente = idsCorrente.has(t.contaId);
		const destinoCorrente = t.contaDestinoId != null && idsCorrente.has(t.contaDestinoId);
		if (origemCorrente && !destinoCorrente) return -t.valor;
		if (!origemCorrente && destinoCorrente) return t.valor;
	}
	return 0;
}

/**
 * Saldo disponível (contas corrente) logo após cada lançamento, na ordem
 * recebida. Inclui linha futura: quem chama decide o recorte.
 */
export function calcularSaldoDisponivelAposCada(
	contas: Conta[],
	transacoesAsc: Transacao[]
): Map<string, number> {
	const idsCorrente = new Set(
		contas.filter((c) => c.ativa && c.tipo === 'corrente').map((c) => c.id)
	);
	let acumulado = contas
		.filter((c) => c.ativa && c.tipo === 'corrente')
		.reduce((acc, c) => acc + c.saldoInicial, 0);

	const mapa = new Map<string, number>();
	for (const t of transacoesAsc) {
		acumulado += deltaSaldoDisponivel(t, idsCorrente);
		mapa.set(t.id, acumulado);
	}
	return mapa;
}
