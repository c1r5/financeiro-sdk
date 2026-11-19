import { expect, test } from 'bun:test';
import { CATEGORIAS, categoriasPorFluxo, ehDivida, labelCategoria } from './catalogo';

test('o catálogo separa fluxo e dívida', () => {
	expect(ehDivida('divida')).toBe(true);
	expect(ehDivida('impostos')).toBe(true);
	expect(ehDivida('alimentacao')).toBe(false);
	expect(ehDivida(undefined)).toBe(false);

	const transferencia = CATEGORIAS.find((c) => c.value === 'transferencia');
	const cartao = CATEGORIAS.find((c) => c.value === 'cartao-credito');
	expect(transferencia?.fluxo).toEqual([]);
	expect(cartao?.fluxo).toEqual([]);

	expect(categoriasPorFluxo('entrada').map((c) => c.value)).toEqual([
		'salario',
		'freelance',
		'rendimentos',
		'outros'
	]);
	expect(categoriasPorFluxo('saida').some((c) => c.value === 'alimentacao')).toBe(true);
	expect(categoriasPorFluxo('saida').some((c) => c.value === 'transferencia')).toBe(false);
	expect(labelCategoria('alimentacao')).toBe('Alimentação');
	expect(CATEGORIAS.some((c) => 'cor' in c)).toBe(false);
});
