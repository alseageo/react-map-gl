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

var propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  redraw: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
  // TODO: style
};

var HTMLOverlay = (function (Component) {
  function HTMLOverlay () {
    Component.apply(this, arguments);
  }

  if ( Component ) HTMLOverlay.__proto__ = Component;
  HTMLOverlay.prototype = Object.create( Component && Component.prototype );
  HTMLOverlay.prototype.constructor = HTMLOverlay;

  HTMLOverlay.prototype.render = function render () {
    var ref = this.props;
    var width = ref.width;
    var height = ref.height;
    var isDragging = ref.isDragging;
    var style = Object.assign({}, {position: 'absolute',
      pointerEvents: 'none',
      left: 0,
      top: 0,
      width: width,
      height: height},
      this.props.style);
    var mercator = ViewportMercator(this.props);
    var project = mercator.project;
    var unproject = mercator.unproject;

    return (
      React.createElement( 'div', { ref: "overlay", style: style },
        this.props.redraw({width: width, height: height, project: project, unproject: unproject, isDragging: isDragging})
      )
    );
  };

  return HTMLOverlay;
}(Component));

export default HTMLOverlay;

HTMLOverlay.propTypes = propTypes;
