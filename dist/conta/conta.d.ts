import type { CategoriaConta, Conta, TipoConta } from '../ledger/domain/conta';
import type { Transacao } from '../ledger/domain/transacao';
export declare function poupancasVinculadas(contas: Conta[], correnteId: string): Conta[];
export declare function poupancaDoProposito(contas: Conta[], correnteId: string, proposito: CategoriaConta): Conta | undefined;
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
export declare function abrirConta(entrada: AberturaDeConta): {
    conta: Conta;
    lancamento?: Transacao;
};
