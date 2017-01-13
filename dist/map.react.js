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

      var _diffStyles = (0, _diffStyles3.default)(prevStyle, nextStyle),
          sourcesDiff = _diffStyles.sourcesDiff,
          layersDiff = _diffStyles.layersDiff;

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
      var pos = _ref.pos,
          startPos = _ref.startPos,
          startBearing = _ref.startBearing,
          startPitch = _ref.startPitch;

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
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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
      var pos = _ref6.pos,
          startPos = _ref6.startPos;

      this._onMouseRotate({ pos: pos, startPos: startPos });
    }
  }, {
    key: '_onMouseRotate',
    value: function _onMouseRotate(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos;

      if (!this.props.onChangeViewport || !this.props.perspectiveEnabled) {
        return;
      }

      var _props = this.props,
          startBearing = _props.startBearing,
          startPitch = _props.startPitch;

      (0, _assert2.default)(typeof startBearing === 'number', '`startBearing` prop is required for mouse rotate behavior');
      (0, _assert2.default)(typeof startPitch === 'number', '`startPitch` prop is required for mouse rotate behavior');

      var map = this._getMap();

      var _calculateNewPitchAnd = this._calculateNewPitchAndBearing({
        pos: pos,
        startPos: startPos,
        startBearing: startBearing,
        startPitch: startPitch
      }),
          pitch = _calculateNewPitchAnd.pitch,
          bearing = _calculateNewPitchAnd.bearing;

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
      var pos = _ref8.pos,
          scale = _ref8.scale;

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
      var _props2 = this.props,
          className = _props2.className,
          width = _props2.width,
          height = _props2.height,
          style = _props2.style;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXAucmVhY3QuanMiXSwibmFtZXMiOlsibm9vcCIsIk1BWF9QSVRDSCIsIlBJVENIX01PVVNFX1RIUkVTSE9MRCIsIlBJVENIX0FDQ0VMIiwiUFJPUF9UWVBFUyIsImxhdGl0dWRlIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImxvbmdpdHVkZSIsInpvb20iLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsImluc3RhbmNlT2YiLCJNYXAiLCJtYXBib3hBcGlBY2Nlc3NUb2tlbiIsIm9uQ2hhbmdlVmlld3BvcnQiLCJmdW5jIiwid2lkdGgiLCJoZWlnaHQiLCJpc0RyYWdnaW5nIiwiYm9vbCIsInN0YXJ0RHJhZ0xuZ0xhdCIsImFycmF5Iiwib25Ib3ZlckZlYXR1cmVzIiwiaWdub3JlRW1wdHlGZWF0dXJlcyIsImF0dHJpYnV0aW9uQ29udHJvbCIsIm9uQ2xpY2siLCJvbkNsaWNrRmVhdHVyZXMiLCJjbGlja1JhZGl1cyIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsInByZXZlbnRTdHlsZURpZmZpbmciLCJwZXJzcGVjdGl2ZUVuYWJsZWQiLCJiZWFyaW5nIiwiUHJvcFR5cGVzIiwicGl0Y2giLCJhbHRpdHVkZSIsIkRFRkFVTFRfUFJPUFMiLCJERUZBVUxUUyIsIk1BUEJPWF9BUElfQUNDRVNTX1RPS0VOIiwiTWFwR0wiLCJzdXBwb3J0ZWQiLCJwcm9wcyIsInN0YXRlIiwiaXNTdXBwb3J0ZWQiLCJpc0hvdmVyaW5nIiwic3RhcnRCZWFyaW5nIiwic3RhcnRQaXRjaCIsIl9xdWVyeVBhcmFtcyIsImFjY2Vzc1Rva2VuIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwiY29tcG9uZW50RGlkVXBkYXRlIiwiaXNNYXAiLCJ0b0pTIiwibWFwIiwiY29udGFpbmVyIiwicmVmcyIsIm1hcGJveE1hcCIsImNlbnRlciIsInN0eWxlIiwiaW50ZXJhY3RpdmUiLCJnZXRDYW52YXMiLCJfbWFwIiwiX3VwZGF0ZU1hcFZpZXdwb3J0IiwiX2NhbGxPbkNoYW5nZVZpZXdwb3J0IiwidHJhbnNmb3JtIiwiX3VwZGF0ZVF1ZXJ5UGFyYW1zIiwibmV3UHJvcHMiLCJfdXBkYXRlU3RhdGVGcm9tUHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIl91cGRhdGVNYXBTaXplIiwicmVtb3ZlIiwiaXNJbnRlcmFjdGl2ZSIsIm9uQ2xpY2tGZWF0dXJlIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJQT0lOVEVSIiwiR1JBQiIsIm9sZFByb3BzIiwic2xpY2UiLCJ1cGRhdGUiLCJuZXdTb3VyY2UiLCJzb3VyY2UiLCJ0eXBlIiwib2xkU291cmNlIiwiZ2V0U291cmNlIiwiaWQiLCJvbGRPcHRzIiwid29ya2VyT3B0aW9ucyIsIm1heHpvb20iLCJ1bmRlZmluZWQiLCJnZW9qc29uVnRPcHRpb25zIiwibWF4Wm9vbSIsImJ1ZmZlciIsInRvbGVyYW5jZSIsImNsdXN0ZXIiLCJjbHVzdGVyUmFkaXVzIiwic3VwZXJjbHVzdGVyT3B0aW9ucyIsInJhZGl1cyIsImNsdXN0ZXJNYXhab29tIiwic2V0RGF0YSIsImRhdGEiLCJyZW1vdmVTb3VyY2UiLCJhZGRTb3VyY2UiLCJpbnRlcmFjdGl2ZUxheWVySWRzIiwibGVuZ3RoIiwibGF5ZXJzIiwicHJldlN0eWxlIiwibmV4dFN0eWxlIiwicHJldktleXNNYXAiLCJzdHlsZUtleXNNYXAiLCJuZXh0S2V5c01hcCIsImRlbGV0ZSIsInByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyIiwicHJldktleXNMaXN0IiwiT2JqZWN0Iiwia2V5cyIsIm5leHRLZXlzTGlzdCIsInNvbWUiLCJnZXQiLCJrZXkiLCJfZ2V0TWFwIiwic2V0U3R5bGUiLCJzb3VyY2VzRGlmZiIsImxheWVyc0RpZmYiLCJ1cGRhdGVzIiwibm9kZSIsImxheWVyIiwiZW50ZXIiLCJfdXBkYXRlU291cmNlIiwiZXhpdCIsImV4aXRpbmciLCJnZXRMYXllciIsInJlbW92ZUxheWVyIiwiYWRkTGF5ZXIiLCJiZWZvcmUiLCJvbGRNYXBTdHlsZSIsIl9zZXREaWZmU3R5bGUiLCJ2aWV3cG9ydENoYW5nZWQiLCJqdW1wVG8iLCJzaXplQ2hhbmdlZCIsInJlc2l6ZSIsInBvcyIsInN0YXJ0UG9zIiwieERlbHRhIiwieCIsInlEZWx0YSIsInkiLCJNYXRoIiwiYWJzIiwic2NhbGUiLCJ5U2NhbGUiLCJtYXgiLCJtaW4iLCJvcHRzIiwibGF0IiwibG5nIiwiX29uTW91c2VEb3duIiwibG5nTGF0IiwiX29uTW91c2VEcmFnIiwic2V0TG9jYXRpb25BdFBvaW50IiwiX29uTW91c2VSb3RhdGUiLCJfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nIiwib3B0IiwiZmVhdHVyZXMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJfb25Nb3VzZVVwIiwiX29uTW91c2VDbGljayIsInNpemUiLCJiYm94IiwiYXJvdW5kIiwic2NhbGVab29tIiwiY2xhc3NOYW1lIiwiY3Vyc29yIiwiX2N1cnNvciIsImNvbnRlbnQiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJjaGlsZHJlbiIsIl9vbk1vdXNlTW92ZSIsIl9vblRvdWNoU3RhcnQiLCJfb25Ub3VjaERyYWciLCJfb25Ub3VjaFJvdGF0ZSIsIl9vblRvdWNoRW5kIiwiX29uVG91Y2hUYXAiLCJfb25ab29tIiwiX29uWm9vbUVuZCIsInByb3BUeXBlcyIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7b0NBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxTQUFTQSxJQUFULEdBQWdCLENBQUU7O0FBRWxCO0FB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O0FBOGZyQkEsTUFBTXNKLFNBQU4sR0FBa0IxTCxVQUFsQjtBQUNBb0MsTUFBTXVKLFlBQU4sR0FBcUIxSixhQUFyQiIsImZpbGUiOiJtYXAucmVhY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzLCBDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBhdXRvYmluZCBmcm9tICdhdXRvYmluZC1kZWNvcmF0b3InO1xuaW1wb3J0IHB1cmVSZW5kZXIgZnJvbSAncHVyZS1yZW5kZXItZGVjb3JhdG9yJztcblxuaW1wb3J0IG1hcGJveGdsIGZyb20gJ21hcGJveC1nbCc7XG5pbXBvcnQge3NlbGVjdH0gZnJvbSAnZDMtc2VsZWN0aW9uJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IE1hcEludGVyYWN0aW9ucyBmcm9tICcuL21hcC1pbnRlcmFjdGlvbnMucmVhY3QnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmltcG9ydCB7Z2V0SW50ZXJhY3RpdmVMYXllcklkc30gZnJvbSAnLi91dGlscy9zdHlsZS11dGlscyc7XG5pbXBvcnQgZGlmZlN0eWxlcyBmcm9tICcuL3V0aWxzL2RpZmYtc3R5bGVzJztcbmltcG9ydCB7bW9kLCB1bnByb2plY3RGcm9tVHJhbnNmb3JtLCBjbG9uZVRyYW5zZm9ybX0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0nO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuLy8gTm90ZTogTWF4IHBpdGNoIGlzIGEgaGFyZCBjb2RlZCB2YWx1ZSAobm90IGEgbmFtZWQgY29uc3RhbnQpIGluIHRyYW5zZm9ybS5qc1xuY29uc3QgTUFYX1BJVENIID0gNjA7XG5jb25zdCBQSVRDSF9NT1VTRV9USFJFU0hPTEQgPSAyMDtcbmNvbnN0IFBJVENIX0FDQ0VMID0gMS4yO1xuXG5jb25zdCBQUk9QX1RZUEVTID0ge1xuICAvKipcbiAgICAqIFRoZSBsYXRpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqXG4gICAgKiBUaGUgbG9uZ2l0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC5cbiAgICAqL1xuICBsb25naXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqXG4gICAgKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuXG4gICAgKi9cbiAgem9vbTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIFRoZSBNYXBib3ggc3R5bGUgdGhlIGNvbXBvbmVudCBzaG91bGQgdXNlLiBDYW4gZWl0aGVyIGJlIGEgc3RyaW5nIHVybFxuICAgICogb3IgYSBNYXBib3hHTCBzdHlsZSBJbW11dGFibGUuTWFwIG9iamVjdC5cbiAgICAqL1xuICBtYXBTdHlsZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICBQcm9wVHlwZXMuaW5zdGFuY2VPZihJbW11dGFibGUuTWFwKVxuICBdKSxcbiAgLyoqXG4gICAgKiBUaGUgTWFwYm94IEFQSSBhY2Nlc3MgdG9rZW4gdG8gcHJvdmlkZSB0byBtYXBib3gtZ2wtanMuIFRoaXMgaXMgcmVxdWlyZWRcbiAgICAqIHdoZW4gdXNpbmcgTWFwYm94IHByb3ZpZGVkIHZlY3RvciB0aWxlcyBhbmQgc3R5bGVzLlxuICAgICovXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAvKipcbiAgICAqIGBvbkNoYW5nZVZpZXdwb3J0YCBjYWxsYmFjayBpcyBmaXJlZCB3aGVuIHRoZSB1c2VyIGludGVyYWN0ZWQgd2l0aCB0aGVcbiAgICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIGBsYXRpdHVkZWAsXG4gICAgKiBgbG9uZ2l0dWRlYCBhbmQgYHpvb21gIGFuZCBhZGRpdGlvbmFsIHN0YXRlIGluZm9ybWF0aW9uLlxuICAgICovXG4gIG9uQ2hhbmdlVmlld3BvcnQ6IFByb3BUeXBlcy5mdW5jLFxuICAvKipcbiAgICAqIFRoZSB3aWR0aCBvZiB0aGUgbWFwLlxuICAgICovXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKlxuICAgICogVGhlIGhlaWdodCBvZiB0aGUgbWFwLlxuICAgICovXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKipcbiAgICAqIElzIHRoZSBjb21wb25lbnQgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuIFRoaXMgaXMgdXNlZCB0byBzaG93L2hpZGUgdGhlXG4gICAgKiBkcmFnIGN1cnNvci4gQWxzbyB1c2VkIGFzIGFuIG9wdGltaXphdGlvbiBpbiBzb21lIG92ZXJsYXlzIGJ5IHByZXZlbnRpbmdcbiAgICAqIHJlbmRlcmluZyB3aGlsZSBkcmFnZ2luZy5cbiAgICAqL1xuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgLyoqXG4gICAgKiBSZXF1aXJlZCB0byBjYWxjdWxhdGUgdGhlIG1vdXNlIHByb2plY3Rpb24gYWZ0ZXIgdGhlIGZpcnN0IGNsaWNrIGV2ZW50XG4gICAgKiBkdXJpbmcgZHJhZ2dpbmcuIFdoZXJlIHRoZSBtYXAgaXMgZGVwZW5kcyBvbiB3aGVyZSB5b3UgZmlyc3QgY2xpY2tlZCBvblxuICAgICogdGhlIG1hcC5cbiAgICAqL1xuICBzdGFydERyYWdMbmdMYXQ6IFByb3BUeXBlcy5hcnJheSxcbiAgLyoqXG4gICAgKiBDYWxsZWQgd2hlbiBhIGZlYXR1cmUgaXMgaG92ZXJlZCBvdmVyLiBVc2VzIE1hcGJveCdzXG4gICAgKiBxdWVyeVJlbmRlcmVkRmVhdHVyZXMgQVBJIHRvIGZpbmQgZmVhdHVyZXMgdW5kZXIgdGhlIHBvaW50ZXI6XG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICAqIFRvIHF1ZXJ5IG9ubHkgc29tZSBvZiB0aGUgbGF5ZXJzLCBzZXQgdGhlIGBpbnRlcmFjdGl2ZWAgcHJvcGVydHkgaW4gdGhlXG4gICAgKiBsYXllciBzdHlsZSB0byBgdHJ1ZWAuIFNlZSBNYXBib3gncyBzdHlsZSBzcGVjXG4gICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1zdHlsZS1zcGVjLyNsYXllci1pbnRlcmFjdGl2ZVxuICAgICogSWYgbm8gaW50ZXJhY3RpdmUgbGF5ZXJzIGFyZSBmb3VuZCAoZS5nLiB1c2luZyBNYXBib3gncyBkZWZhdWx0IHN0eWxlcyksXG4gICAgKiB3aWxsIGZhbGwgYmFjayB0byBxdWVyeSBhbGwgbGF5ZXJzLlxuICAgICogQGNhbGxiYWNrXG4gICAgKiBAcGFyYW0ge2FycmF5fSBmZWF0dXJlcyAtIFRoZSBhcnJheSBvZiBmZWF0dXJlcyB0aGUgbW91c2UgaXMgb3Zlci5cbiAgICAqL1xuICBvbkhvdmVyRmVhdHVyZXM6IFByb3BUeXBlcy5mdW5jLFxuICAvKipcbiAgICAqIERlZmF1bHRzIHRvIFRSVUVcbiAgICAqIFNldCB0byBmYWxzZSB0byBlbmFibGUgb25Ib3ZlckZlYXR1cmVzIHRvIGJlIGNhbGxlZCByZWdhcmRsZXNzIGlmXG4gICAgKiB0aGVyZSBpcyBhbiBhY3R1YWwgZmVhdHVyZSBhdCB4LCB5LiBUaGlzIGlzIHVzZWZ1bCB0byBlbXVsYXRlXG4gICAgKiBcIm1vdXNlLW91dFwiIGJlaGF2aW9ycyBvbiBmZWF0dXJlcy5cbiAgICAqL1xuICBpZ25vcmVFbXB0eUZlYXR1cmVzOiBQcm9wVHlwZXMuYm9vbCxcblxuICAvKipcbiAgICAqIFNob3cgYXR0cmlidXRpb24gY29udHJvbCBvciBub3QuXG4gICAgKi9cbiAgYXR0cmlidXRpb25Db250cm9sOiBQcm9wVHlwZXMuYm9vbCxcblxuICAvKipcbiAgICAqIENhbGxlZCB3aGVuIHRoZSBtYXAgaXMgY2xpY2tlZCBvbi4gUmV0dXJucyBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlLlxuICAgICovXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKlxuICAgICogQ2FsbGVkIHdoZW4gYSBmZWF0dXJlIGlzIGNsaWNrZWQgb24uIFVzZXMgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEkgdG8gZmluZCBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlcjpcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gcXVlcnkgb25seSBzb21lIG9mIHRoZSBsYXllcnMsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlLXNwZWMvI2xheWVyLWludGVyYWN0aXZlXG4gICAgKiBJZiBubyBpbnRlcmFjdGl2ZSBsYXllcnMgYXJlIGZvdW5kIChlLmcuIHVzaW5nIE1hcGJveCdzIGRlZmF1bHQgc3R5bGVzKSxcbiAgICAqIHdpbGwgZmFsbCBiYWNrIHRvIHF1ZXJ5IGFsbCBsYXllcnMuXG4gICAgKi9cbiAgb25DbGlja0ZlYXR1cmVzOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKipcbiAgICAqIFJhZGl1cyB0byBkZXRlY3QgZmVhdHVyZXMgYXJvdW5kIGEgY2xpY2tlZCBwb2ludC4gRGVmYXVsdHMgdG8gMTUuXG4gICAgKi9cbiAgY2xpY2tSYWRpdXM6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqXG4gICAgKiBQYXNzZWQgdG8gTWFwYm94IE1hcCBjb25zdHJ1Y3RvciB3aGljaCBwYXNzZXMgaXQgdG8gdGhlIGNhbnZhcyBjb250ZXh0LlxuICAgICogVGhpcyBpcyB1bnNlZnVsIHdoZW4geW91IHdhbnQgdG8gZXhwb3J0IHRoZSBjYW52YXMgYXMgYSBQTkcuXG4gICAgKi9cbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBQcm9wVHlwZXMuYm9vbCxcblxuICAvKipcbiAgICAqIFRoZXJlIGFyZSBzdGlsbCBrbm93biBpc3N1ZXMgd2l0aCBzdHlsZSBkaWZmaW5nLiBBcyBhIHRlbXBvcmFyeSBzdG9wZ2FwLFxuICAgICogYWRkIHRoZSBvcHRpb24gdG8gcHJldmVudCBzdHlsZSBkaWZmaW5nLlxuICAgICovXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgICogRW5hYmxlcyBwZXJzcGVjdGl2ZSBjb250cm9sIGV2ZW50IGhhbmRsaW5nXG4gICAgKi9cbiAgcGVyc3BlY3RpdmVFbmFibGVkOiBQcm9wVHlwZXMuYm9vbCxcblxuICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIGJlYXJpbmcgb2YgdGhlIHZpZXdwb3J0XG4gICAgKi9cbiAgYmVhcmluZzogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcblxuICAvKipcbiAgICAqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydFxuICAgICovXG4gIHBpdGNoOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgICogU3BlY2lmeSB0aGUgYWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYVxuICAgICogVW5pdDogbWFwIGhlaWdodHMsIGRlZmF1bHQgMS41XG4gICAgKiBOb24tcHVibGljIEFQSSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xMTM3XG4gICAgKi9cbiAgYWx0aXR1ZGU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbn07XG5cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIG1hcFN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12OCcsXG4gIG9uQ2hhbmdlVmlld3BvcnQ6IG51bGwsXG4gIG1hcGJveEFwaUFjY2Vzc1Rva2VuOiBjb25maWcuREVGQVVMVFMuTUFQQk9YX0FQSV9BQ0NFU1NfVE9LRU4sXG4gIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2UsXG4gIGF0dHJpYnV0aW9uQ29udHJvbDogdHJ1ZSxcbiAgaWdub3JlRW1wdHlGZWF0dXJlczogdHJ1ZSxcbiAgYmVhcmluZzogMCxcbiAgcGl0Y2g6IDAsXG4gIGFsdGl0dWRlOiAxLjUsXG4gIGNsaWNrUmFkaXVzOiAxNVxufTtcblxuQHB1cmVSZW5kZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcEdMIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICBzdGF0aWMgc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBtYXBib3hnbC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpc1N1cHBvcnRlZDogbWFwYm94Z2wuc3VwcG9ydGVkKCksXG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZSxcbiAgICAgIGlzSG92ZXJpbmc6IGZhbHNlLFxuICAgICAgc3RhcnREcmFnTG5nTGF0OiBudWxsLFxuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH07XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB7fTtcbiAgICBtYXBib3hnbC5hY2Nlc3NUb2tlbiA9IHByb3BzLm1hcGJveEFwaUFjY2Vzc1Rva2VuO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzU3VwcG9ydGVkKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZFVwZGF0ZSA9IG5vb3A7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBJbW11dGFibGUuTWFwLmlzTWFwKHRoaXMucHJvcHMubWFwU3R5bGUpID9cbiAgICAgIHRoaXMucHJvcHMubWFwU3R5bGUudG9KUygpIDpcbiAgICAgIHRoaXMucHJvcHMubWFwU3R5bGU7XG4gICAgY29uc3QgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgICBjb250YWluZXI6IHRoaXMucmVmcy5tYXBib3hNYXAsXG4gICAgICBjZW50ZXI6IFt0aGlzLnByb3BzLmxvbmdpdHVkZSwgdGhpcy5wcm9wcy5sYXRpdHVkZV0sXG4gICAgICB6b29tOiB0aGlzLnByb3BzLnpvb20sXG4gICAgICBwaXRjaDogdGhpcy5wcm9wcy5waXRjaCxcbiAgICAgIGJlYXJpbmc6IHRoaXMucHJvcHMuYmVhcmluZyxcbiAgICAgIHN0eWxlOiBtYXBTdHlsZSxcbiAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdGhpcy5wcm9wcy5wcmVzZXJ2ZURyYXdpbmdCdWZmZXJcbiAgICAgIC8vIFRPRE8/XG4gICAgICAvLyBhdHRyaWJ1dGlvbkNvbnRyb2w6IHRoaXMucHJvcHMuYXR0cmlidXRpb25Db250cm9sXG4gICAgfSk7XG5cbiAgICBzZWxlY3QobWFwLmdldENhbnZhcygpKS5zdHlsZSgnb3V0bGluZScsICdub25lJyk7XG5cbiAgICB0aGlzLl9tYXAgPSBtYXA7XG4gICAgdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQoe30sIHRoaXMucHJvcHMpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KG1hcC50cmFuc2Zvcm0pO1xuICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKTtcbiAgfVxuXG4gIC8vIE5ldyBwcm9wcyBhcmUgY29taW4nIHJvdW5kIHRoZSBjb3JuZXIhXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICB0aGlzLl91cGRhdGVTdGF0ZUZyb21Qcm9wcyh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFN0eWxlKHRoaXMucHJvcHMsIG5ld1Byb3BzKTtcbiAgICAvLyBTYXZlIHdpZHRoL2hlaWdodCBzbyB0aGF0IHdlIGNhbiBjaGVjayB0aGVtIGluIGNvbXBvbmVudERpZFVwZGF0ZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gbWFwLnJlc2l6ZSgpIHJlYWRzIHNpemUgZnJvbSBET00sIHdlIG5lZWQgdG8gY2FsbCBhZnRlciByZW5kZXJcbiAgICB0aGlzLl91cGRhdGVNYXBTaXplKHRoaXMuc3RhdGUsIHRoaXMucHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX21hcCkge1xuICAgICAgdGhpcy5fbWFwLnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9jdXJzb3IoKSB7XG4gICAgY29uc3QgaXNJbnRlcmFjdGl2ZSA9XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlVmlld3BvcnQgfHxcbiAgICAgIHRoaXMucHJvcHMub25DbGlja0ZlYXR1cmUgfHxcbiAgICAgIHRoaXMucHJvcHMub25Ib3ZlckZlYXR1cmVzO1xuICAgIGlmIChpc0ludGVyYWN0aXZlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5pc0RyYWdnaW5nID9cbiAgICAgICAgY29uZmlnLkNVUlNPUi5HUkFCQklORyA6XG4gICAgICAgICh0aGlzLnN0YXRlLmlzSG92ZXJpbmcgPyBjb25maWcuQ1VSU09SLlBPSU5URVIgOiBjb25maWcuQ1VSU09SLkdSQUIpO1xuICAgIH1cbiAgICByZXR1cm4gJ2luaGVyaXQnO1xuICB9XG5cbiAgX2dldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgX3VwZGF0ZVN0YXRlRnJvbVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gbmV3UHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW47XG4gICAgY29uc3Qge3N0YXJ0RHJhZ0xuZ0xhdH0gPSBuZXdQcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogc3RhcnREcmFnTG5nTGF0ICYmIHN0YXJ0RHJhZ0xuZ0xhdC5zbGljZSgpXG4gICAgfSk7XG4gIH1cblxuICBfdXBkYXRlU291cmNlKG1hcCwgdXBkYXRlKSB7XG4gICAgY29uc3QgbmV3U291cmNlID0gdXBkYXRlLnNvdXJjZS50b0pTKCk7XG4gICAgaWYgKG5ld1NvdXJjZS50eXBlID09PSAnZ2VvanNvbicpIHtcbiAgICAgIGNvbnN0IG9sZFNvdXJjZSA9IG1hcC5nZXRTb3VyY2UodXBkYXRlLmlkKTtcbiAgICAgIGlmIChvbGRTb3VyY2UudHlwZSA9PT0gJ2dlb2pzb24nKSB7XG4gICAgICAgIC8vIHVwZGF0ZSBkYXRhIGlmIG5vIG90aGVyIEdlb0pTT05Tb3VyY2Ugb3B0aW9ucyB3ZXJlIGNoYW5nZWRcbiAgICAgICAgY29uc3Qgb2xkT3B0cyA9IG9sZFNvdXJjZS53b3JrZXJPcHRpb25zO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgKG5ld1NvdXJjZS5tYXh6b29tID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5tYXh6b29tID09PSBvbGRPcHRzLmdlb2pzb25WdE9wdGlvbnMubWF4Wm9vbSkgJiZcbiAgICAgICAgICAobmV3U291cmNlLmJ1ZmZlciA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBuZXdTb3VyY2UuYnVmZmVyID09PSBvbGRPcHRzLmdlb2pzb25WdE9wdGlvbnMuYnVmZmVyKSAmJlxuICAgICAgICAgIChuZXdTb3VyY2UudG9sZXJhbmNlID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS50b2xlcmFuY2UgPT09IG9sZE9wdHMuZ2VvanNvblZ0T3B0aW9ucy50b2xlcmFuY2UpICYmXG4gICAgICAgICAgKG5ld1NvdXJjZS5jbHVzdGVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyID09PSBvbGRPcHRzLmNsdXN0ZXIpICYmXG4gICAgICAgICAgKG5ld1NvdXJjZS5jbHVzdGVyUmFkaXVzID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyUmFkaXVzID09PSBvbGRPcHRzLnN1cGVyY2x1c3Rlck9wdGlvbnMucmFkaXVzKSAmJlxuICAgICAgICAgIChuZXdTb3VyY2UuY2x1c3Rlck1heFpvb20gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgbmV3U291cmNlLmNsdXN0ZXJNYXhab29tID09PSBvbGRPcHRzLnN1cGVyY2x1c3Rlck9wdGlvbnMubWF4Wm9vbSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgb2xkU291cmNlLnNldERhdGEobmV3U291cmNlLmRhdGEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIG1hcC5yZW1vdmVTb3VyY2UodXBkYXRlLmlkKTtcbiAgICBtYXAuYWRkU291cmNlKHVwZGF0ZS5pZCwgbmV3U291cmNlKTtcbiAgfVxuXG4gIC8vIEhvdmVyIGFuZCBjbGljayBvbmx5IHF1ZXJ5IGxheWVycyB3aG9zZSBpbnRlcmFjdGl2ZSBwcm9wZXJ0eSBpcyB0cnVlXG4gIC8vIElmIG5vIGludGVyYWN0aXZpdHkgaXMgc3BlY2lmaWVkLCBxdWVyeSBhbGwgbGF5ZXJzXG4gIF91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSkge1xuICAgIGNvbnN0IGludGVyYWN0aXZlTGF5ZXJJZHMgPSBnZXRJbnRlcmFjdGl2ZUxheWVySWRzKG1hcFN0eWxlKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IGludGVyYWN0aXZlTGF5ZXJJZHMubGVuZ3RoID09PSAwID8ge30gOlxuICAgICAge2xheWVyczogaW50ZXJhY3RpdmVMYXllcklkc307XG4gIH1cblxuICAvLyBJbmRpdmlkdWFsbHkgdXBkYXRlIHRoZSBtYXBzIHNvdXJjZSBhbmQgbGF5ZXJzIHRoYXQgaGF2ZSBjaGFuZ2VkIGlmIGFsbFxuICAvLyBvdGhlciBzdHlsZSBwcm9wcyBoYXZlbid0IGNoYW5nZWQuIFRoaXMgcHJldmVudHMgZmxpY2tpbmcgb2YgdGhlIG1hcCB3aGVuXG4gIC8vIHN0eWxlcyBvbmx5IGNoYW5nZSBzb3VyY2VzIG9yIGxheWVycy5cbiAgLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMsIGNvbXBsZXhpdHkgKi9cbiAgX3NldERpZmZTdHlsZShwcmV2U3R5bGUsIG5leHRTdHlsZSkge1xuICAgIGNvbnN0IHByZXZLZXlzTWFwID0gcHJldlN0eWxlICYmIHN0eWxlS2V5c01hcChwcmV2U3R5bGUpIHx8IHt9O1xuICAgIGNvbnN0IG5leHRLZXlzTWFwID0gc3R5bGVLZXlzTWFwKG5leHRTdHlsZSk7XG4gICAgZnVuY3Rpb24gc3R5bGVLZXlzTWFwKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUubWFwKCgpID0+IHRydWUpLmRlbGV0ZSgnbGF5ZXJzJykuZGVsZXRlKCdzb3VyY2VzJykudG9KUygpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcm9wc090aGVyVGhhbkxheWVyc09yU291cmNlc0RpZmZlcigpIHtcbiAgICAgIGNvbnN0IHByZXZLZXlzTGlzdCA9IE9iamVjdC5rZXlzKHByZXZLZXlzTWFwKTtcbiAgICAgIGNvbnN0IG5leHRLZXlzTGlzdCA9IE9iamVjdC5rZXlzKG5leHRLZXlzTWFwKTtcbiAgICAgIGlmIChwcmV2S2V5c0xpc3QubGVuZ3RoICE9PSBuZXh0S2V5c0xpc3QubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gYG5leHRTdHlsZWAgYW5kIGBwcmV2U3R5bGVgIHNob3VsZCBub3QgaGF2ZSB0aGUgc2FtZSBzZXQgb2YgcHJvcHMuXG4gICAgICBpZiAobmV4dEtleXNMaXN0LnNvbWUoXG4gICAgICAgIGtleSA9PiBwcmV2U3R5bGUuZ2V0KGtleSkgIT09IG5leHRTdHlsZS5nZXQoa2V5KVxuICAgICAgICAvLyBCdXQgdGhlIHZhbHVlIG9mIG9uZSBvZiB0aG9zZSBwcm9wcyBpcyBkaWZmZXJlbnQuXG4gICAgICApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuXG4gICAgaWYgKCFwcmV2U3R5bGUgfHwgcHJvcHNPdGhlclRoYW5MYXllcnNPclNvdXJjZXNEaWZmZXIoKSkge1xuICAgICAgbWFwLnNldFN0eWxlKG5leHRTdHlsZS50b0pTKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzb3VyY2VzRGlmZiwgbGF5ZXJzRGlmZn0gPSBkaWZmU3R5bGVzKHByZXZTdHlsZSwgbmV4dFN0eWxlKTtcblxuICAgIC8vIFRPRE86IEl0J3MgcmF0aGVyIGRpZmZpY3VsdCB0byBkZXRlcm1pbmUgc3R5bGUgZGlmZmluZyBpbiB0aGUgcHJlc2VuY2VcbiAgICAvLyBvZiByZWZzLiBGb3Igbm93LCBpZiBhbnkgc3R5bGUgdXBkYXRlIGhhcyBhIHJlZiwgZmFsbGJhY2sgdG8gbm8gZGlmZmluZy5cbiAgICAvLyBXZSBjYW4gY29tZSBiYWNrIHRvIHRoaXMgY2FzZSBpZiB0aGVyZSdzIGEgc29saWQgdXNlY2FzZS5cbiAgICBpZiAobGF5ZXJzRGlmZi51cGRhdGVzLnNvbWUobm9kZSA9PiBub2RlLmxheWVyLmdldCgncmVmJykpKSB7XG4gICAgICBtYXAuc2V0U3R5bGUobmV4dFN0eWxlLnRvSlMoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBlbnRlciBvZiBzb3VyY2VzRGlmZi5lbnRlcikge1xuICAgICAgbWFwLmFkZFNvdXJjZShlbnRlci5pZCwgZW50ZXIuc291cmNlLnRvSlMoKSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgdXBkYXRlIG9mIHNvdXJjZXNEaWZmLnVwZGF0ZSkge1xuICAgICAgdGhpcy5fdXBkYXRlU291cmNlKG1hcCwgdXBkYXRlKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBleGl0IG9mIHNvdXJjZXNEaWZmLmV4aXQpIHtcbiAgICAgIG1hcC5yZW1vdmVTb3VyY2UoZXhpdC5pZCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZXhpdCBvZiBsYXllcnNEaWZmLmV4aXRpbmcpIHtcbiAgICAgIGlmIChtYXAuc3R5bGUuZ2V0TGF5ZXIoZXhpdC5pZCkpIHtcbiAgICAgICAgbWFwLnJlbW92ZUxheWVyKGV4aXQuaWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHVwZGF0ZSBvZiBsYXllcnNEaWZmLnVwZGF0ZXMpIHtcbiAgICAgIGlmICghdXBkYXRlLmVudGVyKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYW4gb2xkIGxheWVyIHRoYXQgbmVlZHMgdG8gYmUgdXBkYXRlZC4gUmVtb3ZlIHRoZSBvbGQgbGF5ZXJcbiAgICAgICAgLy8gd2l0aCB0aGUgc2FtZSBpZCBhbmQgYWRkIGl0IGJhY2sgYWdhaW4uXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcih1cGRhdGUuaWQpO1xuICAgICAgfVxuICAgICAgbWFwLmFkZExheWVyKHVwZGF0ZS5sYXllci50b0pTKCksIHVwZGF0ZS5iZWZvcmUpO1xuICAgIH1cbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzLCBjb21wbGV4aXR5ICovXG5cbiAgX3VwZGF0ZU1hcFN0eWxlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IG1hcFN0eWxlID0gbmV3UHJvcHMubWFwU3R5bGU7XG4gICAgY29uc3Qgb2xkTWFwU3R5bGUgPSBvbGRQcm9wcy5tYXBTdHlsZTtcbiAgICBpZiAobWFwU3R5bGUgIT09IG9sZE1hcFN0eWxlKSB7XG4gICAgICBpZiAoSW1tdXRhYmxlLk1hcC5pc01hcChtYXBTdHlsZSkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucHJldmVudFN0eWxlRGlmZmluZykge1xuICAgICAgICAgIHRoaXMuX2dldE1hcCgpLnNldFN0eWxlKG1hcFN0eWxlLnRvSlMoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2V0RGlmZlN0eWxlKG9sZE1hcFN0eWxlLCBtYXBTdHlsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2dldE1hcCgpLnNldFN0eWxlKG1hcFN0eWxlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVF1ZXJ5UGFyYW1zKG1hcFN0eWxlKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlTWFwVmlld3BvcnQob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgY29uc3Qgdmlld3BvcnRDaGFuZ2VkID1cbiAgICAgIG5ld1Byb3BzLmxhdGl0dWRlICE9PSBvbGRQcm9wcy5sYXRpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMubG9uZ2l0dWRlICE9PSBvbGRQcm9wcy5sb25naXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLnpvb20gIT09IG9sZFByb3BzLnpvb20gfHxcbiAgICAgIG5ld1Byb3BzLnBpdGNoICE9PSBvbGRQcm9wcy5waXRjaCB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuYmVhcmluZyB8fFxuICAgICAgbmV3UHJvcHMuYWx0aXR1ZGUgIT09IG9sZFByb3BzLmFsdGl0dWRlO1xuXG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG5cbiAgICBpZiAodmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICBtYXAuanVtcFRvKHtcbiAgICAgICAgY2VudGVyOiBbbmV3UHJvcHMubG9uZ2l0dWRlLCBuZXdQcm9wcy5sYXRpdHVkZV0sXG4gICAgICAgIHpvb206IG5ld1Byb3BzLnpvb20sXG4gICAgICAgIGJlYXJpbmc6IG5ld1Byb3BzLmJlYXJpbmcsXG4gICAgICAgIHBpdGNoOiBuZXdQcm9wcy5waXRjaFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRPRE8gLSBqdW1wVG8gZG9lc24ndCBoYW5kbGUgYWx0aXR1ZGVcbiAgICAgIGlmIChuZXdQcm9wcy5hbHRpdHVkZSAhPT0gb2xkUHJvcHMuYWx0aXR1ZGUpIHtcbiAgICAgICAgbWFwLnRyYW5zZm9ybS5hbHRpdHVkZSA9IG5ld1Byb3BzLmFsdGl0dWRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9XG4gICAgICBvbGRQcm9wcy53aWR0aCAhPT0gbmV3UHJvcHMud2lkdGggfHwgb2xkUHJvcHMuaGVpZ2h0ICE9PSBuZXdQcm9wcy5oZWlnaHQ7XG5cbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgICAgbWFwLnJlc2l6ZSgpO1xuICAgICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSk7XG4gICAgfVxuICB9XG5cbiAgX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyh7cG9zLCBzdGFydFBvcywgc3RhcnRCZWFyaW5nLCBzdGFydFBpdGNofSkge1xuICAgIGNvbnN0IHhEZWx0YSA9IHBvcy54IC0gc3RhcnRQb3MueDtcbiAgICBjb25zdCBiZWFyaW5nID0gc3RhcnRCZWFyaW5nICsgMTgwICogeERlbHRhIC8gdGhpcy5wcm9wcy53aWR0aDtcblxuICAgIGxldCBwaXRjaCA9IHN0YXJ0UGl0Y2g7XG4gICAgY29uc3QgeURlbHRhID0gcG9zLnkgLSBzdGFydFBvcy55O1xuICAgIGlmICh5RGVsdGEgPiAwKSB7XG4gICAgICAvLyBEcmFnZ2luZyBkb3dud2FyZHMsIGdyYWR1YWxseSBkZWNyZWFzZSBwaXRjaFxuICAgICAgaWYgKE1hdGguYWJzKHRoaXMucHJvcHMuaGVpZ2h0IC0gc3RhcnRQb3MueSkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB5RGVsdGEgLyAodGhpcy5wcm9wcy5oZWlnaHQgLSBzdGFydFBvcy55KTtcbiAgICAgICAgcGl0Y2ggPSAoMSAtIHNjYWxlKSAqIFBJVENIX0FDQ0VMICogc3RhcnRQaXRjaDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHlEZWx0YSA8IDApIHtcbiAgICAgIC8vIERyYWdnaW5nIHVwd2FyZHMsIGdyYWR1YWxseSBpbmNyZWFzZSBwaXRjaFxuICAgICAgaWYgKHN0YXJ0UG9zLnkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgY29uc3QgeVNjYWxlID0gMSAtIHBvcy55IC8gc3RhcnRQb3MueTtcbiAgICAgICAgLy8gR3JhZHVhbGx5IGFkZCB1bnRpbCB3ZSBoaXQgbWF4IHBpdGNoXG4gICAgICAgIHBpdGNoID0gc3RhcnRQaXRjaCArIHlTY2FsZSAqIChNQVhfUElUQ0ggLSBzdGFydFBpdGNoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmRlYnVnKHN0YXJ0UGl0Y2gsIHBpdGNoKTtcbiAgICByZXR1cm4ge1xuICAgICAgcGl0Y2g6IE1hdGgubWF4KE1hdGgubWluKHBpdGNoLCBNQVhfUElUQ0gpLCAwKSxcbiAgICAgIGJlYXJpbmdcbiAgICB9O1xuICB9XG5cbiAgIC8vIEhlbHBlciB0byBjYWxsIHByb3BzLm9uQ2hhbmdlVmlld3BvcnRcbiAgX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRyYW5zZm9ybSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VWaWV3cG9ydCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0KHtcbiAgICAgICAgbGF0aXR1ZGU6IHRyYW5zZm9ybS5jZW50ZXIubGF0LFxuICAgICAgICBsb25naXR1ZGU6IG1vZCh0cmFuc2Zvcm0uY2VudGVyLmxuZyArIDE4MCwgMzYwKSAtIDE4MCxcbiAgICAgICAgem9vbTogdHJhbnNmb3JtLnpvb20sXG4gICAgICAgIHBpdGNoOiB0cmFuc2Zvcm0ucGl0Y2gsXG4gICAgICAgIGJlYXJpbmc6IG1vZCh0cmFuc2Zvcm0uYmVhcmluZyArIDE4MCwgMzYwKSAtIDE4MCxcblxuICAgICAgICBpc0RyYWdnaW5nOiB0aGlzLnByb3BzLmlzRHJhZ2dpbmcsXG4gICAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogdGhpcy5wcm9wcy5zdGFydERyYWdMbmdMYXQsXG4gICAgICAgIHN0YXJ0QmVhcmluZzogdGhpcy5wcm9wcy5zdGFydEJlYXJpbmcsXG4gICAgICAgIHN0YXJ0UGl0Y2g6IHRoaXMucHJvcHMuc3RhcnRQaXRjaCxcblxuICAgICAgICAuLi5vcHRzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hTdGFydCh7cG9zfSkge1xuICAgIHRoaXMuX29uTW91c2VEb3duKHtwb3N9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZURvd24oe3Bvc30pIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICBjb25zdCBsbmdMYXQgPSB1bnByb2plY3RGcm9tVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0sIHBvcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQobWFwLnRyYW5zZm9ybSwge1xuICAgICAgaXNEcmFnZ2luZzogdHJ1ZSxcbiAgICAgIHN0YXJ0RHJhZ0xuZ0xhdDogW2xuZ0xhdC5sbmcsIGxuZ0xhdC5sYXRdLFxuICAgICAgc3RhcnRCZWFyaW5nOiBtYXAudHJhbnNmb3JtLmJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoOiBtYXAudHJhbnNmb3JtLnBpdGNoXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hEcmFnKHtwb3N9KSB7XG4gICAgdGhpcy5fb25Nb3VzZURyYWcoe3Bvc30pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlRHJhZyh7cG9zfSkge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gdGFrZSB0aGUgc3RhcnQgbG5nbGF0IGFuZCBwdXQgaXQgd2hlcmUgdGhlIG1vdXNlIGlzIGRvd24uXG4gICAgYXNzZXJ0KHRoaXMucHJvcHMuc3RhcnREcmFnTG5nTGF0LCAnYHN0YXJ0RHJhZ0xuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3IgbW91c2UgZHJhZyBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IGNsb25lVHJhbnNmb3JtKG1hcC50cmFuc2Zvcm0pO1xuICAgIHRyYW5zZm9ybS5zZXRMb2NhdGlvbkF0UG9pbnQodGhpcy5wcm9wcy5zdGFydERyYWdMbmdMYXQsIHBvcyk7XG4gICAgdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodHJhbnNmb3JtLCB7XG4gICAgICBpc0RyYWdnaW5nOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmQgX29uVG91Y2hSb3RhdGUoe3Bvcywgc3RhcnRQb3N9KSB7XG4gICAgdGhpcy5fb25Nb3VzZVJvdGF0ZSh7cG9zLCBzdGFydFBvc30pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlUm90YXRlKHtwb3MsIHN0YXJ0UG9zfSkge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0IHx8ICF0aGlzLnByb3BzLnBlcnNwZWN0aXZlRW5hYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtzdGFydEJlYXJpbmcsIHN0YXJ0UGl0Y2h9ID0gdGhpcy5wcm9wcztcbiAgICBhc3NlcnQodHlwZW9mIHN0YXJ0QmVhcmluZyA9PT0gJ251bWJlcicsXG4gICAgICAnYHN0YXJ0QmVhcmluZ2AgcHJvcCBpcyByZXF1aXJlZCBmb3IgbW91c2Ugcm90YXRlIGJlaGF2aW9yJyk7XG4gICAgYXNzZXJ0KHR5cGVvZiBzdGFydFBpdGNoID09PSAnbnVtYmVyJyxcbiAgICAgICdgc3RhcnRQaXRjaGAgcHJvcCBpcyByZXF1aXJlZCBmb3IgbW91c2Ugcm90YXRlIGJlaGF2aW9yJyk7XG5cbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgcG9zLFxuICAgICAgc3RhcnRQb3MsXG4gICAgICBzdGFydEJlYXJpbmcsXG4gICAgICBzdGFydFBpdGNoXG4gICAgfSk7XG5cbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBjbG9uZVRyYW5zZm9ybShtYXAudHJhbnNmb3JtKTtcbiAgICB0cmFuc2Zvcm0uYmVhcmluZyA9IGJlYXJpbmc7XG4gICAgdHJhbnNmb3JtLnBpdGNoID0gcGl0Y2g7XG5cbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydCh0cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZU1vdmUob3B0KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgcG9zID0gb3B0LnBvcztcbiAgICBpZiAoIXRoaXMucHJvcHMub25Ib3ZlckZlYXR1cmVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZlYXR1cmVzID0gbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhbcG9zLngsIHBvcy55XSxcbiAgICAgIHRoaXMuX3F1ZXJ5UGFyYW1zKTtcbiAgICBpZiAoIWZlYXR1cmVzLmxlbmd0aCAmJiB0aGlzLnByb3BzLmlnbm9yZUVtcHR5RmVhdHVyZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNIb3ZlcmluZzogZmVhdHVyZXMubGVuZ3RoID4gMH0pO1xuICAgIHRoaXMucHJvcHMub25Ib3ZlckZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Ub3VjaEVuZChvcHQpIHtcbiAgICB0aGlzLl9vbk1vdXNlVXAob3B0KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Ub3VjaFRhcChvcHQpIHtcbiAgICB0aGlzLl9vbk1vdXNlQ2xpY2sob3B0KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25Nb3VzZVVwKG9wdCkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KG1hcC50cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgc3RhcnREcmFnTG5nTGF0OiBudWxsLFxuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgQGF1dG9iaW5kIF9vbk1vdXNlQ2xpY2sob3B0KSB7XG4gICAgY29uc3QgbWFwID0gdGhpcy5fZ2V0TWFwKCk7XG4gICAgY29uc3QgcG9zID0gb3B0LnBvcztcblxuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgIGNvbnN0IGxuZ0xhdCA9IHVucHJvamVjdEZyb21UcmFuc2Zvcm0obWFwLnRyYW5zZm9ybSwgcG9zKTtcbiAgICAgIHRoaXMucHJvcHMub25DbGljayhsbmdMYXQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2tGZWF0dXJlcykge1xuICAgICAgLy8gUmFkaXVzIGVuYWJsZXMgcG9pbnQgZmVhdHVyZXMsIGxpa2UgbWFya2VyIHN5bWJvbHMsIHRvIGJlIGNsaWNrZWQuXG4gICAgICBjb25zdCBzaXplID0gdGhpcy5wcm9wcy5jbGlja1JhZGl1cztcbiAgICAgIGNvbnN0IGJib3ggPSBbW3Bvcy54IC0gc2l6ZSwgcG9zLnkgLSBzaXplXSwgW3Bvcy54ICsgc2l6ZSwgcG9zLnkgKyBzaXplXV07XG4gICAgICBjb25zdCBmZWF0dXJlcyA9IG1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoYmJveCwgdGhpcy5fcXVlcnlQYXJhbXMpO1xuICAgICAgaWYgKCFmZWF0dXJlcy5sZW5ndGggJiYgdGhpcy5wcm9wcy5pZ25vcmVFbXB0eUZlYXR1cmVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvcHMub25DbGlja0ZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmQgX29uWm9vbSh7cG9zLCBzY2FsZX0pIHtcbiAgICBjb25zdCBtYXAgPSB0aGlzLl9nZXRNYXAoKTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBjbG9uZVRyYW5zZm9ybShtYXAudHJhbnNmb3JtKTtcbiAgICBjb25zdCBhcm91bmQgPSB1bnByb2plY3RGcm9tVHJhbnNmb3JtKHRyYW5zZm9ybSwgcG9zKTtcbiAgICB0cmFuc2Zvcm0uem9vbSA9IHRyYW5zZm9ybS5zY2FsZVpvb20obWFwLnRyYW5zZm9ybS5zY2FsZSAqIHNjYWxlKTtcbiAgICB0cmFuc2Zvcm0uc2V0TG9jYXRpb25BdFBvaW50KGFyb3VuZCwgcG9zKTtcbiAgICB0aGlzLl9jYWxsT25DaGFuZ2VWaWV3cG9ydCh0cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIEBhdXRvYmluZCBfb25ab29tRW5kKCkge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2dldE1hcCgpO1xuICAgIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KG1hcC50cmFuc2Zvcm0sIHtcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NsYXNzTmFtZSwgd2lkdGgsIGhlaWdodCwgc3R5bGV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBtYXBTdHlsZSA9IHtcbiAgICAgIC4uLnN0eWxlLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBjdXJzb3I6IHRoaXMuX2N1cnNvcigpXG4gICAgfTtcblxuICAgIGxldCBjb250ZW50ID0gW1xuICAgICAgPGRpdiBrZXk9XCJtYXBcIiByZWY9XCJtYXBib3hNYXBcIlxuICAgICAgICBzdHlsZT17IG1hcFN0eWxlIH0gY2xhc3NOYW1lPXsgY2xhc3NOYW1lIH0vPixcbiAgICAgIDxkaXYga2V5PVwib3ZlcmxheXNcIiBjbGFzc05hbWU9XCJvdmVybGF5c1wiXG4gICAgICAgIHN0eWxlPXsge3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAwLCB0b3A6IDB9IH0+XG4gICAgICAgIHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG4gICAgICA8L2Rpdj5cbiAgICBdO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNTdXBwb3J0ZWQgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZVZpZXdwb3J0KSB7XG4gICAgICBjb250ZW50ID0gKFxuICAgICAgICA8TWFwSW50ZXJhY3Rpb25zXG4gICAgICAgICAgb25Nb3VzZURvd24gPXsgdGhpcy5fb25Nb3VzZURvd24gfVxuICAgICAgICAgIG9uTW91c2VEcmFnID17IHRoaXMuX29uTW91c2VEcmFnIH1cbiAgICAgICAgICBvbk1vdXNlUm90YXRlID17IHRoaXMuX29uTW91c2VSb3RhdGUgfVxuICAgICAgICAgIG9uTW91c2VVcCA9eyB0aGlzLl9vbk1vdXNlVXAgfVxuICAgICAgICAgIG9uTW91c2VNb3ZlID17IHRoaXMuX29uTW91c2VNb3ZlIH1cbiAgICAgICAgICBvbk1vdXNlQ2xpY2sgPSB7IHRoaXMuX29uTW91c2VDbGljayB9XG4gICAgICAgICAgb25Ub3VjaFN0YXJ0ID17IHRoaXMuX29uVG91Y2hTdGFydCB9XG4gICAgICAgICAgb25Ub3VjaERyYWcgPXsgdGhpcy5fb25Ub3VjaERyYWcgfVxuICAgICAgICAgIG9uVG91Y2hSb3RhdGUgPXsgdGhpcy5fb25Ub3VjaFJvdGF0ZSB9XG4gICAgICAgICAgb25Ub3VjaEVuZCA9eyB0aGlzLl9vblRvdWNoRW5kIH1cbiAgICAgICAgICBvblRvdWNoVGFwID0geyB0aGlzLl9vblRvdWNoVGFwIH1cbiAgICAgICAgICBvblpvb20gPXsgdGhpcy5fb25ab29tIH1cbiAgICAgICAgICBvblpvb21FbmQgPXsgdGhpcy5fb25ab29tRW5kIH1cbiAgICAgICAgICB3aWR0aCA9eyB0aGlzLnByb3BzLndpZHRoIH1cbiAgICAgICAgICBoZWlnaHQgPXsgdGhpcy5wcm9wcy5oZWlnaHQgfT5cblxuICAgICAgICAgIHsgY29udGVudCB9XG5cbiAgICAgICAgPC9NYXBJbnRlcmFjdGlvbnM+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIHN0eWxlPXsge1xuICAgICAgICAgIC4uLnRoaXMucHJvcHMuc3R5bGUsXG4gICAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICAgICAgICB9IH0+XG5cbiAgICAgICAgeyBjb250ZW50IH1cblxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5NYXBHTC5wcm9wVHlwZXMgPSBQUk9QX1RZUEVTO1xuTWFwR0wuZGVmYXVsdFByb3BzID0gREVGQVVMVF9QUk9QUztcbiJdfQ==