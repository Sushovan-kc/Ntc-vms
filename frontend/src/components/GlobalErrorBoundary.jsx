import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    window.addEventListener('error', this.handleGlobalError);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    window.removeEventListener('error', this.handleGlobalError);
  }

  handlePromiseRejection = (event) => {
    console.error("Caught unhandled promise rejection inside ErrorBoundary:", event.reason);
    this.setState({
      hasError: true,
      error: event.reason instanceof Error ? event.reason : new Error(event.reason || "Unhandled Promise Rejection")
    });
  };

  handleGlobalError = (event) => {
    console.error("Caught global runtime script exception inside ErrorBoundary:", event.error);
    this.setState({
      hasError: true,
      error: event.error || new Error(event.message || "Global script exception occurred")
    });
  };

  componentDidCatch(error, errorInfo) {
    console.error("Global UI Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-ntc-gray p-4 text-center select-none font-sans">
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,56,147,0.06)] border border-slate-100 p-8 md:p-10 w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
            
            {/* Warning Icon using ntc-danger and light-blue highlights */}
            <div className="text-ntc-danger bg-ntc-light-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-ntc-light-blue/50">
              <AlertTriangle size={32} />
            </div>

            {/* Header Content with customized theme font colors */}
            <h2 className="text-2xl font-black text-ntc-dark-text tracking-tight mb-2">System Recovery</h2>
            <p className="text-sm text-ntc-muted max-w-sm mx-auto mb-6 leading-relaxed">
              A critical exception occurred. The interface layer has paused to safeguard underlying workspace data.
            </p>

            {/* Raw Error Console Output Log Container */}
            <div className="bg-neutral-900 rounded-xl p-4 text-left mb-6 max-h-36 overflow-auto shadow-inner border border-neutral-800">
              <pre className="whitespace-pre-wrap font-mono text-xs text-red-400 leading-normal">
                {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
              </pre>
            </div>

            {/* Double Escape Hatch Recovery Action Buttons using ntc-blue & ntc-blue-hover */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
              <button 
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full sm:w-auto px-5 py-3 border border-slate-200 hover:bg-slate-50 text-ntc-muted font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> 
                Clear & Retry
              </button>

              <button 
                type="button"
                onClick={() => window.location.href = '/'} 
                className="w-full sm:w-auto px-6 py-3 bg-ntc-blue hover:bg-ntc-blue-hover text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-ntc-blue/10 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Home size={16} /> 
                Reboot App
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
