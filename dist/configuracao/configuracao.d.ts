export interface DivisaoRenda {
    geral: number;
    dividas: number;
    reserva: number;
}
export interface Configuracao {
    moeda: string;
    divisao: DivisaoRenda;
    margemSeguranca: number;
}
export declare function validarConfiguracao(configuracao: Configuracao): Configuracao;
