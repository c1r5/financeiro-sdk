import type { Transacao } from './transacao';

export function ordenar(transacoes: Transacao[]): Transacao[] {
	return [...transacoes].sort((a, b) => {
		const cmpData = a.data.localeCompare(b.data);
		if (cmpData !== 0) return cmpData;
		return a.criadoEm.localeCompare(b.criadoEm);
	});
}
