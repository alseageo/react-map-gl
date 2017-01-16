// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {PropTypes, Component} from 'react';
import autobind from '../utils/autobind';
import config from '../config';

import ViewportMercator from 'viewport-mercator-project';

import Immutable from 'immutable';
import document from 'global/document';

function noop() {}

// Makes working with SVG transforms a little nicer
function svgTransform(props) {
  var transform = [];
  if (Array.isArray(props)) {
    props.forEach(function (prop) {
      var key = Object.keys(prop)[0];
      transform.push((key + "(" + (prop[key]) + ")"));
    });
  }
  return transform.join(' ');
}

function mouse(container, event) {
  var rect = container.getBoundingClientRect();
  var x = event.clientX - rect.left - container.clientLeft;
  var y = event.clientY - rect.top - container.clientTop;
  return [x, y];
}

var propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  points: PropTypes.instanceOf(Immutable.List).isRequired,
  isDragging: PropTypes.bool.isRequired,
  keyAccessor: PropTypes.func.isRequired,
  lngLatAccessor: PropTypes.func.isRequired,
  onAddPoint: PropTypes.func.isRequired,
  onUpdatePoint: PropTypes.func.isRequired,
  renderPoint: PropTypes.func.isRequired
};

var defaultProps = {
  keyAccessor: function (point) { return point.get('id'); },
  lngLatAccessor: function (point) { return point.get('location').toArray(); },
  onAddPoint: noop,
  onUpdatePoint: noop,
  renderPoint: noop,
  isDragging: false
};

var DraggablePointsOverlay = (function (Component) {
  function DraggablePointsOverlay(props) {
    Component.call(this, props);
    this.state = {
      draggedPointKey: null
    };
    autobind(this);
  }

  if ( Component ) DraggablePointsOverlay.__proto__ = Component;
  DraggablePointsOverlay.prototype = Object.create( Component && Component.prototype );
  DraggablePointsOverlay.prototype.constructor = DraggablePointsOverlay;

  DraggablePointsOverlay.prototype._onDragStart = function _onDragStart (point, event) {
    event.stopPropagation();
    document.addEventListener('mousemove', this._onDrag, false);
    document.addEventListener('mouseup', this._onDragEnd, false);
    this.setState({draggedPointKey: this.props.keyAccessor(point)});
  };

  DraggablePointsOverlay.prototype._onDrag = function _onDrag (event) {
    event.stopPropagation();
    var pixel = mouse(this.refs.container, event);
    var mercator = ViewportMercator(this.props);
    var lngLat = mercator.unproject(pixel);
    var key = this.state.draggedPointKey;
    this.props.onUpdatePoint({key: key, location: lngLat});
  };

  DraggablePointsOverlay.prototype._onDragEnd = function _onDragEnd (event) {
    event.stopPropagation();
    document.removeEventListener('mousemove', this._onDrag, false);
    document.removeEventListener('mouseup', this._onDragEnd, false);
    this.setState({draggedPoint: null});
  };

  DraggablePointsOverlay.prototype._addPoint = function _addPoint (event) {
    event.stopPropagation();
    event.preventDefault();
    var pixel = mouse(this.refs.container, event);
    var mercator = ViewportMercator(this.props);
    this.props.onAddPoint(mercator.unproject(pixel));
  };

  DraggablePointsOverlay.prototype.render = function render () {
    var this$1 = this;

    var ref = this.props;
    var points = ref.points;
    var width = ref.width;
    var height = ref.height;
    var isDragging = ref.isDragging;
    var style = ref.style;
    var mercator = ViewportMercator(this.props);
    return (
      React.createElement( 'svg', {
        ref: "container", width: width, height: height, style: Object.assign({}, {pointerEvents: 'all',
          position: 'absolute',
          left: 0,
          top: 0,
          cursor: isDragging ? config.CURSOR.GRABBING : config.CURSOR.GRAB},
          style), onContextMenu: this._addPoint },

        React.createElement( 'g', { style: {cursor: 'pointer'} },
          points.map(function (point, index) {
              var pixel = mercator.project(this$1.props.lngLatAccessor(point));
              return (
                React.createElement( 'g', {
                  key: index, style: {pointerEvents: 'all'}, transform: svgTransform([{translate: pixel}]), onMouseDown: this$1._onDragStart.bind(this$1, point) },
                  this$1.props.renderPoint.call(this$1, point, pixel)
                )
              );
            })
        )
      )
    );
  };

  return DraggablePointsOverlay;
}(Component));

export default DraggablePointsOverlay;

DraggablePointsOverlay.propTypes = propTypes;
DraggablePointsOverlay.defaultProps = defaultProps;
