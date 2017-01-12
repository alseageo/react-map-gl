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

var _mapboxGl = require('mapbox-gl/dist/mapbox-gl.js');

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

var _styleUtils = require('./utils/style-utils');

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

function noop() {}

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
    * Called when a feature is hovered over. Uses Mapbox's
    * queryRenderedFeatures API to find features under the pointer:
    * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
    * To query only some of the layers, set the `interactive` property in the
    * layer style to `true`. See Mapbox's style spec
    * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
    * If no interactive layers are found (e.g. using Mapbox's default styles),
    * will fall back to query all layers.
    * @callback
    * @param {array} features - The array of features the mouse is over.
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
    * Called when the map is clicked on. Returns latitude and longitude.
    */
  onClick: _react.PropTypes.func,

  /**
    * Called when a feature is clicked on. Uses Mapbox's
    * queryRenderedFeatures API to find features under the pointer:
    * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
    * To query only some of the layers, set the `interactive` property in the
    * layer style to `true`. See Mapbox's style spec
    * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
    * If no interactive layers are found (e.g. using Mapbox's default styles),
    * will fall back to query all layers.
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
    * Enables perspective control event handling
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

  _createClass(MapGL, null, [{
    key: 'supported',
    value: function supported() {
      return _mapboxGl2.default.supported();
    }
  }]);

  function MapGL(props) {
    _classCallCheck(this, MapGL);

    var _this = _possibleConstructorReturn(this, (MapGL.__proto__ || Object.getPrototypeOf(MapGL)).call(this, props));

    _this.state = {
      isSupported: _mapboxGl2.default.supported(),
      isDragging: false,
      isHovering: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    };
    _this._queryParams = {};
    _mapboxGl2.default.accessToken = props.mapboxApiAccessToken;

    if (!_this.state.isSupported) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
    }
    return _this;
  }

  _createClass(MapGL, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = _immutable2.default.Map.isMap(this.props.mapStyle) ? this.props.mapStyle.toJS() : this.props.mapStyle;
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
      this._updateQueryParams(mapStyle);
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
        return this.props.isDragging ? _config2.default.CURSOR.GRABBING : this.state.isHovering ? _config2.default.CURSOR.POINTER : _config2.default.CURSOR.GRAB;
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
        if (oldSource.type === 'geojson') {
          // update data if no other GeoJSONSource options were changed
          var oldOpts = oldSource.workerOptions;
          if ((newSource.maxzoom === undefined || newSource.maxzoom === oldOpts.geojsonVtOptions.maxZoom) && (newSource.buffer === undefined || newSource.buffer === oldOpts.geojsonVtOptions.buffer) && (newSource.tolerance === undefined || newSource.tolerance === oldOpts.geojsonVtOptions.tolerance) && (newSource.cluster === undefined || newSource.cluster === oldOpts.cluster) && (newSource.clusterRadius === undefined || newSource.clusterRadius === oldOpts.superclusterOptions.radius) && (newSource.clusterMaxZoom === undefined || newSource.clusterMaxZoom === oldOpts.superclusterOptions.maxZoom)) {
            oldSource.setData(newSource.data);
            return;
          }
        }
      }

      map.removeSource(update.id);
      map.addSource(update.id, newSource);
    }

    // Hover and click only query layers whose interactive property is true
    // If no interactivity is specified, query all layers

  }, {
    key: '_updateQueryParams',
    value: function _updateQueryParams(mapStyle) {
      var interactiveLayerIds = (0, _styleUtils.getInteractiveLayerIds)(mapStyle);
      this._queryParams = interactiveLayerIds.length === 0 ? {} : { layers: interactiveLayerIds };
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
        if (_immutable2.default.Map.isMap(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._getMap().setStyle(mapStyle.toJS());
          } else {
            this._setDiffStyle(oldMapStyle, mapStyle);
          }
        } else {
          this._getMap().setStyle(mapStyle);
        }
        this._updateQueryParams(mapStyle);
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
      var features = map.queryRenderedFeatures([pos.x, pos.y], this._queryParams);
      if (!features.length && this.props.ignoreEmptyFeatures) {
        return;
      }
      this.setState({ isHovering: features.length > 0 });
      this.props.onHoverFeatures(features);
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(opt) {
      this._onMouseUp(opt);
    }
  }, {
    key: '_onTouchTap',
    value: function _onTouchTap(opt) {
      this._onMouseClick(opt);
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
    }
  }, {
    key: '_onMouseClick',
    value: function _onMouseClick(opt) {
      var map = this._getMap();
      var pos = opt.pos;

      if (this.props.onClick) {
        var lngLat = (0, _transform.unprojectFromTransform)(map.transform, pos);
        this.props.onClick(lngLat);
      }

      if (this.props.onClickFeatures) {
        // Radius enables point features, like marker symbols, to be clicked.
        var size = this.props.clickRadius;
        var bbox = [[pos.x - size, pos.y - size], [pos.x + size, pos.y + size]];
        var features = map.queryRenderedFeatures(bbox, this._queryParams);
        if (!features.length && this.props.ignoreEmptyFeatures) {
          return;
        }
        this.props.onClickFeatures(features);
      }
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

      if (this.state.isSupported && this.props.onChangeViewport) {
        content = _react2.default.createElement(
          _mapInteractions2.default,
          {
            onMouseDown: this._onMouseDown,
            onMouseDrag: this._onMouseDrag,
            onMouseRotate: this._onMouseRotate,
            onMouseUp: this._onMouseUp,
            onMouseMove: this._onMouseMove,
            onMouseClick: this._onMouseClick,
            onTouchStart: this._onTouchStart,
            onTouchDrag: this._onTouchDrag,
            onTouchRotate: this._onTouchRotate,
            onTouchEnd: this._onTouchEnd,
            onTouchTap: this._onTouchTap,
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
}(_react.Component), (_applyDecoratedDescriptor(_class2.prototype, '_onTouchStart', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchStart'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseDown', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseDown'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchDrag', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchDrag'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseDrag', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseDrag'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchRotate', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchRotate'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseRotate', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseRotate'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseMove'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchEnd'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onTouchTap', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onTouchTap'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseUp', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseUp'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onMouseClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onMouseClick'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onZoom', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onZoom'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onZoomEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class2.prototype, '_onZoomEnd'), _class2.prototype)), _class2)) || _class;

exports.default = MapGL;


MapGL.propTypes = PROP_TYPES;
MapGL.defaultProps = DEFAULT_PROPS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXAucmVhY3QuanMiXSwibmFtZXMiOlsibm9vcCIsIk1BWF9QSVRDSCIsIlBJVENIX01PVVNFX1RIUkVTSE9MRCIsIlBJVENIX0FDQ0VMIiwiUFJPUF9UWVBFUyIsImxhdGl0dWRlIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImxvbmdpdHVkZSIsInpvb20iLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsImluc3RhbmNlT2YiLCJNYXAiLCJtYXBib3hBcGlBY2Nlc3NUb2tlbiIsIm9uQ2hhbmdlVmlld3BvcnQiLCJmdW5jIiwid2lkdGgiLCJoZWlnaHQiLCJpc0RyYWdnaW5nIiwiYm9vbCIsInN0YXJ0RHJhZ0xuZ0xhdCIsImFycmF5Iiwib25Ib3ZlckZlYXR1cmVzIiwiaWdub3JlRW1wdHlGZWF0dXJlcyIsImF0dHJpYnV0aW9uQ29udHJvbCIsIm9uQ2xpY2siLCJvbkNsaWNrRmVhdHVyZXMiLCJjbGlja1JhZGl1cyIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsInByZXZlbnRTdHlsZURpZmZpbmciLCJwZXJzcGVjdGl2ZUVuYWJsZWQiLCJiZWFyaW5nIiwiUHJvcFR5cGVzIiwicGl0Y2giLCJhbHRpdHVkZSIsIkRFRkFVTFRfUFJPUFMiLCJERUZBVUxUUyIsIk1BUEJPWF9BUElfQUNDRVNTX1RPS0VOIiwiTWFwR0wiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsInN0YXRlIiwiaXNTdXBwb3J0ZWQiLCJpc0hvdmVyaW5nIiwic3RhcnRCZWFyaW5nIiwic3RhcnRQaXRjaCIsIl9xdWVyeVBhcmFtcyIsImFjY2Vzc1Rva2VuIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwiY29tcG9uZW50RGlkVXBkYXRlIiwiaXNNYXAiLCJ0b0pTIiwibWFwIiwiY29udGFpbmVyIiwicmVmcyIsIm1hcGJveE1hcCIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJnZXRDYW52YXMiLCJfbWFwIiwiX3VwZGF0ZU1hcFZpZXdwb3J0IiwiX2NhbGxPbkNoYW5nZVZpZXdwb3J0IiwidHJhbnNmb3JtIiwiX3VwZGF0ZVF1ZXJ5UGFyYW1zIiwibmV3UHJvcHMiLCJfdXBkYXRlU3RhdGVGcm9tUHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIl91cGRhdGVNYXBTaXplIiwicmVtb3ZlIiwiaXNJbnRlcmFjdGl2ZSIsIm9uQ2xpY2tGZWF0dXJlIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJQT0lOVEVSIiwiR1JBQiIsIm9sZFByb3BzIiwic2xpY2UiLCJ1cGRhdGUiLCJuZXdTb3VyY2UiLCJzb3VyY2UiLCJ0eXBlIiwib2xkU291cmNlIiwiZ2V0U291cmNlIiwiaWQiLCJvbGRPcHRzIiwid29ya2VyT3B0aW9ucyIsIm1heHpvb20iLCJ1bmRlZmluZWQiLCJnZW9qc29uVnRPcHRpb25zIiwibWF4Wm9vbSIsImJ1ZmZlciIsInRvbGVyYW5jZSIsImNsdXN0ZXIiLCJjbHVzdGVyUmFkaXVzIiwic3VwZXJjbHVzdGVyT3B0aW9ucyIsInJhZGl1cyIsImNsdXN0ZXJNYXhab29tIiwic2V0RGF0YSIsImRhdGEiLCJyZW1vdmVTb3VyY2UiLCJhZGRTb3VyY2UiLCJpbnRlcmFjdGl2ZUxheWVySWRzIiwibGVuZ3RoIiwibGF5ZXJzIiwicHJldlN0eWxlIiwibmV4dFN0eWxlIiwicHJldktleXNNYXAiLCJzdHlsZUtleXNNYXAiLCJuZXh0S2V5c01hcCIsImRlbGV0ZSIsInByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyIiwicHJldktleXNMaXN0IiwiT2JqZWN0Iiwia2V5cyIsIm5leHRLZXlzTGlzdCIsInNvbWUiLCJnZXQiLCJrZXkiLCJfZ2V0TWFwIiwic2V0U3R5bGUiLCJzb3VyY2VzRGlmZiIsImxheWVyc0RpZmYiLCJ1cGRhdGVzIiwibm9kZSIsImxheWVyIiwiZW50ZXIiLCJfdXBkYXRlU291cmNlIiwiZXhpdCIsImV4aXRpbmciLCJnZXRMYXllciIsInJlbW92ZUxheWVyIiwiYWRkTGF5ZXIiLCJiZWZvcmUiLCJvbGRNYXBTdHlsZSIsIl9zZXREaWZmU3R5bGUiLCJ2aWV3cG9ydENoYW5nZWQiLCJqdW1wVG8iLCJzaXplQ2hhbmdlZCIsInJlc2l6ZSIsInBvcyIsInN0YXJ0UG9zIiwieERlbHRhIiwieCIsInlEZWx0YSIsInkiLCJNYXRoIiwiYWJzIiwic2NhbGUiLCJ5U2NhbGUiLCJtYXgiLCJtaW4iLCJvcHRzIiwibGF0IiwibG5nIiwiX29uTW91c2VEb3duIiwibG5nTGF0IiwiX29uTW91c2VEcmFnIiwic2V0TG9jYXRpb25BdFBvaW50IiwiX29uTW91c2VSb3RhdGUiLCJfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nIiwib3B0IiwiZmVhdHVyZXMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJfb25Nb3VzZVVwIiwiX29uTW91c2VDbGljayIsInNpemUiLCJiYm94IiwiYXJvdW5kIiwic2NhbGVab29tIiwiY2xhc3NOYW1lIiwiY3Vyc29yIiwiX2N1cnNvciIsImNvbnRlbnQiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJjaGlsZHJlbiIsIl9vbk1vdXNlTW92ZSIsIl9vblRvdWNoU3RhcnQiLCJfb25Ub3VjaERyYWciLCJfb25Ub3VjaFJvdGF0ZSIsIl9vblRvdWNoRW5kIiwiX29uVG91Y2hUYXAiLCJfb25ab29tIiwiX29uWm9vbUVuZCIsInByb3BUeXBlcyIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7b0NBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFTQSxJQUFULEdBQWdCLENBQUU7O0FBRWxCO0FB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Ozs7QUE4ZnJCQSxNQUFNc0osU0FBTixHQUFrQjFMLFVBQWxCO0FBQ0FvQyxNQUFNdUosWUFBTixHQUFxQjFKLGFBQXJCIiwiZmlsZSI6Im1hcC5yZWFjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMsIENvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJ2F1dG9iaW5kLWRlY29yYXRvcic7XG5pbXBvcnQgcHVyZVJlbmRlciBmcm9tICdwdXJlLXJlbmRlci1kZWNvcmF0b3InO1xuXG5pbXBvcnQgbWFwYm94Z2wgZnJvbSAnbWFwYm94LWdsL2Rpc3QvbWFwYm94LWdsLmpzJztcbmltcG9ydCB7c2VsZWN0fSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgTWFwSW50ZXJhY3Rpb25zIGZyb20gJy4vbWFwLWludGVyYWN0aW9ucy5yZWFjdCc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuaW1wb3J0IHtnZXRJbnRlcmFjdGl2ZUxheWVySWRzfSBmcm9tICcuL3V0aWxzL3N0eWxlLXV0aWxzJztcbmltcG9ydCBkaWZmU3R5bGVzIGZyb20gJy4vdXRpbHMvZGlmZi1zdHlsZXMnO1xuaW1wb3J0IHttb2QsIHVucHJvamVjdEZyb21UcmFuc2Zvcm0sIGNsb25lVHJhbnNmb3JtfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybSc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyBOb3RlOiBNYXggcGl0Y2ggaXMgYSBoYXJkIGNvZGVkIHZhbHVlIChub3QgYSBuYW1lZCBjb25zdGFudCkgaW4gdHJhbnNmb3JtLmpzXG5jb25zdCBNQVhfUElUQ0ggPSA2MDtcbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDIwO1xuY29uc3QgUElUQ0hfQUNDRUwgPSAxLjI7XG5cbmNvbnN0IFBST1BfVFlQRVMgPSB7XG4gIC8qKlxuICAgICogVGhlIGxhdGl0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC5cbiAgICAqL1xuICBsYXRpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSBsb25naXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLlxuICAgICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC5cbiAgICAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogVGhlIE1hcGJveCBzdHlsZSB0aGUgY29tcG9uZW50IHNob3VsZCB1c2UuIENhbiBlaXRoZXIgYmUgYSBzdHJpbmcgdXJsXG4gICAgKiBvciBhIE1hcGJveEdMIHN0eWxlIEltbXV0YWJsZS5NYXAgb2JqZWN0LlxuICAgICovXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIFByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5NYXApXG4gIF0pLFxuICAvKipcbiAgICAqIFRoZSBNYXBib3ggQVBJIGFjY2VzcyB0b2tlbiB0byBwcm92aWRlIHRvIG1hcGJveC1nbC1qcy4gVGhpcyBpcyByZXF1aXJlZFxuICAgICogd2hlbiB1c2luZyBNYXBib3ggcHJvdmlkZWQgdmVjdG9yIHRpbGVzIGFuZCBzdHlsZXMuXG4gICAgKi9cbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcsXG4gIC8qKlxuICAgICogYG9uQ2hhbmdlVmlld3BvcnRgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgICogbWFwLiBUaGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgY2FsbGJhY2sgY29udGFpbnMgYGxhdGl0dWRlYCxcbiAgICAqIGBsb25naXR1ZGVgIGFuZCBgem9vbWAgYW5kIGFkZGl0aW9uYWwgc3RhdGUgaW5mb3JtYXRpb24uXG4gICAgKi9cbiAgb25DaGFuZ2VWaWV3cG9ydDogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgICogVGhlIHdpZHRoIG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqXG4gICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogSXMgdGhlIGNvbXBvbmVudCBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC4gVGhpcyBpcyB1c2VkIHRvIHNob3cvaGlkZSB0aGVcbiAgICAqIGRyYWcgY3Vyc29yLiBBbHNvIHVzZWQgYXMgYW4gb3B0aW1pemF0aW9uIGluIHNvbWUgb3ZlcmxheXMgYnkgcHJldmVudGluZ1xuICAgICogcmVuZGVyaW5nIHdoaWxlIGRyYWdnaW5nLlxuICAgICovXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICAvKipcbiAgICAqIFJlcXVpcmVkIHRvIGNhbGN1bGF0ZSB0aGUgbW91c2UgcHJvamVjdGlvbiBhZnRlciB0aGUgZmlyc3QgY2xpY2sgZXZlbnRcbiAgICAqIGR1cmluZyBkcmFnZ2luZy4gV2hlcmUgdGhlIG1hcCBpcyBkZXBlbmRzIG9uIHdoZXJlIHlvdSBmaXJzdCBjbGlja2VkIG9uXG4gICAgKiB0aGUgbWFwLlxuICAgICovXG4gIHN0YXJ0RHJhZ0xuZ0xhdDogUHJvcFR5cGVzLmFycmF5LFxuICAvKipcbiAgICAqIENhbGxlZCB3aGVuIGEgZmVhdHVyZSBpcyBob3ZlcmVkIG92ZXIuIFVzZXMgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEkgdG8gZmluZCBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlcjpcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gcXVlcnkgb25seSBzb21lIG9mIHRoZSBsYXllcnMsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlLXNwZWMvI2xheWVyLWludGVyYWN0aXZlXG4gICAgKiBJZiBubyBpbnRlcmFjdGl2ZSBsYXllcnMgYXJlIGZvdW5kIChlLmcuIHVzaW5nIE1hcGJveCdzIGRlZmF1bHQgc3R5bGVzKSxcbiAgICAqIHdpbGwgZmFsbCBiYWNrIHRvIHF1ZXJ5IGFsbCBsYXllcnMuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7YXJyYXl9IGZlYXR1cmVzIC0gVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRoZSBtb3VzZSBpcyBvdmVyLlxuICAgICovXG4gIG9uSG92ZXJGZWF0dXJlczogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgICogRGVmYXVsdHMgdG8gVFJVRVxuICAgICogU2V0IHRvIGZhbHNlIHRvIGVuYWJsZSBvbkhvdmVyRmVhdHVyZXMgdG8gYmUgY2FsbGVkIHJlZ2FyZGxlc3MgaWZcbiAgICAqIHRoZXJlIGlzIGFuIGFjdHVhbCBmZWF0dXJlIGF0IHgsIHkuIFRoaXMgaXMgdXNlZnVsIHRvIGVtdWxhdGVcbiAgICAqIFwibW91c2Utb3V0XCIgYmVoYXZpb3JzIG9uIGZlYXR1cmVzLlxuICAgICovXG4gIGlnbm9yZUVtcHR5RmVhdHVyZXM6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogU2hvdyBhdHRyaWJ1dGlvbiBjb250cm9sIG9yIG5vdC5cbiAgICAqL1xuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBjbGlja2VkIG9uLiBSZXR1cm5zIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUuXG4gICAgKi9cbiAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiBhIGZlYXR1cmUgaXMgY2xpY2tlZCBvbi4gVXNlcyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSSB0byBmaW5kIGZlYXR1cmVzIHVuZGVyIHRoZSBwb2ludGVyOlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBxdWVyeSBvbmx5IHNvbWUgb2YgdGhlIGxheWVycywgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqIElmIG5vIGludGVyYWN0aXZlIGxheWVycyBhcmUgZm91bmQgKGUuZy4gdXNpbmcgTWFwYm94J3MgZGVmYXVsdCBzdHlsZXMpLFxuICAgICogd2lsbCBmYWxsIGJhY2sgdG8gcXVlcnkgYWxsIGxheWVycy5cbiAgICAqL1xuICBvbkNsaWNrRmVhdHVyZXM6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKlxuICAgICogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAxNS5cbiAgICAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICAqIFBhc3NlZCB0byBNYXBib3ggTWFwIGNvbnN0cnVjdG9yIHdoaWNoIHBhc3NlcyBpdCB0byB0aGUgY2FudmFzIGNvbnRleHQuXG4gICAgKiBUaGlzIGlzIHVuc2VmdWwgd2hlbiB5b3Ugd2FudCB0byBleHBvcnQgdGhlIGNhbnZhcyBhcyBhIFBORy5cbiAgICAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogVGhlcmUgYXJlIHN0aWxsIGtub3duIGlzc3VlcyB3aXRoIHN0eWxlIGRpZmZpbmcuIEFzIGEgdGVtcG9yYXJ5IHN0b3BnYXAsXG4gICAgKiBhZGQgdGhlIG9wdGlvbiB0byBwcmV2ZW50IHN0eWxlIGRpZmZpbmcuXG4gICAgKi9cbiAgcHJldmVudFN0eWxlRGlmZmluZzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBFbmFibGVzIHBlcnNwZWN0aXZlIGNvbnRyb2wgZXZlbnQgaGFuZGxpbmdcbiAgICAqL1xuICBwZXJzcGVjdGl2ZUVuYWJsZWQ6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogU3BlY2lmeSB0aGUgYmVhcmluZyBvZiB0aGUgdmlld3BvcnRcbiAgICAqL1xuICBiZWFyaW5nOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgICogU3BlY2lmeSB0aGUgcGl0Y2ggb2YgdGhlIHZpZXdwb3J0XG4gICAgKi9cbiAgcGl0Y2g6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqXG4gICAgKiBTcGVjaWZ5IHRoZSBhbHRpdHVkZSBvZiB0aGUgdmlld3BvcnQgY2FtZXJhXG4gICAgKiBVbml0OiBtYXAgaGVpZ2h0cywgZGVmYXVsdCAxLjVcbiAgICAqIE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgICAqL1xuICBhbHRpdHVkZTogUmVhY3QuUHJvcFR5cGVzLm51bWJlclxufTtcblxuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAgbWFwU3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXY4JyxcbiAgb25DaGFuZ2VWaWV3cG9ydDogbnVsbCxcbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IGNvbmZpZy5ERUZBVUxUUy5NQVBCT1hfQVBJX0FDQ0VTU19UT0tFTixcbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgYXR0cmlidXRpb25Db250cm9sOiB0cnVlLFxuICBpZ25vcmVFbXB0eUZlYXR1cmVzOiB0cnVlLFxuICBiZWFyaW5nOiAwLFxuICBwaXRjaDogMCxcbiAgYWx0aXR1ZGU6IDEuNSxcbiAgY2xpY2tSYWRpdXM6IDE1XG59O1xuXG5AcHVyZVJlbmRlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwR0wgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIG1hcGJveGdsLnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGlzU3VwcG9ydGVkOiBtYXBib3hnbC5zdXBwb3J0ZWQoKSxcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgaXNIb3ZlcmluZzogZmFsc2UsXG4gICAgICBzdGFydERyYWdMbmdMYXQ6IG51bGwsXG4gICAgICBzdGFydEJlYXJpbmc6IG51bGwsXG4gICAgICBzdGFydFBpdGNoOiBudWxsXG4gICAgfTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHt9O1xuICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gcHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW47XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuaXNTdXBwb3J0ZWQpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkTW91bnQgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkVXBkYXRlID0gbm9vcDtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBtYXBTdHlsZSA9IEltbXV0YWJsZS5NYXAuaXNNYXAodGhpcy5wcm9wcy5tYXBTdHlsZSkgP1xuICAgICAgdGhpcy5wcm9wcy5tYXBTdHlsZS50b0pTKCkgOlxuICAgICAgdGhpcy5wcm9wcy5tYXBTdHlsZTtcbiAgICBjb25zdCBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgIGNvbnRhaW5lcjogdGhpcy5yZWZzLm1hcGJveE1hcCxcbiAgICAgIGNlbnRlcjogW3RoaXMucHJvcHMubG9uZ2l0dWRlLCB0aGlzLnByb3BzLmxhdGl0dWRlXSxcbiAgICAgIHpvb206IHRoaXMucHJvcHMuem9vbSxcbiAgICAgIHBpdGNoOiB0aGlzLnByb3BzLnBpdGNoLFxuICAgICAgYmVhcmluZzogdGhpcy5wcm9wcy5iZWFyaW5nLFxuICAgICAgc3R5bGU6IG1hcFN0eWxlLFxuICAgICAgaW50ZXJhY3RpdmU6IGZhbHNlLFxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0aGlzLnByb3BzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxuICAgICAgLy8gVE9ETz9cbiAgICAgIC8vIGF0dHJpYnV0aW9uQ29udHJvbDogdGhpcy5wcm9wcy5hdHRyaWJ1dGlvbkNvbnRyb2xcbiAgICB9KTtcblxuICAgIHNlbGVjdChtYXAuZ2V0Q2FudmFzKCkpLnN0eWxlKCdvdXRsaW5lJywgJ25vbmUnKTtcblxuICAgIHRoaXMuX21hcCA9IG1hcDtcbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh7fSwgdGhpcy5wcm9wcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSk7XG4gICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICB9XG5cbiAgLy8gTmV3IHByb3BzIGFyZSBjb21pbicgcm91bmQgdGhlIGNvcm5lciFcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIHRoaXMuX3VwZGF0ZVN0YXRlRnJvbVByb3BzKHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU3R5bGUodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIC8vIFNhdmUgd2lkdGgvaGVpZ2h0IHNvIHRoYXQgd2UgY2FuIGNoZWNrIHRoZW0gaW4gY29tcG9uZW50RGlkVXBkYXRlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB3aWR0aDogdGhpcy5wcm9wcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHRcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAvLyBtYXAucmVzaXplKCkgcmVhZHMgc2l6ZSBmcm9tIERPTSwgd2UgbmVlZCB0byBjYWxsIGFmdGVyIHJlbmRlclxuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUodGhpcy5zdGF0ZSwgdGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fbWFwKSB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgX2N1cnNvcigpIHtcbiAgICBjb25zdCBpc0ludGVyYWN0aXZlID1cbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCB8fFxuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrRmVhdHVyZSB8fFxuICAgICAgdGhpcy5wcm9wcy5vbkhvdmVyRmVhdHVyZXM7XG4gICAgaWYgKGlzSW50ZXJhY3RpdmUpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmlzRHJhZ2dpbmcgP1xuICAgICAgICBjb25maWcuQ1VSU09SLkdSQUJCSU5HIDpcbiAgICAgICAgKHRoaXMuc3RhdGUuaXNIb3ZlcmluZyA/IGNvbmZpZy5DVVJTT1IuUE9JTlRFUiA6IGNvbmZpZy5DVVJTT1IuR1JBQik7XG4gICAgfVxuICAgIHJldHVybiAnaW5oZXJpdCc7XG4gIH1cblxuICBfZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICBfdXBkYXRlU3RhdGVGcm9tUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBuZXdQcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbjtcbiAgICBjb25zdCB7c3RhcnREcmFnTG5nTGF0fSA9IG5ld1Byb3BzO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3RhcnREcmFnTG5nTGF0OiBzdGFydERyYWdMbmdMYXQgJiYgc3RhcnREcmFnTG5nTGF0LnNsaWNlKClcbiAgICB9KTtcbiAgfVxuXG4gIF91cGRhdGVTb3VyY2UobWFwLCB1cGRhdGUpIHtcbiAgICBjb25zdCBuZXdTb3VyY2UgPSB1cGRhdGUuc291cmNlLnRvSlMoKTtcbiAgICBpZiAobmV3U291cmNlLnR5cGUgPT09ICdnZW9qc29uJykge1xuICAgICAgY29uc3Qgb2xkU291cmNlID0gbWFwLmdldFNvdXJjZSh1cGRhdGUuaWQpO1xuICAgICAgaWYgKG9sZFNvdXJjZS50eXBlID09PSAnZ2VvanNvbicpIHtcbiAgICAgICAgLy8gdXBkYXRlIGRhdGEgaWYgbm8gb3RoZXIgR2VvSlNPTlNvdXJjZSBvcHRpb25zIHdlcmUgY2hhbmdlZFxuICAgICAgICBjb25zdCBvbGRPcHRzID0gb2xkU291cmNlLndvcmtlck9wdGlvbnM7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAobmV3U291cmNlLm1heHpvb20gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLm1heHpvb20gPT09IG9sZE9wdHMuZ2VvanNvblZ0T3B0aW9ucy5tYXhab29tKSAmJlxuICAgICAgICAgIChuZXdTb3VyY2UuYnVmZmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5idWZmZXIgPT09IG9sZE9wdHMuZ2VvanNvblZ0T3B0aW9ucy5idWZmZXIpICYmXG4gICAgICAgICAgKG5ld1NvdXJjZS50b2xlcmFuY2UgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLnRvbGVyYW5jZSA9PT0gb2xkT3B0cy5nZW9qc29uVnRPcHRpb25zLnRvbGVyYW5jZSkgJiZcbiAgICAgICAgICAobmV3U291cmNlLmNsdXN0ZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLmNsdXN0ZXIgPT09IG9sZE9wdHMuY2x1c3RlcikgJiZcbiAgICAgICAgICAobmV3U291cmNlLmNsdXN0ZXJSYWRpdXMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLmNsdXN0ZXJSYWRpdXMgPT09IG9sZE9wdHMuc3VwZXJjbHVzdGVyT3B0aW9ucy5yYWRpdXMpICYmXG4gICAgICAgICAgKG5ld1NvdXJjZS5jbHVzdGVyTWF4Wm9vbSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UuY2x1c3Rlck1heFpvb20gPT09IG9sZE9wdHMuc3VwZXJjbHVzdGVyT3B0aW9ucy5tYXhab29tKVxuICAgICAgICApIHtcbiAgICAgICAgICBvbGRTb3VyY2Uuc2V0RGF0YShuZXdTb3VyY2UuZGF0YSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFwLnJlbW92ZVNvdXJjZSh1cGRhdGUuaWQpO1xuICAgIG1hcC5hZGRTb3VyY2UodXBkYXRlLmlkLCBuZXdTb3VyY2UpO1xuICB9XG5cbiAgLy8gSG92ZXIgYW5kIGNsaWNrIG9ubHkgcXVlcnkgbGF5ZXJzIHdob3NlIGludGVyYWN0aXZlIHByb3BlcnR5IGlzIHRydWVcbiAgLy8gSWYgbm8gaW50ZXJhY3Rpdml0eSBpcyBzcGVjaWZpZWQsIHF1ZXJ5IGFsbCBsYXllcnNcbiAgX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKSB7XG4gICAgY29uc3QgaW50ZXJhY3RpdmVMYXllcklkcyA9IGdldEludGVyYWN0aXZlTGF5ZXJJZHMobWFwU3R5bGUpO1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1zID0gaW50ZXJhY3RpdmVMYXllcklkcy5sZW5ndGggPT09IDAgPyB7fSA6XG4gICAgICB7bGF5ZXJzOiBpbnRlcmFjdGl2ZUxheWVySWRzfTtcbiAgfVxuXG4gIC8vIEluZGl2aWR1YWxseSB1cGRhdGUgdGhlIG1hcHMgc291cmNlIGFuZCBsYXllcnMgdGhhdCBoYXZlIGNoYW5nZWQgaWYgYWxsXG4gIC8vIG90aGVyIHN0eWxlIHByb3BzIGhhdmVuJ3QgY2hhbmdlZC4gVGhpcyBwcmV2ZW50cyBmbGlja2luZyBvZiB0aGUgbWFwIHdoZW5cbiAgLy8gc3R5bGVzIG9ubHkgY2hhbmdlIHNvdXJjZXMgb3IgbGF5ZXJzLlxuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cywgY29tcGxleGl0eSAqL1xuICBfc2V0RGlmZlN0eWxlKHByZXZTdHlsZSwgbmV4dFN0eWxlKSB7XG4gICAgY29uc3QgcHJldktleXNNYXAgPSBwcmV2U3R5bGUgJiYgc3R5bGVLZXlzTWFwKHByZXZTdHlsZSkgfHwge307XG4gICAgY29uc3QgbmV4dEtleXNNYXAgPSBzdHlsZUtleXNNYXAobmV4dFN0eWxlKTtcbiAgICBmdW5jdGlvbiBzdHlsZUtleXNNYXAoc3R5bGUpIHtcbiAgICAgIHJldHVybiBzdHlsZS5tYXAoKCkgPT4gdHJ1ZSkuZGVsZXRlKCdsYXllcnMnKS5kZWxldGUoJ3NvdXJjZXMnKS50b0pTKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyKCkge1xuICAgICAgY29uc3QgcHJldktleXNMaXN0ID0gT2JqZWN0LmtleXMocHJldktleXNNYXApO1xuICAgICAgY29uc3QgbmV4dEtleXNMaXN0ID0gT2JqZWN0LmtleXMobmV4dEtleXNNYXApO1xuICAgICAgaWYgKHByZXZLZXlzTGlzdC5sZW5ndGggIT09IG5leHRLZXlzTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICAvLyBgbmV4dFN0eWxlYCBhbmQgYHByZXZTdHlsZWAgc2hvdWxkIG5vdCBoYXZlIHRoZSBzYW1lIHNldCBvZiBwcm9wcy5cbiAgICAgIGlmIChuZXh0S2V5c0xpc3Quc29tZShcbiAgICAgICAga2V5ID0+IHByZXZTdHlsZS5nZXQoa2V5KSAhPT0gbmV4dFN0eWxlLmdldChrZXkpXG4gICAgICAgIC8vIEJ1dCB0aGUgdmFsdWUgb2Ygb25lIG9mIHRob3NlIHByb3BzIGlzIGRpZmZlcmVudC5cbiAgICAgICkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG5cbiAgICBpZiAoIXByZXZTdHlsZSB8fCBwcm9wc090aGVyVGhhbkxheWVyc09yU291cmNlc0RpZmZlcigpKSB7XG4gICAgICBtYXAuc2V0U3R5bGUobmV4dFN0eWxlLnRvSlMoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3NvdXJjZXNEaWZmLCBsYXllcnNEaWZmfSA9IGRpZmZTdHlsZXMocHJldlN0eWxlLCBuZXh0U3R5bGUpO1xuXG4gICAgLy8gVE9ETzogSXQncyByYXRoZXIgZGlmZmljdWx0IHRvIGRldGVybWluZSBzdHlsZSBkaWZmaW5nIGluIHRoZSBwcmVzZW5jZVxuICAgIC8vIG9mIHJlZnMuIEZvciBub3csIGlmIGFueSBzdHlsZSB1cGRhdGUgaGFzIGEgcmVmLCBmYWxsYmFjayB0byBubyBkaWZmaW5nLlxuICAgIC8vIFdlIGNhbiBjb21lIGJhY2sgdG8gdGhpcyBjYXNlIGlmIHRoZXJlJ3MgYSBzb2xpZCB1c2VjYXNlLlxuICAgIGlmIChsYXllcnNEaWZmLnVwZGF0ZXMuc29tZShub2RlID0+IG5vZGUubGF5ZXIuZ2V0KCdyZWYnKSkpIHtcbiAgICAgIG1hcC5zZXRTdHlsZShuZXh0U3R5bGUudG9KUygpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVudGVyIG9mIHNvdXJjZXNEaWZmLmVudGVyKSB7XG4gICAgICBtYXAuYWRkU291cmNlKGVudGVyLmlkLCBlbnRlci5zb3VyY2UudG9KUygpKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCB1cGRhdGUgb2Ygc291cmNlc0RpZmYudXBkYXRlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTb3VyY2UobWFwLCB1cGRhdGUpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGV4aXQgb2Ygc291cmNlc0RpZmYuZXhpdCkge1xuICAgICAgbWFwLnJlbW92ZVNvdXJjZShleGl0LmlkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBleGl0IG9mIGxheWVyc0RpZmYuZXhpdGluZykge1xuICAgICAgaWYgKG1hcC5zdHlsZS5nZXRMYXllcihleGl0LmlkKSkge1xuICAgICAgICBtYXAucmVtb3ZlTGF5ZXIoZXhpdC5pZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgdXBkYXRlIG9mIGxheWVyc0RpZmYudXBkYXRlcykge1xuICAgICAgaWYgKCF1cGRhdGUuZW50ZXIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhbiBvbGQgbGF5ZXIgdGhhdCBuZWVkcyB0byBiZSB1cGRhdGVkLiBSZW1vdmUgdGhlIG9sZCBsYXllclxuICAgICAgICAvLyB3aXRoIHRoZSBzYW1lIGlkIGFuZCBhZGQgaXQgYmFjayBhZ2Fpbi5cbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKHVwZGF0ZS5pZCk7XG4gICAgICB9XG4gICAgICBtYXAuYWRkTGF5ZXIodXBkYXRlLmxheWVyLnRvSlMoKSwgdXBkYXRlLmJlZm9yZSk7XG4gICAgfVxuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMsIGNvbXBsZXhpdHkgKi9cblxuICBfdXBkYXRlTWFwU3R5bGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBuZXdQcm9wcy5tYXBTdHlsZTtcbiAgICBjb25zdCBvbGRNYXBTdHlsZSA9IG9sZFByb3BzLm1hcFN0eWxlO1xuICAgIGlmIChtYXBTdHlsZSAhPT0gb2xkTWFwU3R5bGUpIHtcbiAgICAgIGlmIChJbW11dGFibGUuTWFwLmlzTWFwKG1hcFN0eWxlKSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wcmV2ZW50U3R5bGVEaWZmaW5nKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0TWFwKCkuc2V0U3R5bGUobWFwU3R5bGUudG9KUygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9zZXREaWZmU3R5bGUob2xkTWFwU3R5bGUsIG1hcFN0eWxlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZ2V0TWFwKCkuc2V0U3R5bGUobWFwU3R5bGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVNYXBWaWV3cG9ydChvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCB2aWV3cG9ydENoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMubGF0aXR1ZGUgIT09IG9sZFByb3BzLmxhdGl0dWRlIHx8XG4gICAgICBuZXdQcm9wcy5sb25naXR1ZGUgIT09IG9sZFByb3BzLmxvbmdpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuem9vbSB8fFxuICAgICAgbmV3UHJvcHMucGl0Y2ggIT09IG9sZFByb3BzLnBpdGNoIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy5iZWFyaW5nIHx8XG4gICAgICBuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGU7XG5cbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcblxuICAgIGlmICh2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIG1hcC5qdW1wVG8oe1xuICAgICAgICBjZW50ZXI6IFtuZXdQcm9wcy5sb25naXR1ZGUsIG5ld1Byb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogbmV3UHJvcHMuem9vbSxcbiAgICAgICAgYmVhcmluZzogbmV3UHJvcHMuYmVhcmluZyxcbiAgICAgICAgcGl0Y2g6IG5ld1Byb3BzLnBpdGNoXG4gICAgICB9KTtcblxuICAgICAgLy8gVE9ETyAtIGp1bXBUbyBkb2Vzbid0IGhhbmRsZSBhbHRpdHVkZVxuICAgICAgaWYgKG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZSkge1xuICAgICAgICBtYXAudHJhbnNmb3JtLmFsdGl0dWRlID0gbmV3UHJvcHMuYWx0aXR1ZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID1cbiAgICAgIG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcblxuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgICBtYXAucmVzaXplKCk7XG4gICAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydChtYXAudHJhbnNmb3JtKTtcbiAgICB9XG4gIH1cblxuICBfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nKHtwb3MsIHN0YXJ0UG9zLCBzdGFydEJlYXJpbmcsIHN0YXJ0UGl0Y2h9KSB7XG4gICAgY29uc3QgeERlbHRhID0gcG9zLnggLSBzdGFydFBvcy54O1xuICAgIGNvbnN0IGJlYXJpbmcgPSBzdGFydEJlYXJpbmcgKyAxODAgKiB4RGVsdGEgLyB0aGlzLnByb3BzLndpZHRoO1xuXG4gICAgbGV0IHBpdGNoID0gc3RhcnRQaXRjaDtcbiAgICBjb25zdCB5RGVsdGEgPSBwb3MueSAtIHN0YXJ0UG9zLnk7XG4gICAgaWYgKHlEZWx0YSA+IDApIHtcbiAgICAgIC8vIERyYWdnaW5nIGRvd253YXJkcywgZ3JhZHVhbGx5IGRlY3JlYXNlIHBpdGNoXG4gICAgICBpZiAoTWF0aC5hYnModGhpcy5wcm9wcy5oZWlnaHQgLSBzdGFydFBvcy55KSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICBjb25zdCBzY2FsZSA9IHlEZWx0YSAvICh0aGlzLnByb3BzLmhlaWdodCAtIHN0YXJ0UG9zLnkpO1xuICAgICAgICBwaXRjaCA9ICgxIC0gc2NhbGUpICogUElUQ0hfQUNDRUwgKiBzdGFydFBpdGNoO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoeURlbHRhIDwgMCkge1xuICAgICAgLy8gRHJhZ2dpbmcgdXB3YXJkcywgZ3JhZHVhbGx5IGluY3JlYXNlIHBpdGNoXG4gICAgICBpZiAoc3RhcnRQb3MueSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAxIGFzIHdlIGRyYWcgdXB3YXJkc1xuICAgICAgICBjb25zdCB5U2NhbGUgPSAxIC0gcG9zLnkgLyBzdGFydFBvcy55O1xuICAgICAgICAvLyBHcmFkdWFsbHkgYWRkIHVudGlsIHdlIGhpdCBtYXggcGl0Y2hcbiAgICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoICsgeVNjYWxlICogKE1BWF9QSVRDSCAtIHN0YXJ0UGl0Y2gpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbnNvbGUuZGVidWcoc3RhcnRQaXRjaCwgcGl0Y2gpO1xuICAgIHJldHVybiB7XG4gICAgICBwaXRjaDogTWF0aC5tYXgoTWF0aC5taW4ocGl0Y2gsIE1BWF9QSVRDSCksIDApLFxuICAgICAgYmVhcmluZ1xuICAgIH07XG4gIH1cblxuICAgLy8gSGVscGVyIHRvIGNhbGwgcHJvcHMub25DaGFuZ2VWaWV3cG9ydFxuICBfY2FsbE9uQ2hhbmdlVmlld3BvcnQodHJhbnNmb3JtLCBvcHRzID0ge30pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0KSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQoe1xuICAgICAgICBsYXRpdHVkZTogdHJhbnNmb3JtLmNlbnRlci5sYXQsXG4gICAgICAgIGxvbmdpdHVkZTogbW9kKHRyYW5zZm9ybS5jZW50ZXIubG5nICsgMTgwLCAzNjApIC0gMTgwLFxuICAgICAgICB6b29tOiB0cmFuc2Zvcm0uem9vbSxcbiAgICAgICAgcGl0Y2g6IHRyYW5zZm9ybS5waXRjaCxcbiAgICAgICAgYmVhcmluZzogbW9kKHRyYW5zZm9ybS5iZWFyaW5nICsgMTgwLCAzNjApIC0gMTgwLFxuXG4gICAgICAgIGlzRHJhZ2dpbmc6IHRoaXMucHJvcHMuaXNEcmFnZ2luZyxcbiAgICAgICAgc3RhcnREcmFnTG5nTGF0OiB0aGlzLnByb3BzLnN0YXJ0RHJhZ0xuZ0xhdCxcbiAgICAgICAgc3RhcnRCZWFyaW5nOiB0aGlzLnByb3BzLnN0YXJ0QmVhcmluZyxcbiAgICAgICAgc3RhcnRQaXRjaDogdGhpcy5wcm9wcy5zdGFydFBpdGNoLFxuXG4gICAgICAgIC4uLm9wdHNcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Ub3VjaFN0YXJ0KHtwb3N9KSB7XG4gICAgdGhpcy5fb25Nb3VzZURvd24oe3Bvc30pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlRG93bih7cG9zfSkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIGNvbnN0IGxuZ0xhdCA9IHVucHJvamVjdEZyb21UcmFuc2Zvcm0obWFwLnRyYW5zZm9ybSwgcG9zKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydChtYXAudHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiB0cnVlLFxuICAgICAgc3RhcnREcmFnTG5nTGF0OiBbbG5nTGF0LmxuZywgbG5nTGF0LmxhdF0sXG4gICAgICBzdGFydEJlYXJpbmc6IG1hcC50cmFuc2Zvcm0uYmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2g6IG1hcC50cmFuc2Zvcm0ucGl0Y2hcbiAgICB9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Ub3VjaERyYWcoe3Bvc30pIHtcbiAgICB0aGlzLl9vbk1vdXNlRHJhZyh7cG9zfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uTW91c2VEcmFnKHtwb3N9KSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB0YWtlIHRoZSBzdGFydCBsbmdsYXQgYW5kIHB1dCBpdCB3aGVyZSB0aGUgbW91c2UgaXMgZG93bi5cbiAgICBhc3NlcnQodGhpcy5wcm9wcy5zdGFydERyYWdMbmdMYXQsICdgc3RhcnREcmFnTG5nTGF0YCBwcm9wIGlzIHJlcXVpcmVkICcgK1xuICAgICAgJ2ZvciBtb3VzZSBkcmFnIGJlaGF2aW9yIHRvIGNhbGN1bGF0ZSB3aGVyZSB0byBwb3NpdGlvbiB0aGUgbWFwLicpO1xuXG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gY2xvbmVUcmFuc2Zvcm0obWFwLnRyYW5zZm9ybSk7XG4gICAgdHJhbnNmb3JtLnNldExvY2F0aW9uQXRQb2ludCh0aGlzLnByb3BzLnN0YXJ0RHJhZ0xuZ0xhdCwgcG9zKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydCh0cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Ub3VjaFJvdGF0ZSh7cG9zLCBzdGFydFBvc30pIHtcbiAgICB0aGlzLl9vbk1vdXNlUm90YXRlKHtwb3MsIHN0YXJ0UG9zfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uTW91c2VSb3RhdGUoe3Bvcywgc3RhcnRQb3N9KSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQgfHwgIXRoaXMucHJvcHMucGVyc3BlY3RpdmVFbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3N0YXJ0QmVhcmluZywgc3RhcnRQaXRjaH0gPSB0aGlzLnByb3BzO1xuICAgIGFzc2VydCh0eXBlb2Ygc3RhcnRCZWFyaW5nID09PSAnbnVtYmVyJyxcbiAgICAgICdgc3RhcnRCZWFyaW5nYCBwcm9wIGlzIHJlcXVpcmVkIGZvciBtb3VzZSByb3RhdGUgYmVoYXZpb3InKTtcbiAgICBhc3NlcnQodHlwZW9mIHN0YXJ0UGl0Y2ggPT09ICdudW1iZXInLFxuICAgICAgJ2BzdGFydFBpdGNoYCBwcm9wIGlzIHJlcXVpcmVkIGZvciBtb3VzZSByb3RhdGUgYmVoYXZpb3InKTtcblxuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuXG4gICAgY29uc3Qge3BpdGNoLCBiZWFyaW5nfSA9IHRoaXMuX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyh7XG4gICAgICBwb3MsXG4gICAgICBzdGFydFBvcyxcbiAgICAgIHN0YXJ0QmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2hcbiAgICB9KTtcblxuICAgIGNvbnN0IHRyYW5zZm9ybSA9IGNsb25lVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0pO1xuICAgIHRyYW5zZm9ybS5iZWFyaW5nID0gYmVhcmluZztcbiAgICB0cmFuc2Zvcm0ucGl0Y2ggPSBwaXRjaDtcblxuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlTW92ZShvcHQpIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICBjb25zdCBwb3MgPSBvcHQucG9zO1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkhvdmVyRmVhdHVyZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmVhdHVyZXMgPSBtYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKFtwb3MueCwgcG9zLnldLFxuICAgICAgdGhpcy5fcXVlcnlQYXJhbXMpO1xuICAgIGlmICghZmVhdHVyZXMubGVuZ3RoICYmIHRoaXMucHJvcHMuaWdub3JlRW1wdHlGZWF0dXJlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtpc0hvdmVyaW5nOiBmZWF0dXJlcy5sZW5ndGggPiAwfSk7XG4gICAgdGhpcy5wcm9wcy5vbkhvdmVyRmVhdHVyZXMoZmVhdHVyZXMpO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vblRvdWNoRW5kKG9wdCkge1xuICAgIHRoaXMuX29uTW91c2VVcChvcHQpO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vblRvdWNoVGFwKG9wdCkge1xuICAgIHRoaXMuX29uTW91c2VDbGljayhvcHQpO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlVXAob3B0KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgICBzdGFydERyYWdMbmdMYXQ6IG51bGwsXG4gICAgICBzdGFydEJlYXJpbmc6IG51bGwsXG4gICAgICBzdGFydFBpdGNoOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uTW91c2VDbGljayhvcHQpIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICBjb25zdCBwb3MgPSBvcHQucG9zO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgY29uc3QgbG5nTGF0ID0gdW5wcm9qZWN0RnJvbVRyYW5zZm9ybShtYXAudHJhbnNmb3JtLCBwb3MpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKGxuZ0xhdCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMub25DbGlja0ZlYXR1cmVzKSB7XG4gICAgICAvLyBSYWRpdXMgZW5hYmxlcyBwb2ludCBmZWF0dXJlcywgbGlrZSBtYXJrZXIgc3ltYm9scywgdG8gYmUgY2xpY2tlZC5cbiAgICAgIGNvbnN0IHNpemUgPSB0aGlzLnByb3BzLmNsaWNrUmFkaXVzO1xuICAgICAgY29uc3QgYmJveCA9IFtbcG9zLnggLSBzaXplLCBwb3MueSAtIHNpemVdLCBbcG9zLnggKyBzaXplLCBwb3MueSArIHNpemVdXTtcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhiYm94LCB0aGlzLl9xdWVyeVBhcmFtcyk7XG4gICAgICBpZiAoIWZlYXR1cmVzLmxlbmd0aCAmJiB0aGlzLnByb3BzLmlnbm9yZUVtcHR5RmVhdHVyZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrRmVhdHVyZXMoZmVhdHVyZXMpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZCBfb25ab29tKHtwb3MsIHNjYWxlfSkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IGNsb25lVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0pO1xuICAgIGNvbnN0IGFyb3VuZCA9IHVucHJvamVjdEZyb21UcmFuc2Zvcm0odHJhbnNmb3JtLCBwb3MpO1xuICAgIHRyYW5zZm9ybS56b29tID0gdHJhbnNmb3JtLnNjYWxlWm9vbShtYXAudHJhbnNmb3JtLnNjYWxlICogc2NhbGUpO1xuICAgIHRyYW5zZm9ybS5zZXRMb2NhdGlvbkF0UG9pbnQoYXJvdW5kLCBwb3MpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vblpvb21FbmQoKSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7Y2xhc3NOYW1lLCB3aWR0aCwgaGVpZ2h0LCBzdHlsZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG1hcFN0eWxlID0ge1xuICAgICAgLi4uc3R5bGUsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGN1cnNvcjogdGhpcy5fY3Vyc29yKClcbiAgICB9O1xuXG4gICAgbGV0IGNvbnRlbnQgPSBbXG4gICAgICA8ZGl2IGtleT1cIm1hcFwiIHJlZj1cIm1hcGJveE1hcFwiXG4gICAgICAgIHN0eWxlPXsgbWFwU3R5bGUgfSBjbGFzc05hbWU9eyBjbGFzc05hbWUgfS8+LFxuICAgICAgPGRpdiBrZXk9XCJvdmVybGF5c1wiIGNsYXNzTmFtZT1cIm92ZXJsYXlzXCJcbiAgICAgICAgc3R5bGU9eyB7cG9zaXRpb246ICdhYnNvbHV0ZScsIGxlZnQ6IDAsIHRvcDogMH0gfT5cbiAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgIDwvZGl2PlxuICAgIF07XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5pc1N1cHBvcnRlZCAmJiB0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQpIHtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxNYXBJbnRlcmFjdGlvbnNcbiAgICAgICAgICBvbk1vdXNlRG93biA9eyB0aGlzLl9vbk1vdXNlRG93biB9XG4gICAgICAgICAgb25Nb3VzZURyYWcgPXsgdGhpcy5fb25Nb3VzZURyYWcgfVxuICAgICAgICAgIG9uTW91c2VSb3RhdGUgPXsgdGhpcy5fb25Nb3VzZVJvdGF0ZSB9XG4gICAgICAgICAgb25Nb3VzZVVwID17IHRoaXMuX29uTW91c2VVcCB9XG4gICAgICAgICAgb25Nb3VzZU1vdmUgPXsgdGhpcy5fb25Nb3VzZU1vdmUgfVxuICAgICAgICAgIG9uTW91c2VDbGljayA9IHsgdGhpcy5fb25Nb3VzZUNsaWNrIH1cbiAgICAgICAgICBvblRvdWNoU3RhcnQgPXsgdGhpcy5fb25Ub3VjaFN0YXJ0IH1cbiAgICAgICAgICBvblRvdWNoRHJhZyA9eyB0aGlzLl9vblRvdWNoRHJhZyB9XG4gICAgICAgICAgb25Ub3VjaFJvdGF0ZSA9eyB0aGlzLl9vblRvdWNoUm90YXRlIH1cbiAgICAgICAgICBvblRvdWNoRW5kID17IHRoaXMuX29uVG91Y2hFbmQgfVxuICAgICAgICAgIG9uVG91Y2hUYXAgPSB7IHRoaXMuX29uVG91Y2hUYXAgfVxuICAgICAgICAgIG9uWm9vbSA9eyB0aGlzLl9vblpvb20gfVxuICAgICAgICAgIG9uWm9vbUVuZCA9eyB0aGlzLl9vblpvb21FbmQgfVxuICAgICAgICAgIHdpZHRoID17IHRoaXMucHJvcHMud2lkdGggfVxuICAgICAgICAgIGhlaWdodCA9eyB0aGlzLnByb3BzLmhlaWdodCB9PlxuXG4gICAgICAgICAgeyBjb250ZW50IH1cblxuICAgICAgICA8L01hcEludGVyYWN0aW9ucz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgc3R5bGU9eyB7XG4gICAgICAgICAgLi4udGhpcy5wcm9wcy5zdHlsZSxcbiAgICAgICAgICB3aWR0aDogdGhpcy5wcm9wcy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICAgIH0gfT5cblxuICAgICAgICB7IGNvbnRlbnQgfVxuXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbk1hcEdMLnByb3BUeXBlcyA9IFBST1BfVFlQRVM7XG5NYXBHTC5kZWZhdWx0UHJvcHMgPSBERUZBVUxUX1BST1BTO1xuIl19