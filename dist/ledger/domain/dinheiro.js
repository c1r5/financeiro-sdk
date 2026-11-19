import { ErroDeDominio } from './erro';
/** Magnitude monetária em centavos. A direção fica no tipo do lançamento. */
export class Dinheiro {
    magnitude;
    constructor(magnitude) {
        this.magnitude = magnitude;
    }
    static is_valid(valor) {
        return Number.isFinite(valor);
    }
    static from(valor) {
        if (!Dinheiro.is_valid(valor)) {
            throw new ErroDeDominio('dinheiro_invalido');
        }
        return new Dinheiro(Math.abs(valor));
    }
    get value() {
        return this.magnitude;
    }
    equals(outro) {
        return this.magnitude === outro.value;
    }
}
//# sourceMappingURL=dinheiro.js.map