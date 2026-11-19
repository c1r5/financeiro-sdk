export function estadoDoUso(percentualUsado) {
    if (percentualUsado > 100)
        return 'vermelho';
    if (percentualUsado > 80)
        return 'amarelo';
    return 'verde';
}
export function estadoDoSaldo(_saldoCentavos) {
    return 'verde';
}
//# sourceMappingURL=estado.js.map