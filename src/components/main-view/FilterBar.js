/* eslint-disable react/no-unescaped-entities, no-unused-vars*/
import React from 'react';
import { Input } from 'semantic-ui-react';

export default function FilterBar(props) {
  const handleFilter = evt => {
    props.onFilter(evt.target.value.trim());
    evt.target.blur();
  }

  function renderInputList() {
    return props.data.map((item, i) => <option value={item.name} key={i} />);
  }

  if (!props.data.length) { return null; }
  return (
    <div className='tree-filter-bar'>
      <Input
        list='tree-filter-data-list'
        fluid
        icon='search'
        placeholder={`Search in ${props.data.length} nodes...`}
        onKeyPress={e => { e.key === 'Enter' && handleFilter(e) }}
      />
      <datalist id='tree-filter-data-list'>
        {renderInputList()}
      </datalist>
    </div>
  );
}
