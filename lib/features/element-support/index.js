import ElementSupport from './ElementSupport';
import ElementNotificationsModule from '../element-notifications';
import NotificationsModule from '../notifications';

export default {
  __depends__: [
    ElementNotificationsModule,
    NotificationsModule
  ],
  __init__: [ 'elementSupport' ],
  elementSupport: [ 'type', ElementSupport ]
};
