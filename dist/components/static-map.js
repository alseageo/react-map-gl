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

import {getInteractiveLayerIds} from '../utils/style-utils';
import diffStyles from '../utils/diff-styles';
import config from '../config';

import mapboxgl, {Point} from 'mapbox-gl';
import {select} from 'd3-selection';
import Immutable from 'immutable';

function noop() {}

var propTypes = {
  /** Mapbox API access token for mapbox-gl-js. Required when using Mapbox vector tiles/styles. */
  mapboxApiAccessToken: PropTypes.string,
  /** Mapbox WebGL context creation option. Useful when you want to export the canvas as a PNG. */
  preserveDrawingBuffer: PropTypes.bool,
  /** Show attribution control or not. */
  attributionControl: PropTypes.bool,

  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Immutable.Map)
  ]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,

  /** The latitude of the center of the map. */
  latitude: PropTypes.number.isRequired,
  /** The longitude of the center of the map. */
  longitude: PropTypes.number.isRequired,
  /** The tile zoom level of the map. */
  zoom: PropTypes.number.isRequired,
  /** Specify the bearing of the viewport */
  bearing: React.PropTypes.number,
  /** Specify the pitch of the viewport */
  pitch: React.PropTypes.number,
  /** Altitude of the viewport camera. Default 1.5 "screen heights" */
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: React.PropTypes.number,
  /** The width of the map. */
  width: PropTypes.number.isRequired,
  /** The height of the map. */
  height: PropTypes.number.isRequired,

  /**
   * `onChangeViewport` callback is fired when the user interacted with the
   * map. The object passed to the callback contains `latitude`,
   * `longitude` and `zoom` and additional state information.
   */
  onChangeViewport: PropTypes.func,

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
    * Set to false to enable onHoverFeatures to be called regardless if
    * there is an actual feature at x, y. This is useful to emulate
    * "mouse-out" behaviors on features.
    * Defaults to TRUE
    */
  ignoreEmptyFeatures: PropTypes.bool,
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
   * Called when the map is clicked. The handler is called with the clicked
   * coordinates (https://www.mapbox.com/mapbox-gl-js/api/#LngLat) and the
   * screen coordinates (https://www.mapbox.com/mapbox-gl-js/api/#PointLike).
   */
  onClick: PropTypes.func,

  /** Radius to detect features around a clicked point. Defaults to 15. */
  clickRadius: PropTypes.number
};

var defaultProps = {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  onChangeViewport: null,
  mapboxApiAccessToken: config.DEFAULTS.MAPBOX_API_ACCESS_TOKEN,
  preserveDrawingBuffer: false,
  attributionControl: true,
  ignoreEmptyFeatures: true,
  bearing: 0,
  pitch: 0,
  altitude: 1.5,
  clickRadius: 15
};

var StaticMap = (function (Component) {
  function StaticMap(props) {
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

  if ( Component ) StaticMap.__proto__ = Component;
  StaticMap.prototype = Object.create( Component && Component.prototype );
  StaticMap.prototype.constructor = StaticMap;

  StaticMap.supported = function supported () {
    return mapboxgl.supported();
  };

  StaticMap.prototype.componentDidMount = function componentDidMount () {
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

    select(map.getCanvas()).style('outline', 'none');

    this._map = map;
    this._updateMapViewport({}, this.props);
    // this._callOnChangeViewport(map.transform);
    this._updateQueryParams(mapStyle);
  };

  // New props are comin' round the corner!
  StaticMap.prototype.componentWillReceiveProps = function componentWillReceiveProps (newProps) {
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
  StaticMap.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  };

  StaticMap.prototype.componentDidUpdate = function componentDidUpdate () {
    // map.resize() reads size from DOM, we need to call after render
    this._updateMapSize(this.state, this.props);
  };

  StaticMap.prototype.componentWillUnmount = function componentWillUnmount () {
    if (this._map) {
      this._map.remove();
    }
  };

  // External apps can access map this way
  StaticMap.prototype._getMap = function _getMap () {
    return this._map;
  };

  StaticMap.prototype._updateStateFromProps = function _updateStateFromProps (oldProps, newProps) {
    mapboxgl.accessToken = newProps.mapboxApiAccessToken;
    var startDragLngLat = newProps.startDragLngLat;
    this.setState({
      startDragLngLat: startDragLngLat && startDragLngLat.slice()
    });
  };

  // Hover and click only query layers whose interactive property is true
  // If no interactivity is specified, query all layers
  StaticMap.prototype._updateQueryParams = function _updateQueryParams (mapStyle) {
    var interactiveLayerIds = getInteractiveLayerIds(mapStyle);
    this._queryParams = interactiveLayerIds.length === 0 ? {} :
      {layers: interactiveLayerIds};
  };

  // Update a source in the map style
  StaticMap.prototype._updateSource = function _updateSource (map, update) {
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
  StaticMap.prototype._setDiffStyle = function _setDiffStyle (prevStyle, nextStyle) {
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

  StaticMap.prototype._updateMapStyle = function _updateMapStyle (oldProps, newProps) {
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

  StaticMap.prototype._updateMapViewport = function _updateMapViewport (oldProps, newProps) {
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
  StaticMap.prototype._updateMapSize = function _updateMapSize (oldProps, newProps) {
    var sizeChanged =
      oldProps.width !== newProps.width || oldProps.height !== newProps.height;

    if (sizeChanged) {
      this._map.resize();
      // this._callOnChangeViewport(this._map.transform);
    }
  };

  StaticMap.prototype._getFeatures = function _getFeatures (ref) {
    var pos = ref.pos;
    var radius = ref.radius;

    var features;
    if (radius) {
      // Radius enables point features, like marker symbols, to be clicked.
      var size = radius;
      var bbox = [[pos[0] - size, pos[1] - size], [pos[0] + size, pos[1] + size]];
      features = this._map.queryRenderedFeatures(bbox, this._queryParams);
    } else {
      var point = new (Function.prototype.bind.apply( Point, [ null ].concat( pos) ));
      features = this._map.queryRenderedFeatures(point, this._queryParams);
    }
    return features;
  };

  // HOVER AND CLICK

  StaticMap.prototype._onMouseMove = function _onMouseMove (ref) {
    var pos = ref.pos;

    if (this.props.onHover) {
      var latLong = this.props.unproject(pos);
      this.props.onHover(latLong, pos);
    }
    if (this.props.onHoverFeatures) {
      var features = this._getFeatures({pos: pos});
      if (!features.length && this.props.ignoreEmptyFeatures) {
        return;
      }
      this.setState({isHovering: features.length > 0});
      this.props.onHoverFeatures(features);
    }
  };

  StaticMap.prototype._onMouseClick = function _onMouseClick (ref) {
    var pos = ref.pos;

    if (this.props.onClick) {
      var latLong = this.props.unproject(pos);
      // TODO - Do we really want to expose a mapbox "Point" in our interface?
      // const point = new Point(...pos);
      this.props.onClick(latLong, pos);
    }

    if (this.props.onClickFeatures) {
      var features = this._getFeatures({pos: pos, radius: this.props.clickRadius});
      if (!features.length && this.props.ignoreEmptyFeatures) {
        return;
      }
      this.props.onClickFeatures(features);
    }
  };

  StaticMap.prototype.render = function render () {
    var ref = this.props;
    var className = ref.className;
    var width = ref.width;
    var height = ref.height;
    var style = ref.style;

    var mapContainerStyle = Object.assign({}, style, {width: width, height: height, position: 'relative'});
    var mapStyle = Object.assign({}, style, {width: width, height: height});
    var overlayContainerStyle = {position: 'absolute', left: 0, top: 0};

    // Note: a static map still handles clicks and hover events
    return (
      React.createElement( 'div', { style: mapContainerStyle, onMouseMove: this._onMouseMove, onMouseClick: this._onMouseClick },

        React.createElement( 'div', { key: "map", ref: "mapboxMap", style: mapStyle, className: className }),
        React.createElement( 'div', { key: "overlays", className: "overlays", style: overlayContainerStyle },
          this.props.children
        )

      )
    );
  };

  return StaticMap;
}(Component));

export default StaticMap;

StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
