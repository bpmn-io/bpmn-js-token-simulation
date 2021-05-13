import ElementSupport from './ElementSupport';
import ElementNotificationsModule from '../element-notifications';

export default {
  __depends__: [
    ElementNotificationsModule
  ],
  __init__: [ 'elementSupport' ],
  elementSupport: [ 'type', ElementSupport ]
};
