import React, {Component} from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import autobind from '../utils/autobind';

import StaticMap from './static-map';
import MapControls from './map-controls';

import {mod, cloneTransform} from '../utils/transform';
// import {unprojectFromTransform} from './utils/transform';
import mapboxgl, {Point} from 'mapbox-gl';

var InteractiveMap = (function (Component) {
  function InteractiveMap(props) {
    Component.call(this, props);
    this.state = {viewport: {}};
    autobind(this);
  }

  if ( Component ) InteractiveMap.__proto__ = Component;
  InteractiveMap.prototype = Object.create( Component && Component.prototype );
  InteractiveMap.prototype.constructor = InteractiveMap;

  // Pure render
  InteractiveMap.supported = function supported () {
    return mapboxgl.supported();
  };

  InteractiveMap.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  };

  InteractiveMap.prototype._getMap = function _getMap () {
    return this.refs.map._map;
  };

  // Uses map to unproject a coordinate
  // TODO - replace with Viewport
  InteractiveMap.prototype._unproject = function _unproject (pos) {
    var ref = this._unprojectToLatLng(pos);
    var lng = ref.lng;
    var lat = ref.lat;
    return [lng, lat];
  };

  InteractiveMap.prototype._unprojectToLatLng = function _unprojectToLatLng (pos) {
    var map = this._getMap();
    var point = new (Function.prototype.bind.apply( Point, [ null ].concat( pos) ));
    var latLong = map.unproject(point);
    return latLong;
  };

  // Uses map to get position for panning
  // TODO - replace with Viewport
  InteractiveMap.prototype._getLngLatAtPoint = function _getLngLatAtPoint (ref) {
    var lngLat = ref.lngLat;
    var pos = ref.pos;

    // assert(point);
    var map = this._getMap();
    var transform = cloneTransform(map.transform);
    var mapboxPoint = new (Function.prototype.bind.apply( Point, [ null ].concat( pos) ));
    // const around = unprojectFromTransform(transform, mapboxPoint);
    transform.setLocationAtPoint(lngLat, mapboxPoint);
    return [
      mod(transform.center.lng + 180, 360) - 180,
      transform.center.lat
    ];
  };

  InteractiveMap.prototype.render = function render () {
    // TODO - do we still need this?
    // let content = [];
    // if (this.state.isSupported && this.props.onChangeViewport) {
    //   content = (}

    return (
      React.createElement( MapControls, Object.assign({},
        this.props, { unproject: this._unproject, getLngLatAtPoint: this._getLngLatAtPoint }),

        React.createElement( StaticMap, Object.assign({}, { ref: "map" }, this.props))

      )
    );
  };

  return InteractiveMap;
}(Component));

export default InteractiveMap;
