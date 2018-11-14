# AmazonButtonBuyAnything

This was designed for the NETGEAR WRN2000v5 router. It periodically queries the router logs and gets mac addresses that connected to it and the timestamp for those connections.

Assuming you setup the mac address to buy something it will then use Puppeteer to click the 1-click buy button for that item.

# Requirements

Node 8 is required because it uses async/await (7 may work)
I don't believe that this will run on an ARM processor because at least at one point google Puppeteer does not do that by default (Though i'm sure with some work you could get it working)

# NOTES
I purposly didn't use express because I wanted this to be able to run from within a local network without port forwarding

# Instructions For Google Wifi Router
1. Use amazon shoping app to setup a button but stop before setting it up which product to buy
2. Go to the google wifi app, name the button with some name (ex TideButton)
3. Create an IFTTT applet that detects a connection to Google Wifi and logs to a Google Spreadsheet (An applet should exist for this)
4. Go to the google spreadsheet and click file -> publish to web. 
   publish it as a CSV and make sure it auto publishes updates (Those may not happen immediatly unless you go to the sheet and refresh the page)
5. Run the following to setup the button to actually buy something
   ```BASH
   node setup.js
   ```
   This should take you through step by step instructions for setup
6. Run this and keep it running.
   ```BASH
   node listen_and_buy.js
   ```
   This should take you through step by step instructions for setup

# Instructions For Netgear WRN2000v5 Router ( I'm not entirely sure this still works )

1. Use amazon shoping app to setup a button but stop before setting it up which product to buy
2. You may also want to block your button from actually connecting to the internet
3. run node setup.js and follow instructions to setup your button
4. run node listen_and_buy.js - Let it run forever and click to purchase 


# Disclamer
I make no guarentee that this will not do some sort of double buy in some cases. Do your own testing and if you find an issue feel free to fix it and submit a pull request. I should eventually get to it :)
