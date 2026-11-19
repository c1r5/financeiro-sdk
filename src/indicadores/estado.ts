export type EstadoIndicador = 'verde' | 'amarelo' | 'vermelho';

export function estadoDoUso(percentualUsado: number): EstadoIndicador {
	if (percentualUsado > 100) return 'vermelho';
	if (percentualUsado > 80) return 'amarelo';
	return 'verde';
}

export function estadoDoSaldo(_saldoCentavos: number): EstadoIndicador {
	return 'verde';
}
