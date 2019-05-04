import * as Tools from './Tools';

function hasChild(n) {
  return n && n.children && n.children.length;
}

function findNode(str, node) {
  if (node.name.includes(str)) {
    return true;
  }
  if (node.children && node.children.length && node.children.find(n => findNode(str, n))) {
    return true;
  }
  return false;
}

function formatSubCategory(children, res = []) {
  children && children.forEach(key => {
    res.push(key);
    return formatSubCategory(key.children, res);
  });
  return res;
}

export const serializeNode = (node, parent) => {
  node.id = node.id || Tools.uuid(8);
  node.parentId = node.parentId || '';
  if (parent) {
    node.parentId = node.parentId || parent.id || '';
  }
  node.children = node.children || [];
  node.description = node.description || '';
  return node;
}

export const serializeTree = (node, parent) => {
  node = serializeNode(node, parent);
  hasChild(node) && node.children.forEach(n => serializeTree(n, node));
  return node;
}

export const sortTree = node => {
  hasChild(node) && node.children.sort((a, b) => {
    if (hasChild(b) || hasChild(a)) {
      if (hasChild(b)) {
        return 1;
      }
      if (hasChild(a)) {
        return -1;
      }
    }
    if (a.name.charAt() > b.name.charAt()) {
      return 1;
    }
    if (a.name.charAt() < b.name.charAt()) {
      return -1;
    }
    return 0;
  });
  hasChild(node) && node.children.forEach(n => sortTree(n));
  return node;
}

export const treeToCategory = tree => {
  return !tree.children
    ? []
    : tree.children.map(cat => {
      cat.children = formatSubCategory(cat.children);
      return cat;
    });
}

export const filterTree = (str, node, parent) => {
  if (!parent) {
    let newRoot = {
      id: node.id + '',
      parentId: node.parentId === -1 ? '' : (node.parentId + ''),
      name: 'Algo',
      children: [],
      description: node.description || ''
    };
    node.children.forEach(n => filterTree(str, n, newRoot));
    return newRoot;
  }
  if (findNode(str, node)) {
    const newNode = {
      id: node.id + '',
      parentId: node.parentId === -1 ? '' : (node.parentId + ''),
      name: node.name,
      children: [],
      description: node.description || ''
    }
    parent.children.push(newNode);
    if (node.children && node.children.length) {
      node.children.forEach(n => filterTree(str, n, newNode));
    }
  }
}

export const standardizeTree = (node, len) => {
  let newNode = {
    name: node.name,
    id: node.id,
    parentId: node.parentId || '',
    children: [],
    description: node.description || ''
  };
  if (node.children) {
    newNode.children = node.children.slice(0, len || node.children.length).map(s => standardizeTree(s, len));
  }
  return newNode;
}

export const treeToArray = (node, res = [], len) => {
  res.push({
    id: node.id + '',
    parentId: node.parentId === -1 ? '' : (node.parentId + ''),
    name: node.name,
  });
  if (node.children) {
    node.children.slice(0, len || node.children.length).forEach(s => treeToArray(s, res, len));
  }
  return res;
}

export const treeToTable = (node, res = [['name', 'parent']], parent = { name: 'root' }) => {
  res.push([node.name, parent.name]);
  if (node.children) {
    node.children.slice(0, node.children.length).forEach(s => treeToTable(s, res, node));
  }
  return res;
}
