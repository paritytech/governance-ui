import React, { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.setState({ error: error });
  }

  render() {
    const { error } = this.state;

    if (error !== null) {
      return (
        <div className="flex h-screen items-center justify-center">
          Unhandled error: {error.toString()}
        </div>
      );
    }

    return this.props.children;
  }
}
