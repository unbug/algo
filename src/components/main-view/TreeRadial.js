/* eslint-disable react/no-unescaped-entities, no-unused-vars*/
import React, { useEffect, useRef } from 'react';
import { Button } from 'semantic-ui-react';
import SvgSaver from 'svgsaver';
import cloneDeep from 'lodash/cloneDeep';
import FilterBar from './FilterBar';
import * as TreeHandler from '../../utils/TreeHandler';
import * as Tools from '../../utils/Tools';

function chart(loaded, ctx) {
  // Generic setup
  let width = Math.max(loaded.length * 3, 900);// Math.max(document.body.offsetWidth, document.body.offsetHeight, 2000);
  let height = width;

  let chart = d3.select(ctx)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .style('background-color', '#fff')
    .attr('width', width * 1.25)
    .attr('height', height * 1.25)
    .append('g')
    .attr('transform', 'translate(' + (width / 2 + 150) + ',' + (height / 2 + 100) + ')');

  // generic functions
  let tree = d3.tree()
    .size([360, height / 2])
    .separation(function (a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

  let stratify = d3.stratify();
  let colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, 12]); // https://github.com/d3/d3-scale-chromatic

  let root;        // initial set of loaded data
  let currentRoot; // the currentData being shown

  // load the data
  // d3.csv('./data/cats.csv', function(loaded) {
  // convert the loaded data to a nested structure, and convert
  // it to a tree with the specific settings.
  root = stratify(loaded);
  tree(root);

  // assign a group to the descendants of level 2, which we use for coloring
  let colorGroups = root.descendants().filter(function (node) { return node.depth === 1 });
  colorGroups.forEach(function (group, i) {
    group.descendants().forEach(function (node) { node.data.group = i; })
  });

  // the root and rootKV, are here merely for reference, to make sure we
  // have the correct number of records at any time. Lets clone the root
  // element, so we have a working copy.
  // currentRoot =_.cloneDeep(root);
  currentRoot = cloneDeep(root);

  // render the graph based on the currentRoot
  update();
  // });

  // draw or update the
  function update() {

    // calculate the x,y coordinates of the currentRoot
    tree(currentRoot);

    // create KV for simple access
    let currentRootKV = currentRoot.descendants().reduce(function (kv, el) { kv[el.data.id] = el; return kv }, {});

    // the currentRoot contains the correct XY positions for all the nodes
    // minus the ones that need to be hidden. We don't want to limit the
    // number of nodes for our data elements, since that causes text and lines to
    // `jump` around. So we need to make sure we have the same amount of elements
    // and hide rendering the hidden ones.
    let toRender = root.descendants().map(function (el) {
      if (currentRootKV[el.data.id]) {
        let newNode = currentRootKV[el.data.id];
        return newNode;
      } else {
        // if the child is not in the KV map, it is hidden. We
        // now need to set its position to the calculated position of
        // the first visible parent. In other words, the first one
        // which is in the currentRootKV map.
        let fromRoot = cloneDeep(el);
        let parent = fromRoot.parent;
        while (!currentRootKV[parent.data.id]) {
          parent = parent.parent;
        }
        let newParent = currentRootKV[parent.data.id];

        fromRoot.hidden = true;
        fromRoot.x = newParent.x;
        fromRoot.y = newParent.y;

        // we also set the parents x,y since the lines need to
        // be drawn from this position.
        fromRoot.parent.x = newParent.x;
        fromRoot.parent.y = newParent.y;

        return fromRoot;
      }
    });

    // now that we have to correct data, create the links
    let links = chart.selectAll('.link')
      .data(toRender.slice(1));

    let linksEnter = links.enter().append('path')
      .attr('class', 'link')
      .attr('d', diagonal({ x: 0, y: 0, parent: { x: 0, y: 0 } }))
      .style('stroke', function (d) { return colorScale(d.data.group) });

    links.merge(linksEnter)
      .transition().duration(2000).attr('d', diagonal);

    // create the groups that hold the circle and the text elements
    let nodes = chart.selectAll('.node').data(toRender);

    let nodesEnter = nodes.enter().append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('click', click)

    nodesEnter.append('circle')
      .attr('r', 2.8)
      .style('fill', function (d) { return colorScale(d.data.group) });

    nodesEnter.append('text')
      .attr('dy', '.31em')

    // combine the updated and new nodes
    let nodesUpdate = nodes.merge(nodesEnter);

    // transition the nodes (circles & text)
    nodesUpdate.transition().duration(2000)
      .attr('transform', function (d) { return 'translate(' + project(d.x, d.y) + ')'; })
      .style('opacity', function (d) { return !d.hidden ? 1 : 0 })
      .on('end', function (d) { d.hidden ? d3.select(this).attr('display', 'none') : '' })
      .on('start', function (d) { !d.hidden ? d3.select(this).attr('display', '') : '' });

    nodesUpdate.select('text')
      .attr('x', function (d) { return d.x < 180 === !d.children ? 6 : -6; })
      .text(function (d) { return d.data.name; })
      // we could also tween the anchor see chapter 2
      .style('text-anchor', function (d) {
        // for the right side
        if (d.x < 180 && d.children) return 'end'
        else if (d.x < 180 && !d.children) return 'start'
        // for the left side
        else if (d.x >= 180 && !d.children) return 'end'
        else if (d.x >= 180 && d.children) return 'start'
      })
      .style('font-weight', 'bold')
      .transition().duration(600)
      .attr('transform', function (d) {
        // called once to determine the target value, and tween the values
        return 'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')';
      })
  }

  // on click hide the children, and color the specific node
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;

      // highlight the selected circle
      d3.select(this).select('circle').style('stroke', 'red');
      d3.select(this).select('circle').style('stroke-width', '2');
    } else {
      d.children = d._children;
      d._children = null;

      // reset the highlight
      d3.select(this).select('circle').style('r', 3.5);
      d3.select(this).select('circle').style('stroke', '');
    }
    update();
  }

  // draw a curve line between d and it's parent
  function diagonal(d) {
    return 'M' + project(d.x, d.y)
      + 'C' + project(d.x, (d.y + d.parent.y) / 2)
      + ' ' + project(d.parent.x, (d.y + d.parent.y) / 2)
      + ' ' + project(d.parent.x, d.parent.y);
  }

  // convert the x,y to a position on the circle
  function project(x, y) {
    let angle = (x - 90) / 180 * Math.PI, radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  }

  return chart;
}

