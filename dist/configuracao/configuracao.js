import { ErroDeDominio } from '../ledger/domain/erro';
export function validarConfiguracao(configuracao) {
    const { geral, dividas, reserva } = configuracao.divisao;
    if (geral + dividas + reserva !== 100) {
        throw new ErroDeDominio('divisao_invalida');
    }
    return configuracao;
}
//# sourceMappingURL=configuracao.js.map