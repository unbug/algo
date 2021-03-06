/* eslint-disable react/no-unescaped-entities*/
import React, { useEffect, useState } from 'react';
import { Button, Grid, Icon, Input, Label, List, Modal, Popup, Segment, Message, TextArea, Form, Divider } from 'semantic-ui-react';
import ErrorModel from "../../models/ErrorModel";
import * as TreeHandler from './../../utils/TreeHandler';

function TreeColumn(props) {
  const [selectLabel, setSelectLabel] = useState(null);
  const [waitToRemove, setWaitToRemove] = useState(null);
  const [removeTimer, setRemoveTimer] = useState(0);

  function handleLabelClick(node) {
    setSelectLabel(node.id);
    props.onLabelClick(node);
  }

  function handleLabelRemove(node) {
    clearTimeout(removeTimer);
    if (waitToRemove == node.id) {
      props.onLabelRemove(node);
    } else {
      setWaitToRemove(node.id);
      setRemoveTimer(setTimeout(() => setWaitToRemove(null), 3000));
    }
  }

  function handleLabelEdit(node, parent) {
    props.onLabelEdit(node, parent);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrag(e, data) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('node', JSON.stringify(data));
  }

  function handleDrop(e) {
    e.preventDefault();
    props.onLabelMove(JSON.parse(e.dataTransfer.getData('node')), props.node);
  }

  function renderLabels() {
    if (!props.childs || !props.childs.length) {
      return 'No children found.';
    }
    return Array.prototype.map.call(props.childs, (key, idx) => {
      const selected = key.id == selectLabel;
      const color = selected ? 'black' : 'gray';
      const isLeaf = !key.children || !key.children.length;
      return (
        <List.Item key={idx} className='tree-grid__label' draggable={!selected} onDragStart={(e) => handleDrag(e, key)}>
          <Popup
            key={key.id}
            trigger={
              <Label key={key.id} style={{ margin: '0.3rem 0.2rem 0 0' }} color={color} circular
                className={`tree-grid__label-name ${key.isNew ? 'tree-grid__label-name--new' : ''} pointer-link`}
                onClick={() => handleLabelClick(key)}>
                {isLeaf ? '' : <Icon name='code branch' />}
                {key.name}
              </Label>
            }
            className='tree-grid__label-popup'
            hoverable={true}
            position='right center'>
            <div className='tree-grid__label-desc'>{key.description}</div>
            {!key.description ? '' : <Divider />}
            <Button size='mini' circular icon='pencil'
              color='gray'
              title='Edit'
              className='tree-grid__label-edit pointer-link'
              onClick={() => handleLabelEdit(key, props.node)} />
            <Button size='mini' circular icon='minus'
              color={waitToRemove == key.id ? 'red' : 'gray'}
              title='Remove'
              className='tree-grid__label-remove pointer-link'
              onClick={() => handleLabelRemove(key)} />
          </Popup>
        </List.Item>
      );
    });
  }

  return (
    <Grid.Column width={2} style={{ padding: 0, paddingRight: '0.4rem' }} onDragOver={handleDragOver} onDrop={handleDrop}>
      <Label circular floating
        color='gray' className='pointer-link'
        onClick={() => props.onLabelAdd(props.node)}><Icon name='plus' style={{ margin: '0' }} /></Label>
      <div style={{ textAlign: 'center' }}>{props.childs ? props.childs.length : 0}</div>
      <Segment className='tree-grid__col' style={{ padding: '0.2rem' }}>
        {renderLabels()}
      </Segment>
    </Grid.Column>
  );
}

