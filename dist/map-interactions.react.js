'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class; // Copyright (c) 2015 Uber Technologies, Inc.

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _mapboxGl = require('mapbox-gl');

var _document = require('global/document');

var _document2 = _interopRequireDefault(_document);

var _window = require('global/window');

var _window2 = _interopRequireDefault(_window);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function noop() {}

var ua = typeof _window2.default.navigator !== 'undefined' ? _window2.default.navigator.userAgent.toLowerCase() : '';
var firefox = ua.indexOf('firefox') !== -1;

function mousePos(el, event) {
  var rect = el.getBoundingClientRect();
  event = event.touches ? event.touches[0] : event;
  return new _mapboxGl.Point(event.clientX - rect.left - el.clientLeft, event.clientY - rect.top - el.clientTop);
}

function touchPos(el, event) {
  var points = [];
  var rect = el.getBoundingClientRect();
  for (var i = 0; i < event.touches.length; i++) {
    points.push(new _mapboxGl.Point(event.touches[i].clientX - rect.left - el.clientLeft, event.touches[i].clientY - rect.top - el.clientTop));
  }
  return points;
}

/* eslint-disable max-len */
// Portions of the code below originally from:
// https://github.com/mapbox/mapbox-gl-js/blob/master/js/ui/handler/scroll_zoom.js
/* eslint-enable max-len */

var PROP_TYPES = {
  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,
  onMouseDown: _react.PropTypes.func,
  onMouseDrag: _react.PropTypes.func,
  onMouseRotate: _react.PropTypes.func,
  onMouseUp: _react.PropTypes.func,
  onMouseMove: _react.PropTypes.func,
  onMouseClick: _react.PropTypes.func,
  onTouchStart: _react.PropTypes.func,
  onTouchDrag: _react.PropTypes.func,
  onTouchRotate: _react.PropTypes.func,
  onTouchEnd: _react.PropTypes.func,
  onTouchTap: _react.PropTypes.func,
  onZoom: _react.PropTypes.func,
  onZoomEnd: _react.PropTypes.func
};

var DEFAULT_PROPS = {
  onMouseDown: noop,
  onMouseDrag: noop,
  onMouseRotate: noop,
  onMouseUp: noop,
  onMouseMove: noop,
  onMouseClick: noop,
  onTouchStart: noop,
  onTouchDrag: noop,
  onTouchRotate: noop,
  onTouchEnd: noop,
  onTouchTap: noop,
  onZoom: noop,
  onZoomEnd: noop
};

