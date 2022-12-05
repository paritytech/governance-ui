import React, { ReactNode } from "react";

type Props = {
  children?: ReactNode[];
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {

  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  componentDidCatch(error: Error, _: React.ErrorInfo) {
    this.setState({error: error});
  }

  render() {
    const {error} = this.state

    if (error !== null) {
      return <div>Unhandled error: {error.toString()}</div>;
    }

    return this.props.children;
  }
}
