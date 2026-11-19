import type { Conta } from './conta.ts';
import { DataCivil } from './data-civil.ts';
import type { Saldos, SaldoConta } from './saldos.ts';
import type { Transacao } from './transacao.ts';

/**
 * Saldo de cada conta ativa. Linha com data posterior a `hoje` permanece no
 * razão e não entra neste saldo. `gasto-cartao` não posta em conta bancária.
 */
export function calcularSaldos(contas: Conta[], transacoes: Transacao[], hoje: string): Saldos {
	const limite = DataCivil.from(hoje);
	const saldoMap = new Map<string, number>();
	for (const conta of contas) {
		if (conta.ativa) {
			saldoMap.set(conta.id, conta.saldoInicial);
		}
	}

	const ordenadas = [...transacoes]
		.filter((t) => t.data <= limite.value)
		.sort((a, b) => {
			const cmpData = a.data.localeCompare(b.data);
			if (cmpData !== 0) return cmpData;
			return a.criadoEm.localeCompare(b.criadoEm);
		});

	for (const t of ordenadas) {
		const saldoAtual = saldoMap.get(t.contaId) ?? 0;

		switch (t.tipo) {
			case 'entrada':
				saldoMap.set(t.contaId, saldoAtual + t.valor);
				break;
			case 'saida':
			case 'pagamento-fatura':
				saldoMap.set(t.contaId, saldoAtual - t.valor);
				break;
			case 'gasto-cartao':
				break;
			case 'transferencia':
				saldoMap.set(t.contaId, saldoAtual - t.valor);
				if (t.contaDestinoId) {
					const saldoDestino = saldoMap.get(t.contaDestinoId) ?? 0;
					saldoMap.set(t.contaDestinoId, saldoDestino + t.valor);
				}
				break;
		}
	}

	const contasAtivas = contas.filter((c) => c.ativa);
	const saldosContas: SaldoConta[] = contasAtivas.map((conta) => ({
		conta,
		saldo: saldoMap.get(conta.id) ?? 0
	}));

	const totalCorrente = saldosContas
		.filter((s) => s.conta.tipo === 'corrente')
		.reduce((acc, s) => acc + s.saldo, 0);

	const totalPoupanca = saldosContas
		.filter((s) => s.conta.tipo === 'poupanca')
		.reduce((acc, s) => acc + s.saldo, 0);

	return {
		contas: saldosContas,
		totalCorrente,
		totalPoupanca,
		total: totalCorrente + totalPoupanca
	};
}
