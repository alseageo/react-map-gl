'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _desc, _value, _class2; // Copyright (c) 2015 Uber Technologies, Inc.

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

var _pureRenderDecorator = require('pure-render-decorator');

var _pureRenderDecorator2 = _interopRequireDefault(_pureRenderDecorator);

var _mapboxGl = require('mapbox-gl');

var _mapboxGl2 = _interopRequireDefault(_mapboxGl);

var _d3Selection = require('d3-selection');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _mapInteractions = require('./map-interactions.react');

var _mapInteractions2 = _interopRequireDefault(_mapInteractions);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _diffStyles2 = require('./utils/diff-styles');

var _diffStyles3 = _interopRequireDefault(_diffStyles2);

var _transform = require('./utils/transform');

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

// Note: Max pitch is a hard coded value (not a named constant) in transform.js
var MAX_PITCH = 60;
var PITCH_MOUSE_THRESHOLD = 20;
var PITCH_ACCEL = 1.2;

var PROP_TYPES = {
  /**
    * The latitude of the center of the map.
    */
  latitude: _react.PropTypes.number.isRequired,
  /**
    * The longitude of the center of the map.
    */
  longitude: _react.PropTypes.number.isRequired,
  /**
    * The tile zoom level of the map.
    */
  zoom: _react.PropTypes.number.isRequired,
  /**
    * The Mapbox style the component should use. Can either be a string url
    * or a MapboxGL style Immutable.Map object.
    */
  mapStyle: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.instanceOf(_immutable2.default.Map)]),
  /**
    * The Mapbox API access token to provide to mapbox-gl-js. This is required
    * when using Mapbox provided vector tiles and styles.
    */
  mapboxApiAccessToken: _react.PropTypes.string,
  /**
    * `onChangeViewport` callback is fired when the user interacted with the
    * map. The object passed to the callback contains `latitude`,
    * `longitude` and `zoom` and additional state information.
    */
  onChangeViewport: _react.PropTypes.func,
  /**
    * The width of the map.
    */
  width: _react.PropTypes.number.isRequired,
  /**
    * The height of the map.
    */
  height: _react.PropTypes.number.isRequired,
  /**
    * Is the component currently being dragged. This is used to show/hide the
    * drag cursor. Also used as an optimization in some overlays by preventing
    * rendering while dragging.
    */
  isDragging: _react.PropTypes.bool,
  /**
    * Required to calculate the mouse projection after the first click event
    * during dragging. Where the map is depends on where you first clicked on
    * the map.
    */
  startDragLngLat: _react.PropTypes.array,
  /**
    * Called when a feature is hovered over. Features must set the
    * `interactive` property to `true` for this to work properly. see the
    * Mapbox example: https://www.mapbox.com/mapbox-gl-js/example/featuresat/
    * The first argument of the callback will be the array of feature the
    * mouse is over. This is the same response returned from `featuresAt`.
    */
  onHoverFeatures: _react.PropTypes.func,
  /**
    * Defaults to TRUE
    * Set to false to enable onHoverFeatures to be called regardless if
    * there is an actual feature at x, y. This is useful to emulate
    * "mouse-out" behaviors on features.
    */
  ignoreEmptyFeatures: _react.PropTypes.bool,

  /**
    * Show attribution control or not.
    */
  attributionControl: _react.PropTypes.bool,

  /**
    * Called when a feature is clicked on. Features must set the
    * `interactive` property to `true` for this to work properly. see the
    * Mapbox example: https://www.mapbox.com/mapbox-gl-js/example/featuresat/
    * The first argument of the callback will be the array of feature the
    * mouse is over. This is the same response returned from `featuresAt`.
    */
  onClickFeatures: _react.PropTypes.func,

  /**
    * Radius to detect features around a clicked point. Defaults to 15.
    */
  clickRadius: _react.PropTypes.number,

  /**
    * Passed to Mapbox Map constructor which passes it to the canvas context.
    * This is unseful when you want to export the canvas as a PNG.
    */
  preserveDrawingBuffer: _react.PropTypes.bool,

  /**
    * There are still known issues with style diffing. As a temporary stopgap,
    * add the option to prevent style diffing.
    */
  preventStyleDiffing: _react.PropTypes.bool,

  /**
    * Enables perspective control event handling (Command-rotate)
    */
  perspectiveEnabled: _react.PropTypes.bool,

  /**
    * Specify the bearing of the viewport
    */
  bearing: _react2.default.PropTypes.number,

  /**
    * Specify the pitch of the viewport
    */
  pitch: _react2.default.PropTypes.number,

  /**
    * Specify the altitude of the viewport camera
    * Unit: map heights, default 1.5
    * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
    */
  altitude: _react2.default.PropTypes.number
};

var DEFAULT_PROPS = {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  onChangeViewport: null,
  mapboxApiAccessToken: _config2.default.DEFAULTS.MAPBOX_API_ACCESS_TOKEN,
  preserveDrawingBuffer: false,
  attributionControl: true,
  ignoreEmptyFeatures: true,
  bearing: 0,
  pitch: 0,
  altitude: 1.5,
  clickRadius: 15
};

