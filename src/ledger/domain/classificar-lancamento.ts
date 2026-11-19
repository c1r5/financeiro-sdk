import type { TipoTransacao } from './transacao';

export function isEntrada(tipo: TipoTransacao): boolean {
	return tipo === 'entrada';
}

export function isSaida(tipo: TipoTransacao): boolean {
	return tipo === 'saida' || tipo === 'pagamento-fatura';
}
