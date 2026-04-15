import React, { useState } from 'react';
import axios from 'axios';
import './BulkInviteManager.css';

const BulkInviteManager = ({ channelId, onSuccess }) => {
  const [emails, setEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setEmails(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);

    // Parse emails - supports comma or newline separated
    const emailList = emails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      setError('Please enter at least one email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/invites/bulk`,
        { channelId, emails: emailList },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setResults(response.data.data);
        setEmails('');
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invites');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bulk-invite-manager">
      <h3>Send Bulk Channel Invites</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emails">Email Addresses</label>
          <textarea
            id="emails"
            value={emails}
            onChange={handleChange}
            placeholder="Enter emails separated by commas or new lines&#10;Example:&#10;user1@example.com, user2@example.com&#10;user3@example.com"
            rows={6}
            disabled={isLoading}
          />
          <small>Separate multiple emails with commas or new lines</small>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !emails.trim()}
          className="btn-send"
        >
          {isLoading ? 'Sending...' : 'Send Invites'}
        </button>
      </form>

      {results && (
        <div className="results-section">
          <div className="summary">
            <p className="total">
              Total: <strong>{results.summary.total}</strong>
            </p>
            <p className="successful">
              ✅ Successful: <strong>{results.summary.successful}</strong>
            </p>
            {results.summary.failed > 0 && (
              <p className="failed">
                ❌ Failed: <strong>{results.summary.failed}</strong>
              </p>
            )}
          </div>

          {results.data.successful.length > 0 && (
            <div className="successful-list">
              <h4>✅ Sent Successfully</h4>
              <ul>
                {results.data.successful.map((item, idx) => (
                  <li key={idx}>{item.email}</li>
                ))}
              </ul>
            </div>
          )}

          {results.data.failed.length > 0 && (
            <div className="failed-list">
              <h4>❌ Failed Invites</h4>
              <ul>
                {results.data.failed.map((item, idx) => (
                  <li key={idx}>
                    {item.email} - {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkInviteManager;