var MapGL = (0, _pureRenderDecorator2.default)(_class = (_class2 = function (_Component) {
  _inherits(MapGL, _Component);

  function MapGL(props) {
    _classCallCheck(this, MapGL);

    var _this = _possibleConstructorReturn(this, (MapGL.__proto__ || Object.getPrototypeOf(MapGL)).call(this, props));

    _this.state = {
      isDragging: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    };
    _mapboxGl2.default.accessToken = props.mapboxApiAccessToken;
    return _this;
  }

  _createClass(MapGL, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle instanceof _immutable2.default.Map ? this.props.mapStyle.toJS() : this.props.mapStyle;
      var map = new _mapboxGl2.default.Map({
        container: this.refs.mapboxMap,
        center: [this.props.longitude, this.props.latitude],
        zoom: this.props.zoom,
        pitch: this.props.pitch,
        bearing: this.props.bearing,
        style: mapStyle,
        interactive: false,
        preserveDrawingBuffer: this.props.preserveDrawingBuffer
        // TODO?
        // attributionControl: this.props.attributionControl
      });

      (0, _d3Selection.select)(map.getCanvas()).style('outline', 'none');

      this._map = map;
      this._updateMapViewport({}, this.props);
      this._callOnChangeViewport(map.transform);
    }

    // New props are comin' round the corner!

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._updateStateFromProps(this.props, newProps);
      this._updateMapViewport(this.props, newProps);
      this._updateMapStyle(this.props, newProps);
      // Save width/height so that we can check them in componentDidUpdate
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // map.resize() reads size from DOM, we need to call after render
      this._updateMapSize(this.state, this.props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._map) {
        this._map.remove();
      }
    }
  }, {
    key: '_cursor',
    value: function _cursor() {
      var isInteractive = this.props.onChangeViewport || this.props.onClickFeature || this.props.onHoverFeatures;
      if (isInteractive) {
        return this.props.isDragging ? _config2.default.CURSOR.GRABBING : _config2.default.CURSOR.GRAB;
      }
      return 'inherit';
    }
  }, {
    key: '_getMap',
    value: function _getMap() {
      return this._map;
    }
  }, {
    key: '_updateStateFromProps',
    value: function _updateStateFromProps(oldProps, newProps) {
      _mapboxGl2.default.accessToken = newProps.mapboxApiAccessToken;
      var startDragLngLat = newProps.startDragLngLat;

      this.setState({
        startDragLngLat: startDragLngLat && startDragLngLat.slice()
      });
    }
  }, {
    key: '_updateSource',
    value: function _updateSource(map, update) {
      var newSource = update.source.toJS();
      if (newSource.type === 'geojson') {
        var oldSource = map.getSource(update.id);
        if (oldSource instanceof _mapboxGl2.default.GeoJSONSource) {
          // update data if no other GeoJSONSource options were changed
          if ((newSource.maxzoom === undefined || newSource.maxzoom === oldSource.geojsonVtOptions.maxZoom) && (newSource.buffer === undefined || newSource.buffer === oldSource.geojsonVtOptions.buffer) && (newSource.tolerance === undefined || newSource.tolerance === oldSource.geojsonVtOptions.tolerance) && (newSource.cluster === undefined || newSource.cluster === oldSource.cluster) && (newSource.clusterRadius === undefined || newSource.clusterRadius === oldSource.superclusterOptions.radius) && (newSource.clusterMaxZoom === undefined || newSource.clusterMaxZoom === oldSource.superclusterOptions.maxZoom)) {
            oldSource.setData(newSource.data);
            return;
          }
        }
      }

      map.removeSource(update.id);
      map.addSource(update.id, newSource);
    }

    // Individually update the maps source and layers that have changed if all
    // other style props haven't changed. This prevents flicking of the map when
    // styles only change sources or layers.
    /* eslint-disable max-statements, complexity */

  }, {
    key: '_setDiffStyle',
    value: function _setDiffStyle(prevStyle, nextStyle) {
      var prevKeysMap = prevStyle && styleKeysMap(prevStyle) || {};
      var nextKeysMap = styleKeysMap(nextStyle);
      function styleKeysMap(style) {
        return style.map(function () {
          return true;
        }).delete('layers').delete('sources').toJS();
      }
      function propsOtherThanLayersOrSourcesDiffer() {
        var prevKeysList = Object.keys(prevKeysMap);
        var nextKeysList = Object.keys(nextKeysMap);
        if (prevKeysList.length !== nextKeysList.length) {
          return true;
        }
        // `nextStyle` and `prevStyle` should not have the same set of props.
        if (nextKeysList.some(function (key) {
          return prevStyle.get(key) !== nextStyle.get(key);
        }
        // But the value of one of those props is different.
        )) {
          return true;
        }
        return false;
      }

      var map = this._getMap();

      if (!prevStyle || propsOtherThanLayersOrSourcesDiffer()) {
        map.setStyle(nextStyle.toJS());
        return;
      }

      var _diffStyles = (0, _diffStyles3.default)(prevStyle, nextStyle);

      var sourcesDiff = _diffStyles.sourcesDiff;
      var layersDiff = _diffStyles.layersDiff;

      // TODO: It's rather difficult to determine style diffing in the presence
      // of refs. For now, if any style update has a ref, fallback to no diffing.
      // We can come back to this case if there's a solid usecase.

      if (layersDiff.updates.some(function (node) {
        return node.layer.get('ref');
      })) {
        map.setStyle(nextStyle.toJS());
        return;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sourcesDiff.enter[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var enter = _step.value;

          map.addSource(enter.id, enter.source.toJS());
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = sourcesDiff.update[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var update = _step2.value;

          this._updateSource(map, update);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = sourcesDiff.exit[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var exit = _step3.value;

          map.removeSource(exit.id);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = layersDiff.exiting[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _exit = _step4.value;

          if (map.style.getLayer(_exit.id)) {
            map.removeLayer(_exit.id);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = layersDiff.updates[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _update = _step5.value;

          if (!_update.enter) {
            // This is an old layer that needs to be updated. Remove the old layer
            // with the same id and add it back again.
            map.removeLayer(_update.id);
          }
          map.addLayer(_update.layer.toJS(), _update.before);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
    /* eslint-enable max-statements, complexity */

  }, {
    key: '_updateMapStyle',
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;
      if (mapStyle !== oldMapStyle) {
        if (mapStyle instanceof _immutable2.default.Map) {
          if (this.props.preventStyleDiffing) {
            this._getMap().setStyle(mapStyle.toJS());
          } else {
            this._setDiffStyle(oldMapStyle, mapStyle);
          }
        } else {
          this._getMap().setStyle(mapStyle);
        }
      }
    }
  }, {
    key: '_updateMapViewport',
    value: function _updateMapViewport(oldProps, newProps) {
      var viewportChanged = newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom || newProps.pitch !== oldProps.pitch || newProps.zoom !== oldProps.bearing || newProps.altitude !== oldProps.altitude;

      var map = this._getMap();

      if (viewportChanged) {
        map.jumpTo({
          center: [newProps.longitude, newProps.latitude],
          zoom: newProps.zoom,
          bearing: newProps.bearing,
          pitch: newProps.pitch
        });

        // TODO - jumpTo doesn't handle altitude
        if (newProps.altitude !== oldProps.altitude) {
          map.transform.altitude = newProps.altitude;
        }
      }
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        var map = this._getMap();
        map.resize();
        this._callOnChangeViewport(map.transform);
      }
    }
  }, {
    key: '_calculateNewPitchAndBearing',
    value: function _calculateNewPitchAndBearing(_ref) {
      var pos = _ref.pos;
      var startPos = _ref.startPos;
      var startBearing = _ref.startBearing;
      var startPitch = _ref.startPitch;

      var xDelta = pos.x - startPos.x;
      var bearing = startBearing + 180 * xDelta / this.props.width;

      var pitch = startPitch;
      var yDelta = pos.y - startPos.y;
      if (yDelta > 0) {
        // Dragging downwards, gradually decrease pitch
        if (Math.abs(this.props.height - startPos.y) > PITCH_MOUSE_THRESHOLD) {
          var scale = yDelta / (this.props.height - startPos.y);
          pitch = (1 - scale) * PITCH_ACCEL * startPitch;
        }
      } else if (yDelta < 0) {
        // Dragging upwards, gradually increase pitch
        if (startPos.y > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to 1 as we drag upwards
          var yScale = 1 - pos.y / startPos.y;
          // Gradually add until we hit max pitch
          pitch = startPitch + yScale * (MAX_PITCH - startPitch);
        }
      }

      // console.debug(startPitch, pitch);
      return {
        pitch: Math.max(Math.min(pitch, MAX_PITCH), 0),
        bearing: bearing
      };
    }

    // Helper to call props.onChangeViewport

  }, {
    key: '_callOnChangeViewport',
    value: function _callOnChangeViewport(transform) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (this.props.onChangeViewport) {
        this.props.onChangeViewport(_extends({
          latitude: transform.center.lat,
          longitude: (0, _transform.mod)(transform.center.lng + 180, 360) - 180,
          zoom: transform.zoom,
          pitch: transform.pitch,
          bearing: (0, _transform.mod)(transform.bearing + 180, 360) - 180,

          isDragging: this.props.isDragging,
          startDragLngLat: this.props.startDragLngLat,
          startBearing: this.props.startBearing,
          startPitch: this.props.startPitch

        }, opts));
      }
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(_ref2) {
      var pos = _ref2.pos;

      this._onMouseDown({ pos: pos });
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(_ref3) {
      var pos = _ref3.pos;

      var map = this._getMap();
      var lngLat = (0, _transform.unprojectFromTransform)(map.transform, pos);
      this._callOnChangeViewport(map.transform, {
        isDragging: true,
        startDragLngLat: [lngLat.lng, lngLat.lat],
        startBearing: map.transform.bearing,
        startPitch: map.transform.pitch
      });
    }
  }, {
    key: '_onTouchDrag',
    value: function _onTouchDrag(_ref4) {
      var pos = _ref4.pos;

      this._onMouseDrag({ pos: pos });
    }
  }, {
    key: '_onMouseDrag',
    value: function _onMouseDrag(_ref5) {
      var pos = _ref5.pos;

      if (!this.props.onChangeViewport) {
        return;
      }

      // take the start lnglat and put it where the mouse is down.
      (0, _assert2.default)(this.props.startDragLngLat, '`startDragLngLat` prop is required ' + 'for mouse drag behavior to calculate where to position the map.');

      var map = this._getMap();
      var transform = (0, _transform.cloneTransform)(map.transform);
      transform.setLocationAtPoint(this.props.startDragLngLat, pos);
      this._callOnChangeViewport(transform, {
        isDragging: true
      });
    }
  }, {
    key: '_onTouchRotate',
    value: function _onTouchRotate(_ref6) {
      var pos = _ref6.pos;
      var startPos = _ref6.startPos;

      this._onMouseRotate({ pos: pos, startPos: startPos });
    }
  }, {
    key: '_onMouseRotate',
    value: function _onMouseRotate(_ref7) {
      var pos = _ref7.pos;
      var startPos = _ref7.startPos;

      if (!this.props.onChangeViewport || !this.props.perspectiveEnabled) {
        return;
      }

      var _props = this.props;
      var startBearing = _props.startBearing;
      var startPitch = _props.startPitch;

      (0, _assert2.default)(typeof startBearing === 'number', '`startBearing` prop is required for mouse rotate behavior');
      (0, _assert2.default)(typeof startPitch === 'number', '`startPitch` prop is required for mouse rotate behavior');

      var map = this._getMap();

      var _calculateNewPitchAnd = this._calculateNewPitchAndBearing({
        pos: pos,
        startPos: startPos,
        startBearing: startBearing,
        startPitch: startPitch
      });

      var pitch = _calculateNewPitchAnd.pitch;
      var bearing = _calculateNewPitchAnd.bearing;


      var transform = (0, _transform.cloneTransform)(map.transform);
      transform.bearing = bearing;
      transform.pitch = pitch;

      this._callOnChangeViewport(transform, {
        isDragging: true
      });
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(opt) {
      var map = this._getMap();
      var pos = opt.pos;
      if (!this.props.onHoverFeatures) {
        return;
      }
      var features = map.queryRenderedFeatures([pos.x, pos.y]);
      if (!features.length && this.props.ignoreEmptyFeatures) {
        return;
      }
      this.props.onHoverFeatures(features);
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(opt) {
      this._onMouseUp(opt);
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(opt) {
      var map = this._getMap();
      this._callOnChangeViewport(map.transform, {
        isDragging: false,
        startDragLngLat: null,
        startBearing: null,
        startPitch: null
      });

      if (!this.props.onClickFeatures) {
        return;
      }

      var pos = opt.pos;

      // Radius enables point features, like marker symbols, to be clicked.
      var size = this.props.clickRadius;
      var bbox = [[pos.x - size, pos.y - size], [pos.x + size, pos.y + size]];
      var features = map.queryRenderedFeatures(bbox);
      if (!features.length && this.props.ignoreEmptyFeatures) {
        return;
      }
      this.props.onClickFeatures(features);
    }
  }, {
    key: '_onZoom',
    value: function _onZoom(_ref8) {
      var pos = _ref8.pos;
      var scale = _ref8.scale;

      var map = this._getMap();
      var transform = (0, _transform.cloneTransform)(map.transform);
      var around = (0, _transform.unprojectFromTransform)(transform, pos);
      transform.zoom = transform.scaleZoom(map.transform.scale * scale);
      transform.setLocationAtPoint(around, pos);
      this._callOnChangeViewport(transform, {
        isDragging: true
      });
    }
  }, {
    key: '_onZoomEnd',
    value: function _onZoomEnd() {
      var map = this._getMap();
      this._callOnChangeViewport(map.transform, {
        isDragging: false
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var className = _props2.className;
      var width = _props2.width;
      var height = _props2.height;
      var style = _props2.style;

      var mapStyle = _extends({}, style, {
        width: width,
        height: height,
        cursor: this._cursor()
      });

      var content = [_react2.default.createElement('div', { key: 'map', ref: 'mapboxMap',
        style: mapStyle, className: className }), _react2.default.createElement(
        'div',
        { key: 'overlays', className: 'overlays',
          style: { position: 'absolute', left: 0, top: 0 } },
        this.props.children
      )];

      if (this.props.onChangeViewport) {
        content = _react2.default.createElement(
          _mapInteractions2.default,
          {
            onMouseDown: this._onMouseDown,
            onMouseDrag: this._onMouseDrag,
            onMouseRotate: this._onMouseRotate,
            onMouseUp: this._onMouseUp,
            onMouseMove: this._onMouseMove,
            onTouchStart: this._onTouchStart,
            onTouchDrag: this._onTouchDrag,
            onTouchRotate: this._onTouchRotate,
            onTouchEnd: this._onTouchEnd,
            onZoom: this._onZoom,
            onZoomEnd: this._onZoomEnd,
            width: this.props.width,
            height: this.props.height },
          content
        );
      }

      return _react2.default.createElement(
        'div',
        {
          style: _extends({}, this.props.style, {
            width: this.props.width,
            height: this.props.height,
            position: 'relative'
          }) },
        content
      );
    }
  }]);

  return MapGL;
}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, '_onTouchStart', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchStart'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseDown', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseDown'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchDrag', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchDrag'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseDrag', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseDrag'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchRotate', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchRotate'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseRotate', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseRotate'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseMove'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchEnd'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseUp', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseUp'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onZoom', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onZoom'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onZoomEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onZoomEnd'), _class2.prototype)), _class2)) || _class;

exports.default = MapGL;


MapGL.propTypes = PROP_TYPES;
MapGL.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXAucmVhY3QuanMiXSwibmFtZXMiOlsiTUFYX1BJVENIIiwiUElUQ0hfTU9VU0VfVEhSRVNIT0xEIiwiUElUQ0hfQUNDRUwiLCJQUk9QX1RZUEVTIiwibGF0aXR1ZGUiLCJudW1iZXIiLCJpc1JlcXVpcmVkIiwibG9uZ2l0dWRlIiwiem9vbSIsIm1hcFN0eWxlIiwib25lT2ZUeXBlIiwic3RyaW5nIiwiaW5zdGFuY2VPZiIsIk1hcCIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwib25DaGFuZ2VWaWV3cG9ydCIsImZ1bmMiLCJ3aWR0aCIsImhlaWdodCIsImlzRHJhZ2dpbmciLCJib29sIiwic3RhcnREcmFnTG5nTGF0IiwiYXJyYXkiLCJvbkhvdmVyRmVhdHVyZXMiLCJpZ25vcmVFbXB0eUZlYXR1cmVzIiwiYXR0cmlidXRpb25Db250cm9sIiwib25DbGlja0ZlYXR1cmVzIiwiY2xpY2tSYWRpdXMiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwicGVyc3BlY3RpdmVFbmFibGVkIiwiYmVhcmluZyIsIlByb3BUeXBlcyIsInBpdGNoIiwiYWx0aXR1ZGUiLCJERUZBVUxUX1BST1BTIiwiREVGQVVMVFMiLCJNQVBCT1hfQVBJX0FDQ0VTU19UT0tFTiIsIk1hcEdMIiwicHJvcHMiLCJzdGF0ZSIsInN0YXJ0QmVhcmluZyIsInN0YXJ0UGl0Y2giLCJhY2Nlc3NUb2tlbiIsInRvSlMiLCJtYXAiLCJjb250YWluZXIiLCJyZWZzIiwibWFwYm94TWFwIiwiY2VudGVyIiwic3R5bGUiLCJpbnRlcmFjdGl2ZSIsImdldENhbnZhcyIsIl9tYXAiLCJfdXBkYXRlTWFwVmlld3BvcnQiLCJfY2FsbE9uQ2hhbmdlVmlld3BvcnQiLCJ0cmFuc2Zvcm0iLCJuZXdQcm9wcyIsIl91cGRhdGVTdGF0ZUZyb21Qcm9wcyIsIl91cGRhdGVNYXBTdHlsZSIsInNldFN0YXRlIiwiX3VwZGF0ZU1hcFNpemUiLCJyZW1vdmUiLCJpc0ludGVyYWN0aXZlIiwib25DbGlja0ZlYXR1cmUiLCJDVVJTT1IiLCJHUkFCQklORyIsIkdSQUIiLCJvbGRQcm9wcyIsInNsaWNlIiwidXBkYXRlIiwibmV3U291cmNlIiwic291cmNlIiwidHlwZSIsIm9sZFNvdXJjZSIsImdldFNvdXJjZSIsImlkIiwiR2VvSlNPTlNvdXJjZSIsIm1heHpvb20iLCJ1bmRlZmluZWQiLCJnZW9qc29uVnRPcHRpb25zIiwibWF4Wm9vbSIsImJ1ZmZlciIsInRvbGVyYW5jZSIsImNsdXN0ZXIiLCJjbHVzdGVyUmFkaXVzIiwic3VwZXJjbHVzdGVyT3B0aW9ucyIsInJhZGl1cyIsImNsdXN0ZXJNYXhab29tIiwic2V0RGF0YSIsImRhdGEiLCJyZW1vdmVTb3VyY2UiLCJhZGRTb3VyY2UiLCJwcmV2U3R5bGUiLCJuZXh0U3R5bGUiLCJwcmV2S2V5c01hcCIsInN0eWxlS2V5c01hcCIsIm5leHRLZXlzTWFwIiwiZGVsZXRlIiwicHJvcHNPdGhlclRoYW5MYXllcnNPclNvdXJjZXNEaWZmZXIiLCJwcmV2S2V5c0xpc3QiLCJPYmplY3QiLCJrZXlzIiwibmV4dEtleXNMaXN0IiwibGVuZ3RoIiwic29tZSIsImdldCIsImtleSIsIl9nZXRNYXAiLCJzZXRTdHlsZSIsInNvdXJjZXNEaWZmIiwibGF5ZXJzRGlmZiIsInVwZGF0ZXMiLCJub2RlIiwibGF5ZXIiLCJlbnRlciIsIl91cGRhdGVTb3VyY2UiLCJleGl0IiwiZXhpdGluZyIsImdldExheWVyIiwicmVtb3ZlTGF5ZXIiLCJhZGRMYXllciIsImJlZm9yZSIsIm9sZE1hcFN0eWxlIiwiX3NldERpZmZTdHlsZSIsInZpZXdwb3J0Q2hhbmdlZCIsImp1bXBUbyIsInNpemVDaGFuZ2VkIiwicmVzaXplIiwicG9zIiwic3RhcnRQb3MiLCJ4RGVsdGEiLCJ4IiwieURlbHRhIiwieSIsIk1hdGgiLCJhYnMiLCJzY2FsZSIsInlTY2FsZSIsIm1heCIsIm1pbiIsIm9wdHMiLCJsYXQiLCJsbmciLCJfb25Nb3VzZURvd24iLCJsbmdMYXQiLCJfb25Nb3VzZURyYWciLCJzZXRMb2NhdGlvbkF0UG9pbnQiLCJfb25Nb3VzZVJvdGF0ZSIsIl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmciLCJvcHQiLCJmZWF0dXJlcyIsInF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyIsIl9vbk1vdXNlVXAiLCJzaXplIiwiYmJveCIsImFyb3VuZCIsInNjYWxlWm9vbSIsImNsYXNzTmFtZSIsImN1cnNvciIsIl9jdXJzb3IiLCJjb250ZW50IiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwiY2hpbGRyZW4iLCJfb25Nb3VzZU1vdmUiLCJfb25Ub3VjaFN0YXJ0IiwiX29uVG91Y2hEcmFnIiwiX29uVG91Y2hSb3RhdGUiLCJfb25Ub3VjaEVuZCIsIl9vblpvb20iLCJfb25ab29tRW5kIiwicHJvcFR5cGVzIiwiZGVmYXVsdFByb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztvQ0FBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBO0FBQ0EsSUFBTUEsWUFBWSxFQUFsQjtBQUNBLElBQU1DLHdCQUF3QixFQUE5QjtBQUNBLElBQU1DLGNBQWMsR0FBcEI7O0FBRUEsSUFBTUMsYUFBYTtBQUNqQjs7O0FBR0FDLFlBQVUsaUJBQVVDLE1BQVYsQ0FBaUJDLFVBSlY7QUFLakI7OztBQUdBQyxhQUFXLGlCQUFVRixNQUFWLENBQWlCQyxVQVJYO0FBU2pCOzs7QUFHQUUsUUFBTSxpQkFBVUgsTUFBVixDQUFpQkMsVUFaTjtBQWFqQjs7OztBQUlBRyxZQUFVLGlCQUFVQyxTQUFWLENBQW9CLENBQzVCLGlCQUFVQyxNQURrQixFQUU1QixpQkFBVUMsVUFB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QUFLQyxhQU52QjtBQU9FLHlCQUFlLEtBQUtDLFlBUHRCO0FBUUUsMkJBQWlCLEtBQUtDLGNBUnhCO0FBU0Usd0JBQWMsS0FBS0MsV0FUckI7QUFVRSxvQkFBVSxLQUFLQyxPQVZqQjtBQVdFLHVCQUFhLEtBQUtDLFVBWHBCO0FBWUUsbUJBQVMsS0FBS3JJLEtBQUwsQ0FBV3RCLEtBWnRCO0FBYUUsb0JBQVUsS0FBS3NCLEtBQUwsQ0FBV3JCLE1BYnZCO0FBZUkrSTtBQWZKLFNBREY7QUFvQkQ7O0FBRUQsYUFDRTtBQUFBO0FBQUE7QUFDRSw4QkFDSyxLQUFLMUgsS0FBTCxDQUFXVyxLQURoQjtBQUVFakMsbUJBQU8sS0FBS3NCLEtBQUwsQ0FBV3RCLEtBRnBCO0FBR0VDLG9CQUFRLEtBQUtxQixLQUFMLENBQVdyQixNQUhyQjtBQUlFZ0osc0JBQVU7QUFKWixZQURGO0FBUUlEO0FBUkosT0FERjtBQWFEOzs7Ozs7a0JBcGRrQjNILEs7OztBQXVkckJBLE1BQU11SSxTQUFOLEdBQWtCMUssVUFBbEI7QUFDQW1DLE1BQU13SSxZQUFOLEdBQXFCM0ksYUFBckIiLCJmaWxlIjoibWFwLnJlYWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlcywgQ29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnYXV0b2JpbmQtZGVjb3JhdG9yJztcbmltcG9ydCBwdXJlUmVuZGVyIGZyb20gJ3B1cmUtcmVuZGVyLWRlY29yYXRvcic7XG5cbmltcG9ydCBtYXBib3hnbCBmcm9tICdtYXBib3gtZ2wnO1xuaW1wb3J0IHtzZWxlY3R9IGZyb20gJ2QzLXNlbGVjdGlvbic7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCBNYXBJbnRlcmFjdGlvbnMgZnJvbSAnLi9tYXAtaW50ZXJhY3Rpb25zLnJlYWN0JztcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQgZGlmZlN0eWxlcyBmcm9tICcuL3V0aWxzL2RpZmYtc3R5bGVzJztcbmltcG9ydCB7bW9kLCB1bnByb2plY3RGcm9tVHJhbnNmb3JtLCBjbG9uZVRyYW5zZm9ybX0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0nO1xuXG4vLyBOb3RlOiBNYXggcGl0Y2ggaXMgYSBoYXJkIGNvZGVkIHZhbHVlIChub3QgYSBuYW1lZCBjb25zdGFudCkgaW4gdHJhbnNmb3JtLmpzXG5jb25zdCBNQVhfUElUQ0ggPSA2MDtcbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDIwO1xuY29uc3QgUElUQ0hfQUNDRUwgPSAxLjI7XG5cbmNvbnN0IFBST1BfVFlQRVMgPSB7XG4gIC8qKlxuICAgICogVGhlIGxhdGl0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC5cbiAgICAqL1xuICBsYXRpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSBsb25naXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLlxuICAgICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC5cbiAgICAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogVGhlIE1hcGJveCBzdHlsZSB0aGUgY29tcG9uZW50IHNob3VsZCB1c2UuIENhbiBlaXRoZXIgYmUgYSBzdHJpbmcgdXJsXG4gICAgKiBvciBhIE1hcGJveEdMIHN0eWxlIEltbXV0YWJsZS5NYXAgb2JqZWN0LlxuICAgICovXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIFByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5NYXApXG4gIF0pLFxuICAvKipcbiAgICAqIFRoZSBNYXBib3ggQVBJIGFjY2VzcyB0b2tlbiB0byBwcm92aWRlIHRvIG1hcGJveC1nbC1qcy4gVGhpcyBpcyByZXF1aXJlZFxuICAgICogd2hlbiB1c2luZyBNYXBib3ggcHJvdmlkZWQgdmVjdG9yIHRpbGVzIGFuZCBzdHlsZXMuXG4gICAgKi9cbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcsXG4gIC8qKlxuICAgICogYG9uQ2hhbmdlVmlld3BvcnRgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgICogbWFwLiBUaGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgY2FsbGJhY2sgY29udGFpbnMgYGxhdGl0dWRlYCxcbiAgICAqIGBsb25naXR1ZGVgIGFuZCBgem9vbWAgYW5kIGFkZGl0aW9uYWwgc3RhdGUgaW5mb3JtYXRpb24uXG4gICAgKi9cbiAgb25DaGFuZ2VWaWV3cG9ydDogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgICogVGhlIHdpZHRoIG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqXG4gICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogSXMgdGhlIGNvbXBvbmVudCBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC4gVGhpcyBpcyB1c2VkIHRvIHNob3cvaGlkZSB0aGVcbiAgICAqIGRyYWcgY3Vyc29yLiBBbHNvIHVzZWQgYXMgYW4gb3B0aW1pemF0aW9uIGluIHNvbWUgb3ZlcmxheXMgYnkgcHJldmVudGluZ1xuICAgICogcmVuZGVyaW5nIHdoaWxlIGRyYWdnaW5nLlxuICAgICovXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICAvKipcbiAgICAqIFJlcXVpcmVkIHRvIGNhbGN1bGF0ZSB0aGUgbW91c2UgcHJvamVjdGlvbiBhZnRlciB0aGUgZmlyc3QgY2xpY2sgZXZlbnRcbiAgICAqIGR1cmluZyBkcmFnZ2luZy4gV2hlcmUgdGhlIG1hcCBpcyBkZXBlbmRzIG9uIHdoZXJlIHlvdSBmaXJzdCBjbGlja2VkIG9uXG4gICAgKiB0aGUgbWFwLlxuICAgICovXG4gIHN0YXJ0RHJhZ0xuZ0xhdDogUHJvcFR5cGVzLmFycmF5LFxuICAvKipcbiAgICAqIENhbGxlZCB3aGVuIGEgZmVhdHVyZSBpcyBob3ZlcmVkIG92ZXIuIEZlYXR1cmVzIG11c3Qgc2V0IHRoZVxuICAgICogYGludGVyYWN0aXZlYCBwcm9wZXJ0eSB0byBgdHJ1ZWAgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseS4gc2VlIHRoZVxuICAgICogTWFwYm94IGV4YW1wbGU6IGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvZmVhdHVyZXNhdC9cbiAgICAqIFRoZSBmaXJzdCBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2sgd2lsbCBiZSB0aGUgYXJyYXkgb2YgZmVhdHVyZSB0aGVcbiAgICAqIG1vdXNlIGlzIG92ZXIuIFRoaXMgaXMgdGhlIHNhbWUgcmVzcG9uc2UgcmV0dXJuZWQgZnJvbSBgZmVhdHVyZXNBdGAuXG4gICAgKi9cbiAgb25Ib3ZlckZlYXR1cmVzOiBQcm9wVHlwZXMuZnVuYyxcbiAgLyoqXG4gICAgKiBEZWZhdWx0cyB0byBUUlVFXG4gICAgKiBTZXQgdG8gZmFsc2UgdG8gZW5hYmxlIG9uSG92ZXJGZWF0dXJlcyB0byBiZSBjYWxsZWQgcmVnYXJkbGVzcyBpZlxuICAgICogdGhlcmUgaXMgYW4gYWN0dWFsIGZlYXR1cmUgYXQgeCwgeS4gVGhpcyBpcyB1c2VmdWwgdG8gZW11bGF0ZVxuICAgICogXCJtb3VzZS1vdXRcIiBiZWhhdmlvcnMgb24gZmVhdHVyZXMuXG4gICAgKi9cbiAgaWdub3JlRW1wdHlGZWF0dXJlczogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBTaG93IGF0dHJpYnV0aW9uIGNvbnRyb2wgb3Igbm90LlxuICAgICovXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiBhIGZlYXR1cmUgaXMgY2xpY2tlZCBvbi4gRmVhdHVyZXMgbXVzdCBzZXQgdGhlXG4gICAgKiBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IHRvIGB0cnVlYCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5LiBzZWUgdGhlXG4gICAgKiBNYXBib3ggZXhhbXBsZTogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS9mZWF0dXJlc2F0L1xuICAgICogVGhlIGZpcnN0IGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjayB3aWxsIGJlIHRoZSBhcnJheSBvZiBmZWF0dXJlIHRoZVxuICAgICogbW91c2UgaXMgb3Zlci4gVGhpcyBpcyB0aGUgc2FtZSByZXNwb25zZSByZXR1cm5lZCBmcm9tIGBmZWF0dXJlc0F0YC5cbiAgICAqL1xuICBvbkNsaWNrRmVhdHVyZXM6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKlxuICAgICogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAxNS5cbiAgICAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICAqIFBhc3NlZCB0byBNYXBib3ggTWFwIGNvbnN0cnVjdG9yIHdoaWNoIHBhc3NlcyBpdCB0byB0aGUgY2FudmFzIGNvbnRleHQuXG4gICAgKiBUaGlzIGlzIHVuc2VmdWwgd2hlbiB5b3Ugd2FudCB0byBleHBvcnQgdGhlIGNhbnZhcyBhcyBhIFBORy5cbiAgICAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogVGhlcmUgYXJlIHN0aWxsIGtub3duIGlzc3VlcyB3aXRoIHN0eWxlIGRpZmZpbmcuIEFzIGEgdGVtcG9yYXJ5IHN0b3BnYXAsXG4gICAgKiBhZGQgdGhlIG9wdGlvbiB0byBwcmV2ZW50IHN0eWxlIGRpZmZpbmcuXG4gICAgKi9cbiAgcHJldmVudFN0eWxlRGlmZmluZzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBFbmFibGVzIHBlcnNwZWN0aXZlIGNvbnRyb2wgZXZlbnQgaGFuZGxpbmcgKENvbW1hbmQtcm90YXRlKVxuICAgICovXG4gIHBlcnNwZWN0aXZlRW5hYmxlZDogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydFxuICAgICovXG4gIGJlYXJpbmc6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqXG4gICAgKiBTcGVjaWZ5IHRoZSBwaXRjaCBvZiB0aGUgdmlld3BvcnRcbiAgICAqL1xuICBwaXRjaDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmFcbiAgICAqIFVuaXQ6IG1hcCBoZWlnaHRzLCBkZWZhdWx0IDEuNVxuICAgICogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICAgICovXG4gIGFsdGl0dWRlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG59O1xuXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICBvbkNoYW5nZVZpZXdwb3J0OiBudWxsLFxuICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogY29uZmlnLkRFRkFVTFRTLk1BUEJPWF9BUElfQUNDRVNTX1RPS0VOLFxuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IHRydWUsXG4gIGlnbm9yZUVtcHR5RmVhdHVyZXM6IHRydWUsXG4gIGJlYXJpbmc6IDAsXG4gIHBpdGNoOiAwLFxuICBhbHRpdHVkZTogMS41LFxuICBjbGlja1JhZGl1czogMTVcbn07XG5cbkBwdXJlUmVuZGVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBHTCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgc3RhcnREcmFnTG5nTGF0OiBudWxsLFxuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH07XG4gICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBwcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbjtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IG1hcFN0eWxlID0gdGhpcy5wcm9wcy5tYXBTdHlsZSBpbnN0YW5jZW9mIEltbXV0YWJsZS5NYXAgP1xuICAgICAgdGhpcy5wcm9wcy5tYXBTdHlsZS50b0pTKCkgOlxuICAgICAgdGhpcy5wcm9wcy5tYXBTdHlsZTtcbiAgICBjb25zdCBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgIGNvbnRhaW5lcjogdGhpcy5yZWZzLm1hcGJveE1hcCxcbiAgICAgIGNlbnRlcjogW3RoaXMucHJvcHMubG9uZ2l0dWRlLCB0aGlzLnByb3BzLmxhdGl0dWRlXSxcbiAgICAgIHpvb206IHRoaXMucHJvcHMuem9vbSxcbiAgICAgIHBpdGNoOiB0aGlzLnByb3BzLnBpdGNoLFxuICAgICAgYmVhcmluZzogdGhpcy5wcm9wcy5iZWFyaW5nLFxuICAgICAgc3R5bGU6IG1hcFN0eWxlLFxuICAgICAgaW50ZXJhY3RpdmU6IGZhbHNlLFxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0aGlzLnByb3BzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxuICAgICAgLy8gVE9ETz9cbiAgICAgIC8vIGF0dHJpYnV0aW9uQ29udHJvbDogdGhpcy5wcm9wcy5hdHRyaWJ1dGlvbkNvbnRyb2xcbiAgICB9KTtcblxuICAgIHNlbGVjdChtYXAuZ2V0Q2FudmFzKCkpLnN0eWxlKCdvdXRsaW5lJywgJ25vbmUnKTtcblxuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh7fSwgdGhpcy5wcm9wcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSk7XG4gIH1cblxuICAvLyBOZXcgcHJvcHMgYXJlIGNvbWluJyByb3VuZCB0aGUgY29ybmVyIVxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5fdXBkYXRlU3RhdGVGcm9tUHJvcHModGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTdHlsZSh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgLy8gU2F2ZSB3aWR0aC9oZWlnaHQgc28gdGhhdCB3ZSBjYW4gY2hlY2sgdGhlbSBpbiBjb21wb25lbnREaWRVcGRhdGVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NLCB3ZSBuZWVkIHRvIGNhbGwgYWZ0ZXIgcmVuZGVyXG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSh0aGlzLnN0YXRlLCB0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICBfY3Vyc29yKCkge1xuICAgIGNvbnN0IGlzSW50ZXJhY3RpdmUgPVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0IHx8XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2tGZWF0dXJlIHx8XG4gICAgICB0aGlzLnByb3BzLm9uSG92ZXJGZWF0dXJlcztcbiAgICBpZiAoaXNJbnRlcmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuaXNEcmFnZ2luZyA/XG4gICAgICAgIGNvbmZpZy5DVVJTT1IuR1JBQkJJTkcgOiBjb25maWcuQ1VSU09SLkdSQUI7XG4gICAgfVxuICAgIHJldHVybiAnaW5oZXJpdCc7XG4gIH1cblxuICBfZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICBfdXBkYXRlU3RhdGVGcm9tUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBuZXdQcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbjtcbiAgICBjb25zdCB7c3RhcnREcmFnTG5nTGF0fSA9IG5ld1Byb3BzO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3RhcnREcmFnTG5nTGF0OiBzdGFydERyYWdMbmdMYXQgJiYgc3RhcnREcmFnTG5nTGF0LnNsaWNlKClcbiAgICB9KTtcbiAgfVxuXG4gIF91cGRhdGVTb3VyY2UobWFwLCB1cGRhdGUpIHtcbiAgICBjb25zdCBuZXdTb3VyY2UgPSB1cGRhdGUuc291cmNlLnRvSlMoKTtcbiAgICBpZiAobmV3U291cmNlLnR5cGUgPT09ICdnZW9qc29uJykge1xuICAgICAgY29uc3Qgb2xkU291cmNlID0gbWFwLmdldFNvdXJjZSh1cGRhdGUuaWQpO1xuICAgICAgaWYgKG9sZFNvdXJjZSBpbnN0YW5jZW9mIG1hcGJveGdsLkdlb0pTT05Tb3VyY2UpIHtcbiAgICAgICAgLy8gdXBkYXRlIGRhdGEgaWYgbm8gb3RoZXIgR2VvSlNPTlNvdXJjZSBvcHRpb25zIHdlcmUgY2hhbmdlZFxuICAgICAgICBpZiAoXG4gICAgICAgICAgKG5ld1NvdXJjZS5tYXh6b29tID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5tYXh6b29tID09PSBvbGRTb3VyY2UuZ2VvanNvblZ0T3B0aW9ucy5tYXhab29tKSAmJlxuICAgICAgICAgIChuZXdTb3VyY2UuYnVmZmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5idWZmZXIgPT09IG9sZFNvdXJjZS5nZW9qc29uVnRPcHRpb25zLmJ1ZmZlcikgJiZcbiAgICAgICAgICAobmV3U291cmNlLnRvbGVyYW5jZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UudG9sZXJhbmNlID09PSBvbGRTb3VyY2UuZ2VvanNvblZ0T3B0aW9ucy50b2xlcmFuY2UpICYmXG4gICAgICAgICAgKG5ld1NvdXJjZS5jbHVzdGVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyID09PSBvbGRTb3VyY2UuY2x1c3RlcikgJiZcbiAgICAgICAgICAobmV3U291cmNlLmNsdXN0ZXJSYWRpdXMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLmNsdXN0ZXJSYWRpdXMgPT09IG9sZFNvdXJjZS5zdXBlcmNsdXN0ZXJPcHRpb25zLnJhZGl1cykgJiZcbiAgICAgICAgICAobmV3U291cmNlLmNsdXN0ZXJNYXhab29tID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyTWF4Wm9vbSA9PT0gb2xkU291cmNlLnN1cGVyY2x1c3Rlck9wdGlvbnMubWF4Wm9vbSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgb2xkU291cmNlLnNldERhdGEobmV3U291cmNlLmRhdGEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG1hcC5yZW1vdmVTb3VyY2UodXBkYXRlLmlkKTtcbiAgICBtYXAuYWRkU291cmNlKHVwZGF0ZS5pZCwgbmV3U291cmNlKTtcbiAgfVxuXG4gIC8vIEluZGl2aWR1YWxseSB1cGRhdGUgdGhlIG1hcHMgc291cmNlIGFuZCBsYXllcnMgdGhhdCBoYXZlIGNoYW5nZWQgaWYgYWxsXG4gIC8vIG90aGVyIHN0eWxlIHByb3BzIGhhdmVuJ3QgY2hhbmdlZC4gVGhpcyBwcmV2ZW50cyBmbGlja2luZyBvZiB0aGUgbWFwIHdoZW5cbiAgLy8gc3R5bGVzIG9ubHkgY2hhbmdlIHNvdXJjZXMgb3IgbGF5ZXJzLlxuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cywgY29tcGxleGl0eSAqL1xuICBfc2V0RGlmZlN0eWxlKHByZXZTdHlsZSwgbmV4dFN0eWxlKSB7XG4gICAgY29uc3QgcHJldktleXNNYXAgPSBwcmV2U3R5bGUgJiYgc3R5bGVLZXlzTWFwKHByZXZTdHlsZSkgfHwge307XG4gICAgY29uc3QgbmV4dEtleXNNYXAgPSBzdHlsZUtleXNNYXAobmV4dFN0eWxlKTtcbiAgICBmdW5jdGlvbiBzdHlsZUtleXNNYXAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZS5tYXAoKCkgPT4gdHJ1ZSkuZGVsZXRlKCdsYXllcnMnKS5kZWxldGUoJ3NvdXJjZXMnKS50b0pTKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyKCkge1xuICAgICAgY29uc3QgcHJldktleXNMaXN0ID0gT2JqZWN0LmtleXMocHJldktleXNNYXApO1xuICAgICAgY29uc3QgbmV4dEtleXNMaXN0ID0gT2JqZWN0LmtleXMobmV4dEtleXNNYXApO1xuICAgICAgaWYgKHByZXZLZXlzTGlzdC5sZW5ndGggIT09IG5leHRLZXlzTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICAvLyBgbmV4dFN0eWxlYCBhbmQgYHByZXZTdHlsZWAgc2hvdWxkIG5vdCBoYXZlIHRoZSBzYW1lIHNldCBvZiBwcm9wcy5cbiAgICAgIGlmIChuZXh0S2V5c0xpc3Quc29tZShcbiAgICAgICAga2V5ID0+IHByZXZTdHlsZS5nZXQoa2V5KSAhPT0gbmV4dFN0eWxlLmdldChrZXkpXG4gICAgICAgIC8vIEJ1dCB0aGUgdmFsdWUgb2Ygb25lIG9mIHRob3NlIHByb3BzIGlzIGRpZmZlcmVudC5cbiAgICAgICkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG5cbiAgICBpZiAoIXByZXZTdHlsZSB8fCBwcm9wc090aGVyVGhhbkxheWVyc09yU291cmNlc0RpZmZlcigpKSB7XG4gICAgICBtYXAuc2V0U3R5bGUobmV4dFN0eWxlLnRvSlMoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3NvdXJjZXNEaWZmLCBsYXllcnNEaWZmfSA9IGRpZmZTdHlsZXMocHJldlN0eWxlLCBuZXh0U3R5bGUpO1xuXG4gICAgLy8gVE9ETzogSXQncyByYXRoZXIgZGlmZmljdWx0IHRvIGRldGVybWluZSBzdHlsZSBkaWZmaW5nIGluIHRoZSBwcmVzZW5jZVxuICAgIC8vIG9mIHJlZnMuIEZvciBub3csIGlmIGFueSBzdHlsZSB1cGRhdGUgaGFzIGEgcmVmLCBmYWxsYmFjayB0byBubyBkaWZmaW5nLlxuICAgIC8vIFdlIGNhbiBjb21lIGJhY2sgdG8gdGhpcyBjYXNlIGlmIHRoZXJlJ3MgYSBzb2xpZCB1c2VjYXNlLlxuICAgIGlmIChsYXllcnNEaWZmLnVwZGF0ZXMuc29tZShub2RlID0+IG5vZGUubGF5ZXIuZ2V0KCdyZWYnKSkpIHtcbiAgICAgIG1hcC5zZXRTdHlsZShuZXh0U3R5bGUudG9KUygpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVudGVyIG9mIHNvdXJjZXNEaWZmLmVudGVyKSB7XG4gICAgICBtYXAuYWRkU291cmNlKGVudGVyLmlkLCBlbnRlci5zb3VyY2UudG9KUygpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCB1cGRhdGUgb2Ygc291cmNlc0RpZmYudXBkYXRlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTb3VyY2UobWFwLCB1cGRhdGUpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGV4aXQgb2Ygc291cmNlc0RpZmYuZXhpdCkge1xuICAgICAgbWFwLnJlbW92ZVNvdXJjZShleGl0LmlkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBleGl0IG9mIGxheWVyc0RpZmYuZXhpdGluZykge1xuICAgICAgaWYgKG1hcC5zdHlsZS5nZXRMYXllcihleGl0LmlkKSkge1xuICAgICAgICBtYXAucmVtb3ZlTGF5ZXIoZXhpdC5pZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgdXBkYXRlIG9mIGxheWVyc0RpZmYudXBkYXRlcykge1xuICAgICAgaWYgKCF1cGRhdGUuZW50ZXIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhbiBvbGQgbGF5ZXIgdGhhdCBuZWVkcyB0byBiZSB1cGRhdGVkLiBSZW1vdmUgdGhlIG9sZCBsYXllclxuICAgICAgICAvLyB3aXRoIHRoZSBzYW1lIGlkIGFuZCBhZGQgaXQgYmFjayBhZ2Fpbi5cbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKHVwZGF0ZS5pZCk7XG4gICAgICB9XG4gICAgICBtYXAuYWRkTGF5ZXIodXBkYXRlLmxheWVyLnRvSlMoKSwgdXBkYXRlLmJlZm9yZSk7XG4gICAgfVxuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMsIGNvbXBsZXhpdHkgKi9cblxuICBfdXBkYXRlTWFwU3R5bGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBuZXdQcm9wcy5tYXBTdHlsZTtcbiAgICBjb25zdCBvbGRNYXBTdHlsZSA9IG9sZFByb3BzLm1hcFN0eWxlO1xuICAgIGlmIChtYXBTdHlsZSAhPT0gb2xkTWFwU3R5bGUpIHtcbiAgICAgIGlmIChtYXBTdHlsZSBpbnN0YW5jZW9mIEltbXV0YWJsZS5NYXApIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucHJldmVudFN0eWxlRGlmZmluZykge1xuICAgICAgICAgIHRoaXMuX2dldE1hcCgpLnNldFN0eWxlKG1hcFN0eWxlLnRvSlMoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2V0RGlmZlN0eWxlKG9sZE1hcFN0eWxlLCBtYXBTdHlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2dldE1hcCgpLnNldFN0eWxlKG1hcFN0eWxlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlTWFwVmlld3BvcnQob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3Qgdmlld3BvcnRDaGFuZ2VkID1cbiAgICAgIG5ld1Byb3BzLmxhdGl0dWRlICE9PSBvbGRQcm9wcy5sYXRpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMubG9uZ2l0dWRlICE9PSBvbGRQcm9wcy5sb25naXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLnpvb20gIT09IG9sZFByb3BzLnpvb20gfHxcbiAgICAgIG5ld1Byb3BzLnBpdGNoICE9PSBvbGRQcm9wcy5waXRjaCB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuYmVhcmluZyB8fFxuICAgICAgbmV3UHJvcHMuYWx0aXR1ZGUgIT09IG9sZFByb3BzLmFsdGl0dWRlO1xuXG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG5cbiAgICBpZiAodmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICBtYXAuanVtcFRvKHtcbiAgICAgICAgY2VudGVyOiBbbmV3UHJvcHMubG9uZ2l0dWRlLCBuZXdQcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IG5ld1Byb3BzLnpvb20sXG4gICAgICAgIGJlYXJpbmc6IG5ld1Byb3BzLmJlYXJpbmcsXG4gICAgICAgIHBpdGNoOiBuZXdQcm9wcy5waXRjaFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRPRE8gLSBqdW1wVG8gZG9lc24ndCBoYW5kbGUgYWx0aXR1ZGVcbiAgICAgIGlmIChuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGUpIHtcbiAgICAgICAgbWFwLnRyYW5zZm9ybS5hbHRpdHVkZSA9IG5ld1Byb3BzLmFsdGl0dWRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9XG4gICAgICBvbGRQcm9wcy53aWR0aCAhPT0gbmV3UHJvcHMud2lkdGggfHwgb2xkUHJvcHMuaGVpZ2h0ICE9PSBuZXdQcm9wcy5oZWlnaHQ7XG5cbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgICAgbWFwLnJlc2l6ZSgpO1xuICAgICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSk7XG4gICAgfVxuICB9XG5cbiAgX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyh7cG9zLCBzdGFydFBvcywgc3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSkge1xuICAgIGNvbnN0IHhEZWx0YSA9IHBvcy54IC0gc3RhcnRQb3MueDtcbiAgICBjb25zdCBiZWFyaW5nID0gc3RhcnRCZWFyaW5nICsgMTgwICogeERlbHRhIC8gdGhpcy5wcm9wcy53aWR0aDtcblxuICAgIGxldCBwaXRjaCA9IHN0YXJ0UGl0Y2g7XG4gICAgY29uc3QgeURlbHRhID0gcG9zLnkgLSBzdGFydFBvcy55O1xuICAgIGlmICh5RGVsdGEgPiAwKSB7XG4gICAgICAvLyBEcmFnZ2luZyBkb3dud2FyZHMsIGdyYWR1YWxseSBkZWNyZWFzZSBwaXRjaFxuICAgICAgaWYgKE1hdGguYWJzKHRoaXMucHJvcHMuaGVpZ2h0IC0gc3RhcnRQb3MueSkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB5RGVsdGEgLyAodGhpcy5wcm9wcy5oZWlnaHQgLSBzdGFydFBvcy55KTtcbiAgICAgICAgcGl0Y2ggPSAoMSAtIHNjYWxlKSAqIFBJVENIX0FDQ0VMICogc3RhcnRQaXRjaDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHlEZWx0YSA8IDApIHtcbiAgICAgIC8vIERyYWdnaW5nIHVwd2FyZHMsIGdyYWR1YWxseSBpbmNyZWFzZSBwaXRjaFxuICAgICAgaWYgKHN0YXJ0UG9zLnkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgY29uc3QgeVNjYWxlID0gMSAtIHBvcy55IC8gc3RhcnRQb3MueTtcbiAgICAgICAgLy8gR3JhZHVhbGx5IGFkZCB1bnRpbCB3ZSBoaXQgbWF4IHBpdGNoXG4gICAgICAgIHBpdGNoID0gc3RhcnRQaXRjaCArIHlTY2FsZSAqIChNQVhfUElUQ0ggLSBzdGFydFBpdGNoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmRlYnVnKHN0YXJ0UGl0Y2gsIHBpdGNoKTtcbiAgICByZXR1cm4ge1xuICAgICAgcGl0Y2g6IE1hdGgubWF4KE1hdGgubWluKHBpdGNoLCBNQVhfUElUQ0gpLCAwKSxcbiAgICAgIGJlYXJpbmdcbiAgICB9O1xuICB9XG5cbiAgIC8vIEhlbHBlciB0byBjYWxsIHByb3BzLm9uQ2hhbmdlVmlld3BvcnRcbiAgX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRyYW5zZm9ybSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0KHtcbiAgICAgICAgbGF0aXR1ZGU6IHRyYW5zZm9ybS5jZW50ZXIubGF0LFxuICAgICAgICBsb25naXR1ZGU6IG1vZCh0cmFuc2Zvcm0uY2VudGVyLmxuZyArIDE4MCwgMzYwKSAtIDE4MCxcbiAgICAgICAgem9vbTogdHJhbnNmb3JtLnpvb20sXG4gICAgICAgIHBpdGNoOiB0cmFuc2Zvcm0ucGl0Y2gsXG4gICAgICAgIGJlYXJpbmc6IG1vZCh0cmFuc2Zvcm0uYmVhcmluZyArIDE4MCwgMzYwKSAtIDE4MCxcblxuICAgICAgICBpc0RyYWdnaW5nOiB0aGlzLnByb3BzLmlzRHJhZ2dpbmcsXG4gICAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogdGhpcy5wcm9wcy5zdGFydERyYWdMbmdMYXQsXG4gICAgICAgIHN0YXJ0QmVhcmluZzogdGhpcy5wcm9wcy5zdGFydEJlYXJpbmcsXG4gICAgICAgIHN0YXJ0UGl0Y2g6IHRoaXMucHJvcHMuc3RhcnRQaXRjaCxcblxuICAgICAgICAuLi5vcHRzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hTdGFydCh7cG9zfSkge1xuICAgIHRoaXMuX29uTW91c2VEb3duKHtwb3N9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZURvd24oe3Bvc30pIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICBjb25zdCBsbmdMYXQgPSB1bnByb2plY3RGcm9tVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0sIHBvcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogdHJ1ZSxcbiAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogW2xuZ0xhdC5sbmcsIGxuZ0xhdC5sYXRdLFxuICAgICAgc3RhcnRCZWFyaW5nOiBtYXAudHJhbnNmb3JtLmJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoOiBtYXAudHJhbnNmb3JtLnBpdGNoXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hEcmFnKHtwb3N9KSB7XG4gICAgdGhpcy5fb25Nb3VzZURyYWcoe3Bvc30pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlRHJhZyh7cG9zfSkge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gdGFrZSB0aGUgc3RhcnQgbG5nbGF0IGFuZCBwdXQgaXQgd2hlcmUgdGhlIG1vdXNlIGlzIGRvd24uXG4gICAgYXNzZXJ0KHRoaXMucHJvcHMuc3RhcnREcmFnTG5nTGF0LCAnYHN0YXJ0RHJhZ0xuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3IgbW91c2UgZHJhZyBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IGNsb25lVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0pO1xuICAgIHRyYW5zZm9ybS5zZXRMb2NhdGlvbkF0UG9pbnQodGhpcy5wcm9wcy5zdGFydERyYWdMbmdMYXQsIHBvcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hSb3RhdGUoe3Bvcywgc3RhcnRQb3N9KSB7XG4gICAgdGhpcy5fb25Nb3VzZVJvdGF0ZSh7cG9zLCBzdGFydFBvc30pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlUm90YXRlKHtwb3MsIHN0YXJ0UG9zfSkge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0IHx8ICF0aGlzLnByb3BzLnBlcnNwZWN0aXZlRW5hYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzdGFydEJlYXJpbmcsIHN0YXJ0UGl0Y2h9ID0gdGhpcy5wcm9wcztcbiAgICBhc3NlcnQodHlwZW9mIHN0YXJ0QmVhcmluZyA9PT0gJ251bWJlcicsXG4gICAgICAnYHN0YXJ0QmVhcmluZ2AgcHJvcCBpcyByZXF1aXJlZCBmb3IgbW91c2Ugcm90YXRlIGJlaGF2aW9yJyk7XG4gICAgYXNzZXJ0KHR5cGVvZiBzdGFydFBpdGNoID09PSAnbnVtYmVyJyxcbiAgICAgICdgc3RhcnRQaXRjaGAgcHJvcCBpcyByZXF1aXJlZCBmb3IgbW91c2Ugcm90YXRlIGJlaGF2aW9yJyk7XG5cbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgcG9zLFxuICAgICAgc3RhcnRQb3MsXG4gICAgICBzdGFydEJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoXG4gICAgfSk7XG5cbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBjbG9uZVRyYW5zZm9ybShtYXAudHJhbnNmb3JtKTtcbiAgICB0cmFuc2Zvcm0uYmVhcmluZyA9IGJlYXJpbmc7XG4gICAgdHJhbnNmb3JtLnBpdGNoID0gcGl0Y2g7XG5cbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydCh0cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZU1vdmUob3B0KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgcG9zID0gb3B0LnBvcztcbiAgICBpZiAoIXRoaXMucHJvcHMub25Ib3ZlckZlYXR1cmVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZlYXR1cmVzID0gbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhbcG9zLngsIHBvcy55XSk7XG4gICAgaWYgKCFmZWF0dXJlcy5sZW5ndGggJiYgdGhpcy5wcm9wcy5pZ25vcmVFbXB0eUZlYXR1cmVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMub25Ib3ZlckZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Ub3VjaEVuZChvcHQpIHtcbiAgICB0aGlzLl9vbk1vdXNlVXAob3B0KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZVVwKG9wdCkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KG1hcC50cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgc3RhcnREcmFnTG5nTGF0OiBudWxsLFxuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2xpY2tGZWF0dXJlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBvcyA9IG9wdC5wb3M7XG5cbiAgICAvLyBSYWRpdXMgZW5hYmxlcyBwb2ludCBmZWF0dXJlcywgbGlrZSBtYXJrZXIgc3ltYm9scywgdG8gYmUgY2xpY2tlZC5cbiAgICBjb25zdCBzaXplID0gdGhpcy5wcm9wcy5jbGlja1JhZGl1cztcbiAgICBjb25zdCBiYm94ID0gW1twb3MueCAtIHNpemUsIHBvcy55IC0gc2l6ZV0sIFtwb3MueCArIHNpemUsIHBvcy55ICsgc2l6ZV1dO1xuICAgIGNvbnN0IGZlYXR1cmVzID0gbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhiYm94KTtcbiAgICBpZiAoIWZlYXR1cmVzLmxlbmd0aCAmJiB0aGlzLnByb3BzLmlnbm9yZUVtcHR5RmVhdHVyZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrRmVhdHVyZXMoZmVhdHVyZXMpO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vblpvb20oe3Bvcywgc2NhbGV9KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gY2xvbmVUcmFuc2Zvcm0obWFwLnRyYW5zZm9ybSk7XG4gICAgY29uc3QgYXJvdW5kID0gdW5wcm9qZWN0RnJvbVRyYW5zZm9ybSh0cmFuc2Zvcm0sIHBvcyk7XG4gICAgdHJhbnNmb3JtLnpvb20gPSB0cmFuc2Zvcm0uc2NhbGVab29tKG1hcC50cmFuc2Zvcm0uc2NhbGUgKiBzY2FsZSk7XG4gICAgdHJhbnNmb3JtLnNldExvY2F0aW9uQXRQb2ludChhcm91bmQsIHBvcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uWm9vbUVuZCgpIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydChtYXAudHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZVxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjbGFzc05hbWUsIHdpZHRoLCBoZWlnaHQsIHN0eWxlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbWFwU3R5bGUgPSB7XG4gICAgICAuLi5zdHlsZSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgY3Vyc29yOiB0aGlzLl9jdXJzb3IoKVxuICAgIH07XG5cbiAgICBsZXQgY29udGVudCA9IFtcbiAgICAgIDxkaXYga2V5PVwibWFwXCIgcmVmPVwibWFwYm94TWFwXCJcbiAgICAgICAgc3R5bGU9eyBtYXBTdHlsZSB9IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9Lz4sXG4gICAgICA8ZGl2IGtleT1cIm92ZXJsYXlzXCIgY2xhc3NOYW1lPVwib3ZlcmxheXNcIlxuICAgICAgICBzdHlsZT17IHtwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogMCwgdG9wOiAwfSB9PlxuICAgICAgICB7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgXTtcblxuICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQpIHtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxNYXBJbnRlcmFjdGlvbnNcbiAgICAgICAgICBvbk1vdXNlRG93biA9eyB0aGlzLl9vbk1vdXNlRG93biB9XG4gICAgICAgICAgb25Nb3VzZURyYWcgPXsgdGhpcy5fb25Nb3VzZURyYWcgfVxuICAgICAgICAgIG9uTW91c2VSb3RhdGUgPXsgdGhpcy5fb25Nb3VzZVJvdGF0ZSB9XG4gICAgICAgICAgb25Nb3VzZVVwID17IHRoaXMuX29uTW91c2VVcCB9XG4gICAgICAgICAgb25Nb3VzZU1vdmUgPXsgdGhpcy5fb25Nb3VzZU1vdmUgfVxuICAgICAgICAgIG9uVG91Y2hTdGFydCA9eyB0aGlzLl9vblRvdWNoU3RhcnQgfVxuICAgICAgICAgIG9uVG91Y2hEcmFnID17IHRoaXMuX29uVG91Y2hEcmFnIH1cbiAgICAgICAgICBvblRvdWNoUm90YXRlID17IHRoaXMuX29uVG91Y2hSb3RhdGUgfVxuICAgICAgICAgIG9uVG91Y2hFbmQgPXsgdGhpcy5fb25Ub3VjaEVuZCB9XG4gICAgICAgICAgb25ab29tID17IHRoaXMuX29uWm9vbSB9XG4gICAgICAgICAgb25ab29tRW5kID17IHRoaXMuX29uWm9vbUVuZCB9XG4gICAgICAgICAgd2lkdGggPXsgdGhpcy5wcm9wcy53aWR0aCB9XG4gICAgICAgICAgaGVpZ2h0ID17IHRoaXMucHJvcHMuaGVpZ2h0IH0+XG5cbiAgICAgICAgICB7IGNvbnRlbnQgfVxuXG4gICAgICAgIDwvTWFwSW50ZXJhY3Rpb25zPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBzdHlsZT17IHtcbiAgICAgICAgICAuLi50aGlzLnByb3BzLnN0eWxlLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgICAgfSB9PlxuXG4gICAgICAgIHsgY29udGVudCB9XG5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuTWFwR0wucHJvcFR5cGVzID0gUFJPUF9UWVBFUztcbk1hcEdMLmRlZmF1bHRQcm9wcyA9IERFRkFVTFRfUFJPUFM7XG4iXX0=