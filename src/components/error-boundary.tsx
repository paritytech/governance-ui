import React from "react";

export class ErrorBoundary extends React.Component {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  componentDidCatch(error: Error, _: React.ErrorInfo) {
    this.state.error = error;
  }

  render() {
    const {error} = this.state

    if (error !== null) {
      return <div>Unhandled error: {error}</div>;
    }

    return this.props.children;
  }
}
