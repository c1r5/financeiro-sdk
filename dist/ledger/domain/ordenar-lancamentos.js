export function ordenar(transacoes) {
    return [...transacoes].sort((a, b) => {
        const cmpData = a.data.localeCompare(b.data);
        if (cmpData !== 0)
            return cmpData;
        return a.criadoEm.localeCompare(b.criadoEm);
    });
}
//# sourceMappingURL=ordenar-lancamentos.js.map