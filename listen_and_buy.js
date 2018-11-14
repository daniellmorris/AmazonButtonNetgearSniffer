const DB = require('./db.js')
const {Detect} = require('./src/detect.js')
const {AmazonShopping} = require('./src/amazon.js')

const Prompt = require('prompt-promise');

const Puppeteer = require('prompt-promise');
const config = require('./config');

DB.setup(async function(db) {
  let dashes = await db.findOne({type: 'dashes'}) || {};
  let detect = new Detect(dashes, db, config.detect.type);

  let amazon = new AmazonShopping();

  async function buy(dash) {
    await amazon.setup(config.amazon.headless);
    let ret = await amazon.buy(dash.amazon, dash.description);
    await amazon.destroy();
    return ret;
  }

  if (process.env.DEBUG_FOR_DASH) {
    await buy(dashes[process.env.DEBUG_FOR_DASH]||{})
    return
  }

  console.log("Setting up detection");
  console.log("Make sure your dash button is connected to the network and press the button.");
  detect.setup(config.detect[config.detect.type])
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