export default function TreeGrid(props) {
  const [columns, setColumns] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [parentNode, setParentNode] = useState(null);
  const [editNode, setEditNode] = useState(null);

  useEffect(() => {
    if (props.tree) {
      setColumns([props.tree]);
    }
  }, [props.tree]);

  function resetFormInputs(node) {
    if (node) {
      setEditName(node.name);
      setEditDesc(node.description);
    } else {
      setEditName('');
      setEditDesc('');
    }
  }

  function getFormInput() {
    return {
      name: editName,
      description: editDesc
    }
  }

  function handleLabelClick(node) {
    let column = columns.find(col => col.parentId === node.parentId);
    if (column) {
      columns.splice(columns.indexOf(column), columns.length, node);
    } else {
      columns.push(node);
    }
    setColumns([...columns]);
  }

  function handleLabelAdd(node) {
    setParentNode(node);
    setOpenEditModal(true);
    resetFormInputs();
  }

  function handleLabelEdit(node, parent) {
    setEditNode(node);
    setParentNode(parent);
    setOpenEditModal(true);
    resetFormInputs(node);
  }

  function handleLabelRemove(node) {
    let column = columns.find(col => col.id === node.parentId);
    if (column) {
      // remove the children from columns
      let pcolumn = columns.find(col => col.id === node.id);
      pcolumn && columns.splice(columns.indexOf(pcolumn), columns.length);

      // remove it from parent node
      column.children.splice(column.children.indexOf(node), 1);
      props.onDeleteNode(node.id);
    }
    setColumns([...columns]);
  }

  function handleLabelMove(node, parent) {
    const { id, parentId } = node;
    if (parent && parent.id != id && parent.id != parentId) {
      // find the source column of the node
      const column = columns.find(col => col.id === parentId);
      // find the target column to move to
      const nColumn = columns.find(col => col.id === parent.id);
      if (column && nColumn) {
        // remove the children from columns
        const pcolumn = columns.find(col => col.id === node.id);
        pcolumn && columns.splice(columns.indexOf(pcolumn), columns.length);

        // remove it from parent node
        node = column.children.find(n => n.id == node.id);
        column.children.splice(column.children.indexOf(node), 1);

        // add the node to the target column
        node.parentId = parent.id;
        parent.children.push(node);
        props.onMoveNode(node.id, parent.id);
      }
      setColumns([...columns]);
    }
  }

  function handleEditModalInputKeydown(e) {
    if (!openEditModal) {
      return;
    }
    switch (e.which) {
      // press Enter
      case 13:
        handleEditModalDone();
        break;
    }
  }

  function handleEditModalInputChange(e, data) {
    setEditName(data.value.trim());
  }

  function handleEditModalDescChange(e, data) {
    setEditDesc(data.value.trim());
  }

  function handleEditModalClose() {
    setOpenEditModal(false);
    setTimeout(() => {
      setEditNode(null);
      setParentNode(null);
    }, 2000)
  }

  function handleEditModalDone() {
    const parent = parentNode;
    const edit = editNode;
    if (parent && editName.length) {
      if (parent.children && parent.children.find(n => n.name === editName && n !== editNode)) {
        ErrorModel.error = new Error(`"${editName}" already exist in the children list!`);
        return;
      }
      // edit node
      if (edit) {
        const newNode = getFormInput();
        edit.isNew = true;
        edit.name = newNode.name;
        edit.description = newNode.description;
        props.onPostNode(newNode, edit.id).then(() => {
          setColumns([...columns]);
        });
      } else { // add new node
        parent.children = parent.children || [];
        const newNode = TreeHandler.serializeNode(getFormInput(), parent);
        newNode.isNew = true;
        parent.children.unshift(newNode);
        props.onPutNode(newNode, parent.id).then(() => {
          setColumns([...columns]);
        });
      }
    }
    setEditNode(null);
    setParentNode(null);
    setOpenEditModal(false);
  }

  if (!props.tree) {
    return '';
  }
  let style = { height: 'calc(100vh - 13rem)' };
  if (!props.active) {
    style.display = 'none';
  }
  return (
    <Grid style={style} className='tree-grid'>
      {columns.map(node => <TreeColumn
        key={node.id} node={node} childs={node.children}
        onLabelClick={handleLabelClick}
        onLabelRemove={handleLabelRemove}
        onLabelAdd={handleLabelAdd}
        onLabelEdit={handleLabelEdit}
        onLabelMove={handleLabelMove} />
      )}
      <div className='menu-bar' style={{ padding: 0 }}>
        <Button size='medium' circular icon='sync'
          onClick={props.onLoadFromCloud} title='Load from cloud' />
        <Button size='medium' circular icon='save'
          color={props.loadedFromLocal ? 'green' : (props.localAvailable ? 'yellow' : 'gray')}
          onClick={props.onSaveToLocal} title='Save to local' />
        <Button size='medium' circular icon='cloud upload'
          color={props.loadedFromLocal ? 'green' : (props.localAvailable ? 'yellow' : 'gray')}
          onClick={props.onLoadFromLocal} title='Load from local' />
        <Button size='medium' circular icon='cloud download'
          onClick={props.onDownload} title='Download JSON' />
      </div>
      <Modal size='tiny' open={openEditModal}
        onClose={handleEditModalClose} onActionClick={handleEditModalInputChange}>
        <Modal.Header>{editNode ? 'Edit node' : 'Add a new node'}</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            placeholder='node text...'
            defaultValue={editName}
            onChange={handleEditModalInputChange}
            onKeyDown={handleEditModalInputKeydown}
          />
          <br />
          <Form>
            <TextArea
              style={{ minHeight: 100, width: '100%' }}
              placeholder='node description...'
              defaultValue={editDesc}
              onChange={handleEditModalDescChange}
            />
          </Form>
          <Message size='tiny' color='green'>Add, edit and remove will be automatically save to local.</Message>
        </Modal.Content>
        <Modal.Actions>
          <Button positive icon='checkmark' labelPosition='right' content='Done' onClick={handleEditModalDone} />
        </Modal.Actions>
      </Modal>
    </Grid>
  )
}
