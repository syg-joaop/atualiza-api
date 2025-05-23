export interface IClienteDb {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface IVersaoEsperadaCliente {
    clienteId: number;
    nomeCliente: string;
    versaoEsperada: string;
    versaoInstalada: string;
    statusConexao: string;
}