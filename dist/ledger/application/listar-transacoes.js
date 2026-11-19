import { buscar, filtrarPorMes, filtrarPorTipo } from '../domain/filtrar-lancamentos';
import { ordenar } from '../domain/ordenar-lancamentos';
export async function listarTransacoes(repositorio, filtro = {}) {
    let lista = ordenar(await repositorio.listarTransacoes());
    if (filtro.mes !== undefined && filtro.ano !== undefined) {
        lista = filtrarPorMes(lista, filtro.mes, filtro.ano);
    }
    if (filtro.tipo !== undefined) {
        lista = filtrarPorTipo(lista, filtro.tipo);
    }
    if (filtro.texto !== undefined) {
        lista = buscar(lista, filtro.texto);
    }
    return lista;
}
//# sourceMappingURL=listar-transacoes.js.map