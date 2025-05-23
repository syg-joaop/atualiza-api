exports.up = function (knex) {
    return knex.schema.hasTable("controle_versao").then(exists => {
        if (!exists) {
            return knex.schema.createTable("controle_versao", table => {
                table.increments("id").primary();
                table.string("versao", 10).notNullable();
                table.text("script").notNullable();
                table
                    .timestamp("aplicado_em")
                    .defaultTo(knex.fn.now())
                    .notNullable();
            });
        }
    });
}

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("controle_versao");
}
