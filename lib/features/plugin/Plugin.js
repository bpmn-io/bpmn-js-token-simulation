import { TOGGLE_MODE_EVENT } from '../../util/EventHelper';

export const PLUGIN_ID = 'tokenSimulation';


export default class Plugin {
  constructor(eventBus, pluginManager) {
    this._eventBus = eventBus;

    this._active = false;

    eventBus.on('import.parse.start', () => {
      if (this._active) {
        this.deactivate();

        eventBus.once('import.done', () => {
          this.activate();
        });
      }
    });

    pluginManager.registerPlugin(PLUGIN_ID, this);
  }

  /**
   * Called by plugin manager.
   */
  activate() {
    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      active: true
    });

    this._active = true;
  }

  /**
   * Called by plugin manager.
   */
  deactivate() {
    this._eventBus.fire(TOGGLE_MODE_EVENT, {
      active: false
    });

    this._active = false;
  }
}

Plugin.$inject = [
  'eventBus',
  'pluginManager'
];