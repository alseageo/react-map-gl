import {Map} from 'immutable';

export function getInteractiveLayerIds(mapStyle) {
  var interactiveLayerIds = [];

  if (Map.isMap(mapStyle) && mapStyle.has('layers')) {
    interactiveLayerIds = mapStyle.get('layers')
      .filter(function (l) { return l.get('interactive'); })
      .map(function (l) { return l.get('id'); })
      .toJS();
  } else if (Array.isArray(mapStyle.layers)) {
    interactiveLayerIds = mapStyle.layers.filter(function (l) { return l.interactive; })
      .map(function (l) { return l.id; });
  }

  return interactiveLayerIds;
}
