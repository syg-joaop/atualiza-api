import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { readdirSync } from "fs";
import { join } from "path";
import { KnexConnection } from "src/core/scripts/knex";

@Injectable()
export class MigrateApiService {
  private connection: KnexConnection = new KnexConnection();

  /**
   *? Atualiza a tabela de controle de versão do cliente e a tabela central.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async atualizaTabelaCentral() {
    try {
      const baseDir = process.cwd();

      // --- Migrações centrais via Knex ---
      const migCentralDir = join(baseDir, "src", "core", "migrations-knex");

      const knexCentral = await this.connection.conexao();

      const centralFiles = readdirSync(migCentralDir)
        .filter((f) => f.endsWith(".js"))
        .sort();

      const appliedCentral =
        await knexCentral("knex_migrations").select("name");
      const appliedNames = appliedCentral.map((r) => r.name);

      const pendentesCentral = centralFiles.filter(
        (f) => !appliedNames.includes(f)
      );

      for (const nome of pendentesCentral) {
        await this.connection.makeMigration({
          name: nome,
          directory: migCentralDir,
        });
      }

      // --- Atualiza cada cliente ---
      const clientes = await knexCentral
        .select("idempresa")
        .from("conexoes_clientes_cloud");

      const migClientesDir = migCentralDir;
      const clientFiles = readdirSync(migClientesDir)
        .filter((f) => f.endsWith(".js"))
        .sort();

      for (const idempresa of clientes) {
        try {
          const knexCliente = await this.connection.conexaoCliente(idempresa);

          const historico = await knexCliente
            .select("script")
            .from("controle_versao");
          const aplicados = historico.map((r) => r.script);

          // escolhe a partir de '002' (o 001 é o nosso script da tabela central do autentica)
          const arquivos = clientFiles.filter((f) => {
            const versaoCli = Number(f.split("_")[0]);
            return versaoCli >= 2 && !aplicados.includes(f);
          });

          for (const arq of arquivos) {
            await knexCliente.migrate.up({
              name: arq,
              directory: migClientesDir,
            });

            //pega o começo do nome do arquivo pra versionar (ex: 002)
            const versaoCli = arq.split("_")[0];
            await knexCliente("controle_versao")
              .insert({
                versao: versaoCli,
                script: arq,
                aplicado_em: new Date(),
              })
              .onConflict("script")
              .merge({
                versao: versaoCli,
                aplicado_em: new Date(),
              });

            // Atualiza a tabela central com a versão instalada do cliente
            await knexCentral("versao_esperada_cliente")
              .insert({
                cliente_id: idempresa,
                versao_instalada: versaoCli,
                status_conexao: "ativo",
              })
              .onConflict("cliente_id")
              .merge({
                versao_instalada: versaoCli,
                status_conexao: "ativo",
              });
          }
        } catch (err) {
          // Se falhar, atualiza a tabela central com status offline
          console.error(`Erro ao migrar cliente ${idempresa.idempresa}: `, err);
          await knexCentral("versao_esperada_cliente")
            .update({ status_conexao: "erro" })
            .where({ cliente_id: idempresa })
            .onConflict("cliente_id")
            .merge({ status_conexao: "erro" });
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar tabela central: ", error);
      throw new Error("Erro ao atualizar tabela central: " + error.message);
    }
  }

  /**
   *? Atualiza a tabela de controle de versão de um cliente específico.
   * @param idempresa - ID da empresa a ser atualizada
   */
  async atualizaClienteEspecifico(idempresa: number) {
    try {
      const baseDir = process.cwd();
      const migCentralDir = join(baseDir, "src", "core", "migrations-knex");

      const knexCentral = await this.connection.conexao();

      // Verifica se o cliente existe
      const clienteExiste = await knexCentral("conexoes_clientes_cloud")
        .where({ idempresa })
        .first();

      if (!clienteExiste) {
        throw new Error(`Cliente com ID ${idempresa} não encontrado`);
      }

      const clientFiles = readdirSync(migCentralDir)
        .filter((f) => f.endsWith(".js"))
        .sort();

      try {
        const knexCliente = await this.connection.conexaoCliente(idempresa);

        const historico = await knexCliente
          .select("script")
          .from("controle_versao");
        const aplicados = historico.map((r) => r.script);

        // escolhe a partir de '002' (o 001 é o nosso script da tabela central do autentica)
        const arquivos = clientFiles.filter((f) => {
          const versaoCli = Number(f.split("_")[0]);
          return versaoCli >= 2 && !aplicados.includes(f);
        });

        for (const arq of arquivos) {
          await knexCliente.migrate.up({
            name: arq,
            directory: migCentralDir,
          });

          //pega o começo do nome do arquivo pra versionar (ex: 002)
          const versaoCli = arq.split("_")[0];
          await knexCliente("controle_versao")
            .insert({
              versao: versaoCli,
              script: arq,
              aplicado_em: new Date(),
            })
            .onConflict("script")
            .merge({
              versao: versaoCli,
              aplicado_em: new Date(),
            });

          // Atualiza a tabela central com a versão instalada do cliente
          await knexCentral("versao_esperada_cliente")
            .insert({
              cliente_id: idempresa,
              versao_instalada: versaoCli,
              status_conexao: "ativo",
            })
            .onConflict("cliente_id")
            .merge({
              versao_instalada: versaoCli,
              status_conexao: "ativo",
            });
        }

        console.log(`Cliente ${idempresa} atualizado com sucesso`);
        return {
          success: true,
          message: `Cliente ${idempresa} atualizado com sucesso`,
        };
      } catch (err) {
        // Se falhar, atualiza a tabela central com status offline
        console.error(`Erro ao migrar cliente ${idempresa}: `, err);
        await knexCentral("versao_esperada_cliente")
          .update({ status_conexao: "offline" })
          .where({ cliente_id: idempresa })
          .onConflict("cliente_id")
          .merge({ status_conexao: "offline" });

        throw new Error(
          `Erro ao atualizar cliente ${idempresa}: ${err.message}`
        );
      }
    } catch (error) {
      console.error(
        `Erro ao atualizar cliente específico ${idempresa}: `,
        error
      );
      throw new Error(
        `Erro ao atualizar cliente específico ${idempresa}: ${error.message}`
      );
    }
  }
}
