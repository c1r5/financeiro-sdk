import { expect, test } from 'bun:test';
import { estadoDoSaldo, estadoDoUso } from './estado';

test('o uso do limite troca de cor nos limiares', () => {
	expect(estadoDoUso(80)).toBe('verde');
	expect(estadoDoUso(80.01)).toBe('amarelo');
	expect(estadoDoUso(100)).toBe('amarelo');
	expect(estadoDoUso(100.01)).toBe('vermelho');
	expect(estadoDoSaldo(0)).toBe('verde');
	expect(estadoDoSaldo(-5000)).toBe('verde');
	expect(estadoDoSaldo(900000)).toBe('verde');
});
