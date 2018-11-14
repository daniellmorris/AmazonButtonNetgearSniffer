const puppeteer = require('puppeteer');

class AmazonShopping {

  constructor () {
    
  }

  async setup (isHeadless) {
    console.log("Setting up amazon stuff");
    this.browser = await puppeteer.launch({headless: !!isHeadless, 'args': ['--disable-infobars', '--no-sandbox', '--disable-setuid-sandbox']});// For WSL support args: ['--no-sandbox', '--disable-setuid-sandbox']
    this.page = await this.browser.newPage();
  }
  
  async destroy () {
    console.log("Destroying amazon stuff");
    await this.browser.close();
  }

  async insertUIAndWaitForDone () {
    let wasClicked = false;
    while (!wasClicked)  {
      try { 
        wasClicked = await this.page.evaluate(async () => {
          (function setupUi () {
              var shadowHTML =  "" 
              + "<style> "
              +"h1 {margin: 0px;margin-bottom:5px;color:#fff;background-color:#0026FF;}"
              +"h1.title:after {content:'Ui Setup ';}"
              +"h2 {margin: 0px;color:#333;}"
              +"h3 {margin: 0px;}"
              +".container {"
              +"font:normal normal 14px/1.4 Tahoma,Verdana,Sans-Serif;"
              +"color: grey;"
              +"width:500px;"
              +"border:1px solid #344150;"
              +"border-bottom:none;"
              +"background-color:white;"
              +"position:fixed;"
              +"right:10px;"
              +"bottom:-1px;"
              +"z-index:1000101;"
              +"-webkit-box-shadow:1px 1px 5px rgba(0,0,0,.2);"
              +"-moz-box-shadow:1px 1px 5px rgba(0,0,0,.2);"
              +"box-shadow:1px 1px 5px rgba(0,0,0,.2);"
              +"transition: all 0.5s ease;"
              +"}" 
              +"</style> "
              +"<div class='container'> This is a test<br>test</div>";
              window.shadowDomHost = document.createElement("div");
              //artoo.$(window.shadowDomHost).css("width","0px");
              //artoo.$(window.shadowDomHost).css("height","0px");
              //artoo.$(window.shadowDomHost).hide();
              window.shadowDomRoot = window.shadowDomHost.createShadowRoot();
              window.shadowDomRoot.innerHTML = shadowHTML;
              window.document.body.appendChild ( window.shadowDomHost)

              window.shadowDomRoot.querySelector(".container").innerHTML = ""
                +"<h1 class='title'></b></h1>"
                +" 1. Login to AWS <br>" 
                +" 2. Go to the product page you wish to purchase <br>" 
                +" 3. Turn on 1-click purchases or this will not work <br>" 
                +" 4. If the 1 click buy button is not on the page then you didn't do step 3<br>" 
                +" 5. When you are done click the done button <br>" 
                +" <button>done</button>"
                + "<br>"
                + "<br>"
                    +"";
          }) ()
              
          var buttonForAwShopUi = window.shadowDomRoot.querySelector("button");

          return new Promise(function(resolve) {
            buttonForAwShopUi.addEventListener('click', function() {
              resolve(true);  
            });
          });
        })
      } catch (e) {
        console.log("Going to keep looping until button is clicked", e.message);
      }
    }
  }

  async manualUserLogin () {
    let ret = null;
    try {
      console.log("Going to web page");
      await this.page.goto('https://www.amazon.com')

      console.log("Inserting and wating for done");
      await this.insertUIAndWaitForDone();     
      ret = {url: await this.page.url(), cookies: await this.page.cookies()};
      console.log("Done with ui", ret);
    } catch (e) {
      console.log(e);
    }
    return ret;
  }

  async buy (amazon) {
    let ret = null;
    try {
      console.log("Going to buy page");
      await this.page.setCookie(...amazon.cookies)
      await this.page.goto(amazon.buy_url || amazon.url) // || for backwards compatibility
      
      await this.page.waitForSelector('#oneClickBuyButton');

      await this.page.screenshot({path: 'pre-buy.png'});

      //await this.click
      await this.page.evaluate(async () => {
        let ret = document.querySelector('#oneClickBuyButton');
        console.log(ret);
        if (ret) {
          console.log("Should click")
          ret.click()
        }
        return true
      });
      await this.page.waitFor(10000);
      await this.page.screenshot({path: 'post-buy.png'});
    } catch (e) {
      console.log(e);
    }
    return ret;
  }
}

exports.AmazonShopping = AmazonShopping