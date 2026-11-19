import { ErroDeDominio } from './erro.ts';

/** Magnitude monetária em centavos. A direção fica no tipo do lançamento. */
export class Dinheiro {
	private constructor(private readonly magnitude: number) {}

	static is_valid(valor: number): boolean {
		return Number.isFinite(valor);
	}

	static from(valor: number): Dinheiro {
		if (!Dinheiro.is_valid(valor)) {
			throw new ErroDeDominio('dinheiro_invalido');
		}
		return new Dinheiro(Math.abs(valor));
	}

	get value(): number {
		return this.magnitude;
	}

	equals(outro: Dinheiro): boolean {
		return this.magnitude === outro.value;
	}
}
