const axios = require('axios')
const moment = require('axios')

class DetectCsv {

  constructor (dashes, db) {
    this.dashes = dashes;
    this.db = db
  }

  async setup (config) {
    this.config = config
  }

  async start (newCb) {
    const waitFor = (timeout) => {
      return new Promise((resolve) => setTimeout(resolve, timeout))
    }

    function CSVtoArray(fileText) {
      let lineCsvToArray = (text) => {
        var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
        var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
        // Return NULL if input string is not well formed CSV string.
        if (!re_valid.test(text)) return null;
        var a = [];                     // Initialize array to receive values.
        text.replace(re_value, // "Walk" the string using replace with callback.
            function(m0, m1, m2, m3) {
                // Remove backslash from \' in single quoted values.
                if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                // Remove backslash from \" in double quoted values.
                else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                else if (m3 !== undefined) a.push(m3);
                return ''; // Return empty string.
            });
        // Handle special case of empty last value.
        if (/,\s*$/.test(text)) a.push('');
        return a;
      }
      let fileRet = []
      for (let line of fileText.split('\n')) {
        fileRet.push(lineCsvToArray(line))
      }
      return fileRet
    };

    const findMatches = (body) => {
      let fileValues = CSVtoArray(body)
      let macs = [];
      let idx = 0;
      for (let line of fileValues) {
        if (line[this.config.csv_indexes.statusId]===this.config.statusToMatch) {
          let date = moment(line[this.config.csv_indexes.date], 'MMMM D, YYYY at hh:mma').toDate()
          macs.push({mac: line[this.config.csv_indexes.deviceId], timestamp: date, total: idx}) 
          idx++;
        }
      }
      return macs
    }

    let lastDate = null;

    while (true) {
      try {
        let res = await axios.get(this.config.csv_url);
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

module.exports = DetectCsv;
