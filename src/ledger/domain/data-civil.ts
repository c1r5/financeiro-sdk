import { ErroDeDominio } from './erro';

const FORMATO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data de calendário, sem hora, no formato YYYY-MM-DD. */
export class DataCivil {
	private constructor(private readonly iso: string) {}

	static is_valid(valor: string): boolean {
		const match = FORMATO.exec(valor);
		if (!match) return false;
		const ano = Number(match[1]);
		const mes = Number(match[2]);
		const dia = Number(match[3]);
		const data = new Date(Date.UTC(ano, mes - 1, dia));
		return (
			data.getUTCFullYear() === ano &&
			data.getUTCMonth() === mes - 1 &&
			data.getUTCDate() === dia
		);
	}

	static from(valor: string): DataCivil {
		if (!DataCivil.is_valid(valor)) {
			throw new ErroDeDominio('data_civil_invalida');
		}
		return new DataCivil(valor);
	}

	get value(): string {
		return this.iso;
	}

	equals(outra: DataCivil): boolean {
		return this.iso === outra.value;
	}

	/** Comparação lexicográfica, válida porque o formato é YYYY-MM-DD. */
	naoPosteriorA(limite: DataCivil): boolean {
		return this.iso <= limite.value;
	}
}
