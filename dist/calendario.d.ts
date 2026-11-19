/** Conta de datas civis em UTC. O fuso local não entra no resultado. */
export declare function diasNoMes(ano: number, mes: number): number;
export declare function dataUtc(ano: number, mes: number, dia: number): string;
export declare function partes(iso: string): {
    ano: number;
    mes: number;
    dia: number;
};
export declare function somarDias(iso: string, dias: number): string;
export declare function diaDaSemana(iso: string): number;
/** `referencia` é `YYYY-MM`. Meses negativos usam a mesma divisão de `Math.floor`. */
export declare function avancarMes(referencia: string, meses: number): string;
