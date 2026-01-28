// import randomColor from 'randomcolor';

import {
  SCOPE_CREATE_EVENT
} from '../../util/EventHelper';

const HIGH_PRIORITY = 1500;


export default function ColoredScopes(eventBus) {

  // const colors = randomColor({
  //   count: 60
  // }).filter(c => getContrastYIQ(c.substring(1)) < 200);

  // function getContrastYIQ(hexcolor) {
  //   var r = parseInt(hexcolor.substr(0,2),16);
  //   var g = parseInt(hexcolor.substr(2,2),16);
  //   var b = parseInt(hexcolor.substr(4,2),16);
  //   var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  //   return yiq;
  // }

  let colorsIdx = 0;

  function getColors(scope) {

    return {
      primary: '#0f62fe',
      auxiliary: '#ffffff'
    };
  }

  eventBus.on(SCOPE_CREATE_EVENT, HIGH_PRIORITY, event => {

    const {
      scope
    } = event;

    scope.colors = getColors(scope);
  });
}

ColoredScopes.$inject = [
  'eventBus'
];