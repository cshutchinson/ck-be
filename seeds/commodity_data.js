
exports.seed = function(knex, Promise) {
  if(true){
    return knex('commodities').del().then(function(){
      return Promise.all([
        knex('commodities').insert({
          name: 'GC.1',
          price: '1116.50',
          update: new Date()
        }),
        knex('commodities').insert({
          name: 'SI.1',
          price: '14.27',
          update: new Date()
        }),
        knex('commodities').insert({
          name: 'HG.1',
          price: '2.058',
          update: new Date()
        }),
      ])
    })
  }
}
