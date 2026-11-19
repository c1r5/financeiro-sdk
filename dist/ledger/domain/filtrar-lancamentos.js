export function filtrarPorMes(transacoes, mes, ano) {
    const mesStr = String(mes).padStart(2, '0');
    const prefixo = `${ano}-${mesStr}`;
    return transacoes.filter((t) => t.data.startsWith(prefixo));
}
export function filtrarPorTipo(transacoes, tipo) {
    return transacoes.filter((t) => t.tipo === tipo);
}
export function buscar(transacoes, busca) {
    const buscaLower = busca.toLowerCase();
    return transacoes.filter((t) => t.descricao.toLowerCase().includes(buscaLower) ||
        t.categoria.toLowerCase().includes(buscaLower));
}
//# sourceMappingURL=filtrar-lancamentos.js.map