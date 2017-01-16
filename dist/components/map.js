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
import shallowCompare from 'react-addons-shallow-compare';
import autobind from '../utils/autobind';

import mapboxgl, {Point} from 'mapbox-gl';
import {select} from 'd3-selection';
import Immutable from 'immutable';
import assert from 'assert';
import window from 'global/window';

import MapInteractions from './map-interactions';
import {getInteractiveLayerIds} from '../utils/style-utils';
import diffStyles from '../utils/diff-styles';
import {mod, unprojectFromTransform, cloneTransform} from '../utils/transform';
import config from '../config';

function noop() {}

// Note: Max pitch is a hard coded value (not a named constant) in transform.js
var MAX_PITCH = 60;
var PITCH_MOUSE_THRESHOLD = 20;
var PITCH_ACCEL = 1.2;

var propTypes = {
  /**
    * The latitude of the center of the map.
    */
  latitude: PropTypes.number.isRequired,
  /**
    * The longitude of the center of the map.
    */
  longitude: PropTypes.number.isRequired,
  /**
    * The tile zoom level of the map.
    */
  zoom: PropTypes.number.isRequired,
  /**
    * The Mapbox style the component should use. Can either be a string url
    * or a MapboxGL style Immutable.Map object.
    */
  mapStyle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Immutable.Map)
  ]),
  /**
    * The Mapbox API access token to provide to mapbox-gl-js. This is required
    * when using Mapbox provided vector tiles and styles.
    */
  mapboxApiAccessToken: PropTypes.string,
  /**
    * `onChangeViewport` callback is fired when the user interacted with the
    * map. The object passed to the callback contains `latitude`,
    * `longitude` and `zoom` and additional state information.
    */
  onChangeViewport: PropTypes.func,
  /**
    * The width of the map.
    */
  width: PropTypes.number.isRequired,
  /**
    * The height of the map.
    */
  height: PropTypes.number.isRequired,
  /**
    * Is the component currently being dragged. This is used to show/hide the
    * drag cursor. Also used as an optimization in some overlays by preventing
    * rendering while dragging.
    */
  isDragging: PropTypes.bool,
  /**
    * Required to calculate the mouse projection after the first click event
    * during dragging. Where the map is depends on where you first clicked on
    * the map.
    */
  startDragLngLat: PropTypes.array,
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
  onHoverFeatures: PropTypes.func,
  /**
    * Defaults to TRUE
    * Set to false to enable onHoverFeatures to be called regardless if
    * there is an actual feature at x, y. This is useful to emulate
    * "mouse-out" behaviors on features.
    */
  ignoreEmptyFeatures: PropTypes.bool,

  /**
    * Show attribution control or not.
    */
  attributionControl: PropTypes.bool,

  /**
   * Called when the map is clicked. The handler is called with the clicked
   * coordinates (https://www.mapbox.com/mapbox-gl-js/api/#LngLat) and the
   * screen coordinates (https://www.mapbox.com/mapbox-gl-js/api/#PointLike).
   */
  onClick: PropTypes.func,

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
  onClickFeatures: PropTypes.func,

  /**
    * Radius to detect features around a clicked point. Defaults to 15.
    */
  clickRadius: PropTypes.number,

  /**
    * Passed to Mapbox Map constructor which passes it to the canvas context.
    * This is unseful when you want to export the canvas as a PNG.
    */
  preserveDrawingBuffer: PropTypes.bool,

  /**
    * There are still known issues with style diffing. As a temporary stopgap,
    * add the option to prevent style diffing.
    */
  preventStyleDiffing: PropTypes.bool,

  /**
    * Enables perspective control event handling
    */
  perspectiveEnabled: PropTypes.bool,

  /**
    * Specify the bearing of the viewport
    */
  bearing: React.PropTypes.number,

  /**
    * Specify the pitch of the viewport
    */
  pitch: React.PropTypes.number,

  /**
    * Specify the altitude of the viewport camera
    * Unit: map heights, default 1.5
    * Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
    */
  altitude: React.PropTypes.number
};

