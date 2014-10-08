# Skelly
**A base/utils for web development with [live-data](http://npmjs.org/package/live-data) and [dom-temple](http://npmjs.org/package/dom-temple)**

## Ideas:
- Modular
- Have an extensible base for getting started but not necessary
- Share as much code a possible between client and server
- A bunch of modules with integration modules (e.g. dom-temple does templating, live-binders binds live models to dom elements and alive-temple uses live-binders to do templating)

## TODO:
**Short Term:**

**Long Term:**
- Publish live-binders
- alive-temple

## Implementation Overview:

For deploying primus to production, do nothing special!
The suggested method is to run a server, pull the primus code down from it, minify it, then push it onto some external host!