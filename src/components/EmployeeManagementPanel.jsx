import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeManagementPanel.css';

const EmployeeManagementPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Adjust this endpoint based on your actual API
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/employees`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivitySummary = async (employeeId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/employees/${employeeId}/summary`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setActivitySummary(response.data.data);
        setShowActivityDetails(true);
      }
    } catch (err) {
      setError('Failed to fetch activity summary');
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    fetchActivitySummary(employee._id);
    setError(null);
    setSuccess(null);
  };

  const handleDeactivate = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/employees/${selectedEmployee._id}/deactivate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Employee deactivated successfully');
        fetchEmployees();
        setSelectedEmployee(null);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate employee');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/employees/${selectedEmployee._id}/delete`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Employee deleted successfully. Messages and records preserved.');
        fetchEmployees();
        setSelectedEmployee(null);
        setShowDeleteConfirm(false);
        setShowActivityDetails(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="employee-management-panel">
      <h2>Employee Management</h2>

      <div className="main-container">
        <div className="employees-list">
          <h3>Employees</h3>
          <button onClick={fetchEmployees} className="btn-refresh">
            Refresh
          </button>

          {isLoading ? (
            <p className="loading">Loading employees...</p>
          ) : employees.length > 0 ? (
            <ul className="employee-items">
              {employees.map(emp => (
                <li
                  key={emp._id}
                  className={`employee-item ${selectedEmployee?._id === emp._id ? 'selected' : ''}`}
                  onClick={() => handleSelectEmployee(emp)}
                >
                  <span className="emp-name">{emp.name}</span>
                  <span className="emp-email">{emp.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No employees found</p>
          )}
        </div>

        <div className="details-section">
          {selectedEmployee && (
            <>
              <div className="employee-header">
                <h3>{selectedEmployee.name}</h3>
                <p className="email">{selectedEmployee.email}</p>
                <p className="phone">{selectedEmployee.phone}</p>
              </div>

              {showActivityDetails && activitySummary && (
                <div className="activity-summary">
                  <h4>Activity Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <label>Channels</label>
                      <p>{activitySummary.activity.channelCount}</p>
                    </div>
                    <div className="summary-item">
                      <label>Direct Messages</label>
                      <p>{activitySummary.activity.directMessageCount}</p>
                    </div>
                    <div className="summary-item">
                      <label>Channel Messages</label>
                      <p>{activitySummary.activity.channelMessageCount}</p>
                    </div>
                    <div className="summary-item">
                      <label>Payslips</label>
                      <p>{activitySummary.activity.payslipCount}</p>
                    </div>
                  </div>

                  {activitySummary.activity.channels.length > 0 && (
                    <div className="channels-list">
                      <h5>Member of Channels:</h5>
                      <ul>
                        {activitySummary.activity.channels.map(ch => (
                          <li key={ch._id}>{ch.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="action-buttons">
                <button
                  onClick={handleDeactivate}
                  className="btn-deactivate"
                  title="Temporarily deactivate this employee"
                >
                  Deactivate Employee
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-delete"
                  title="Permanently delete this employee"
                >
                  Delete Employee
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="delete-confirmation">
                  <div className="confirm-box">
                    <p>
                      Are you sure you want to delete <strong>{selectedEmployee.name}</strong>?
                    </p>
                    <p className="warning">
                      ⚠️ This will:
                    </p>
                    <ul>
                      <li>Remove employee from all channels</li>
                      <li>Revoke platform access</li>
                      <li>Keep all messages and activity history</li>
                    </ul>
                    <div className="confirm-actions">
                      <button
                        onClick={handleDelete}
                        className="btn-confirm-delete"
                      >
                        Yes, Delete Permanently
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default EmployeeManagementPanel;
