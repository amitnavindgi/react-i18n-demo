import React, { Component } from 'react';
import LocaleButton from './LocaleButton';
import {
  FormattedDate,
  FormattedRelative,
  FormattedNumber,
  FormattedMessage,
  intlShape,
  injectIntl,
  defineMessages,
} from 'react-intl';

const propTypes = {
  intl: intlShape.isRequired,
};

const messages = defineMessages({
  counting: {
    id: 'app.counting',
    defaultMessage: 'I need to buy {count, number} {count, plural, one {apple} other {apples}}'
  },
  helloWorld2: {
    id: 'app.hello_world2',
    defaultMessage: 'Hello World 2!',
  },
});

//1. To get the translated message, we call the
//formatMessage method and pass a message object as a parameter.
//2. Message object must have unique id and defaultValue attributes.
//3. We use defineMessages from React Intl to define such objects as shown above.
class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>
          <FormattedMessage
            id="app.hello_world"
            defaultMessage="Hello World!"
            description="Hello world header greeting"
          />
        </h1>
        <h1>{this.props.intl.formatMessage(messages.helloWorld2)}</h1>
        <LocaleButton locale={this.props.intl.locale} />
        <div>{this.props.intl.formatMessage(messages.counting, { count: 1 })}</div>
        <div>{this.props.intl.formatMessage(messages.counting, { count: 2 })}</div>
        <div>{this.props.intl.formatMessage(messages.counting, { count: 5 })}</div>
        <div><FormattedDate value={1480187019228} /></div>
        <div><FormattedNumber value="1000" currency="USD" currencyDisplay="symbol" style="currency" /></div>
        <div><FormattedRelative value={1480187019228} /></div>
      </div>
    );
  }
}

App.propTypes = propTypes;

//injectIntl wraps app component and injects the intl object
export default injectIntl(App);