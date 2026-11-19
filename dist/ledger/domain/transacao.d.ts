export type TipoTransacao = 'entrada' | 'saida' | 'transferencia' | 'pagamento-fatura' | 'gasto-cartao';
export type CategoriaTransacao = 'salario' | 'freelance' | 'rendimentos' | 'alimentacao' | 'mercado' | 'farmacia' | 'transporte' | 'saude' | 'lazer' | 'educacao' | 'moradia' | 'contas' | 'assinaturas' | 'investimento' | 'poupanca' | 'transferencia' | 'cartao-credito' | 'divida' | 'impostos' | 'outros';
export interface Parcela {
    atual: number;
    total: number;
}
/** Linha do razão. O valor é a magnitude em centavos, sempre não negativa. */
export interface Transacao {
    id: string;
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
    criadoEm: string;
}
