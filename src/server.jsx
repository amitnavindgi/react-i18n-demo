import express from 'express';
import React from 'react';
import ReactDom from 'react-dom/server';
import App from './components/App';
import cookieParser from 'cookie-parser';
import acceptLanguage from 'accept-language';
import { IntlProvider } from 'react-intl';

//setting up English and Russian locales as supported
acceptLanguage.languages(['en', 'ru']);

//set up express to listen on port 3001
const app = express();

const PORT = process.env.PORT || 3001;

//log to confirm the start
app.listen(PORT, () => {
  console.log(`Server listening on: ${PORT}`); // eslint-disable-line no-console
});

app.use(cookieParser());

const assetUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:8050' : '/';

//fetches a locale value from a cookie; 
//if none is found, then the HTTP Accept-Language header is processed
function detectLocale(req) {
  console.log("Locale in cookie : [" + req.cookies.locale + "]");
  const cookieLocale = req.cookies.locale;
  console.log("Locale in req header : [" + req.headers['accept-language'] + "]");
  return acceptLanguage.get(cookieLocale || req.headers['accept-language']) || 'en';
}

//html that is returned to the client
function renderHTML(componentHTML) {
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
      </body>
    </html>
  `;
}

//called when there is a request(req) made to the server
app.use((req, res) => {
  const locale = detectLocale(req);
  console.log("Locale chosen : [" + locale + "]");
  
  //IntlProvider child components will 
  //have access to internationalization functions
  const componentHTML = ReactDom.renderToString(
    <IntlProvider locale={locale}>
      <App />
    </IntlProvider>
  );

  console.log("Setting cookie expiry to 10 seconds ");
  res.cookie('locale', locale, { maxAge: 10 });
  
  return res.end(renderHTML(componentHTML));
});