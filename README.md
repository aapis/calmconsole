CalmConsole
===========

An on-screen console debugging tool intended for mobile devices were the console may be hidden or not supported.

How do I use this?
==================

* Download/clone the package
* Add ```<script src="/path/to/CalmConsole.min.js" type="text/javascript"></script>``` to your markup
* Fire up your console-less mobile device (or browser)
* Profit

Using CalmConsole
=================

You can invoke CC using the browser's built in console by calling ```calm.log('message to log');```, or by adding it directly into your code.  Don't want to ditch your beloved ```console.log()```?  No problem, CalmConsole will display any messages logged using the Console object as well (currently ```console.log```, ```console.warn``` and ```console.error``` are supported).

This sucks, I could make it better!
===================================

I'm always looking to improve my skills, and my projects, so fork away.  Anything marked as TODO (or any of the issues, obviously) are a good place to start.