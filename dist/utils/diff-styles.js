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

/* eslint-disable max-statements */
export function diffSources(prevStyle, nextStyle) {
  var prevSources = prevStyle.get('sources');
  var nextSources = nextStyle.get('sources');
  var enter = [];
  var update = [];
  var exit = [];
  var prevIds = prevSources.keySeq().toArray();
  var nextIds = nextSources.keySeq().toArray();
  for (var i = 0, list = prevIds; i < list.length; i += 1) {
    var id = list[i];

    var nextSource = nextSources.get(id);
    if (nextSource) {
      if (!nextSource.equals(prevSources.get(id))) {
        update.push({id: id, source: nextSources.get(id)});
      }
    } else {
      exit.push({id: id, source: prevSources.get(id)});
    }
  }
  for (var i$1 = 0, list$1 = nextIds; i$1 < list$1.length; i$1 += 1) {
    var id$1 = list$1[i$1];

    var prevSource = prevSources.get(id$1);
    if (!prevSource) {
      enter.push({id: id$1, source: nextSources.get(id$1)});
    }
  }
  return {enter: enter, update: update, exit: exit};
}
/* eslint-enable max-statements */

export function diffLayers(prevStyle, nextStyle) {
  var prevLayers = prevStyle.get('layers');
  var nextLayers = nextStyle.get('layers');
  var updates = [];
  var exiting = [];
  var prevMap = {};
  var nextMap = {};
  nextLayers.forEach(function (layer, index) {
    var id = layer.get('id');
    var layerImBehind = nextLayers.get(index + 1);
    nextMap[id] = {
      layer: layer,
      id: id,
      // The `id` of the layer before this one.
      before: layerImBehind ? layerImBehind.get('id') : null,
      enter: true
    };
  });
  prevLayers.forEach(function (layer, index) {
    var id = layer.get('id');
    var layerImBehind = prevLayers.get(index + 1);
    prevMap[id] = {
      layer: layer,
      id: id,
      before: layerImBehind ? layerImBehind.get('id') : null
    };
    if (nextMap[id]) {
      // Not a new layer.
      nextMap[id].enter = false;
    } else {
      // This layer is being removed.
      exiting.push(prevMap[id]);
    }
  });
  for (var i = 0, list = nextLayers.reverse(); i < list.length; i += 1) {
    var layer = list[i];

    var id = layer.get('id');
    if (
      !prevMap[id] ||
      !prevMap[id].layer.equals(nextMap[id].layer) ||
      prevMap[id].before !== nextMap[id].before
    ) {
      // This layer is being changed.
      updates.push(nextMap[id]);
    }
  }
  return {updates: updates, exiting: exiting};
}

export default function diffStyle(prevStyle, nextStyle) {
  return {
    sourcesDiff: diffSources(prevStyle, nextStyle),
    layersDiff: diffLayers(prevStyle, nextStyle)
  };
}
