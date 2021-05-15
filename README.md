# ![](chrome/images/icon48.png)aeilgeoir 

A web browser extension that transforms a curated list of websites into Irish.

Download the extension [here](https://chrome.google.com/webstore/detail/gaeilgeoir/boljhhcnjbdijgbledlnokiianknolel) for Chrome,
and [here](https://addons.mozilla.org/ga-IE/firefox/addon/gaeilgeoir) for Firefox.

## Adding Translations

Support for new websites (e.g. `website.com`) can be added directly as a JSON file under `translations/website.com.json`.

Updates to the universal rules (which are applied to every website) can be made to `translations/website.com.json`.

CSV files with a list of currently missing translations can be generated for a website by following these steps:

Right click anywhere on the web page and choose 'Download translation template file'. This will trigger a CSV file download that can then be edited in e.g. Excel.

The edited CSV file can then be used to update the files in `translations/` by running `scripts/jsonify.py {PATH_TO_CSV_FILE}`.

## Testing Your Changes

To test changes to translation files for site specific translations, you need to push your changes to a fork / branch and update the URL used in `chrome/gaeilgeoir.js` (in the `fetchDomainTranslations` function `fetch` call).

### Chrome

To test local changes to the extension, go to `chrome://extensions/` in your browser.

Click 'Load Unpacked', navigate to the `Gaeilgeoir/chrome` directory and hit 'Select' (Developer Mode most be enabled in the top right of the screen).

To pick up changes you've made locally you must hit the refresh/reload button on the extension card in `chrome://extensions/`.

### Firefox

Zip your files so that symbolically linked files are resolved: e.g. `cd firefox/ &&  zip -r firefox.zip * `

Go to `about:debugging#/runtime/this-firefox` in your browser.

Click 'Load Temporary Add-on...', navigate to your zip file directory and hit 'Open'.

To pick up changes you've made locally you must hit the 'Reload' button on the bottom of extension card in `about:debugging#/runtime/this-firefox`.
