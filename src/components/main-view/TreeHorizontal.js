/* eslint-disable react/no-unescaped-entities, no-unused-vars*/
import React, { useRef, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import SvgSaver from 'svgsaver';
import FilterBar from './FilterBar';
import * as TreeHandler from '../../utils/TreeHandler';

// source code: https://beta.observablehq.com/@mbostock/collapsible-tree
// Drag and Drop, Zoomable, Panning, Collapsible Tree with auto-sizing: http://bl.ocks.org/robschmuecker/7880033
let width = document.body.offsetWidth * 1.2;
let dx = 10;
let dy = Math.min(200, width / 8);
let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
let margin = ({ top: 10, right: 120, bottom: 10, left: 40 });
let tree = d3.tree().nodeSize([dx, dy]);

let chart = (data, collapse) => {
  const root = d3.hierarchy(data);

  root.x0 = dy / 2;
  root.y0 = 0;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && collapse) d.children = null;
  });
  let colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, 12]); // https://github.com/d3/d3-scale-chromatic
  // assign a group to the descendants of level 2, which we use for coloring
  let colorGroups = root.descendants().filter(function (node) { return node.depth === 1 });
  colorGroups.forEach(function (group, i) {
    group.descendants().forEach(function (node) { node.data.group = i; })
  });

  const svg = d3.create('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .style('background-color', '#fff')
    .attr('title', 'tree-horizontal')
    .attr('width', width)
    .attr('height', dx)
    .attr('viewBox', [-margin.left, -margin.top, width, dx])
    .style('font', '10px sans-serif')
    .style('user-select', 'none');

  const gLink = svg.append('g')
    .attr('fill', 'none')
    .attr('stroke', '#a333c8')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5);

  const gNode = svg.append('g')
    .attr('cursor', 'pointer');

  function update(source) {
    const duration = d3.event && d3.event.altKey ? 2500 : 250;
    const nodes = root.descendants().reverse();
    const links = root.links();

    // Compute the new tree layout.
    tree(root);

    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });

    const height = right.x - left.x + margin.top + margin.bottom;

    const transition = svg.transition()
      .duration(duration)
      .attr('height', height)
      .attr('viewBox', [-margin.left, left.x - margin.top, width, height])
      .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch('toggle'));

    // Update the nodes…
    const node = gNode.selectAll('g')
      .data(nodes, d => d.id);

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .on('click', d => {
        d.children = d.children ? null : d._children;
        d.children?.forEach(n => { n.data.group = d.data.group });
        update(d);
      });

    nodeEnter.append('circle')
      .attr('r', 4)
      .attr('fill', d => {
        return d._children ? colorScale(d.data.group) : '#d4d4d5';
      });

    nodeEnter.append('text')
      .attr('dy', '0.31em')
      .style('font-weight', 'bold')
      .attr('x', d => d._children ? -6 : 6)
      .attr('text-anchor', d => d._children ? 'end' : 'start')
      .text(d => d.data.name)
      .clone(true).lower()
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .attr('stroke', 'white');

    nodeEnter.append('title')
      .text(d => d.data?.description || '');

    // Transition nodes to their new position.
    const nodeUpdate = node.merge(nodeEnter).transition(transition)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1);

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node.exit().transition(transition).remove()
      .attr('transform', d => `translate(${source.y},${source.x})`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0);

    // Update the links…
    const link = gLink.selectAll('path')
      .data(links, d => d.target.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().append('path')
      .attr('d', d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      })
      .style('stroke', function (d) { return colorScale(d.target.data.group) });

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
      .attr('d', diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
      .attr('d', d => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);

  return svg.node();
}

export default function TreeHorizontal(props) {
  const bodyEl = useRef(null);
  let collapse = false;
  let filterData = null;
  let svg = null;

  useEffect(() => {
    renderTree();
  }, [props.data]);

  const handleFilter = val => {
    if (val.length) {
      collapse = false;
      filterData = TreeHandler.filterTree(val, props.data);
      setTimeout(() => renderTree(filterData));
    } else {
      filterData = null;
      collapse = true;
      setTimeout(() => renderTree());
    }
  }

  const handleToggleCollapse = () => {
    collapse = !collapse;
    setTimeout(() => renderTree(filterData));
  }

  const handleSaveImage = () => {
    svg && (new SvgSaver()).asPng(svg);
  }

  const handleSaveSVG = () => {
    svg && (new SvgSaver()).asSvg(svg);
  }

  function renderTree(data) {
    data = data || props.data;
    if (data && bodyEl.current) {
      bodyEl.current.scrollLeft = 0;
      bodyEl.current.innerHTML = '';
      svg = chart(data, collapse);
      bodyEl.current.appendChild(svg);
    }
  }

  let style = {};
  if (!props.active) {
    style.display = 'none';
  }

  return (
    <div className='tree-horizontal' style={style}>
      <FilterBar data={props.filterTags} onFilter={handleFilter} />
      <div className='tree-horizontal__body' ref={bodyEl}></div>
      <div className='menu-bar'>
        <Button size='medium' circular icon={collapse ? 'circle outline' : 'circle'}
          onClick={handleToggleCollapse} title='Toggle Collapse All' />
        <Button size='medium' circular icon='image'
          onClick={handleSaveImage} title='Download as Image' />
        <Button size='medium' circular icon='cloud download'
          onClick={handleSaveSVG} title='Download as SVG' />
      </div>
    </div>
  );
}