var defaultProps = {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  onChangeViewport: null,
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  ignoreEmptyFeatures: true,
  bearing: 0,
  pitch: 0,
  altitude: 1.5,
  clickRadius: 15
};

// Try to get access token from URL, env, local storage or config
function getAccessToken() {
  var accessToken = null;

  if (window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken) {
    // Note: This depends on the bundler (e.g. webpack) inmporting environment correctly
    accessToken =
      process.env.MapboxAccessToken || process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line
  }

  // Try to save and restore from local storage
  // if (window.localStorage) {
  //   if (accessToken) {
  //     window.localStorage.accessToken = accessToken;
  //   } else {
  //     accessToken = window.localStorage.accessToken;
  //   }
  // }

  return accessToken || config.DEFAULTS.MAPBOX_API_ACCESS_TOKEN;
}

var MapGL = (function (Component) {
  function MapGL(props) {
    Component.call(this, props);
    this.state = {
      isSupported: mapboxgl.supported(),
      isDragging: false,
      isHovering: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    };
    this._queryParams = {};
    mapboxgl.accessToken = props.mapboxApiAccessToken;

    if (!this.state.isSupported) {
      this.componentDidMount = noop;
      this.componentWillReceiveProps = noop;
      this.componentDidUpdate = noop;
    }

    autobind(this);
  }

  if ( Component ) MapGL.__proto__ = Component;
  MapGL.prototype = Object.create( Component && Component.prototype );
  MapGL.prototype.constructor = MapGL;

  MapGL.supported = function supported () {
    return mapboxgl.supported();
  };

  MapGL.prototype.componentDidMount = function componentDidMount () {
    var mapStyle = Immutable.Map.isMap(this.props.mapStyle) ?
      this.props.mapStyle.toJS() :
      this.props.mapStyle;
    var map = new mapboxgl.Map({
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

    // TODO - can we drop d3-select dependency?
    select(map.getCanvas()).style('outline', 'none');

    this._map = map;
    this._updateMapViewport({}, this.props);
    this._callOnChangeViewport(map.transform);
    this._updateQueryParams(mapStyle);
  };

  // New props are comin' round the corner!
  MapGL.prototype.componentWillReceiveProps = function componentWillReceiveProps (newProps) {
    this._updateStateFromProps(this.props, newProps);
    this._updateMapViewport(this.props, newProps);
    this._updateMapStyle(this.props, newProps);
    // Save width/height so that we can check them in componentDidUpdate
    this.setState({
      width: this.props.width,
      height: this.props.height
    });
  };

  // Pure render
  MapGL.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  };

  MapGL.prototype.componentDidUpdate = function componentDidUpdate () {
    // map.resize() reads size from DOM, we need to call after render
    this._updateMapSize(this.state, this.props);
  };

  MapGL.prototype.componentWillUnmount = function componentWillUnmount () {
    if (this._map) {
      this._map.remove();
    }
  };

  // External apps can access map this way
  MapGL.prototype._getMap = function _getMap () {
    return this._map;
  };

  // Calculate a cursor style
  MapGL.prototype._getCursor = function _getCursor () {
    var isInteractive =
      this.props.onChangeViewport ||
      this.props.onClickFeature ||
      this.props.onHoverFeatures;
    if (isInteractive) {
      return this.props.isDragging ?
        config.CURSOR.GRABBING :
        (this.state.isHovering ? config.CURSOR.POINTER : config.CURSOR.GRAB);
    }
    return 'inherit';
  };

  MapGL.prototype._updateStateFromProps = function _updateStateFromProps (oldProps, newProps) {
    mapboxgl.accessToken = newProps.mapboxApiAccessToken;
    var startDragLngLat = newProps.startDragLngLat;
    this.setState({
      startDragLngLat: startDragLngLat && startDragLngLat.slice()
    });
  };

  // Hover and click only query layers whose interactive property is true
  // If no interactivity is specified, query all layers
  MapGL.prototype._updateQueryParams = function _updateQueryParams (mapStyle) {
    var interactiveLayerIds = getInteractiveLayerIds(mapStyle);
    this._queryParams = interactiveLayerIds.length === 0 ? {} :
      {layers: interactiveLayerIds};
  };

  // Update a source in the map style
  MapGL.prototype._updateSource = function _updateSource (map, update) {
    var newSource = update.source.toJS();
    if (newSource.type === 'geojson') {
      var oldSource = map.getSource(update.id);
      if (oldSource.type === 'geojson') {
        // update data if no other GeoJSONSource options were changed
        var oldOpts = oldSource.workerOptions;
        if (
          (newSource.maxzoom === undefined ||
            newSource.maxzoom === oldOpts.geojsonVtOptions.maxZoom) &&
          (newSource.buffer === undefined ||
            newSource.buffer === oldOpts.geojsonVtOptions.buffer) &&
          (newSource.tolerance === undefined ||
            newSource.tolerance === oldOpts.geojsonVtOptions.tolerance) &&
          (newSource.cluster === undefined ||
            newSource.cluster === oldOpts.cluster) &&
          (newSource.clusterRadius === undefined ||
            newSource.clusterRadius === oldOpts.superclusterOptions.radius) &&
          (newSource.clusterMaxZoom === undefined ||
            newSource.clusterMaxZoom === oldOpts.superclusterOptions.maxZoom)
        ) {
          oldSource.setData(newSource.data);
          return;
        }
      }
    }

    map.removeSource(update.id);
    map.addSource(update.id, newSource);
  };

  // Individually update the maps source and layers that have changed if all
  // other style props haven't changed. This prevents flicking of the map when
  // styles only change sources or layers.
  /* eslint-disable max-statements, complexity */
  MapGL.prototype._setDiffStyle = function _setDiffStyle (prevStyle, nextStyle) {
    var this$1 = this;

    var prevKeysMap = prevStyle && styleKeysMap(prevStyle) || {};
    var nextKeysMap = styleKeysMap(nextStyle);
    function styleKeysMap(style) {
      return style.map(function () { return true; }).delete('layers').delete('sources').toJS();
    }
    function propsOtherThanLayersOrSourcesDiffer() {
      var prevKeysList = Object.keys(prevKeysMap);
      var nextKeysList = Object.keys(nextKeysMap);
      if (prevKeysList.length !== nextKeysList.length) {
        return true;
      }
      // `nextStyle` and `prevStyle` should not have the same set of props.
      if (nextKeysList.some(
        function (key) { return prevStyle.get(key) !== nextStyle.get(key); }
        // But the value of one of those props is different.
      )) {
        return true;
      }
      return false;
    }

    var map = this._map;

    if (!prevStyle || propsOtherThanLayersOrSourcesDiffer()) {
      map.setStyle(nextStyle.toJS());
      return;
    }

    var ref = diffStyles(prevStyle, nextStyle);
    var sourcesDiff = ref.sourcesDiff;
    var layersDiff = ref.layersDiff;

    // TODO: It's rather difficult to determine style diffing in the presence
    // of refs. For now, if any style update has a ref, fallback to no diffing.
    // We can come back to this case if there's a solid usecase.
    if (layersDiff.updates.some(function (node) { return node.layer.get('ref'); })) {
      map.setStyle(nextStyle.toJS());
      return;
    }

    for (var i = 0, list = sourcesDiff.enter; i < list.length; i += 1) {
      var enter = list[i];

      map.addSource(enter.id, enter.source.toJS());
    }
    for (var i$1 = 0, list$1 = sourcesDiff.update; i$1 < list$1.length; i$1 += 1) {
      var update = list$1[i$1];

      this$1._updateSource(map, update);
    }
    for (var i$2 = 0, list$2 = sourcesDiff.exit; i$2 < list$2.length; i$2 += 1) {
      var exit = list$2[i$2];

      map.removeSource(exit.id);
    }
    for (var i$3 = 0, list$3 = layersDiff.exiting; i$3 < list$3.length; i$3 += 1) {
      var exit$1 = list$3[i$3];

      if (map.style.getLayer(exit$1.id)) {
        map.removeLayer(exit$1.id);
      }
    }
    for (var i$4 = 0, list$4 = layersDiff.updates; i$4 < list$4.length; i$4 += 1) {
      var update$1 = list$4[i$4];

      if (!update$1.enter) {
        // This is an old layer that needs to be updated. Remove the old layer
        // with the same id and add it back again.
        map.removeLayer(update$1.id);
      }
      map.addLayer(update$1.layer.toJS(), update$1.before);
    }
  };
  /* eslint-enable max-statements, complexity */

  MapGL.prototype._updateMapStyle = function _updateMapStyle (oldProps, newProps) {
    var mapStyle = newProps.mapStyle;
    var oldMapStyle = oldProps.mapStyle;
    if (mapStyle !== oldMapStyle) {
      if (Immutable.Map.isMap(mapStyle)) {
        if (this.props.preventStyleDiffing) {
          this._map.setStyle(mapStyle.toJS());
        } else {
          this._setDiffStyle(oldMapStyle, mapStyle);
        }
      } else {
        this._map.setStyle(mapStyle);
      }
      this._updateQueryParams(mapStyle);
    }
  };

  MapGL.prototype._updateMapViewport = function _updateMapViewport (oldProps, newProps) {
    var viewportChanged =
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom ||
      newProps.pitch !== oldProps.pitch ||
      newProps.zoom !== oldProps.bearing ||
      newProps.altitude !== oldProps.altitude;

    if (viewportChanged) {
      this._map.jumpTo({
        center: [newProps.longitude, newProps.latitude],
        zoom: newProps.zoom,
        bearing: newProps.bearing,
        pitch: newProps.pitch
      });

      // TODO - jumpTo doesn't handle altitude
      if (newProps.altitude !== oldProps.altitude) {
        this._map.transform.altitude = newProps.altitude;
      }
    }
  };

  // Note: needs to be called after render (e.g. in componentDidUpdate)
  MapGL.prototype._updateMapSize = function _updateMapSize (oldProps, newProps) {
    var sizeChanged =
      oldProps.width !== newProps.width || oldProps.height !== newProps.height;

    if (sizeChanged) {
      this._map.resize();
      this._callOnChangeViewport(this._map.transform);
    }
  };

  // Calculates a new pitch and bearing from a position (coming from an event)
  MapGL.prototype._calculateNewPitchAndBearing = function _calculateNewPitchAndBearing (ref) {
    var pos = ref.pos;
    var startPos = ref.startPos;
    var startBearing = ref.startBearing;
    var startPitch = ref.startPitch;

    var xDelta = pos[0] - startPos[0];
    var bearing = startBearing + 180 * xDelta / this.props.width;

    var pitch = startPitch;
    var yDelta = pos[1] - startPos[1];
    if (yDelta > 0) {
      // Dragging downwards, gradually decrease pitch
      if (Math.abs(this.props.height - startPos[1]) > PITCH_MOUSE_THRESHOLD) {
        var scale = yDelta / (this.props.height - startPos[1]);
        pitch = (1 - scale) * PITCH_ACCEL * startPitch;
      }
    } else if (yDelta < 0) {
      // Dragging upwards, gradually increase pitch
      if (startPos.y > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        var yScale = 1 - pos[1] / startPos[1];
        // Gradually add until we hit max pitch
        pitch = startPitch + yScale * (MAX_PITCH - startPitch);
      }
    }

    // console.debug(startPitch, pitch);
    return {
      pitch: Math.max(Math.min(pitch, MAX_PITCH), 0),
      bearing: bearing
    };
  };

   // Helper to call props.onChangeViewport
  MapGL.prototype._callOnChangeViewport = function _callOnChangeViewport (transform, opts) {
    if ( opts === void 0 ) opts = {};

    if (this.props.onChangeViewport) {
      this.props.onChangeViewport(Object.assign({}, {latitude: transform.center.lat,
        longitude: mod(transform.center.lng + 180, 360) - 180,
        zoom: transform.zoom,
        pitch: transform.pitch,
        bearing: mod(transform.bearing + 180, 360) - 180,

        isDragging: this.props.isDragging,
        startDragLngLat: this.props.startDragLngLat,
        startBearing: this.props.startBearing,
        startPitch: this.props.startPitch},

        opts));
    }
  };

  MapGL.prototype._onTouchStart = function _onTouchStart (opts) {
    this._onMouseDown(opts);
  };

  MapGL.prototype._onTouchDrag = function _onTouchDrag (opts) {
    this._onMouseDrag(opts);
  };

  MapGL.prototype._onTouchRotate = function _onTouchRotate (opts) {
    this._onMouseRotate(opts);
  };

  MapGL.prototype._onTouchEnd = function _onTouchEnd (opts) {
    this._onMouseUp(opts);
  };

  MapGL.prototype._onTouchTap = function _onTouchTap (opts) {
    this._onMouseClick(opts);
  };

  MapGL.prototype._onMouseDown = function _onMouseDown (ref) {
    var pos = ref.pos;

    var ref$1 = this._map;
    var transform = ref$1.transform;
    var lngLat = unprojectFromTransform(transform, new (Function.prototype.bind.apply( Point, [ null ].concat( pos) )));
    this._callOnChangeViewport(transform, {
      isDragging: true,
      startDragLngLat: [lngLat.lng, lngLat.lat],
      startBearing: transform.bearing,
      startPitch: transform.pitch
    });
  };

  MapGL.prototype._onMouseDrag = function _onMouseDrag (ref) {
    var pos = ref.pos;

    if (!this.props.onChangeViewport) {
      return;
    }

    // take the start lnglat and put it where the mouse is down.
    assert(this.props.startDragLngLat, '`startDragLngLat` prop is required ' +
      'for mouse drag behavior to calculate where to position the map.');

    var transform = cloneTransform(this._map.transform);
    transform.setLocationAtPoint(this.props.startDragLngLat, new (Function.prototype.bind.apply( Point, [ null ].concat( pos) )));
    this._callOnChangeViewport(transform, {isDragging: true});
  };

  MapGL.prototype._onMouseRotate = function _onMouseRotate (ref) {
    var pos = ref.pos;
    var startPos = ref.startPos;

    if (!this.props.onChangeViewport || !this.props.perspectiveEnabled) {
      return;
    }

    var ref$1 = this.props;
    var startBearing = ref$1.startBearing;
    var startPitch = ref$1.startPitch;
    assert(typeof startBearing === 'number',
      '`startBearing` prop is required for mouse rotate behavior');
    assert(typeof startPitch === 'number',
      '`startPitch` prop is required for mouse rotate behavior');

    var ref$2 = this._calculateNewPitchAndBearing({
      pos: pos,
      startPos: startPos,
      startBearing: startBearing,
      startPitch: startPitch
    });
    var pitch = ref$2.pitch;
    var bearing = ref$2.bearing;

    var transform = cloneTransform(this._map.transform);
    transform.bearing = bearing;
    transform.pitch = pitch;

    this._callOnChangeViewport(transform, {isDragging: true});
  };

  MapGL.prototype._onMouseMove = function _onMouseMove (ref) {
    var pos = ref.pos;

    if (!this.props.onHoverFeatures) {
      return;
    }
    var features = this._map.queryRenderedFeatures(new (Function.prototype.bind.apply( Point, [ null ].concat( pos) )), this._queryParams);
    if (!features.length && this.props.ignoreEmptyFeatures) {
      return;
    }
    this.setState({isHovering: features.length > 0});
    this.props.onHoverFeatures(features);
  };

  MapGL.prototype._onMouseUp = function _onMouseUp (opt) {
    this._callOnChangeViewport(this._map.transform, {
      isDragging: false,
      startDragLngLat: null,
      startBearing: null,
      startPitch: null
    });
  };

  MapGL.prototype._onMouseClick = function _onMouseClick (ref) {
    var pos = ref.pos;

    if (!this.props.onClickFeatures && !this.props.onClick) {
      return;
    }

    if (this.props.onClick) {
      var point = new (Function.prototype.bind.apply( Point, [ null ].concat( pos) ));
      var latLong = this._map.unproject(point);
      // TODO - Do we really want to expose a mapbox "Point" in our interface?
      this.props.onClick(latLong, point);
    }

    if (this.props.onClickFeatures) {
      // Radius enables point features, like marker symbols, to be clicked.
      var size = this.props.clickRadius;
      var bbox = [[pos[0] - size, pos[1] - size], [pos[0] + size, pos[1] + size]];
      var features = this._map.queryRenderedFeatures(bbox, this._queryParams);
      if (!features.length && this.props.ignoreEmptyFeatures) {
        return;
      }
      this.props.onClickFeatures(features);
    }
  };

  MapGL.prototype._onZoom = function _onZoom (ref) {
    var pos = ref.pos;
    var scale = ref.scale;

    var point = new (Function.prototype.bind.apply( Point, [ null ].concat( pos) ));
    var transform = cloneTransform(this._map.transform);
    var around = unprojectFromTransform(transform, point);
    transform.zoom = transform.scaleZoom(this._map.transform.scale * scale);
    transform.setLocationAtPoint(around, point);
    this._callOnChangeViewport(transform, {isDragging: true});
  };

  MapGL.prototype._onZoomEnd = function _onZoomEnd () {
    this._callOnChangeViewport(this._map.transform, {isDragging: false});
  };

  MapGL.prototype.render = function render () {
    var ref = this.props;
    var className = ref.className;
    var width = ref.width;
    var height = ref.height;
    var style = ref.style;
    var mapStyle = Object.assign({}, style, {width: width, height: height, cursor: this._getCursor()});

    var content = [
      React.createElement( 'div', { key: "map", ref: "mapboxMap", style: mapStyle, className: className }),
      React.createElement( 'div', { key: "overlays", className: "overlays", style: {position: 'absolute', left: 0, top: 0} },
        this.props.children
      )
    ];

    if (this.state.isSupported && this.props.onChangeViewport) {
      content = (
        React.createElement( MapInteractions, {
          onMouseDown: this._onMouseDown, onMouseDrag: this._onMouseDrag, onMouseRotate: this._onMouseRotate, onMouseUp: this._onMouseUp, onMouseMove: this._onMouseMove, onMouseClick: this._onMouseClick, onTouchStart: this._onTouchStart, onTouchDrag: this._onTouchDrag, onTouchRotate: this._onTouchRotate, onTouchEnd: this._onTouchEnd, onTouchTap: this._onTouchTap, onZoom: this._onZoom, onZoomEnd: this._onZoomEnd, width: this.props.width, height: this.props.height },

          content

        )
      );
    }

    return (
      React.createElement( 'div', { style: Object.assign({}, this.props.style, {width: width, height: height, position: 'relative'}) },

        content

      )
    );
  };

  return MapGL;
}(Component));

export default MapGL;

MapGL.displayName = 'MapGL';
MapGL.propTypes = propTypes;
MapGL.defaultProps = defaultProps;
