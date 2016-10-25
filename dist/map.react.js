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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXAucmVhY3QuanMiXSwibmFtZXMiOlsibm9vcCIsIk1BWF9QSVRDSCIsIlBJVENIX01PVVNFX1RIUkVTSE9MRCIsIlBJVENIX0FDQ0VMIiwiUFJPUF9UWVBFUyIsImxhdGl0dWRlIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImxvbmdpdHVkZSIsInpvb20iLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsImluc3RhbmNlT2YiLCJNYXAiLCJtYXBib3hBcGlBY2Nlc3NUb2tlbiIsIm9uQ2hhbmdlVmlld3BvcnQiLCJmdW5jIiwid2lkdGgiLCJoZWlnaHQiLCJpc0RyYWdnaW5nIiwiYm9vbCIsInN0YXJ0RHJhZ0xuZ0xhdCIsImFycmF5Iiwib25Ib3ZlckZlYXR1cmVzIiwiaWdub3JlRW1wdHlGZWF0dXJlcyIsImF0dHJpYnV0aW9uQ29udHJvbCIsIm9uQ2xpY2siLCJvbkNsaWNrRmVhdHVyZXMiLCJjbGlja1JhZGl1cyIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsInByZXZlbnRTdHlsZURpZmZpbmciLCJwZXJzcGVjdGl2ZUVuYWJsZWQiLCJiZWFyaW5nIiwiUHJvcFR5cGVzIiwicGl0Y2giLCJhbHRpdHVkZSIsIkRFRkFVTFRfUFJPUFMiLCJERUZBVUxUUyIsIk1BUEJPWF9BUElfQUNDRVNTX1RPS0VOIiwiTWFwR0wiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsInN0YXRlIiwiaXNTdXBwb3J0ZWQiLCJpc0hvdmVyaW5nIiwic3RhcnRCZWFyaW5nIiwic3RhcnRQaXRjaCIsIl9xdWVyeVBhcmFtcyIsImFjY2Vzc1Rva2VuIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwiY29tcG9uZW50RGlkVXBkYXRlIiwiaXNNYXAiLCJ0b0pTIiwibWFwIiwiY29udGFpbmVyIiwicmVmcyIsIm1hcGJveE1hcCIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJnZXRDYW52YXMiLCJfbWFwIiwiX3VwZGF0ZU1hcFZpZXdwb3J0IiwiX2NhbGxPbkNoYW5nZVZpZXdwb3J0IiwidHJhbnNmb3JtIiwiX3VwZGF0ZVF1ZXJ5UGFyYW1zIiwibmV3UHJvcHMiLCJfdXBkYXRlU3RhdGVGcm9tUHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIl91cGRhdGVNYXBTaXplIiwicmVtb3ZlIiwiaXNJbnRlcmFjdGl2ZSIsIm9uQ2xpY2tGZWF0dXJlIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJQT0lOVEVSIiwiR1JBQiIsIm9sZFByb3BzIiwic2xpY2UiLCJ1cGRhdGUiLCJuZXdTb3VyY2UiLCJzb3VyY2UiLCJ0eXBlIiwib2xkU291cmNlIiwiZ2V0U291cmNlIiwiaWQiLCJvbGRPcHRzIiwid29ya2VyT3B0aW9ucyIsIm1heHpvb20iLCJ1bmRlZmluZWQiLCJnZW9qc29uVnRPcHRpb25zIiwibWF4Wm9vbSIsImJ1ZmZlciIsInRvbGVyYW5jZSIsImNsdXN0ZXIiLCJjbHVzdGVyUmFkaXVzIiwic3VwZXJjbHVzdGVyT3B0aW9ucyIsInJhZGl1cyIsImNsdXN0ZXJNYXhab29tIiwic2V0RGF0YSIsImRhdGEiLCJyZW1vdmVTb3VyY2UiLCJhZGRTb3VyY2UiLCJpbnRlcmFjdGl2ZUxheWVySWRzIiwibGVuZ3RoIiwibGF5ZXJzIiwicHJldlN0eWxlIiwibmV4dFN0eWxlIiwicHJldktleXNNYXAiLCJzdHlsZUtleXNNYXAiLCJuZXh0S2V5c01hcCIsImRlbGV0ZSIsInByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyIiwicHJldktleXNMaXN0IiwiT2JqZWN0Iiwia2V5cyIsIm5leHRLZXlzTGlzdCIsInNvbWUiLCJnZXQiLCJrZXkiLCJfZ2V0TWFwIiwic2V0U3R5bGUiLCJzb3VyY2VzRGlmZiIsImxheWVyc0RpZmYiLCJ1cGRhdGVzIiwibm9kZSIsImxheWVyIiwiZW50ZXIiLCJfdXBkYXRlU291cmNlIiwiZXhpdCIsImV4aXRpbmciLCJnZXRMYXllciIsInJlbW92ZUxheWVyIiwiYWRkTGF5ZXIiLCJiZWZvcmUiLCJvbGRNYXBTdHlsZSIsIl9zZXREaWZmU3R5bGUiLCJ2aWV3cG9ydENoYW5nZWQiLCJqdW1wVG8iLCJzaXplQ2hhbmdlZCIsInJlc2l6ZSIsInBvcyIsInN0YXJ0UG9zIiwieERlbHRhIiwieCIsInlEZWx0YSIsInkiLCJNYXRoIiwiYWJzIiwic2NhbGUiLCJ5U2NhbGUiLCJtYXgiLCJtaW4iLCJvcHRzIiwibGF0IiwibG5nIiwiX29uTW91c2VEb3duIiwibG5nTGF0IiwiX29uTW91c2VEcmFnIiwic2V0TG9jYXRpb25BdFBvaW50IiwiX29uTW91c2VSb3RhdGUiLCJfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nIiwib3B0IiwiZmVhdHVyZXMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJfb25Nb3VzZVVwIiwiX29uTW91c2VDbGljayIsInNpemUiLCJiYm94IiwiYXJvdW5kIiwic2NhbGVab29tIiwiY2xhc3NOYW1lIiwiY3Vyc29yIiwiX2N1cnNvciIsImNvbnRlbnQiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJjaGlsZHJlbiIsIl9vbk1vdXNlTW92ZSIsIl9vblRvdWNoU3RhcnQiLCJfb25Ub3VjaERyYWciLCJfb25Ub3VjaFJvdGF0ZSIsIl9vblRvdWNoRW5kIiwiX29uVG91Y2hUYXAiLCJfb25ab29tIiwiX29uWm9vbUVuZCIsInByb3BUeXBlcyIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7b0NBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFTQSxJQUFULEdBQWdCLENBQUU7O0FBRWxCO0FB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Ozs7QUE4ZnJCQSxNQUFNc0osU0FBTixHQUFrQjFMLFVBQWxCO0FBQ0FvQyxNQUFNdUosWUFBTixHQUFxQjFKLGFBQXJCIiwiZmlsZSI6Im1hcC5yZWFjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXMsIENvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJ2F1dG9iaW5kLWRlY29yYXRvcic7XG5pbXBvcnQgcHVyZVJlbmRlciBmcm9tICdwdXJlLXJlbmRlci1kZWNvcmF0b3InO1xuXG5pbXBvcnQgbWFwYm94Z2wgZnJvbSAnbWFwYm94LWdsJztcbmltcG9ydCB7c2VsZWN0fSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgTWFwSW50ZXJhY3Rpb25zIGZyb20gJy4vbWFwLWludGVyYWN0aW9ucy5yZWFjdCc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuaW1wb3J0IHtnZXRJbnRlcmFjdGl2ZUxheWVySWRzfSBmcm9tICcuL3V0aWxzL3N0eWxlLXV0aWxzJztcbmltcG9ydCBkaWZmU3R5bGVzIGZyb20gJy4vdXRpbHMvZGlmZi1zdHlsZXMnO1xuaW1wb3J0IHttb2QsIHVucHJvamVjdEZyb21UcmFuc2Zvcm0sIGNsb25lVHJhbnNmb3JtfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybSc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyBOb3RlOiBNYXggcGl0Y2ggaXMgYSBoYXJkIGNvZGVkIHZhbHVlIChub3QgYSBuYW1lZCBjb25zdGFudCkgaW4gdHJhbnNmb3JtLmpzXG5jb25zdCBNQVhfUElUQ0ggPSA2MDtcbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDIwO1xuY29uc3QgUElUQ0hfQUNDRUwgPSAxLjI7XG5cbmNvbnN0IFBST1BfVFlQRVMgPSB7XG4gIC8qKlxuICAgICogVGhlIGxhdGl0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC5cbiAgICAqL1xuICBsYXRpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSBsb25naXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLlxuICAgICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC5cbiAgICAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogVGhlIE1hcGJveCBzdHlsZSB0aGUgY29tcG9uZW50IHNob3VsZCB1c2UuIENhbiBlaXRoZXIgYmUgYSBzdHJpbmcgdXJsXG4gICAgKiBvciBhIE1hcGJveEdMIHN0eWxlIEltbXV0YWJsZS5NYXAgb2JqZWN0LlxuICAgICovXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIFByb3BUeXBlcy5pbnN0YW5jZU9mKEltbXV0YWJsZS5NYXApXG4gIF0pLFxuICAvKipcbiAgICAqIFRoZSBNYXBib3ggQVBJIGFjY2VzcyB0b2tlbiB0byBwcm92aWRlIHRvIG1hcGJveC1nbC1qcy4gVGhpcyBpcyByZXF1aXJlZFxuICAgICogd2hlbiB1c2luZyBNYXBib3ggcHJvdmlkZWQgdmVjdG9yIHRpbGVzIGFuZCBzdHlsZXMuXG4gICAgKi9cbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcsXG4gIC8qKlxuICAgICogYG9uQ2hhbmdlVmlld3BvcnRgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgICogbWFwLiBUaGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgY2FsbGJhY2sgY29udGFpbnMgYGxhdGl0dWRlYCxcbiAgICAqIGBsb25naXR1ZGVgIGFuZCBgem9vbWAgYW5kIGFkZGl0aW9uYWwgc3RhdGUgaW5mb3JtYXRpb24uXG4gICAgKi9cbiAgb25DaGFuZ2VWaWV3cG9ydDogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgICogVGhlIHdpZHRoIG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqXG4gICAgKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogSXMgdGhlIGNvbXBvbmVudCBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC4gVGhpcyBpcyB1c2VkIHRvIHNob3cvaGlkZSB0aGVcbiAgICAqIGRyYWcgY3Vyc29yLiBBbHNvIHVzZWQgYXMgYW4gb3B0aW1pemF0aW9uIGluIHNvbWUgb3ZlcmxheXMgYnkgcHJldmVudGluZ1xuICAgICogcmVuZGVyaW5nIHdoaWxlIGRyYWdnaW5nLlxuICAgICovXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICAvKipcbiAgICAqIFJlcXVpcmVkIHRvIGNhbGN1bGF0ZSB0aGUgbW91c2UgcHJvamVjdGlvbiBhZnRlciB0aGUgZmlyc3QgY2xpY2sgZXZlbnRcbiAgICAqIGR1cmluZyBkcmFnZ2luZy4gV2hlcmUgdGhlIG1hcCBpcyBkZXBlbmRzIG9uIHdoZXJlIHlvdSBmaXJzdCBjbGlja2VkIG9uXG4gICAgKiB0aGUgbWFwLlxuICAgICovXG4gIHN0YXJ0RHJhZ0xuZ0xhdDogUHJvcFR5cGVzLmFycmF5LFxuICAvKipcbiAgICAqIENhbGxlZCB3aGVuIGEgZmVhdHVyZSBpcyBob3ZlcmVkIG92ZXIuIFVzZXMgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEkgdG8gZmluZCBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlcjpcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gcXVlcnkgb25seSBzb21lIG9mIHRoZSBsYXllcnMsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlLXNwZWMvI2xheWVyLWludGVyYWN0aXZlXG4gICAgKiBJZiBubyBpbnRlcmFjdGl2ZSBsYXllcnMgYXJlIGZvdW5kIChlLmcuIHVzaW5nIE1hcGJveCdzIGRlZmF1bHQgc3R5bGVzKSxcbiAgICAqIHdpbGwgZmFsbCBiYWNrIHRvIHF1ZXJ5IGFsbCBsYXllcnMuXG4gICAgKiBAY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7YXJyYXl9IGZlYXR1cmVzIC0gVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRoZSBtb3VzZSBpcyBvdmVyLlxuICAgICovXG4gIG9uSG92ZXJGZWF0dXJlczogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgICogRGVmYXVsdHMgdG8gVFJVRVxuICAgICogU2V0IHRvIGZhbHNlIHRvIGVuYWJsZSBvbkhvdmVyRmVhdHVyZXMgdG8gYmUgY2FsbGVkIHJlZ2FyZGxlc3MgaWZcbiAgICAqIHRoZXJlIGlzIGFuIGFjdHVhbCBmZWF0dXJlIGF0IHgsIHkuIFRoaXMgaXMgdXNlZnVsIHRvIGVtdWxhdGVcbiAgICAqIFwibW91c2Utb3V0XCIgYmVoYXZpb3JzIG9uIGZlYXR1cmVzLlxuICAgICovXG4gIGlnbm9yZUVtcHR5RmVhdHVyZXM6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogU2hvdyBhdHRyaWJ1dGlvbiBjb250cm9sIG9yIG5vdC5cbiAgICAqL1xuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBjbGlja2VkIG9uLiBSZXR1cm5zIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUuXG4gICAgKi9cbiAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiBhIGZlYXR1cmUgaXMgY2xpY2tlZCBvbi4gVXNlcyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSSB0byBmaW5kIGZlYXR1cmVzIHVuZGVyIHRoZSBwb2ludGVyOlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBxdWVyeSBvbmx5IHNvbWUgb2YgdGhlIGxheWVycywgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICAqIElmIG5vIGludGVyYWN0aXZlIGxheWVycyBhcmUgZm91bmQgKGUuZy4gdXNpbmcgTWFwYm94J3MgZGVmYXVsdCBzdHlsZXMpLFxuICAgICogd2lsbCBmYWxsIGJhY2sgdG8gcXVlcnkgYWxsIGxheWVycy5cbiAgICAqL1xuICBvbkNsaWNrRmVhdHVyZXM6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKlxuICAgICogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAxNS5cbiAgICAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICAqIFBhc3NlZCB0byBNYXBib3ggTWFwIGNvbnN0cnVjdG9yIHdoaWNoIHBhc3NlcyBpdCB0byB0aGUgY2FudmFzIGNvbnRleHQuXG4gICAgKiBUaGlzIGlzIHVuc2VmdWwgd2hlbiB5b3Ugd2FudCB0byBleHBvcnQgdGhlIGNhbnZhcyBhcyBhIFBORy5cbiAgICAqL1xuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogVGhlcmUgYXJlIHN0aWxsIGtub3duIGlzc3VlcyB3aXRoIHN0eWxlIGRpZmZpbmcuIEFzIGEgdGVtcG9yYXJ5IHN0b3BnYXAsXG4gICAgKiBhZGQgdGhlIG9wdGlvbiB0byBwcmV2ZW50IHN0eWxlIGRpZmZpbmcuXG4gICAgKi9cbiAgcHJldmVudFN0eWxlRGlmZmluZzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBFbmFibGVzIHBlcnNwZWN0aXZlIGNvbnRyb2wgZXZlbnQgaGFuZGxpbmcgKENvbW1hbmQtcm90YXRlKVxuICAgICovXG4gIHBlcnNwZWN0aXZlRW5hYmxlZDogUHJvcFR5cGVzLmJvb2wsXG5cbiAgLyoqXG4gICAgKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydFxuICAgICovXG4gIGJlYXJpbmc6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqXG4gICAgKiBTcGVjaWZ5IHRoZSBwaXRjaCBvZiB0aGUgdmlld3BvcnRcbiAgICAqL1xuICBwaXRjaDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmFcbiAgICAqIFVuaXQ6IG1hcCBoZWlnaHRzLCBkZWZhdWx0IDEuNVxuICAgICogTm9uLXB1YmxpYyBBUEksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTEzN1xuICAgICovXG4gIGFsdGl0dWRlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG59O1xuXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICBtYXBTdHlsZTogJ21hcGJveDovL3N0eWxlcy9tYXBib3gvbGlnaHQtdjgnLFxuICBvbkNoYW5nZVZpZXdwb3J0OiBudWxsLFxuICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogY29uZmlnLkRFRkFVTFRTLk1BUEJPWF9BUElfQUNDRVNTX1RPS0VOLFxuICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICBhdHRyaWJ1dGlvbkNvbnRyb2w6IHRydWUsXG4gIGlnbm9yZUVtcHR5RmVhdHVyZXM6IHRydWUsXG4gIGJlYXJpbmc6IDAsXG4gIHBpdGNoOiAwLFxuICBhbHRpdHVkZTogMS41LFxuICBjbGlja1JhZGl1czogMTVcbn07XG5cbkBwdXJlUmVuZGVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBHTCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gbWFwYm94Z2wuc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgaXNTdXBwb3J0ZWQ6IG1hcGJveGdsLnN1cHBvcnRlZCgpLFxuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgICBpc0hvdmVyaW5nOiBmYWxzZSxcbiAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0QmVhcmluZzogbnVsbCxcbiAgICAgIHN0YXJ0UGl0Y2g6IG51bGxcbiAgICB9O1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1zID0ge307XG4gICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBwcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbjtcblxuICAgIGlmICghdGhpcy5zdGF0ZS5pc1N1cHBvcnRlZCkge1xuICAgICAgdGhpcy5jb21wb25lbnREaWRNb3VudCA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnREaWRVcGRhdGUgPSBub29wO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IG1hcFN0eWxlID0gSW1tdXRhYmxlLk1hcC5pc01hcCh0aGlzLnByb3BzLm1hcFN0eWxlKSA/XG4gICAgICB0aGlzLnByb3BzLm1hcFN0eWxlLnRvSlMoKSA6XG4gICAgICB0aGlzLnByb3BzLm1hcFN0eWxlO1xuICAgIGNvbnN0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgY29udGFpbmVyOiB0aGlzLnJlZnMubWFwYm94TWFwLFxuICAgICAgY2VudGVyOiBbdGhpcy5wcm9wcy5sb25naXR1ZGUsIHRoaXMucHJvcHMubGF0aXR1ZGVdLFxuICAgICAgem9vbTogdGhpcy5wcm9wcy56b29tLFxuICAgICAgcGl0Y2g6IHRoaXMucHJvcHMucGl0Y2gsXG4gICAgICBiZWFyaW5nOiB0aGlzLnByb3BzLmJlYXJpbmcsXG4gICAgICBzdHlsZTogbWFwU3R5bGUsXG4gICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXG4gICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRoaXMucHJvcHMucHJlc2VydmVEcmF3aW5nQnVmZmVyXG4gICAgICAvLyBUT0RPP1xuICAgICAgLy8gYXR0cmlidXRpb25Db250cm9sOiB0aGlzLnByb3BzLmF0dHJpYnV0aW9uQ29udHJvbFxuICAgIH0pO1xuXG4gICAgc2VsZWN0KG1hcC5nZXRDYW52YXMoKSkuc3R5bGUoJ291dGxpbmUnLCAnbm9uZScpO1xuXG4gICAgdGhpcy5fbWFwID0gbWFwO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KHt9LCB0aGlzLnByb3BzKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydChtYXAudHJhbnNmb3JtKTtcbiAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSk7XG4gIH1cblxuICAvLyBOZXcgcHJvcHMgYXJlIGNvbWluJyByb3VuZCB0aGUgY29ybmVyIVxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5fdXBkYXRlU3RhdGVGcm9tUHJvcHModGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTdHlsZSh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgLy8gU2F2ZSB3aWR0aC9oZWlnaHQgc28gdGhhdCB3ZSBjYW4gY2hlY2sgdGhlbSBpbiBjb21wb25lbnREaWRVcGRhdGVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NLCB3ZSBuZWVkIHRvIGNhbGwgYWZ0ZXIgcmVuZGVyXG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSh0aGlzLnN0YXRlLCB0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLl9tYXApIHtcbiAgICAgIHRoaXMuX21hcC5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICBfY3Vyc29yKCkge1xuICAgIGNvbnN0IGlzSW50ZXJhY3RpdmUgPVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0IHx8XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2tGZWF0dXJlIHx8XG4gICAgICB0aGlzLnByb3BzLm9uSG92ZXJGZWF0dXJlcztcbiAgICBpZiAoaXNJbnRlcmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuaXNEcmFnZ2luZyA/XG4gICAgICAgIGNvbmZpZy5DVVJTT1IuR1JBQkJJTkcgOlxuICAgICAgICAodGhpcy5zdGF0ZS5pc0hvdmVyaW5nID8gY29uZmlnLkNVUlNPUi5QT0lOVEVSIDogY29uZmlnLkNVUlNPUi5HUkFCKTtcbiAgICB9XG4gICAgcmV0dXJuICdpbmhlcml0JztcbiAgfVxuXG4gIF9nZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcDtcbiAgfVxuXG4gIF91cGRhdGVTdGF0ZUZyb21Qcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBtYXBib3hnbC5hY2Nlc3NUb2tlbiA9IG5ld1Byb3BzLm1hcGJveEFwaUFjY2Vzc1Rva2VuO1xuICAgIGNvbnN0IHtzdGFydERyYWdMbmdMYXR9ID0gbmV3UHJvcHM7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzdGFydERyYWdMbmdMYXQ6IHN0YXJ0RHJhZ0xuZ0xhdCAmJiBzdGFydERyYWdMbmdMYXQuc2xpY2UoKVxuICAgIH0pO1xuICB9XG5cbiAgX3VwZGF0ZVNvdXJjZShtYXAsIHVwZGF0ZSkge1xuICAgIGNvbnN0IG5ld1NvdXJjZSA9IHVwZGF0ZS5zb3VyY2UudG9KUygpO1xuICAgIGlmIChuZXdTb3VyY2UudHlwZSA9PT0gJ2dlb2pzb24nKSB7XG4gICAgICBjb25zdCBvbGRTb3VyY2UgPSBtYXAuZ2V0U291cmNlKHVwZGF0ZS5pZCk7XG4gICAgICBpZiAob2xkU291cmNlLnR5cGUgPT09ICdnZW9qc29uJykge1xuICAgICAgICAvLyB1cGRhdGUgZGF0YSBpZiBubyBvdGhlciBHZW9KU09OU291cmNlIG9wdGlvbnMgd2VyZSBjaGFuZ2VkXG4gICAgICAgIGNvbnN0IG9sZE9wdHMgPSBvbGRTb3VyY2Uud29ya2VyT3B0aW9ucztcbiAgICAgICAgaWYgKFxuICAgICAgICAgIChuZXdTb3VyY2UubWF4em9vbSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UubWF4em9vbSA9PT0gb2xkT3B0cy5nZW9qc29uVnRPcHRpb25zLm1heFpvb20pICYmXG4gICAgICAgICAgKG5ld1NvdXJjZS5idWZmZXIgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLmJ1ZmZlciA9PT0gb2xkT3B0cy5nZW9qc29uVnRPcHRpb25zLmJ1ZmZlcikgJiZcbiAgICAgICAgICAobmV3U291cmNlLnRvbGVyYW5jZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UudG9sZXJhbmNlID09PSBvbGRPcHRzLmdlb2pzb25WdE9wdGlvbnMudG9sZXJhbmNlKSAmJlxuICAgICAgICAgIChuZXdTb3VyY2UuY2x1c3RlciA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UuY2x1c3RlciA9PT0gb2xkT3B0cy5jbHVzdGVyKSAmJlxuICAgICAgICAgIChuZXdTb3VyY2UuY2x1c3RlclJhZGl1cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UuY2x1c3RlclJhZGl1cyA9PT0gb2xkT3B0cy5zdXBlcmNsdXN0ZXJPcHRpb25zLnJhZGl1cykgJiZcbiAgICAgICAgICAobmV3U291cmNlLmNsdXN0ZXJNYXhab29tID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyTWF4Wm9vbSA9PT0gb2xkT3B0cy5zdXBlcmNsdXN0ZXJPcHRpb25zLm1heFpvb20pXG4gICAgICAgICkge1xuICAgICAgICAgIG9sZFNvdXJjZS5zZXREYXRhKG5ld1NvdXJjZS5kYXRhKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBtYXAucmVtb3ZlU291cmNlKHVwZGF0ZS5pZCk7XG4gICAgbWFwLmFkZFNvdXJjZSh1cGRhdGUuaWQsIG5ld1NvdXJjZSk7XG4gIH1cblxuICAvLyBIb3ZlciBhbmQgY2xpY2sgb25seSBxdWVyeSBsYXllcnMgd2hvc2UgaW50ZXJhY3RpdmUgcHJvcGVydHkgaXMgdHJ1ZVxuICAvLyBJZiBubyBpbnRlcmFjdGl2aXR5IGlzIHNwZWNpZmllZCwgcXVlcnkgYWxsIGxheWVyc1xuICBfdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpIHtcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUxheWVySWRzID0gZ2V0SW50ZXJhY3RpdmVMYXllcklkcyhtYXBTdHlsZSk7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSBpbnRlcmFjdGl2ZUxheWVySWRzLmxlbmd0aCA9PT0gMCA/IHt9IDpcbiAgICAgIHtsYXllcnM6IGludGVyYWN0aXZlTGF5ZXJJZHN9O1xuICB9XG5cbiAgLy8gSW5kaXZpZHVhbGx5IHVwZGF0ZSB0aGUgbWFwcyBzb3VyY2UgYW5kIGxheWVycyB0aGF0IGhhdmUgY2hhbmdlZCBpZiBhbGxcbiAgLy8gb3RoZXIgc3R5bGUgcHJvcHMgaGF2ZW4ndCBjaGFuZ2VkLiBUaGlzIHByZXZlbnRzIGZsaWNraW5nIG9mIHRoZSBtYXAgd2hlblxuICAvLyBzdHlsZXMgb25seSBjaGFuZ2Ugc291cmNlcyBvciBsYXllcnMuXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzLCBjb21wbGV4aXR5ICovXG4gIF9zZXREaWZmU3R5bGUocHJldlN0eWxlLCBuZXh0U3R5bGUpIHtcbiAgICBjb25zdCBwcmV2S2V5c01hcCA9IHByZXZTdHlsZSAmJiBzdHlsZUtleXNNYXAocHJldlN0eWxlKSB8fCB7fTtcbiAgICBjb25zdCBuZXh0S2V5c01hcCA9IHN0eWxlS2V5c01hcChuZXh0U3R5bGUpO1xuICAgIGZ1bmN0aW9uIHN0eWxlS2V5c01hcChzdHlsZSkge1xuICAgICAgcmV0dXJuIHN0eWxlLm1hcCgoKSA9PiB0cnVlKS5kZWxldGUoJ2xheWVycycpLmRlbGV0ZSgnc291cmNlcycpLnRvSlMoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcHJvcHNPdGhlclRoYW5MYXllcnNPclNvdXJjZXNEaWZmZXIoKSB7XG4gICAgICBjb25zdCBwcmV2S2V5c0xpc3QgPSBPYmplY3Qua2V5cyhwcmV2S2V5c01hcCk7XG4gICAgICBjb25zdCBuZXh0S2V5c0xpc3QgPSBPYmplY3Qua2V5cyhuZXh0S2V5c01hcCk7XG4gICAgICBpZiAocHJldktleXNMaXN0Lmxlbmd0aCAhPT0gbmV4dEtleXNMaXN0Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIGBuZXh0U3R5bGVgIGFuZCBgcHJldlN0eWxlYCBzaG91bGQgbm90IGhhdmUgdGhlIHNhbWUgc2V0IG9mIHByb3BzLlxuICAgICAgaWYgKG5leHRLZXlzTGlzdC5zb21lKFxuICAgICAgICBrZXkgPT4gcHJldlN0eWxlLmdldChrZXkpICE9PSBuZXh0U3R5bGUuZ2V0KGtleSlcbiAgICAgICAgLy8gQnV0IHRoZSB2YWx1ZSBvZiBvbmUgb2YgdGhvc2UgcHJvcHMgaXMgZGlmZmVyZW50LlxuICAgICAgKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcblxuICAgIGlmICghcHJldlN0eWxlIHx8IHByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyKCkpIHtcbiAgICAgIG1hcC5zZXRTdHlsZShuZXh0U3R5bGUudG9KUygpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7c291cmNlc0RpZmYsIGxheWVyc0RpZmZ9ID0gZGlmZlN0eWxlcyhwcmV2U3R5bGUsIG5leHRTdHlsZSk7XG5cbiAgICAvLyBUT0RPOiBJdCdzIHJhdGhlciBkaWZmaWN1bHQgdG8gZGV0ZXJtaW5lIHN0eWxlIGRpZmZpbmcgaW4gdGhlIHByZXNlbmNlXG4gICAgLy8gb2YgcmVmcy4gRm9yIG5vdywgaWYgYW55IHN0eWxlIHVwZGF0ZSBoYXMgYSByZWYsIGZhbGxiYWNrIHRvIG5vIGRpZmZpbmcuXG4gICAgLy8gV2UgY2FuIGNvbWUgYmFjayB0byB0aGlzIGNhc2UgaWYgdGhlcmUncyBhIHNvbGlkIHVzZWNhc2UuXG4gICAgaWYgKGxheWVyc0RpZmYudXBkYXRlcy5zb21lKG5vZGUgPT4gbm9kZS5sYXllci5nZXQoJ3JlZicpKSkge1xuICAgICAgbWFwLnNldFN0eWxlKG5leHRTdHlsZS50b0pTKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZW50ZXIgb2Ygc291cmNlc0RpZmYuZW50ZXIpIHtcbiAgICAgIG1hcC5hZGRTb3VyY2UoZW50ZXIuaWQsIGVudGVyLnNvdXJjZS50b0pTKCkpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHVwZGF0ZSBvZiBzb3VyY2VzRGlmZi51cGRhdGUpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNvdXJjZShtYXAsIHVwZGF0ZSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZXhpdCBvZiBzb3VyY2VzRGlmZi5leGl0KSB7XG4gICAgICBtYXAucmVtb3ZlU291cmNlKGV4aXQuaWQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGV4aXQgb2YgbGF5ZXJzRGlmZi5leGl0aW5nKSB7XG4gICAgICBpZiAobWFwLnN0eWxlLmdldExheWVyKGV4aXQuaWQpKSB7XG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihleGl0LmlkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCB1cGRhdGUgb2YgbGF5ZXJzRGlmZi51cGRhdGVzKSB7XG4gICAgICBpZiAoIXVwZGF0ZS5lbnRlcikge1xuICAgICAgICAvLyBUaGlzIGlzIGFuIG9sZCBsYXllciB0aGF0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuIFJlbW92ZSB0aGUgb2xkIGxheWVyXG4gICAgICAgIC8vIHdpdGggdGhlIHNhbWUgaWQgYW5kIGFkZCBpdCBiYWNrIGFnYWluLlxuICAgICAgICBtYXAucmVtb3ZlTGF5ZXIodXBkYXRlLmlkKTtcbiAgICAgIH1cbiAgICAgIG1hcC5hZGRMYXllcih1cGRhdGUubGF5ZXIudG9KUygpLCB1cGRhdGUuYmVmb3JlKTtcbiAgICB9XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cywgY29tcGxleGl0eSAqL1xuXG4gIF91cGRhdGVNYXBTdHlsZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBtYXBTdHlsZSA9IG5ld1Byb3BzLm1hcFN0eWxlO1xuICAgIGNvbnN0IG9sZE1hcFN0eWxlID0gb2xkUHJvcHMubWFwU3R5bGU7XG4gICAgaWYgKG1hcFN0eWxlICE9PSBvbGRNYXBTdHlsZSkge1xuICAgICAgaWYgKEltbXV0YWJsZS5NYXAuaXNNYXAobWFwU3R5bGUpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnByZXZlbnRTdHlsZURpZmZpbmcpIHtcbiAgICAgICAgICB0aGlzLl9nZXRNYXAoKS5zZXRTdHlsZShtYXBTdHlsZS50b0pTKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3NldERpZmZTdHlsZShvbGRNYXBTdHlsZSwgbWFwU3R5bGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9nZXRNYXAoKS5zZXRTdHlsZShtYXBTdHlsZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tIHx8XG4gICAgICBuZXdQcm9wcy5waXRjaCAhPT0gb2xkUHJvcHMucGl0Y2ggfHxcbiAgICAgIG5ld1Byb3BzLnpvb20gIT09IG9sZFByb3BzLmJlYXJpbmcgfHxcbiAgICAgIG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZTtcblxuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuXG4gICAgaWYgKHZpZXdwb3J0Q2hhbmdlZCkge1xuICAgICAgbWFwLmp1bXBUbyh7XG4gICAgICAgIGNlbnRlcjogW25ld1Byb3BzLmxvbmdpdHVkZSwgbmV3UHJvcHMubGF0aXR1ZGVdLFxuICAgICAgICB6b29tOiBuZXdQcm9wcy56b29tLFxuICAgICAgICBiZWFyaW5nOiBuZXdQcm9wcy5iZWFyaW5nLFxuICAgICAgICBwaXRjaDogbmV3UHJvcHMucGl0Y2hcbiAgICAgIH0pO1xuXG4gICAgICAvLyBUT0RPIC0ganVtcFRvIGRvZXNuJ3QgaGFuZGxlIGFsdGl0dWRlXG4gICAgICBpZiAobmV3UHJvcHMuYWx0aXR1ZGUgIT09IG9sZFByb3BzLmFsdGl0dWRlKSB7XG4gICAgICAgIG1hcC50cmFuc2Zvcm0uYWx0aXR1ZGUgPSBuZXdQcm9wcy5hbHRpdHVkZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBOb3RlOiBuZWVkcyB0byBiZSBjYWxsZWQgYWZ0ZXIgcmVuZGVyIChlLmcuIGluIGNvbXBvbmVudERpZFVwZGF0ZSlcbiAgX3VwZGF0ZU1hcFNpemUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3Qgc2l6ZUNoYW5nZWQgPVxuICAgICAgb2xkUHJvcHMud2lkdGggIT09IG5ld1Byb3BzLndpZHRoIHx8IG9sZFByb3BzLmhlaWdodCAhPT0gbmV3UHJvcHMuaGVpZ2h0O1xuXG4gICAgaWYgKHNpemVDaGFuZ2VkKSB7XG4gICAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICAgIG1hcC5yZXNpemUoKTtcbiAgICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KG1hcC50cmFuc2Zvcm0pO1xuICAgIH1cbiAgfVxuXG4gIF9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe3Bvcywgc3RhcnRQb3MsIHN0YXJ0QmVhcmluZywgc3RhcnRQaXRjaH0pIHtcbiAgICBjb25zdCB4RGVsdGEgPSBwb3MueCAtIHN0YXJ0UG9zLng7XG4gICAgY29uc3QgYmVhcmluZyA9IHN0YXJ0QmVhcmluZyArIDE4MCAqIHhEZWx0YSAvIHRoaXMucHJvcHMud2lkdGg7XG5cbiAgICBsZXQgcGl0Y2ggPSBzdGFydFBpdGNoO1xuICAgIGNvbnN0IHlEZWx0YSA9IHBvcy55IC0gc3RhcnRQb3MueTtcbiAgICBpZiAoeURlbHRhID4gMCkge1xuICAgICAgLy8gRHJhZ2dpbmcgZG93bndhcmRzLCBncmFkdWFsbHkgZGVjcmVhc2UgcGl0Y2hcbiAgICAgIGlmIChNYXRoLmFicyh0aGlzLnByb3BzLmhlaWdodCAtIHN0YXJ0UG9zLnkpID4gUElUQ0hfTU9VU0VfVEhSRVNIT0xEKSB7XG4gICAgICAgIGNvbnN0IHNjYWxlID0geURlbHRhIC8gKHRoaXMucHJvcHMuaGVpZ2h0IC0gc3RhcnRQb3MueSk7XG4gICAgICAgIHBpdGNoID0gKDEgLSBzY2FsZSkgKiBQSVRDSF9BQ0NFTCAqIHN0YXJ0UGl0Y2g7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh5RGVsdGEgPCAwKSB7XG4gICAgICAvLyBEcmFnZ2luZyB1cHdhcmRzLCBncmFkdWFsbHkgaW5jcmVhc2UgcGl0Y2hcbiAgICAgIGlmIChzdGFydFBvcy55ID4gUElUQ0hfTU9VU0VfVEhSRVNIT0xEKSB7XG4gICAgICAgIC8vIE1vdmUgZnJvbSAwIHRvIDEgYXMgd2UgZHJhZyB1cHdhcmRzXG4gICAgICAgIGNvbnN0IHlTY2FsZSA9IDEgLSBwb3MueSAvIHN0YXJ0UG9zLnk7XG4gICAgICAgIC8vIEdyYWR1YWxseSBhZGQgdW50aWwgd2UgaGl0IG1heCBwaXRjaFxuICAgICAgICBwaXRjaCA9IHN0YXJ0UGl0Y2ggKyB5U2NhbGUgKiAoTUFYX1BJVENIIC0gc3RhcnRQaXRjaCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5kZWJ1ZyhzdGFydFBpdGNoLCBwaXRjaCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBpdGNoOiBNYXRoLm1heChNYXRoLm1pbihwaXRjaCwgTUFYX1BJVENIKSwgMCksXG4gICAgICBiZWFyaW5nXG4gICAgfTtcbiAgfVxuXG4gICAvLyBIZWxwZXIgdG8gY2FsbCBwcm9wcy5vbkNoYW5nZVZpZXdwb3J0XG4gIF9jYWxsT25DaGFuZ2VWaWV3cG9ydCh0cmFuc2Zvcm0sIG9wdHMgPSB7fSkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQpIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCh7XG4gICAgICAgIGxhdGl0dWRlOiB0cmFuc2Zvcm0uY2VudGVyLmxhdCxcbiAgICAgICAgbG9uZ2l0dWRlOiBtb2QodHJhbnNmb3JtLmNlbnRlci5sbmcgKyAxODAsIDM2MCkgLSAxODAsXG4gICAgICAgIHpvb206IHRyYW5zZm9ybS56b29tLFxuICAgICAgICBwaXRjaDogdHJhbnNmb3JtLnBpdGNoLFxuICAgICAgICBiZWFyaW5nOiBtb2QodHJhbnNmb3JtLmJlYXJpbmcgKyAxODAsIDM2MCkgLSAxODAsXG5cbiAgICAgICAgaXNEcmFnZ2luZzogdGhpcy5wcm9wcy5pc0RyYWdnaW5nLFxuICAgICAgICBzdGFydERyYWdMbmdMYXQ6IHRoaXMucHJvcHMuc3RhcnREcmFnTG5nTGF0LFxuICAgICAgICBzdGFydEJlYXJpbmc6IHRoaXMucHJvcHMuc3RhcnRCZWFyaW5nLFxuICAgICAgICBzdGFydFBpdGNoOiB0aGlzLnByb3BzLnN0YXJ0UGl0Y2gsXG5cbiAgICAgICAgLi4ub3B0c1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kIF9vblRvdWNoU3RhcnQoe3Bvc30pIHtcbiAgICB0aGlzLl9vbk1vdXNlRG93bih7cG9zfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uTW91c2VEb3duKHtwb3N9KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgbG5nTGF0ID0gdW5wcm9qZWN0RnJvbVRyYW5zZm9ybShtYXAudHJhbnNmb3JtLCBwb3MpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KG1hcC50cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IHRydWUsXG4gICAgICBzdGFydERyYWdMbmdMYXQ6IFtsbmdMYXQubG5nLCBsbmdMYXQubGF0XSxcbiAgICAgIHN0YXJ0QmVhcmluZzogbWFwLnRyYW5zZm9ybS5iZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaDogbWFwLnRyYW5zZm9ybS5waXRjaFxuICAgIH0pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vblRvdWNoRHJhZyh7cG9zfSkge1xuICAgIHRoaXMuX29uTW91c2VEcmFnKHtwb3N9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZURyYWcoe3Bvc30pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHRha2UgdGhlIHN0YXJ0IGxuZ2xhdCBhbmQgcHV0IGl0IHdoZXJlIHRoZSBtb3VzZSBpcyBkb3duLlxuICAgIGFzc2VydCh0aGlzLnByb3BzLnN0YXJ0RHJhZ0xuZ0xhdCwgJ2BzdGFydERyYWdMbmdMYXRgIHByb3AgaXMgcmVxdWlyZWQgJyArXG4gICAgICAnZm9yIG1vdXNlIGRyYWcgYmVoYXZpb3IgdG8gY2FsY3VsYXRlIHdoZXJlIHRvIHBvc2l0aW9uIHRoZSBtYXAuJyk7XG5cbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBjbG9uZVRyYW5zZm9ybShtYXAudHJhbnNmb3JtKTtcbiAgICB0cmFuc2Zvcm0uc2V0TG9jYXRpb25BdFBvaW50KHRoaXMucHJvcHMuc3RhcnREcmFnTG5nTGF0LCBwb3MpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vblRvdWNoUm90YXRlKHtwb3MsIHN0YXJ0UG9zfSkge1xuICAgIHRoaXMuX29uTW91c2VSb3RhdGUoe3Bvcywgc3RhcnRQb3N9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZVJvdGF0ZSh7cG9zLCBzdGFydFBvc30pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCB8fCAhdGhpcy5wcm9wcy5wZXJzcGVjdGl2ZUVuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7c3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSA9IHRoaXMucHJvcHM7XG4gICAgYXNzZXJ0KHR5cGVvZiBzdGFydEJlYXJpbmcgPT09ICdudW1iZXInLFxuICAgICAgJ2BzdGFydEJlYXJpbmdgIHByb3AgaXMgcmVxdWlyZWQgZm9yIG1vdXNlIHJvdGF0ZSBiZWhhdmlvcicpO1xuICAgIGFzc2VydCh0eXBlb2Ygc3RhcnRQaXRjaCA9PT0gJ251bWJlcicsXG4gICAgICAnYHN0YXJ0UGl0Y2hgIHByb3AgaXMgcmVxdWlyZWQgZm9yIG1vdXNlIHJvdGF0ZSBiZWhhdmlvcicpO1xuXG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG5cbiAgICBjb25zdCB7cGl0Y2gsIGJlYXJpbmd9ID0gdGhpcy5fY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nKHtcbiAgICAgIHBvcyxcbiAgICAgIHN0YXJ0UG9zLFxuICAgICAgc3RhcnRCZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaFxuICAgIH0pO1xuXG4gICAgY29uc3QgdHJhbnNmb3JtID0gY2xvbmVUcmFuc2Zvcm0obWFwLnRyYW5zZm9ybSk7XG4gICAgdHJhbnNmb3JtLmJlYXJpbmcgPSBiZWFyaW5nO1xuICAgIHRyYW5zZm9ybS5waXRjaCA9IHBpdGNoO1xuXG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uTW91c2VNb3ZlKG9wdCkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIGNvbnN0IHBvcyA9IG9wdC5wb3M7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uSG92ZXJGZWF0dXJlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmZWF0dXJlcyA9IG1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoW3Bvcy54LCBwb3MueV0sXG4gICAgICB0aGlzLl9xdWVyeVBhcmFtcyk7XG4gICAgaWYgKCFmZWF0dXJlcy5sZW5ndGggJiYgdGhpcy5wcm9wcy5pZ25vcmVFbXB0eUZlYXR1cmVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe2lzSG92ZXJpbmc6IGZlYXR1cmVzLmxlbmd0aCA+IDB9KTtcbiAgICB0aGlzLnByb3BzLm9uSG92ZXJGZWF0dXJlcyhmZWF0dXJlcyk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hFbmQob3B0KSB7XG4gICAgdGhpcy5fb25Nb3VzZVVwKG9wdCk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hUYXAob3B0KSB7XG4gICAgdGhpcy5fb25Nb3VzZUNsaWNrKG9wdCk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uTW91c2VVcChvcHQpIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydChtYXAudHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZSxcbiAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0QmVhcmluZzogbnVsbCxcbiAgICAgIHN0YXJ0UGl0Y2g6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZUNsaWNrKG9wdCkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIGNvbnN0IHBvcyA9IG9wdC5wb3M7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICBjb25zdCBsbmdMYXQgPSB1bnByb2plY3RGcm9tVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0sIHBvcyk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2sobG5nTGF0KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrRmVhdHVyZXMpIHtcbiAgICAgIC8vIFJhZGl1cyBlbmFibGVzIHBvaW50IGZlYXR1cmVzLCBsaWtlIG1hcmtlciBzeW1ib2xzLCB0byBiZSBjbGlja2VkLlxuICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMucHJvcHMuY2xpY2tSYWRpdXM7XG4gICAgICBjb25zdCBiYm94ID0gW1twb3MueCAtIHNpemUsIHBvcy55IC0gc2l6ZV0sIFtwb3MueCArIHNpemUsIHBvcy55ICsgc2l6ZV1dO1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSBtYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGJib3gsIHRoaXMuX3F1ZXJ5UGFyYW1zKTtcbiAgICAgIGlmICghZmVhdHVyZXMubGVuZ3RoICYmIHRoaXMucHJvcHMuaWdub3JlRW1wdHlGZWF0dXJlcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2tGZWF0dXJlcyhmZWF0dXJlcyk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kIF9vblpvb20oe3Bvcywgc2NhbGV9KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gY2xvbmVUcmFuc2Zvcm0obWFwLnRyYW5zZm9ybSk7XG4gICAgY29uc3QgYXJvdW5kID0gdW5wcm9qZWN0RnJvbVRyYW5zZm9ybSh0cmFuc2Zvcm0sIHBvcyk7XG4gICAgdHJhbnNmb3JtLnpvb20gPSB0cmFuc2Zvcm0uc2NhbGVab29tKG1hcC50cmFuc2Zvcm0uc2NhbGUgKiBzY2FsZSk7XG4gICAgdHJhbnNmb3JtLnNldExvY2F0aW9uQXRQb2ludChhcm91bmQsIHBvcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uWm9vbUVuZCgpIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydChtYXAudHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZVxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjbGFzc05hbWUsIHdpZHRoLCBoZWlnaHQsIHN0eWxlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbWFwU3R5bGUgPSB7XG4gICAgICAuLi5zdHlsZSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgY3Vyc29yOiB0aGlzLl9jdXJzb3IoKVxuICAgIH07XG5cbiAgICBsZXQgY29udGVudCA9IFtcbiAgICAgIDxkaXYga2V5PVwibWFwXCIgcmVmPVwibWFwYm94TWFwXCJcbiAgICAgICAgc3R5bGU9eyBtYXBTdHlsZSB9IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9Lz4sXG4gICAgICA8ZGl2IGtleT1cIm92ZXJsYXlzXCIgY2xhc3NOYW1lPVwib3ZlcmxheXNcIlxuICAgICAgICBzdHlsZT17IHtwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogMCwgdG9wOiAwfSB9PlxuICAgICAgICB7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgXTtcblxuICAgIGlmICh0aGlzLnN0YXRlLmlzU3VwcG9ydGVkICYmIHRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCkge1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPE1hcEludGVyYWN0aW9uc1xuICAgICAgICAgIG9uTW91c2VEb3duID17IHRoaXMuX29uTW91c2VEb3duIH1cbiAgICAgICAgICBvbk1vdXNlRHJhZyA9eyB0aGlzLl9vbk1vdXNlRHJhZyB9XG4gICAgICAgICAgb25Nb3VzZVJvdGF0ZSA9eyB0aGlzLl9vbk1vdXNlUm90YXRlIH1cbiAgICAgICAgICBvbk1vdXNlVXAgPXsgdGhpcy5fb25Nb3VzZVVwIH1cbiAgICAgICAgICBvbk1vdXNlTW92ZSA9eyB0aGlzLl9vbk1vdXNlTW92ZSB9XG4gICAgICAgICAgb25Nb3VzZUNsaWNrID0geyB0aGlzLl9vbk1vdXNlQ2xpY2sgfVxuICAgICAgICAgIG9uVG91Y2hTdGFydCA9eyB0aGlzLl9vblRvdWNoU3RhcnQgfVxuICAgICAgICAgIG9uVG91Y2hEcmFnID17IHRoaXMuX29uVG91Y2hEcmFnIH1cbiAgICAgICAgICBvblRvdWNoUm90YXRlID17IHRoaXMuX29uVG91Y2hSb3RhdGUgfVxuICAgICAgICAgIG9uVG91Y2hFbmQgPXsgdGhpcy5fb25Ub3VjaEVuZCB9XG4gICAgICAgICAgb25Ub3VjaFRhcCA9IHsgdGhpcy5fb25Ub3VjaFRhcCB9XG4gICAgICAgICAgb25ab29tID17IHRoaXMuX29uWm9vbSB9XG4gICAgICAgICAgb25ab29tRW5kID17IHRoaXMuX29uWm9vbUVuZCB9XG4gICAgICAgICAgd2lkdGggPXsgdGhpcy5wcm9wcy53aWR0aCB9XG4gICAgICAgICAgaGVpZ2h0ID17IHRoaXMucHJvcHMuaGVpZ2h0IH0+XG5cbiAgICAgICAgICB7IGNvbnRlbnQgfVxuXG4gICAgICAgIDwvTWFwSW50ZXJhY3Rpb25zPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBzdHlsZT17IHtcbiAgICAgICAgICAuLi50aGlzLnByb3BzLnN0eWxlLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgICAgfSB9PlxuXG4gICAgICAgIHsgY29udGVudCB9XG5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuTWFwR0wucHJvcFR5cGVzID0gUFJPUF9UWVBFUztcbk1hcEdMLmRlZmF1bHRQcm9wcyA9IERFRkFVTFRfUFJPUFM7XG4iXX0=