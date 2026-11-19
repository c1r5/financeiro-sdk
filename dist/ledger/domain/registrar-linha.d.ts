import type { CategoriaTransacao, Parcela, TipoTransacao, Transacao } from './transacao';
export interface NovaLinha {
    id: string;
    criadoEm: string;
    data: string;
    descricao: string;
    tipo: TipoTransacao;
    valor: number;
    categoria: CategoriaTransacao;
    contaId: string;
    contaDestinoId?: string;
    cartaoId?: string;
    faturaReferencia?: string;
    parcela?: Parcela;
    grupoParcelamentoId?: string;
}
export declare function registrarLinha(params: NovaLinha): Transacao;
