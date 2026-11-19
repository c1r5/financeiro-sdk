export class ErroDeDominio extends Error {
    codigo;
    constructor(codigo) {
        super(codigo);
        this.name = 'ErroDeDominio';
        this.codigo = codigo;
    }
}
//# sourceMappingURL=erro.js.map