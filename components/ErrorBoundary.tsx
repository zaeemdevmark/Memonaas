"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
            <div>
              <h2
                className="font-display text-2xl text-[var(--ink)] mb-3"
              >
                Something went wrong
              </h2>
              <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">
                An unexpected error occurred. Please refresh the page.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="text-[11px] tracking-widest uppercase border-b border-[var(--ink)] pb-0.5 hover:opacity-60 transition-opacity"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
