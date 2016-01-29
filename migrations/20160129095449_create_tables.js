
exports.up = function(knex, Promise) {
  return knex.schema.createTable('commodities', function(table){
    table.increments();
    table.string('name');
    table.string('price');
    table.timestamp('update');
  });
};


exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('commodities')
};
