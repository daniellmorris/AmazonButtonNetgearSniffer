const axios = require('axios')

class Detect {

  constructor (dashes, authorization) {
    this.dashes = dashes;
    this.authorization = authorization
  }

  async setup () {
  }

  async start (newCb) {
    const waitFor = (timeout) => {
      return new Promise((resolve) => setTimeout(resolve, timeout))
    }


    axios.defaults.headers.common['Authorization'] = this.authorization;

    const findMatches = (body) => {
      const regex = /([0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}),\s(.*)/g;
      let m;

      let macs = [];
      while ((m = regex.exec(body)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        macs.push({mac: m[1], timestamp: new Date(m[2]), total: m[0]});
      }
      return macs;
    }

    let lastDate = null;

    while (true) {
      try {
        let res = await axios.get('http://192.168.1.1/FW_log.htm');
        let r = findMatches(res.data);
        let newLastDate = lastDate
        for (let o of r) {
          if (lastDate===null || o.timestamp > lastDate) {
            if (newLastDate!== null && lastDate!==null) { 
              await newCb(this.dashes, o.mac, o.total)
            }
          }
          if (newLastDate===null || o.timestamp > newLastDate) {
            newLastDate = o.timestamp;
          }
        }
        lastDate = newLastDate;
        
      } catch (e) {
        console.log("ERROR", e);  
      }

      await waitFor(1000);
    }
  }
}

exports.Detect = Detect;
