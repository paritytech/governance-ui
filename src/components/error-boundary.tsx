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

  componentDidCatch(error: Error, _: React.ErrorInfo) {
    this.setState({ error: error });
  }

  render() {
    const { error } = this.state;

    if (error !== null) {
      return (
        <div
          style={{
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Unhandled error: {error.toString()}
        </div>
      );
    }

    return this.props.children;
  }
}
