import ModelerModule from 'lib/modeler';

import {
  isPlane
} from 'bpmn-js/lib/util/DrilldownUtil';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { expect } from 'chai';


describe('features/element-order - ElementOrder', function() {

  describe('linear process', function() {

    const diagram = require('./ElementOrder.dfs-order.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should return elements in DFS order', inject(
      function(elementOrder, canvas) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);
        const ids = elements.map(e => e.id).filter(id =>
          [ 'START', 'TASK_A', 'TASK_B', 'END' ].includes(id)
        );

        // then
        expect(ids).to.eql([ 'START', 'TASK_A', 'TASK_B', 'END' ]);
      }
    ));


    it('should return all elements exactly once', inject(
      function(elementOrder, canvas, elementRegistry) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);

        // then – no duplicates
        const ids = elements.map(e => e.id);
        expect(new Set(ids).size).to.equal(ids.length);

        // and – all non-plane registry elements under root are covered
        const registered = [];
        elementRegistry.forEach(el => {
          if (!isPlane(el)) {
            registered.push(el.id);
          }
        });
        for (const id of registered) {
          expect(ids).to.include(id);
        }
      }
    ));

  });


  describe('subprocess process', function() {

    const diagram = require('./ElementOrder.dfs-subprocess.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should return subprocess children grouped after the subprocess', inject(
      function(elementOrder, canvas) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);
        const flowNodeIds = elements.map(e => e.id).filter(id =>
          [ 'ROOT_START', 'SUB_PROCESS', 'SUB_START', 'SUB_TASK', 'SUB_END', 'ROOT_END' ].includes(id)
        );

        // then – subprocess content is grouped with the subprocess
        expect(flowNodeIds).to.eql([
          'ROOT_START',
          'SUB_PROCESS',
          'SUB_START',
          'SUB_TASK',
          'SUB_END',
          'ROOT_END'
        ]);
      }
    ));

  });


  describe('pool / collaboration', function() {

    const diagram = require('./ElementOrder.pools.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should return all elements from all pools exactly once', inject(
      function(elementOrder, canvas, elementRegistry) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);

        // then – no duplicates
        const ids = elements.map(e => e.id);
        expect(new Set(ids).size).to.equal(ids.length);

        // and – all non-plane registry elements under root are covered
        const registered = [];
        elementRegistry.forEach(el => {
          if (!isPlane(el)) {
            registered.push(el.id);
          }
        });
        for (const id of registered) {
          expect(ids).to.include(id);
        }
      }
    ));


    it('should return elements within a pool in DFS order', inject(
      function(elementOrder, elementRegistry) {

        // given
        const poolA = elementRegistry.get('POOL_A');

        // when
        const elements = elementOrder.getOrderedElements(poolA);
        const ids = elements.map(e => e.id).filter(id =>
          [ 'POOL_A_START', 'POOL_A_TASK', 'POOL_A_END' ].includes(id)
        );

        // then
        expect(ids).to.eql([ 'POOL_A_START', 'POOL_A_TASK', 'POOL_A_END' ]);
      }
    ));

  });


  describe('message flows (collaboration)', function() {

    const diagram = require('./ElementOrder.message-flow.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should return all elements exactly once', inject(
      function(elementOrder, canvas, elementRegistry) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);

        // then – no duplicates
        const ids = elements.map(e => e.id);
        expect(new Set(ids).size).to.equal(ids.length);

        // and – all non-plane registry elements covered
        const registered = [];
        elementRegistry.forEach(el => {
          if (!isPlane(el)) {
            registered.push(el.id);
          }
        });
        for (const id of registered) {
          expect(ids).to.include(id);
        }
      }
    ));


    it('should return Pool A elements before Pool B elements (message flow last)', inject(
      function(elementOrder, canvas) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);
        const ids = elements.map(e => e.id);

        const startAIdx = ids.indexOf('START_A');
        const taskAIdx = ids.indexOf('TASK_A');
        const endAIdx = ids.indexOf('END_A');
        const receiveBIdx = ids.indexOf('RECEIVE_B');
        const taskBIdx = ids.indexOf('TASK_B');
        const endBIdx = ids.indexOf('END_B');

        // then – Pool A elements are in DFS order
        expect(startAIdx).to.be.below(taskAIdx);
        expect(taskAIdx).to.be.below(endAIdx);

        // and – all Pool A elements come before Pool B elements
        // (message flows are followed after sequence flows)
        expect(endAIdx).to.be.below(receiveBIdx);

        // and – Pool B elements are in DFS order
        expect(receiveBIdx).to.be.below(taskBIdx);
        expect(taskBIdx).to.be.below(endBIdx);
      }
    ));

  });


  describe('boundary events', function() {

    describe('ordering', function() {

      const diagram = require('./ElementOrder.boundary-event.bpmn');

      beforeEach(bootstrapModeler(diagram, {
        additionalModules: [ ModelerModule ]
      }));


      it('should return boundary event after outgoing sequence flow target', inject(
        function(elementOrder, canvas) {

          // given
          const root = canvas.getRootElement();

          // when
          const elements = elementOrder.getOrderedElements(root);
          const ids = elements.map(e => e.id).filter(id =>
            [ 'START', 'TASK', 'END_NORMAL', 'BOUNDARY', 'END_BOUNDARY' ].includes(id)
          );

          // then – outgoing flow target (END_NORMAL) comes before the
          // boundary event (BOUNDARY) and its own target (END_BOUNDARY)
          expect(ids).to.eql([
            'START',
            'TASK',
            'END_NORMAL',
            'BOUNDARY',
            'END_BOUNDARY'
          ]);
        }
      ));

    });


    describe('complex diagram', function() {

      const diagram = require('../../boundary-events.bpmn');

      beforeEach(bootstrapModeler(diagram, {
        additionalModules: [ ModelerModule ]
      }));


      it('should visit boundary events after outgoing sequence flow targets', inject(
        function(elementOrder, canvas) {

          // given
          const root = canvas.getRootElement();

          // when
          const elements = elementOrder.getOrderedElements(root);
          const ids = elements.map(e => e.id);

          const activityIdx = ids.indexOf('ACTIVITY');
          const endAIdx = ids.indexOf('END_A');
          const noneAIdx = ids.indexOf('NONE_A');

          // then – ACTIVITY comes first, then END_A (via outgoing flow),
          // then NONE_A (boundary event attacher) and its targets
          expect(activityIdx).to.be.below(endAIdx);
          expect(endAIdx).to.be.below(noneAIdx);
        }
      ));


      it('should return all elements exactly once', inject(
        function(elementOrder, canvas, elementRegistry) {

          // given
          const root = canvas.getRootElement();

          // when
          const elements = elementOrder.getOrderedElements(root);

          // then – no duplicates
          const ids = elements.map(e => e.id);
          expect(new Set(ids).size).to.equal(ids.length);

          // and – all non-plane registry elements under root are covered
          const registered = [];
          elementRegistry.forEach(el => {
            if (!isPlane(el)) {
              registered.push(el.id);
            }
          });
          for (const id of registered) {
            expect(ids).to.include(id);
          }
        }
      ));

    });

  });


  describe('cyclic flow', function() {

    const diagram = require('./ElementOrder.cyclic.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should terminate and return all elements exactly once', inject(
      function(elementOrder, canvas, elementRegistry) {

        // given
        const root = canvas.getRootElement();

        // when – must not hang or throw due to the back-edge loop
        const elements = elementOrder.getOrderedElements(root);

        // then – no duplicates
        const ids = elements.map(e => e.id);
        expect(new Set(ids).size).to.equal(ids.length);

        // and – all three flow nodes present
        expect(ids).to.include('START');
        expect(ids).to.include('TASK_A');
        expect(ids).to.include('TASK_B');

        // and – all non-plane registry elements covered
        const registered = [];
        elementRegistry.forEach(el => {
          if (!isPlane(el)) {
            registered.push(el.id);
          }
        });
        for (const id of registered) {
          expect(ids).to.include(id);
        }
      }
    ));

  });


  describe('disconnected island', function() {

    const diagram = require('./ElementOrder.disconnected.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should collect disconnected nodes via fallback', inject(
      function(elementOrder, canvas, elementRegistry) {

        // given
        const root = canvas.getRootElement();

        // when
        const elements = elementOrder.getOrderedElements(root);
        const ids = elements.map(e => e.id);

        // then – the isolated task must be present despite having no connections
        expect(ids).to.include('ISLAND');

        // and – all non-plane registry elements covered
        const registered = [];
        elementRegistry.forEach(el => {
          if (!isPlane(el)) {
            registered.push(el.id);
          }
        });
        for (const id of registered) {
          expect(ids).to.include(id);
        }
      }
    ));

  });


  describe('null / empty input', function() {

    const diagram = require('./ElementOrder.dfs-order.bpmn');

    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [ ModelerModule ]
    }));


    it('should not throw when called with null (resolves to canvas root)', inject(
      function(elementOrder, elementRegistry) {

        // when / then – no throw; resolves to the canvas root
        let threw = false;
        try {
          elementOrder.getOrderedElements(null);
        } catch (e) {
          threw = true;
        }
        expect(threw).to.equal(false);
      }
    ));


    it('should return [] without throwing when canvas has no root', inject(
      function(elementOrder, canvas) {

        // Simulate "no diagram loaded": getRootElement returns null
        const orig = canvas.getRootElement.bind(canvas);
        canvas.getRootElement = () => null;

        // when / then – no throw
        const elements = elementOrder.getOrderedElements();
        expect(elements).to.eql([]);

        canvas.getRootElement = orig;
      }
    ));

  });

});

