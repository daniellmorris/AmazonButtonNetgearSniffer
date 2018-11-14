const axios = require('axios')

class Detect {

  constructor (dashes, db, type='csv') {
    this.dashes = dashes;
    this.detectType = type;
    console.log('./detect_'+type+'.js')
    let DetectClass = require('./detect_'+type+'.js')
    console.log(DetectClass)
    this.detection = new DetectClass(dashes, db)
  }

  async setup (config) {
    return this.detection.setup(config)
  }

  start (newCb) {
    return this.detection.start(newCb)
  }
}

exports.Detect = Detect;
