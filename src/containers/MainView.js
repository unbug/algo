/* eslint-disable react/no-unescaped-entities*/
import React, { useReducer, useEffect } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import BaseView from './BaseView';
import MainModel from '../models/MainModel';
import { genPath } from '../constants/RouterConstants';
import RouterConstants from '../constants/RouterConstants';
import TreeGrid from '../components/main-view/TreeGrid';
import TreeHorizontal from '../components/main-view/TreeHorizontal';
import TreeRadial from '../components/main-view/TreeRadial';
import URLsConstants from '../constants/URLsConstants';

const actionTypes = {
  UPDATE: 'update',
};

const initState = {
  type: 'horizontal',
  query: null,
  tree: MainModel.tree,
  loadedFromLocal: MainModel.loadedFromLocal,
  localAvailable: MainModel.localAvailable,
  arrayTree: [],
  standardTree: [],
  standardTree2: [],
  filterTags: [],
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.UPDATE:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

export default function MainView(props) {
  const [state, dispatch] = useReducer(reducer, initState);
  useEffect(() => {
    MainModel.onUpdated(handleMainModelUpdate);
    return () => {
      MainModel.offUpdated(handleMainModelUpdate);
    }
  });
  useEffect(() => onRouteChanged(), [props.location]);
  useEffect(() => {
    !state.tree ? MainModel.requestTree() : MainModel.loadFromLocal();
  }, []);

  function setState(payload) {
    dispatch({ type: actionTypes.UPDATE, payload: payload });
  }

  function onRouteChanged() {
    // search
    const { type, query } = props.match.params;
    const newState = {
      type: type
    }
    if (!newState.type) {
      newState.type = 'horizontal';
      setState(newState);
      return;
    }
    // update arrayTree for radial
    if (/radial/ig.test(type) && state.query != query) {
      newState.query = query;
      newState.arrayTree = MainModel.getArrayTree(query);
      newState.standardTree2 = MainModel.getStandardTree(query || 20);
    }
    setState(newState);
  }

  function gotoPage(query) {
    props.history.push(genPath(RouterConstants.main, {
      ':type': state.type,
      ':query': query
    }));
  }

  function handleMainModelUpdate(curr, prev, mutation) {
    if (mutation.tree ||
      mutation.loadedFromLocal ||
      mutation.localAvailable) {
      setState({
        selectedNode: MainModel.selectedNode,
        loadedFromLocal: MainModel.loadedFromLocal,
        localAvailable: MainModel.localAvailable,
        tree: MainModel.tree,
        arrayTree: MainModel.getArrayTree(state.query || 20),
        filterTags: MainModel.getArrayTree(),
        standardTree: MainModel.getStandardTree(),
        standardTree2: MainModel.getStandardTree(state.query || 20),
      });
    }
  }

  function handlePutNode(node, parentId) {
    MainModel.saveToLocal();
    return Promise.resolve(node);
  }

  function handlePostNode(node, id) {
    MainModel.saveToLocal();
    return Promise.resolve(node);
  }

  function handleDeleteNode(id) {
    MainModel.saveToLocal();
    return Promise.resolve();
  }

  function handleMoveNode(id, parentId) {
    MainModel.saveToLocal();
    return Promise.resolve();
  }

  function handleSaveToLocal() {
    if (!window.confirm('Are you sure you to overwrite local copy with the cloud copy?')) { return; }
    MainModel.saveToLocal();
  }

  function handleLoadFromLocal() {
    MainModel.loadFromLocal();
  }

  function handleLoadFromCloud() {
    URLsConstants.updateCacheId();
    MainModel.requestTree();
  }

  function handleDownload(type) {
    if (type == 'csv') {
      MainModel.downloadCSV();
    } else {
      MainModel.download();
    }
  }

  function handleUpdateArrayNodes(num) {
    gotoPage(Math.max(parseInt(state.query) + num, 6));
  }

  return (
    <BaseView className='main-view' {...props} fluid>
      <TreeGrid
        {...state}
        active={state.type === 'grid'}
        onPutNode={handlePutNode}
        onPostNode={handlePostNode}
        onDeleteNode={handleDeleteNode}
        onMoveNode={handleMoveNode}
        onDownload={handleDownload}
        onSaveToLocal={handleSaveToLocal}
        onLoadFromCloud={handleLoadFromCloud}
        onLoadFromLocal={handleLoadFromLocal} />
      <TreeRadial
        active={state.type === 'radial'}
        tree={state.tree}
        data={state.arrayTree}
        filterTags={state.filterTags}
        onUpdateArrayNodes={handleUpdateArrayNodes} />
      <TreeHorizontal
        active={state.type === 'horizontal'}
        data={state.standardTree}
        filterTags={state.filterTags} />
      <div className='nav-bar'>
        <Menu pointing secondary>
          <Menu.Item
            name='horizontal'
            active={state.type === 'horizontal'}
            as='a' href='#/'>
            <Icon name='home' />
            <span>Home</span>
          </Menu.Item>
          <Menu.Item
            name='radial'
            active={state.type === 'radial'}
            as='a' href='#/type=radial&query=20'>
            <Icon name='code branch' />
            <span>Radial</span>
          </Menu.Item>
          <Menu.Item
            name='grid'
            active={state.type === 'grid'}
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