export default function TreeRadial(props) {
  const bodyEl = useRef();
  let filterData = [];

  useEffect(() => {
    setTimeout(() => renderTree(), props.active ? 0 : 3000);
  }, [props.data]);

  const handleFilter = val => {
    if (val.length) {
      filterData = TreeHandler.treeToArray(TreeHandler.filterTree(val, props.tree));
      setTimeout(() => renderTree(filterData));
    } else {
      filterData = null;
      setTimeout(() => renderTree());
    }
  }

  const handleSaveImage = () => {
    bodyEl.current && (new SvgSaver()).asPng(bodyEl.current);
  }

  const handleSaveSVG = () => {
    bodyEl.current && (new SvgSaver()).asSvg(bodyEl.current);
  }

  const handleFullscreen = () => {
    if (bodyEl.current) {
      Tools.fullscreen(bodyEl.current.parentNode);
    }
  }

  function renderTree(data) {
    data = data || props.data;
    if (data && data.length && bodyEl.current) {
      bodyEl.current.innerHTML = '';
      chart(data, '.tree-radial__svg');
      try {
        setTimeout(() => {
          let pel = bodyEl.current.parentNode;
          const width = parseInt(bodyEl.current.getAttribute('width'));
          pel.scrollTop = width / 4;
          pel.scrollLeft = width / 7;
        }, 500);
      } catch (e) {
        // todo
      }
    }
  }

  let style = {};
  if (!props.active) {
    style.display = 'none';
  }
  return (
    <div className='tree-radial' style={style}>
      <FilterBar data={props.filterTags} onFilter={handleFilter} />
      <div className='tree-radial__body'>
        <svg ref={bodyEl} title='tree-radial' className='tree-radial__svg'></svg>
      </div>
      <div className='menu-bar'>
        <Button size='medium' circular icon='expand'
          onClick={handleFullscreen} title='Fullscreen' />
        <Button size='medium' circular icon='chevron circle up'
          onClick={() => props.onUpdateArrayNodes(2)} title='Nodes per level +2' />
        <Button size='medium' circular icon='chevron circle down'
          onClick={() => props.onUpdateArrayNodes(-2)} title='Node per level -2' />
        <Button size='medium' circular icon='image'
          onClick={handleSaveImage} title='Download as Image' />
        <Button size='medium' circular icon='cloud download'
          onClick={handleSaveSVG} title='Download as SVG' />
      </div>
    </div>
  );
}
