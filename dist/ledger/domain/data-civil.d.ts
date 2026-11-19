/** Data de calendário, sem hora, no formato YYYY-MM-DD. */
export declare class DataCivil {
    private readonly iso;
    private constructor();
    static is_valid(valor: string): boolean;
    static from(valor: string): DataCivil;
    get value(): string;
    equals(outra: DataCivil): boolean;
    /** Comparação lexicográfica, válida porque o formato é YYYY-MM-DD. */
    naoPosteriorA(limite: DataCivil): boolean;
}
