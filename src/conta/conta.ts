import type { CategoriaConta, Conta, TipoConta } from '../ledger/domain/conta';
import { registrarLinha } from '../ledger/domain/registrar-linha';
import type { Transacao } from '../ledger/domain/transacao';

export function poupancasVinculadas(contas: Conta[], correnteId: string): Conta[] {
	return contas.filter(
		(conta) => conta.ativa && conta.tipo === 'poupanca' && conta.contaVinculadaId === correnteId
	);
}

export function poupancaDoProposito(
	contas: Conta[],
	correnteId: string,
	proposito: CategoriaConta
): Conta | undefined {
	return poupancasVinculadas(contas, correnteId).find((conta) => conta.categoria === proposito);
}

export interface AberturaDeConta {
	id: string;
	criadoEm: string;
	hoje: string;
	tipo: TipoConta;
	nome: string;
	descricao: string;
	saldoInicial: number;
	contaVinculadaId?: string;
	categoria?: CategoriaConta;
	lancamentoId?: string;
}

export function abrirConta(entrada: AberturaDeConta): { conta: Conta; lancamento?: Transacao } {
	const conta: Conta = {
		id: entrada.id,
		tipo: entrada.tipo,
		nome: entrada.nome,
		descricao: entrada.descricao,
		saldoInicial: 0,
		ativa: true,
		criadoEm: entrada.criadoEm
	};
	if (entrada.tipo === 'poupanca' && entrada.contaVinculadaId) {
		conta.contaVinculadaId = entrada.contaVinculadaId;
	}
	if (entrada.tipo === 'poupanca' && entrada.categoria) conta.categoria = entrada.categoria;

	if (entrada.saldoInicial <= 0 || !entrada.lancamentoId) {
		return { conta };
	}

	if (entrada.contaVinculadaId && entrada.tipo === 'poupanca') {
		return {
			conta,
			lancamento: registrarLinha({
				id: entrada.lancamentoId,
				criadoEm: entrada.criadoEm,
				data: entrada.hoje,
				descricao: `Depósito inicial de ${entrada.nome}`,
				tipo: 'transferencia',
				valor: entrada.saldoInicial,
				categoria: 'investimento',
				contaId: entrada.contaVinculadaId,
				contaDestinoId: entrada.id
			})
		};
	}

	return {
		conta,
		lancamento: registrarLinha({
			id: entrada.lancamentoId,
			criadoEm: entrada.criadoEm,
			data: entrada.hoje,
			descricao: `Saldo inicial de ${entrada.nome}`,
			tipo: 'entrada',
			valor: entrada.saldoInicial,
			categoria: 'outros',
			contaId: entrada.id
		})
	};
}
