//After the JavaScript is initialized, client.jsx will grab the 
//locale from the cookie and request the JSON file with the translations
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Cookie from 'js-cookie';
import { addLocaleData, IntlProvider } from 'react-intl';
//works well for fetch on client and server
import fetch from 'isomorphic-fetch';

const locale = Cookie.get('locale') || 'en';

fetch(`/public/assets/${locale}.json`)
  .then((res) => {
    if (res.status >= 400) {
      throw new Error('Bad response from server');
    }

    return res.json();
  })
  .then((localeData) => {
    addLocaleData(window.ReactIntlLocaleData[locale]);
    //IntlProvider child components will 
    //have access to internationalization functions and msgs
    ReactDOM.render(
    <IntlProvider initialNow={parseInt(window.INITIAL_NOW, 10)} locale={locale} messages={localeData}>
        <App />
    </IntlProvider>,
    document.getElementById('react-view')
    );
}).catch((error) => {
  console.error(error);
});