var MapInteractions = (_class = function (_Component) {
  _inherits(MapInteractions, _Component);

  function MapInteractions(props) {
    _classCallCheck(this, MapInteractions);

    var _this = _possibleConstructorReturn(this, (MapInteractions.__proto__ || Object.getPrototypeOf(MapInteractions)).call(this, props));

    _this.state = {
      didDrag: false,
      startPos: null,
      pos: null,
      mouseWheelPos: null
    };
    return _this;
  }

  _createClass(MapInteractions, [{
    key: '_getMousePos',
    value: function _getMousePos(event) {
      var el = this.refs.container;
      return mousePos(el, event);
    }
  }, {
    key: '_getTouchPos',
    value: function _getTouchPos(event) {
      var el = this.refs.container;
      return touchPos(el, event).reduce(function (prev, curr, i, arr) {
        return prev.add(curr.div(arr.length));
      }, new _mapboxGl.Point(0, 0));
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      var pos = this._getMousePos(event);
      this.setState({
        didDrag: false,
        startPos: pos,
        pos: pos,
        metaKey: Boolean(event.metaKey)
      });
      this.props.onMouseDown({ pos: pos });
      _document2.default.addEventListener('mousemove', this._onMouseDrag, false);
      _document2.default.addEventListener('mouseup', this._onMouseUp, false);
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(event) {
      var pos = this._getTouchPos(event);
      this.setState({
        didDrag: false,
        startPos: pos,
        pos: pos,
        metaKey: Boolean(event.metaKey)
      });
      this.props.onTouchStart({ pos: pos });
      _document2.default.addEventListener('touchmove', this._onTouchDrag, false);
      _document2.default.addEventListener('touchend', this._onTouchEnd, false);
    }
  }, {
    key: '_onMouseDrag',
    value: function _onMouseDrag(event) {
      var pos = this._getMousePos(event);
      this.setState({ pos: pos, didDrag: true });
      if (this.state.metaKey) {
        var startPos = this.state.startPos;

        this.props.onMouseRotate({ pos: pos, startPos: startPos });
      } else {
        this.props.onMouseDrag({ pos: pos });
      }
    }
  }, {
    key: '_onTouchDrag',
    value: function _onTouchDrag(event) {
      var pos = this._getTouchPos(event);
      this.setState({ pos: pos, didDrag: true });
      if (this.state.metaKey) {
        var startPos = this.state.startPos;

        this.props.onTouchRotate({ pos: pos, startPos: startPos });
      } else {
        this.props.onTouchDrag({ pos: pos });
      }
      event.preventDefault();
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(event) {
      _document2.default.removeEventListener('mousemove', this._onMouseDrag, false);
      _document2.default.removeEventListener('mouseup', this._onMouseUp, false);
      var pos = this._getMousePos(event);
      this.setState({ pos: pos });
      this.props.onMouseUp({ pos: pos });
      if (!this.state.didDrag) {
        this.props.onMouseClick({ pos: pos });
      }
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(event) {
      _document2.default.removeEventListener('touchmove', this._onTouchDrag, false);
      _document2.default.removeEventListener('touchend', this._onTouchEnd, false);
      var pos = this._getTouchPos(event);
      this.setState({ pos: pos });
      this.props.onTouchEnd({ pos: pos });
      if (!this.state.didDrag) {
        this.props.onTouchTap({ pos: pos });
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var pos = this._getMousePos(event);
      this.props.onMouseMove({ pos: pos });
    }

    /* eslint-disable complexity, max-statements */

  }, {
    key: '_onWheel',
    value: function _onWheel(event) {
      event.stopPropagation();
      event.preventDefault();
      var value = event.deltaY;
      // Firefox doubles the values on retina screens...
      if (firefox && event.deltaMode === _window2.default.WheelEvent.DOM_DELTA_PIXEL) {
        value /= _window2.default.devicePixelRatio;
      }
      if (event.deltaMode === _window2.default.WheelEvent.DOM_DELTA_LINE) {
        value *= 40;
      }

      var type = this.state.mouseWheelType;
      var timeout = this.state.mouseWheelTimeout;
      var lastValue = this.state.mouseWheelLastValue;
      var time = this.state.mouseWheelTime;

      var now = (_window2.default.performance || Date).now();
      var timeDelta = now - (time || 0);

      var pos = this._getMousePos(event);
      time = now;

      if (value !== 0 && value % 4.000244140625 === 0) {
        // This one is definitely a mouse wheel event.
        type = 'wheel';
        // Normalize this value to match trackpad.
        value = Math.floor(value / 4);
      } else if (value !== 0 && Math.abs(value) < 4) {
        // This one is definitely a trackpad event because it is so small.
        type = 'trackpad';
      } else if (timeDelta > 400) {
        // This is likely a new scroll action.
        type = null;
        lastValue = value;

        // Start a timeout in case this was a singular event, and delay it by up
        // to 40ms.
        timeout = _window2.default.setTimeout(function setTimeout() {
          var _type = 'wheel';
          this._zoom(-this.state.mouseWheelLastValue, this.state.mouseWheelPos);
          this.setState({ mouseWheelType: _type });
        }.bind(this), 40);
      } else if (!this._type) {
        // This is a repeating event, but we don't know the type of event just
        // yet.
        // If the delta per time is small, we assume it's a fast trackpad;
        // otherwise we switch into wheel mode.
        type = Math.abs(timeDelta * value) < 200 ? 'trackpad' : 'wheel';

        // Make sure our delayed event isn't fired again, because we accumulate
        // the previous event (which was less than 40ms ago) into this event.
        if (timeout) {
          _window2.default.clearTimeout(timeout);
          timeout = null;
          value += lastValue;
        }
      }

      // Slow down zoom if shift key is held for more precise zooming
      if (event.shiftKey && value) {
        value = value / 4;
      }

      // Only fire the callback if we actually know what type of scrolling device
      // the user uses.
      if (type) {
        this._zoom(-value, pos);
      }

      this.setState({
        mouseWheelTime: time,
        mouseWheelPos: pos,
        mouseWheelType: type,
        mouseWheelTimeout: timeout,
        mouseWheelLastValue: lastValue
      });
    }
    /* eslint-enable complexity, max-statements */

  }, {
    key: '_zoom',
    value: function _zoom(delta, pos) {

      // Scale by sigmoid of scroll wheel delta.
      var scale = 2 / (1 + Math.exp(-Math.abs(delta / 100)));
      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }
      this.props.onZoom({ pos: pos, scale: scale });
      _window2.default.clearTimeout(this._zoomEndTimeout);
      this._zoomEndTimeout = _window2.default.setTimeout(function _setTimeout() {
        this.props.onZoomEnd();
      }.bind(this), 200);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        {
          ref: 'container',
          onMouseMove: this._onMouseMove,
          onMouseDown: this._onMouseDown,
          onTouchStart: this._onTouchStart,
          onContextMenu: this._onMouseDown,
          onWheel: this._onWheel,
          style: {
            width: this.props.width,
            height: this.props.height,
            position: 'relative'
          } },
        this.props.children
      );
    }
  }]);

  return MapInteractions;
}(_react.Component), (_applyDecoratedDescriptor(_class.prototype, '_onMouseDown', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseDown'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onTouchStart', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onTouchStart'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseDrag', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseDrag'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onTouchDrag', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onTouchDrag'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseUp', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseUp'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onTouchEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onTouchEnd'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onWheel', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onWheel'), _class.prototype)), _class);
exports.default = MapInteractions;


MapInteractions.propTypes = PROP_TYPES;
MapInteractions.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXAtaW50ZXJhY3Rpb25zLnJlYWN0LmpzIl0sIm5hbWVzIjpbIm5vb3AiLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInRvTG93ZXJDYXNlIiwiZmlyZWZveCIsImluZGV4T2YiLCJtb3VzZVBvcyIsImVsIiwiZXZlbnQiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG91Y2hlcyIsImNsaWVudFgiLCJsZWZ0IiwiY2xpZW50TGVmdCIsImNsaWVudFkiLCJ0b3AiLCJjbGllbnRUb3AiLCJ0b3VjaFBvcyIsInBvaW50cyIsImkiLCJsZW5ndGgiLCJwdXNoIiwiUFJPUF9UWVBFUyIsIndpZHRoIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsIm9uTW91c2VEb3duIiwiZnVuYyIsIm9uTW91c2VEcmFnIiwib25Nb3VzZVJvdGF0ZSIsIm9uTW91c2VVcCIsIm9uTW91c2VNb3ZlIiwib25Nb3VzZUNsaWNrIiwib25Ub3VjaFN0YXJ0Iiwib25Ub3VjaERyYWciLCJvblRvdWNoUm90YXRlIiwib25Ub3VjaEVuZCIsIm9uVG91Y2hUYXAiLCJvblpvb20iLCJvblpvb21FbmQiLCJERUZBVUxUX1BST1BTIiwiTWFwSW50ZXJhY3Rpb25zIiwicHJvcHMiLCJzdGF0ZSIsImRpZERyYWciLCJzdGFydFBvcyIsInBvcyIsIm1vdXNlV2hlZWxQb3MiLCJyZWZzIiwiY29udGFpbmVyIiwicmVkdWNlIiwicHJldiIsImN1cnIiLCJhcnIiLCJhZGQiLCJkaXYiLCJfZ2V0TW91c2VQb3MiLCJzZXRTdGF0ZSIsIm1ldGFLZXkiLCJCb29sZWFuIiwiYWRkRXZlbnRMaXN0ZW5lciIsIl9vbk1vdXNlRHJhZyIsIl9vbk1vdXNlVXAiLCJfZ2V0VG91Y2hQb3MiLCJfb25Ub3VjaERyYWciLCJfb25Ub3VjaEVuZCIsInByZXZlbnREZWZhdWx0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInN0b3BQcm9wYWdhdGlvbiIsInZhbHVlIiwiZGVsdGFZIiwiZGVsdGFNb2RlIiwiV2hlZWxFdmVudCIsIkRPTV9ERUxUQV9QSVhFTCIsImRldmljZVBpeGVsUmF0aW8iLCJET01fREVMVEFfTElORSIsInR5cGUiLCJtb3VzZVdoZWVsVHlwZSIsInRpbWVvdXQiLCJtb3VzZVdoZWVsVGltZW91dCIsImxhc3RWYWx1ZSIsIm1vdXNlV2hlZWxMYXN0VmFsdWUiLCJ0aW1lIiwibW91c2VXaGVlbFRpbWUiLCJub3ciLCJwZXJmb3JtYW5jZSIsIkRhdGUiLCJ0aW1lRGVsdGEiLCJNYXRoIiwiZmxvb3IiLCJhYnMiLCJzZXRUaW1lb3V0IiwiX3R5cGUiLCJfem9vbSIsImJpbmQiLCJjbGVhclRpbWVvdXQiLCJzaGlmdEtleSIsImRlbHRhIiwic2NhbGUiLCJleHAiLCJfem9vbUVuZFRpbWVvdXQiLCJfc2V0VGltZW91dCIsIl9vbk1vdXNlTW92ZSIsIl9vbk1vdXNlRG93biIsIl9vblRvdWNoU3RhcnQiLCJfb25XaGVlbCIsInBvc2l0aW9uIiwiY2hpbGRyZW4iLCJwcm9wVHlwZXMiLCJkZWZhdWx0UHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzsyQkFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFTQSxJQUFULEdBQWdCLENBQUU7O0FBRWxCLElBQU1DLEtBQUssT0FBTyxpQkFBT0MsU0FBZCxLQUE0QixXQUE1QixHQUNULGlCQUFPQSxTQUFQLENBQWlCQyxTQUFqQixDQUEyQkMsV0FBM0IsRUFEUyxHQUNrQyxFQUQ3QztBQUVBLElBQU1DLFVBQVVKLEdBQUdLLE9BQUgsQ0FBVyxTQUFYLE1BQTBCLENBQUMsQ0FBM0M7O0FBRUEsU0FBU0MsUUFBVCxDQUFrQkMsRUFBbEIsRUFBc0JDLEtBQXRCLEVBQTZCO0FBQzNC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M0QsS0FBTCxDQUFXSCxTQUFYO0FBQ0QsT0FGd0MsQ0FFdkN1RCxJQUZ1QyxDQUVsQyxJQUZrQyxDQUFsQixFQUVULEdBRlMsQ0FBdkI7QUFHRDs7OzZCQUVRO0FBQ1AsYUFDRTtBQUFBO0FBQUE7QUFDRSxlQUFJLFdBRE47QUFFRSx1QkFBYyxLQUFLUSxZQUZyQjtBQUdFLHVCQUFjLEtBQUtDLFlBSHJCO0FBSUUsd0JBQWUsS0FBS0MsYUFKdEI7QUFLRSx5QkFBZ0IsS0FBS0QsWUFMdkI7QUFNRSxtQkFBVSxLQUFLRSxRQU5qQjtBQU9FLGlCQUFRO0FBQ05uRixtQkFBTyxLQUFLb0IsS0FBTCxDQUFXcEIsS0FEWjtBQUVORyxvQkFBUSxLQUFLaUIsS0FBTCxDQUFXakIsTUFGYjtBQUdOaUYsc0JBQVU7QUFISixXQVBWO0FBYUksYUFBS2hFLEtBQUwsQ0FBV2lFO0FBYmYsT0FERjtBQWtCRDs7Ozs7a0JBOU5rQmxFLGU7OztBQWlPckJBLGdCQUFnQm1FLFNBQWhCLEdBQTRCdkYsVUFBNUI7QUFDQW9CLGdCQUFnQm9FLFlBQWhCLEdBQStCckUsYUFBL0IiLCJmaWxlIjoibWFwLWludGVyYWN0aW9ucy5yZWFjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcywgQ29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnYXV0b2JpbmQtZGVjb3JhdG9yJztcbmltcG9ydCB7UG9pbnR9IGZyb20gJ21hcGJveC1nbCc7XG5pbXBvcnQgZG9jdW1lbnQgZnJvbSAnZ2xvYmFsL2RvY3VtZW50JztcbmltcG9ydCB3aW5kb3cgZnJvbSAnZ2xvYmFsL3dpbmRvdyc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5jb25zdCB1YSA9IHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/XG4gIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkgOiAnJztcbmNvbnN0IGZpcmVmb3ggPSB1YS5pbmRleE9mKCdmaXJlZm94JykgIT09IC0xO1xuXG5mdW5jdGlvbiBtb3VzZVBvcyhlbCwgZXZlbnQpIHtcbiAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBldmVudCA9IGV2ZW50LnRvdWNoZXMgPyBldmVudC50b3VjaGVzWzBdIDogZXZlbnQ7XG4gIHJldHVybiBuZXcgUG9pbnQoXG4gICAgZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCAtIGVsLmNsaWVudExlZnQsXG4gICAgZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wIC0gZWwuY2xpZW50VG9wXG4gICk7XG59XG5cbmZ1bmN0aW9uIHRvdWNoUG9zKGVsLCBldmVudCkge1xuICBjb25zdCBwb2ludHMgPSBbXTtcbiAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICBwb2ludHMucHVzaChuZXcgUG9pbnQoXG4gICAgICBldmVudC50b3VjaGVzW2ldLmNsaWVudFggLSByZWN0LmxlZnQgLSBlbC5jbGllbnRMZWZ0LFxuICAgICAgZXZlbnQudG91Y2hlc1tpXS5jbGllbnRZIC0gcmVjdC50b3AgLSBlbC5jbGllbnRUb3BcbiAgICApKTtcbiAgfVxuICByZXR1cm4gcG9pbnRzO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4vLyBQb3J0aW9ucyBvZiB0aGUgY29kZSBiZWxvdyBvcmlnaW5hbGx5IGZyb206XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9ibG9iL21hc3Rlci9qcy91aS9oYW5kbGVyL3Njcm9sbF96b29tLmpzXG4vKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cblxuY29uc3QgUFJPUF9UWVBFUyA9IHtcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIG9uTW91c2VEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25Nb3VzZURyYWc6IFByb3BUeXBlcy5mdW5jLFxuICBvbk1vdXNlUm90YXRlOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25Nb3VzZVVwOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25Nb3VzZU1vdmU6IFByb3BUeXBlcy5mdW5jLFxuICBvbk1vdXNlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICBvblRvdWNoU3RhcnQ6IFByb3BUeXBlcy5mdW5jLFxuICBvblRvdWNoRHJhZzogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVG91Y2hSb3RhdGU6IFByb3BUeXBlcy5mdW5jLFxuICBvblRvdWNoRW5kOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25Ub3VjaFRhcDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uWm9vbTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uWm9vbUVuZDogUHJvcFR5cGVzLmZ1bmNcbn07XG5cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIG9uTW91c2VEb3duOiBub29wLFxuICBvbk1vdXNlRHJhZzogbm9vcCxcbiAgb25Nb3VzZVJvdGF0ZTogbm9vcCxcbiAgb25Nb3VzZVVwOiBub29wLFxuICBvbk1vdXNlTW92ZTogbm9vcCxcbiAgb25Nb3VzZUNsaWNrOiBub29wLFxuICBvblRvdWNoU3RhcnQ6IG5vb3AsXG4gIG9uVG91Y2hEcmFnOiBub29wLFxuICBvblRvdWNoUm90YXRlOiBub29wLFxuICBvblRvdWNoRW5kOiBub29wLFxuICBvblRvdWNoVGFwOiBub29wLFxuICBvblpvb206IG5vb3AsXG4gIG9uWm9vbUVuZDogbm9vcFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwSW50ZXJhY3Rpb25zIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZGlkRHJhZzogZmFsc2UsXG4gICAgICBzdGFydFBvczogbnVsbCxcbiAgICAgIHBvczogbnVsbCxcbiAgICAgIG1vdXNlV2hlZWxQb3M6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgX2dldE1vdXNlUG9zKGV2ZW50KSB7XG4gICAgY29uc3QgZWwgPSB0aGlzLnJlZnMuY29udGFpbmVyO1xuICAgIHJldHVybiBtb3VzZVBvcyhlbCwgZXZlbnQpO1xuICB9XG5cbiAgX2dldFRvdWNoUG9zKGV2ZW50KSB7XG4gICAgY29uc3QgZWwgPSB0aGlzLnJlZnMuY29udGFpbmVyO1xuICAgIHJldHVybiB0b3VjaFBvcyhlbCwgZXZlbnQpLnJlZHVjZSgocHJldiwgY3VyciwgaSwgYXJyKSA9PiB7XG4gICAgICByZXR1cm4gcHJldi5hZGQoY3Vyci5kaXYoYXJyLmxlbmd0aCkpO1xuICAgIH0sIG5ldyBQb2ludCgwLCAwKSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uTW91c2VEb3duKGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0TW91c2VQb3MoZXZlbnQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZGlkRHJhZzogZmFsc2UsXG4gICAgICBzdGFydFBvczogcG9zLFxuICAgICAgcG9zLFxuICAgICAgbWV0YUtleTogQm9vbGVhbihldmVudC5tZXRhS2V5KVxuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25Nb3VzZURvd24oe3Bvc30pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VEcmFnLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCwgZmFsc2UpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIF9vblRvdWNoU3RhcnQoZXZlbnQpIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRUb3VjaFBvcyhldmVudCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkaWREcmFnOiBmYWxzZSxcbiAgICAgIHN0YXJ0UG9zOiBwb3MsXG4gICAgICBwb3MsXG4gICAgICBtZXRhS2V5OiBCb29sZWFuKGV2ZW50Lm1ldGFLZXkpXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vblRvdWNoU3RhcnQoe3Bvc30pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hEcmFnLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoRW5kLCBmYWxzZSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uTW91c2VEcmFnKGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0TW91c2VQb3MoZXZlbnQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3BvcywgZGlkRHJhZzogdHJ1ZX0pO1xuICAgIGlmICh0aGlzLnN0YXRlLm1ldGFLZXkpIHtcbiAgICAgIGNvbnN0IHtzdGFydFBvc30gPSB0aGlzLnN0YXRlO1xuICAgICAgdGhpcy5wcm9wcy5vbk1vdXNlUm90YXRlKHtwb3MsIHN0YXJ0UG9zfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMub25Nb3VzZURyYWcoe3Bvc30pO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25Ub3VjaERyYWcoZXZlbnQpIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRUb3VjaFBvcyhldmVudCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7cG9zLCBkaWREcmFnOiB0cnVlfSk7XG4gICAgaWYgKHRoaXMuc3RhdGUubWV0YUtleSkge1xuICAgICAgY29uc3Qge3N0YXJ0UG9zfSA9IHRoaXMuc3RhdGU7XG4gICAgICB0aGlzLnByb3BzLm9uVG91Y2hSb3RhdGUoe3Bvcywgc3RhcnRQb3N9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5vblRvdWNoRHJhZyh7cG9zfSk7XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uTW91c2VVcChldmVudCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VEcmFnLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCwgZmFsc2UpO1xuICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldE1vdXNlUG9zKGV2ZW50KTtcbiAgICB0aGlzLnNldFN0YXRlKHtwb3N9KTtcbiAgICB0aGlzLnByb3BzLm9uTW91c2VVcCh7cG9zfSk7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmRpZERyYWcpIHtcbiAgICAgIHRoaXMucHJvcHMub25Nb3VzZUNsaWNrKHtwb3N9KTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uVG91Y2hFbmQoZXZlbnQpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoRHJhZywgZmFsc2UpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFRvdWNoUG9zKGV2ZW50KTtcbiAgICB0aGlzLnNldFN0YXRlKHtwb3N9KTtcbiAgICB0aGlzLnByb3BzLm9uVG91Y2hFbmQoe3Bvc30pO1xuICAgIGlmICghdGhpcy5zdGF0ZS5kaWREcmFnKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVG91Y2hUYXAoe3Bvc30pO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25Nb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRNb3VzZVBvcyhldmVudCk7XG4gICAgdGhpcy5wcm9wcy5vbk1vdXNlTW92ZSh7cG9zfSk7XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5LCBtYXgtc3RhdGVtZW50cyAqL1xuICBAYXV0b2JpbmRcbiAgX29uV2hlZWwoZXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCB2YWx1ZSA9IGV2ZW50LmRlbHRhWTtcbiAgICAvLyBGaXJlZm94IGRvdWJsZXMgdGhlIHZhbHVlcyBvbiByZXRpbmEgc2NyZWVucy4uLlxuICAgIGlmIChmaXJlZm94ICYmIGV2ZW50LmRlbHRhTW9kZSA9PT0gd2luZG93LldoZWVsRXZlbnQuRE9NX0RFTFRBX1BJWEVMKSB7XG4gICAgICB2YWx1ZSAvPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICB9XG4gICAgaWYgKGV2ZW50LmRlbHRhTW9kZSA9PT0gd2luZG93LldoZWVsRXZlbnQuRE9NX0RFTFRBX0xJTkUpIHtcbiAgICAgIHZhbHVlICo9IDQwO1xuICAgIH1cblxuICAgIGxldCB0eXBlID0gdGhpcy5zdGF0ZS5tb3VzZVdoZWVsVHlwZTtcbiAgICBsZXQgdGltZW91dCA9IHRoaXMuc3RhdGUubW91c2VXaGVlbFRpbWVvdXQ7XG4gICAgbGV0IGxhc3RWYWx1ZSA9IHRoaXMuc3RhdGUubW91c2VXaGVlbExhc3RWYWx1ZTtcbiAgICBsZXQgdGltZSA9IHRoaXMuc3RhdGUubW91c2VXaGVlbFRpbWU7XG5cbiAgICBjb25zdCBub3cgPSAod2luZG93LnBlcmZvcm1hbmNlIHx8IERhdGUpLm5vdygpO1xuICAgIGNvbnN0IHRpbWVEZWx0YSA9IG5vdyAtICh0aW1lIHx8IDApO1xuXG4gICAgY29uc3QgcG9zID0gdGhpcy5fZ2V0TW91c2VQb3MoZXZlbnQpO1xuICAgIHRpbWUgPSBub3c7XG5cbiAgICBpZiAodmFsdWUgIT09IDAgJiYgdmFsdWUgJSA0LjAwMDI0NDE0MDYyNSA9PT0gMCkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIG1vdXNlIHdoZWVsIGV2ZW50LlxuICAgICAgdHlwZSA9ICd3aGVlbCc7XG4gICAgICAvLyBOb3JtYWxpemUgdGhpcyB2YWx1ZSB0byBtYXRjaCB0cmFja3BhZC5cbiAgICAgIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSAvIDQpO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IDAgJiYgTWF0aC5hYnModmFsdWUpIDwgNCkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIHRyYWNrcGFkIGV2ZW50IGJlY2F1c2UgaXQgaXMgc28gc21hbGwuXG4gICAgICB0eXBlID0gJ3RyYWNrcGFkJztcbiAgICB9IGVsc2UgaWYgKHRpbWVEZWx0YSA+IDQwMCkge1xuICAgICAgLy8gVGhpcyBpcyBsaWtlbHkgYSBuZXcgc2Nyb2xsIGFjdGlvbi5cbiAgICAgIHR5cGUgPSBudWxsO1xuICAgICAgbGFzdFZhbHVlID0gdmFsdWU7XG5cbiAgICAgIC8vIFN0YXJ0IGEgdGltZW91dCBpbiBjYXNlIHRoaXMgd2FzIGEgc2luZ3VsYXIgZXZlbnQsIGFuZCBkZWxheSBpdCBieSB1cFxuICAgICAgLy8gdG8gNDBtcy5cbiAgICAgIHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiBzZXRUaW1lb3V0KCkge1xuICAgICAgICBjb25zdCBfdHlwZSA9ICd3aGVlbCc7XG4gICAgICAgIHRoaXMuX3pvb20oLXRoaXMuc3RhdGUubW91c2VXaGVlbExhc3RWYWx1ZSwgdGhpcy5zdGF0ZS5tb3VzZVdoZWVsUG9zKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bW91c2VXaGVlbFR5cGU6IF90eXBlfSk7XG4gICAgICB9LmJpbmQodGhpcyksIDQwKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl90eXBlKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgcmVwZWF0aW5nIGV2ZW50LCBidXQgd2UgZG9uJ3Qga25vdyB0aGUgdHlwZSBvZiBldmVudCBqdXN0XG4gICAgICAvLyB5ZXQuXG4gICAgICAvLyBJZiB0aGUgZGVsdGEgcGVyIHRpbWUgaXMgc21hbGwsIHdlIGFzc3VtZSBpdCdzIGEgZmFzdCB0cmFja3BhZDtcbiAgICAgIC8vIG90aGVyd2lzZSB3ZSBzd2l0Y2ggaW50byB3aGVlbCBtb2RlLlxuICAgICAgdHlwZSA9IE1hdGguYWJzKHRpbWVEZWx0YSAqIHZhbHVlKSA8IDIwMCA/ICd0cmFja3BhZCcgOiAnd2hlZWwnO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgb3VyIGRlbGF5ZWQgZXZlbnQgaXNuJ3QgZmlyZWQgYWdhaW4sIGJlY2F1c2Ugd2UgYWNjdW11bGF0ZVxuICAgICAgLy8gdGhlIHByZXZpb3VzIGV2ZW50ICh3aGljaCB3YXMgbGVzcyB0aGFuIDQwbXMgYWdvKSBpbnRvIHRoaXMgZXZlbnQuXG4gICAgICBpZiAodGltZW91dCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdmFsdWUgKz0gbGFzdFZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNsb3cgZG93biB6b29tIGlmIHNoaWZ0IGtleSBpcyBoZWxkIGZvciBtb3JlIHByZWNpc2Ugem9vbWluZ1xuICAgIGlmIChldmVudC5zaGlmdEtleSAmJiB2YWx1ZSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZSAvIDQ7XG4gICAgfVxuXG4gICAgLy8gT25seSBmaXJlIHRoZSBjYWxsYmFjayBpZiB3ZSBhY3R1YWxseSBrbm93IHdoYXQgdHlwZSBvZiBzY3JvbGxpbmcgZGV2aWNlXG4gICAgLy8gdGhlIHVzZXIgdXNlcy5cbiAgICBpZiAodHlwZSkge1xuICAgICAgdGhpcy5fem9vbSgtdmFsdWUsIHBvcyk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb3VzZVdoZWVsVGltZTogdGltZSxcbiAgICAgIG1vdXNlV2hlZWxQb3M6IHBvcyxcbiAgICAgIG1vdXNlV2hlZWxUeXBlOiB0eXBlLFxuICAgICAgbW91c2VXaGVlbFRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICBtb3VzZVdoZWVsTGFzdFZhbHVlOiBsYXN0VmFsdWVcbiAgICB9KTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHksIG1heC1zdGF0ZW1lbnRzICovXG5cbiAgX3pvb20oZGVsdGEsIHBvcykge1xuXG4gICAgLy8gU2NhbGUgYnkgc2lnbW9pZCBvZiBzY3JvbGwgd2hlZWwgZGVsdGEuXG4gICAgbGV0IHNjYWxlID0gMiAvICgxICsgTWF0aC5leHAoLU1hdGguYWJzKGRlbHRhIC8gMTAwKSkpO1xuICAgIGlmIChkZWx0YSA8IDAgJiYgc2NhbGUgIT09IDApIHtcbiAgICAgIHNjYWxlID0gMSAvIHNjYWxlO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uWm9vbSh7cG9zLCBzY2FsZX0pO1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fem9vbUVuZFRpbWVvdXQpO1xuICAgIHRoaXMuX3pvb21FbmRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gX3NldFRpbWVvdXQoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uWm9vbUVuZCgpO1xuICAgIH0uYmluZCh0aGlzKSwgMjAwKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICByZWY9XCJjb250YWluZXJcIlxuICAgICAgICBvbk1vdXNlTW92ZT17IHRoaXMuX29uTW91c2VNb3ZlIH1cbiAgICAgICAgb25Nb3VzZURvd249eyB0aGlzLl9vbk1vdXNlRG93biB9XG4gICAgICAgIG9uVG91Y2hTdGFydD17IHRoaXMuX29uVG91Y2hTdGFydCB9XG4gICAgICAgIG9uQ29udGV4dE1lbnU9eyB0aGlzLl9vbk1vdXNlRG93biB9XG4gICAgICAgIG9uV2hlZWw9eyB0aGlzLl9vbldoZWVsIH1cbiAgICAgICAgc3R5bGU9eyB7XG4gICAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICAgICAgICB9IH0+XG5cbiAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cblxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5NYXBJbnRlcmFjdGlvbnMucHJvcFR5cGVzID0gUFJPUF9UWVBFUztcbk1hcEludGVyYWN0aW9ucy5kZWZhdWx0UHJvcHMgPSBERUZBVUxUX1BST1BTO1xuIl19