/** Conta de datas civis em UTC. O fuso local não entra no resultado. */
export function diasNoMes(ano, mes) {
    return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}
export function dataUtc(ano, mes, dia) {
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    const anoUtc = data.getUTCFullYear();
    const mesUtc = String(data.getUTCMonth() + 1).padStart(2, '0');
    const diaUtc = String(data.getUTCDate()).padStart(2, '0');
    return `${anoUtc}-${mesUtc}-${diaUtc}`;
}
export function partes(iso) {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return { ano, mes, dia };
}
export function somarDias(iso, dias) {
    const { ano, mes, dia } = partes(iso);
    return dataUtc(ano, mes, dia + dias);
}
export function diaDaSemana(iso) {
    const { ano, mes, dia } = partes(iso);
    return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}
/** `referencia` é `YYYY-MM`. Meses negativos usam a mesma divisão de `Math.floor`. */
export function avancarMes(referencia, meses) {
    const [ano, mes] = referencia.split('-').map(Number);
    const indice = ano * 12 + (mes - 1) + meses;
    const anoNovo = Math.floor(indice / 12);
    const mesNovo = indice - anoNovo * 12;
    return `${anoNovo}-${String(mesNovo + 1).padStart(2, '0')}`;
}
//# sourceMappingURL=calendario.js.map