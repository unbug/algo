/* eslint-disable no-console */
import React, { useState, useRef } from 'react';
import { Visibility } from 'semantic-ui-react'

const IMG = 'images/example.png';

export default function RetryImage(props) {
  const [visible, setVisible] = useState(false);
  const retry = useRef(0);
  const lazy = props.lazy === undefined || props.lazy === null ? true : false;
  const retryMax = props.retryMax != undefined ? props.retryMax : 1;

  function handleError(e) {
    const s = e.target.src;
    if (s && s != 'null' && s != 'undefined') {
      console.info('Request image failed: ' + s);
      if (retry.current < retryMax) {
        retry.current += 1;
        e.target.src = s;
      } else {
        props.onError && props.onError(e);
        if (props.fallback) {
          e.target.src = getFallbackSrc();
        } else if (e.target.src != IMG) {
          e.target.removeAttribute('src');
        }
      }
    }
  }

  function getFallbackSrc() {
    return typeof props.fallback === 'string' ? props.fallback : IMG;
  }

  function handleTopVisible() {
    setVisible(true);
  }

  if (visible || !lazy) {
    const src = props.src || getFallbackSrc();
    return <img onError={handleError} {...props} src={src} />
  }
  return <Visibility as="img" style={props.style}
    fireOnMount={true}
    onTopVisible={handleTopVisible}
    onOnScreen={handleTopVisible} />;
}
