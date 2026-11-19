/** Magnitude monetária em centavos. A direção fica no tipo do lançamento. */
export declare class Dinheiro {
    private readonly magnitude;
    private constructor();
    static is_valid(valor: number): boolean;
    static from(valor: number): Dinheiro;
    get value(): number;
    equals(outro: Dinheiro): boolean;
}
