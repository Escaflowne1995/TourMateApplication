/**
 * Supabase Connection Test Component
 * Tests and displays Supabase connection status
 */

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = React.useState({
    status: 'testing',
    message: 'Testing Supabase connection...',
    details: null
  });

  React.useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      if (!window.SupabaseHelper) {
        setConnectionStatus({
          status: 'error',
          message: 'Supabase helper not loaded',
          details: 'Make sure supabaseClient.js is loaded before this component'
        });
        return;
      }

      const result = await window.SupabaseHelper.testConnection();
      
      if (result.success) {
        setConnectionStatus({
          status: 'success',
          message: result.message,
          details: result.needsSetup ? 'Database tables need to be created' : 'All systems operational'
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: result.error,
          details: 'Check your Supabase configuration and internet connection'
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: `Connection test failed: ${error.message}`,
        details: 'Unexpected error during connection test'
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'success':
        return <i className="fas fa-check-circle" style={{ color: '#22C55E' }}></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle" style={{ color: '#EF4444' }}></i>;
      case 'testing':
      default:
        return <i className="fas fa-spinner fa-spin" style={{ color: '#3B82F6' }}></i>;
    }
  };

  const getStatusClass = () => {
    switch (connectionStatus.status) {
      case 'success':
        return 'connection-test success';
      case 'error':
        return 'connection-test error';
      case 'testing':
      default:
        return 'connection-test testing';
    }
  };

  return (
    <div className={getStatusClass()}>
      <div className="connection-header">
        {getStatusIcon()}
        <h3>Supabase Connection Status</h3>
        <button onClick={testConnection} className="btn btn-sm btn-outline">
          <i className="fas fa-sync-alt"></i> Retest
        </button>
      </div>
      
      <div className="connection-details">
        <p className="status-message">{connectionStatus.message}</p>
        {connectionStatus.details && (
          <p className="status-details">{connectionStatus.details}</p>
        )}
      </div>

      {connectionStatus.status === 'error' && (
        <div className="troubleshooting">
          <h4>Troubleshooting Steps:</h4>
          <ul>
            <li>Check your internet connection</li>
            <li>Verify Supabase URL and API key in supabaseClient.js</li>
            <li>Run the database migration SQL in Supabase Dashboard</li>
            <li>Check browser console for detailed error messages</li>
          </ul>
        </div>
      )}

      {connectionStatus.status === 'success' && connectionStatus.details?.includes('tables need') && (
        <div className="setup-required">
          <h4>⚠️ Setup Required:</h4>
          <p>
            Connection successful, but you need to run the database migration.
            Go to your Supabase Dashboard → SQL Editor and run the contents of:
            <code>admin/database/migrations/admin-supabase-setup.sql</code>
          </p>
        </div>
      )}

      <style jsx>{`
        .connection-test {
          margin: 20px 0;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .connection-test.success {
          border-color: #22C55E;
          background: #F0FDF4;
        }

        .connection-test.error {
          border-color: #EF4444;
          background: #FEF2F2;
        }

        .connection-test.testing {
          border-color: #3B82F6;
          background: #EFF6FF;
        }

        .connection-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .connection-header h3 {
          margin: 0;
          flex: 1;
          font-size: 18px;
          font-weight: 600;
        }

        .connection-header i {
          font-size: 20px;
        }

        .btn {
          padding: 8px 16px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn:hover {
          background: #F9FAFB;
          border-color: #9CA3AF;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-outline {
          background: transparent;
        }

        .connection-details .status-message {
          font-weight: 500;
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .connection-details .status-details {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
        }

        .troubleshooting, .setup-required {
          margin-top: 16px;
          padding: 16px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.05);
        }

        .troubleshooting h4, .setup-required h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .troubleshooting ul {
          margin: 0;
          padding-left: 20px;
        }

        .troubleshooting li {
          margin-bottom: 4px;
          color: #374151;
        }

        .setup-required code {
          background: #F3F4F6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          display: block;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

window.SupabaseConnectionTest = SupabaseConnectionTest;
