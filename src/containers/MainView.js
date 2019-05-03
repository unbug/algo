/* eslint-disable react/no-unescaped-entities*/
import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import BaseView from './BaseView';
import MainModel from '../models/MainModel';
import { genPath } from '../constants/RouterConstants';
import RouterConstants from '../constants/RouterConstants';
import TreeGrid from '../components/main-view/TreeGrid';
import TreeHorizontal from '../components/main-view/TreeHorizontal';
import TreeRadial from '../components/main-view/TreeRadial';
import URLsConstants from '../constants/URLsConstants';

export default class MainView extends React.Component {

  state = {
    type: 'horizontal',
    query: null,
    tree: MainModel.tree,
    loadedFromLocal: MainModel.loadedFromLocal,
    localAvailable: MainModel.localAvailable,
    arrayTree: [],
    standardTree: [],
    standardTree2: [],
    filterTags: [],
  }

  constructor(props) {
    super(props);
    MainModel.onUpdated(this.handleMainModelUpdate);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  componentDidMount() {
    this.onRouteChanged();
    !this.state.tree ? MainModel.requestTree() : MainModel.loadFromLocal();
  }

  onRouteChanged() {
    // search
    const { type, query } = this.props.match.params;
    const newState = {
      type: type
    }
    if (!newState.type) {
      newState.type = 'horizontal';
      this.setState(newState);
      return;
    }
    // update arrayTree for radial
    if (/radial/ig.test(type) && this.state.query != query) {
      newState.query = query;
      newState.arrayTree = MainModel.getArrayTree(query);
      newState.standardTree2 = MainModel.getStandardTree(query || 6);
    }
    this.setState(newState);
  }

  gotoPage(query) {
    this.props.history.push(genPath(RouterConstants.main, {
      ':type': this.state.type,
      ':query': query
    }));
  }

  handleMainModelUpdate = (curr, prev, mutation) => {
    if (mutation.tree ||
      mutation.loadedFromLocal ||
      mutation.localAvailable) {
      this.setState({
        selectedNode: MainModel.selectedNode,
        loadedFromLocal: MainModel.loadedFromLocal,
        localAvailable: MainModel.localAvailable,
        tree: MainModel.tree,
        arrayTree: MainModel.getArrayTree(this.state.query || 10),
        filterTags: MainModel.getArrayTree(),
        standardTree: MainModel.getStandardTree(),
        standardTree2: MainModel.getStandardTree(this.state.query || 10),
      });
    }
  }

  handlePutNode(node, parentId) {
    MainModel.saveToLocal();
    return Promise.resolve(node);
  }

  handlePostNode(node, id) {
    MainModel.saveToLocal();
    return Promise.resolve(node);
  }

  handleDeleteNode(id) {
    MainModel.saveToLocal();
    return Promise.resolve();
  }

  handleSaveToLocal = () => {
    MainModel.saveToLocal();
  }

  handleLoadFromLocal = () => {
    MainModel.loadFromLocal();
  }

  handleLoadFromCloud = () => {
    URLsConstants.updateCacheId();
    MainModel.requestTree();
  }

  handleDownload = (type) => {
    if (type == 'csv') {
      MainModel.downloadCSV();
    } else {
      MainModel.download();
    }
  }

  handleUpdateArrayNodes = num => {
    this.gotoPage(Math.max(parseInt(this.state.query) + num, 6));
  }

  handleSaveEditPass = val => {
    MainModel.saveEditPass(val);
  }

  render() {
    return (
      <BaseView title='Algo' className='main-view' {...this.props} fluid>
        <TreeGrid
          {...this.state}
          active={this.state.type === 'grid'}
          onPutNode={this.handlePutNode}
          onPostNode={this.handlePostNode}
          onDeleteNode={this.handleDeleteNode}
          onDownload={this.handleDownload}
          onSaveToLocal={this.handleSaveToLocal}
          onLoadFromCloud={this.handleLoadFromCloud}
          onLoadFromLocal={this.handleLoadFromLocal} />
        <TreeRadial
          active={this.state.type === 'radial'}
          tree={this.state.tree}
          data={this.state.arrayTree}
          filterTags={this.state.filterTags}
          onUpdateArrayNodes={this.handleUpdateArrayNodes} />
        <TreeHorizontal
          active={this.state.type === 'horizontal'}
          data={this.state.standardTree}
          filterTags={this.state.filterTags} />
        <div className='nav-bar'>
          <Menu pointing secondary>
            <Menu.Item
              name='horizontal'
              active={this.state.type === 'horizontal'}
              as='a' href='#/'>
              <Icon name='home' />
              <span>Home</span>
            </Menu.Item>
            <Menu.Item
              name='radial'
              active={this.state.type === 'radial'}
              as='a' href='#/type=radial&query=6'>
              <Icon name='code branch' />
              <span>Radial</span>
            </Menu.Item>
            <Menu.Item
              name='grid'
              active={this.state.type === 'grid'}
              as='a' href='#/type=grid&query='>
              <Icon name='pencil' />
              <span>Editor</span>
            </Menu.Item>
            <Menu.Item
              name='grid'
              as='a' href='https://github.com/unbug/algo' target='_blank' rel='noopener noreferrer'>
              <Icon name='github alternate' />
              <span>GitHub</span>
            </Menu.Item>
          </Menu>
        </div>
      </BaseView>
    )
  }
}
