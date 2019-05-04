import React from 'react';
import { Container, Message } from 'semantic-ui-react';
import ErrorMessage from '../components/common/ErrorMessage';
import ErrorModel from '../models/ErrorModel';
import AppModel from '../models/AppModel';

export default class BaseView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    ErrorModel.error = error;
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
    document.title = this.props.title ? (`${this.props.title} - ${AppModel.appName}`) : AppModel.appName;
  }

  componentDidMount() {
    this.onRouteChanged();
  }

  onRouteChanged() {
  }

  renderBody() {
    if (!this.state.errorInfo) {
      return this.props.children;
    }
    return (
      <Container>
        <Message error color='red'>
          <Message.Header>Sorry, something went wrong</Message.Header>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </Message>
      </Container>
    );
  }

  render() {
    return (
      <div className='view-wrap'>
        <div {...this.props} className={`view ${this.props.className}`}>
          {this.renderBody()}
        </div>
        <ErrorMessage {...this.props} />
      </div>
    )
  }
}
