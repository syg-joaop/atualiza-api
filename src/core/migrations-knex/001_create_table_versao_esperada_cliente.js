
exports.up = function (knex) {
  return knex.schema.hasTable("versao_esperada_cliente").then(exists => {
    if (!exists) {
      return knex.schema.createTable("versao_esperada_cliente", table => {
        table.increments("id")();
        table.integer("cliente_id").primary();
        table.text("nome_cliente").notNullable();
        table.string("versao_esperada", 20).notNullable();
        table.string("versao_instalada", 20);
        table.timestamp("ultima_verificacao");
        table.text("status_conexao"); // 'online', 'offline', 'erro'
      });
    }
  });
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("versao_esperada_cliente");
}
