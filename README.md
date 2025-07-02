# Pen Pal

Pen Pal is an AI powered assistant that will analyze web requests as you conduct a penetration test for a web application.

- Findings are automatically displayed in the browser in real time.
- Possible attack vectors are highlighted with example payloads.
- Great at identifying hidden routes and sensitive data that may often be overlooked.

## Presentation

A power point presentation can be found in the presentation folder of this repo.
[Link to Presentation](./presentation/penpal_presentation.pptx)

## Adding the Firefox Extension

1. **Open Firefox** and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select the `manifest.json` file from the extension's directory.
4. The extension will be loaded temporarily for development and testing.

> **Note:** The extension will be removed when you restart Firefox. Repeat these steps to reload it.

> **Note:** You will need to manually add your APIs URL to the `pen-pal-extension/background.js` file in the variable `API_URL`. If you are running with the default configurations then everything is set for you.

## Server Documentation

For information about the server component, please see the `README.md` inside the `pen-pal-server` folder.
[View the pen-pal-server README here.](./pen-pal-server/README.md)
