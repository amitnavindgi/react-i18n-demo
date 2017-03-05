import express from 'express';
import React from 'react';
import ReactDom from 'react-dom/server';
import App from './components/App';
import cookieParser from 'cookie-parser';
import acceptLanguage from 'accept-language';
import { addLocaleData, IntlProvider } from 'react-intl';
import fs from 'fs';
import path from 'path';

import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

//adding support for ru and en
addLocaleData([ru, en]);

//messages keeps translated msgs
const messages = {};
const localeData = {};

//fill up localedata with messages for ru and en
['en', 'ru'].forEach((locale) => {
  localeData[locale] = fs.readFileSync(path.join(__dirname, `../node_modules/react-intl/locale-data/${locale}.js`)).toString();
  messages[locale] = require(`../public/assets/${locale}.json`);
});

//setting up English and Russian locales as supported
acceptLanguage.languages(['en', 'ru']);

//set up express to listen on port 3001
const app = express();

//set port to 3001 if not provided thru env variables during start up
const PORT = process.env.PORT || 3001;

//log to confirm the start
app.listen(PORT, () => {
  console.log(`Server listening on: ${PORT}`); // eslint-disable-line no-console
});

app.use(cookieParser());
//Express serves the translation JSON files. 
//In production, use something like nginx instead
app.use('/public/assets', express.static('public/assets'));

const assetUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:8050' : '/';

//fetches a locale value from a cookie; 
//if none is found, then the HTTP Accept-Language header is processed
function detectLocale(req) {
  console.log("Locale in cookie : [" + req.cookies.locale + "]");
  const cookieLocale = req.cookies.locale;
  console.log("Locale in req header : [" + req.headers['accept-language'] + "]");
  return acceptLanguage.get(cookieLocale) || 'en';
}

//html that is returned to the client
function renderHTML(componentHTML, locale, initialNow) {
  return `
    <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hello React</title>
      </head>
      <body>
        <div id="react-view">${componentHTML}</div>
        <script type="application/javascript" src="${assetUrl}/public/assets/bundle.js"></script>
        <script type="application/javascript">${localeData[locale]}</script>
        <script type="application/javascript">window.INITIAL_NOW=${JSON.stringify(initialNow)}</script>
      </body>
    </html>
  `;
}

//called when there is a request(req) made to the server
app.use((req, res) => {
  const locale = detectLocale(req);
  console.log("Locale chosen : [" + locale + "]");
  
  const initialNow = Date.now();
  //IntlProvider child components will 
  //have access to internationalization functions
  const componentHTML = ReactDom.renderToString(
    //providing the translated messages to 
    //IntlProvider (all of those messages are now 
    //available to child components)
    <IntlProvider initialNow={initialNow} locale={locale} messages={messages[locale]}>
      <App />
    </IntlProvider>
  );

  console.log("Setting cookie expiry to 10 seconds ");
  res.cookie('locale', locale, { maxAge: 10 });
  
  //extending the renderHTML method so that 
  //we can insert locale-specific JavaScript 
  //into the generated HTML markup
  return res.end(renderHTML(componentHTML, locale, initialNow));
});