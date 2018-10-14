import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.js';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import recorder from '../imports/redux/reducers';

const store = createStore(recorder);

Meteor.startup(() => {
  
  render(
    <Provider store={store}>
      <App />
    </Provider>
    , document.getElementById('render-target'));
});
