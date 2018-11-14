const DB = require('./db.js')
const {Detect} = require('./src/detect.js')
const {AmazonShopping} = require('./src/amazon.js')

const Prompt = require('prompt-promise');

const Puppeteer = require('prompt-promise');

DB.setup(async function(db) {
  let dashes = await db.findOne({type: 'dashes'}) || {};
  let headers = await db.findOne({type: 'headers'})||{};
  let detect = new Detect(dashes, headers.authorization);

  let amazon = new AmazonShopping();

  async function buy(dash) {
    await amazon.setup(false);
    let ret = await amazon.buy(dash.amazon);
    await amazon.destroy();
    return ret;
  }

  console.log("Setting up detection");
  console.log("Make sure your dash button is connected to the network and press the button.");
  detect.setup()
    .then(async () => {
      console.log("Starting detection");
      await detect.start((async function(dashes, mac, line) {
        if (dashes[mac]) {
          await buy(dashes[mac])
        } else {
          console.log("Unreqcognized MAC address connected: ", mac, line);
        }
      }).bind(this))
    })
    .then(() => console.log("Done"));
})
