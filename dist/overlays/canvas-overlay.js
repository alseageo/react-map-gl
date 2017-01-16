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
import ViewportMercator from 'viewport-mercator-project';
import window from 'global/window';

var propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  redraw: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

var CanvasOverlay = (function (Component) {
  function CanvasOverlay () {
    Component.apply(this, arguments);
  }

  if ( Component ) CanvasOverlay.__proto__ = Component;
  CanvasOverlay.prototype = Object.create( Component && Component.prototype );
  CanvasOverlay.prototype.constructor = CanvasOverlay;

  CanvasOverlay.prototype.componentDidMount = function componentDidMount () {
    this._redraw();
  };

  CanvasOverlay.prototype.componentDidUpdate = function componentDidUpdate () {
    this._redraw();
  };

  CanvasOverlay.prototype._redraw = function _redraw () {
    var pixelRatio = window.devicePixelRatio || 1;
    var canvas = this.refs.overlay;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    var mercator = ViewportMercator(this.props);
    this.props.redraw({
      width: this.props.width,
      height: this.props.height,
      ctx: ctx,
      project: mercator.project,
      unproject: mercator.unproject,
      isDragging: this.props.isDragging
    });
    ctx.restore();
  };

  CanvasOverlay.prototype.render = function render () {
    var pixelRatio = window.devicePixelRatio || 1;
    return (
      React.createElement( 'canvas', {
        ref: "overlay", width: this.props.width * pixelRatio, height: this.props.height * pixelRatio, style: {
          width: ((this.props.width) + "px"),
          height: ((this.props.height) + "px"),
          position: 'absolute',
          pointerEvents: 'none',
          left: 0,
          top: 0
        } })
    );
  };

  return CanvasOverlay;
}(Component));

export default CanvasOverlay;

CanvasOverlay.propTypes = propTypes;
