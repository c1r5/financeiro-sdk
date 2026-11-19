import type { Conta } from '../domain/conta.ts';
import type { Transacao } from '../domain/transacao.ts';

/** Persistência do razão. O SDK não escolhe o banco. */
export interface RepositorioDoLivro {
	listarContas(): Promise<Conta[]>;
	gravarConta(conta: Conta): Promise<void>;
	listarTransacoes(): Promise<Transacao[]>;
	incluirTransacao(transacao: Transacao): Promise<void>;
	removerTransacao(id: string): Promise<void>;
}
