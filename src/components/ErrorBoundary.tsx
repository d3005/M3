import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="m-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-100">
        <h2 className="text-lg font-semibold">Something went wrong on this page.</h2>
        <p className="mt-1 text-sm">Your saved progress is safe in this browser. Try reloading; if it repeats, use “Export progress” on the Dashboard and report the message below.</p>
        <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-2 text-xs">{this.state.error.message}</pre>
        <button type="button" className="mt-3 rounded-lg border border-rose-400 px-3 py-1.5 text-sm" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}
