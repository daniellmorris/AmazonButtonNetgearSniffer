# AmazonButtonNetgearSniffer

This was designed for the NETGEAR WRN2000v5 router. It periodically queries the router logs and gets mac addresses that connected to it and the timestamp for those connections.

Assuming you setup the mac address to buy something it will then use Puppeteer to click the 1-click buy button for that item.

# Requirements

Node 8 is required because it uses async/await (7 may work)
I don't believe that this will run on an ARM processor because at least at one point google Puppeteer does not do that by default (Though i'm sure with some work you could get it working)

# Instructions

1. Connect your button to your netgear router - Don't set it up to actually buy something though.
2. You may also want to block your button from actually connecting to the internet
3. run node setup.js and follow instructions to setup your button
4. run node listen_and_buy.js - Let it run forever and click to purchase 


# Disclamer
I make no guarentee that this will not do some sort of double buy in some cases. Do your own testing and if you find an issue feel free to fix it and submit a pull request. I should eventually get to it :)
