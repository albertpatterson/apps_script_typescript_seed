# Apps Script Typescript Seed
A seed for an Apps Script project using typescript

## Getting Started
1) Clone this Repo and install via npm
2) Create a new Apps Script. This can be easily accomplished from a Doc or Sheet or via Clasp as described at [Clasp Codelab: Create a New Project](https://codelabs.developers.google.com/codelabs/clasp#3). If using clasp, this will create new '.claps.json' and 'appsscript.json' files. Place these in the 'src/config' folder
3) execute ```npm run watch``` which will watch files for changes
4) develop your application under the 'src' folder
    * Function triggers (like onOpen) must be exported from index.ts to be correctly registered in the Apps Script 
5) Upload the built script 'dist/bundel.js'. This can simply be pasted into the online script editor, or better yet uploaded automatically via clasp as described at [Clasp Codelab: Pulling & Pushing Files](https://codelabs.developers.google.com/codelabs/clasp#4) You can even have clasp watch your dist folder to automatically upload a new build. Note: for this to work, place '.claps.json' and 'appsscript.json' under 'src/config' and they will automatically be copied to 'dist' 

## Additional Resources
* [Apps Script Overview](https://developers.google.com/apps-script/overview)
* [Clasp Codelab](https://codelabs.developers.google.com/codelabs/clasp#0)