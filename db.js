const Datastore = require('nedb');

let db = new Datastore('database/data.db');
module.exports =  {
  setup: function(cb) {
    db.loadDatabase(function (err) {
      cb({
        db: db,
        findOne (...args) {
          return new Promise((resolve, reject) => {
            this.db.findOne(...args, function(err, res) {
              if (err) return reject(err);

              resolve(res);
            })
          })
        },
        update (...args) {
          return new Promise((resolve, reject) => {
            db.update(...args, function (err, numReplaced, upsert) {
              if (err) return reject(err);

              resolve({numReplaced, upsert})
              // numReplaced = 1, upsert = { _id: 'id5', planet: 'Pluton', inhabited: false }
              // A new document { _id: 'id5', planet: 'Pluton', inhabited: false } has been added to the collection
            });
          });
        }
      });
    });

  }, 
};
