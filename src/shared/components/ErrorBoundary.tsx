/**
 * Error Boundary Component
 * يلتقط الأخطاء في React tree ويعرض UI بديل
 */
"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import logger from "@/infrastructure/logging/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught an error:", error);
    logger.error("Error Info:", errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // يمكن إرسال الخطأ إلى خدمة مراقبة (Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  private reportError(_error: Error, _errorInfo: React.ErrorInfo) {
    // TODO: دمج مع خدمة مراقبة الأخطاء
    // Sentry.captureException(_error, { contexts: { react: _errorInfo } })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-neutral-950">
          <Card className="max-w-lg w-full border-red-200 dark:border-red-900">
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-3">
                عذراً، حدث خطأ غير متوقع
              </h2>

              <p className="text-gray-600 dark:text-neutral-400 mb-6 leading-relaxed">
                نعتذر عن الإزعاج. حدث خطأ أثناء عرض هذه الصفحة. يرجى المحاولة
                مرة أخرى.
              </p>

              {this.props.showDetails && this.state.error && (
                <details className="mb-6 text-right bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-red-700 dark:text-red-400 mb-2">
                    تفاصيل تقنية
                  </summary>
                  <pre className="text-xs overflow-auto max-h-40 text-red-600 dark:text-red-300">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC لتغليف المكونات بـ Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
