export type EstadoIndicador = 'verde' | 'amarelo' | 'vermelho';
export declare function estadoDoUso(percentualUsado: number): EstadoIndicador;
export declare function estadoDoSaldo(_saldoCentavos: number): EstadoIndicador;
