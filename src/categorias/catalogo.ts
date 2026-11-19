import type { CategoriaTransacao } from '../ledger/domain/transacao';

export type FluxoCategoria = 'entrada' | 'saida';

export interface Categoria {
	value: CategoriaTransacao;
	label: string;
	fluxo: FluxoCategoria[];
	grupo?: 'divida';
}

const META: Record<CategoriaTransacao, Omit<Categoria, 'value'>> = {
	salario: { label: 'Salário', fluxo: ['entrada'] },
	freelance: { label: 'Freelance', fluxo: ['entrada'] },
	rendimentos: { label: 'Rendimentos', fluxo: ['entrada'] },
	alimentacao: { label: 'Alimentação', fluxo: ['saida'] },
	mercado: { label: 'Mercado', fluxo: ['saida'] },
	farmacia: { label: 'Farmácia', fluxo: ['saida'] },
	saude: { label: 'Saúde', fluxo: ['saida'] },
	transporte: { label: 'Transporte', fluxo: ['saida'] },
	moradia: { label: 'Moradia', fluxo: ['saida'] },
	contas: { label: 'Contas & Consumo', fluxo: ['saida'] },
	assinaturas: { label: 'Assinaturas', fluxo: ['saida'] },
	lazer: { label: 'Lazer', fluxo: ['saida'] },
	educacao: { label: 'Educação', fluxo: ['saida'] },
	investimento: { label: 'Investimento', fluxo: ['saida'] },
	poupanca: { label: 'Poupança', fluxo: ['saida'] },
	divida: { label: 'Dívida', fluxo: ['saida'], grupo: 'divida' },
	impostos: { label: 'Impostos', fluxo: ['saida'], grupo: 'divida' },
	outros: { label: 'Outros', fluxo: ['entrada', 'saida'] },
	transferencia: { label: 'Transferência', fluxo: [] },
	'cartao-credito': { label: 'Cartão de Crédito', fluxo: [] }
};

const ORDEM: CategoriaTransacao[] = [
	'salario',
	'freelance',
	'rendimentos',
	'alimentacao',
	'mercado',
	'farmacia',
	'saude',
	'transporte',
	'moradia',
	'contas',
	'assinaturas',
	'lazer',
	'educacao',
	'investimento',
	'poupanca',
	'divida',
	'impostos',
	'outros',
	'transferencia',
	'cartao-credito'
];

export const CATEGORIAS: Categoria[] = ORDEM.map((value) => ({ value, ...META[value] }));

export function categoriasPorFluxo(fluxo: FluxoCategoria): Categoria[] {
	return CATEGORIAS.filter((categoria) => categoria.fluxo.includes(fluxo));
}

export function labelCategoria(categoria: CategoriaTransacao): string {
	return META[categoria]?.label ?? categoria;
}

export function ehDivida(categoria: CategoriaTransacao | undefined): boolean {
	return categoria !== undefined && META[categoria]?.grupo === 'divida';
}
