
const DB = require('./db.js');
const {Detect} = require('./src/detect.js');
const {AmazonShopping} = require('./src/amazon.js')

const Prompt = require('prompt-promise');
const config = require('./config');

const Puppeteer = require('prompt-promise');

DB.setup(async function(db) {
  let dashes = await db.findOne({type: 'dashes'}) || {};
  let lastSetupCookies = await db.findOne({type: 'last_setup_cookies'}) || {};
  let detect = new Detect(dashes, db, config.detect.type);

  let amazon = new AmazonShopping();

  async function setupAmazon() {
    await amazon.setup();
    let ret = await amazon.manualUserLogin(lastSetupCookies.cookies);
    await amazon.destroy();
    return ret;
  }
  
  if (process.env.DEBUG_FOR_DASH) {
    dashes[process.env.DEBUG_FOR_DASH] = {description: await Prompt("Enter description: ")};
    dashes.type = 'dashes';
    dashes[process.env.DEBUG_FOR_DASH].amazon = await setupAmazon();
    let upRet = await db.update({ type: 'dashes' }, dashes, { upsert: true })
    if (dashes[process.env.DEBUG_FOR_DASH].amazon && dashes[process.env.DEBUG_FOR_DASH].amazon.cookies) { 
      await db.update({ type: 'last_setup_cookies' }, {type: 'last_setup_cookies', cookies: dashes[process.env.DEBUG_FOR_DASH].amazon.cookies}, { upsert: true })
    }
    return
  }

  console.log("Setting up detection");
  console.log("Make sure your dash button is connected to the network and press the button.");
  detect.setup(config.detect[config.detect.type])
    .then(async () => {
      console.log("Starting detection");
      await detect.start((async function(dashes, mac, line) {
        if (dashes[mac]) {
          console.log("Already configured dash: ", mac, dashes[mac].description);
          let res = (await Prompt('Re-configure device?(yes/no):')).toLowerCase();
          if (res==='y' || res==='yes') {
            res = (await Prompt('Delete device?(yes/no):')).toLowerCase();
            if (res==='y' || res==='yes') {
              delete dashes[mac];
              let upRet = await db.update({ type: 'dashes' }, dashes, { upsert: true })
            } else {
              res = (await Prompt('Setup different amazon shopping settings (yes/no):')).toLowerCase();

              if (!dashes[mac].amazon) {
                dashes[mac].amazon = await setupAmazon();
                if (dashes[mac].amazon) { 
                  let upRet = await db.update({ type: 'dashes' }, dashes, { upsert: true })
              
                  await db.update({ type: 'last_setup_cookies' }, {type: 'last_setup_cookies', cookies: dashes[mac].amazon.cookies}, { upsert: true })
                } else {
                  console.log("Failed to re-configure dash button", mac, dash[mac].description);
                }
              }

            }
          }
        } else {
          console.log("New MAC id detectied: ", mac);
          if (!dashes[mac]) {
            let res = (await Prompt('Is this a dash button (yes/no):')).toLowerCase();
            if (res==='y' || res==='yes') {
              dashes[mac] = {description: await Prompt("Enter description: ")};
              dashes.type = 'dashes';

              console.log("Go to amazon");
              dashes[mac].amazon = await setupAmazon();
              
              let upRet = await db.update({ type: 'dashes' }, dashes, { upsert: true })
              
              if (dashes[mac].amazon && dashes[mac].amazon.cookies) { 
                await db.update({ type: 'last_setup_cookies' }, {type: 'last_setup_cookies', cookies: dashes[mac].amazon.cookies}, { upsert: true })
              }

              console.log("Done with amazon");
            }
          }
        }
      }).bind(this))
    })
    .then(() => console.log("Done"))
    .catch(err => console.log(err))
})
