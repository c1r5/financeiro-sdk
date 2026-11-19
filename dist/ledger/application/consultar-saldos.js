import { calcularSaldos } from '../domain/calcular-saldos';
export async function consultarSaldos(repositorio, relogio) {
    const contas = await repositorio.listarContas();
    const transacoes = await repositorio.listarTransacoes();
    return calcularSaldos(contas, transacoes, relogio.hoje());
}
//# sourceMappingURL=consultar-saldos.js.map