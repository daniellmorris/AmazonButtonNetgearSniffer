const axios = require('axios')

class DetectWrn {

  constructor (dashes, db) {
    this.dashes = dashes;
    this.db = db
  }

  async setup (config) {
    const changeUserPass = async (headers) => {
      let user = await Prompt("Netgear WRN2000v5 Username: ");
      let pass = await Prompt("Netgear WRN2000v5 Password: ");

      headers.authorization = "Basic " + Buffer.from(user + ":" + pass).toString('base64');
      headers.type = 'headers';
      
      let upRet = await db.update({ type: 'headers' }, headers, { upsert: true })
      console.log("Update return", upRet);

      return headers;
    }
    let headers = await this.db.findOne({type: 'headers'})||{};

    if (!headers || !headers.authorization) {
      headers = await changeUserPass(headers);
    } else {
      let res = (await Prompt('Change username and password (yes/no):')).toLowerCase();
      if (res==='y' || res==='yes') {
        headers = await changeUserPass(headers);
      }
    }
    this.authorization = headers.authorization
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

module.exports = DetectWrn;
