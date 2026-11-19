import type { CategoriaTransacao } from '../ledger/domain/transacao';
export type FluxoCategoria = 'entrada' | 'saida';
export interface Categoria {
    value: CategoriaTransacao;
    label: string;
    fluxo: FluxoCategoria[];
    grupo?: 'divida';
}
export declare const CATEGORIAS: Categoria[];
export declare function categoriasPorFluxo(fluxo: FluxoCategoria): Categoria[];
export declare function labelCategoria(categoria: CategoriaTransacao): string;
export declare function ehDivida(categoria: CategoriaTransacao | undefined): boolean;
