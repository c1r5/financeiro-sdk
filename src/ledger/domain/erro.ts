export class ErroDeDominio extends Error {
	readonly codigo: string;

	constructor(codigo: string) {
		super(codigo);
		this.name = 'ErroDeDominio';
		this.codigo = codigo;
	}
}
