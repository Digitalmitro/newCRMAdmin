import React, { useState, useRef } from 'react';
import axios from 'axios';
import './PayslipManagement.css';

const PayslipManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const fileInputRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    uploadPayslip(file);
  };

  const uploadPayslip = async (file) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', selectedEmployee);
    formData.append('month', month);
    formData.append('year', year);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/payslips/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Payslip uploaded successfully');
        fetchPayslips();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchPayslips = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslips/month/list`,
        {
          params: { month, year },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setPayslips(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch payslips');
    }
  };

  const handleDownload = async (payslipId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslips/download/${payslipId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${payslipId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      setError('Failed to download payslip');
    }
  };

  const handleDelete = async (payslipId) => {
    if (!window.confirm('Are you sure you want to delete this payslip?')) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/payslips/${payslipId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Payslip deleted successfully');
        fetchPayslips();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete payslip');
    }
  };

  return (
    <div className="payslip-management">
      <h2>Manage Payslips</h2>

      <div className="upload-section">
        <h3>Upload Payslip</h3>
        <div className="form-group">
          <label htmlFor="employee">Select Employee</label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">-- Select Employee --</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="month">Month</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !selectedEmployee}
          className="btn-select-file"
        >
          {isUploading ? 'Uploading...' : 'Select PDF File'}
        </button>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>

      <div className="payslips-list-section">
        <h3>Payslips for {month} {year}</h3>
        <button onClick={fetchPayslips} className="btn-refresh">
          Refresh
        </button>

        {payslips.length > 0 ? (
          <table className="payslips-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Year</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map(payslip => (
                <tr key={payslip._id}>
                  <td>{payslip.employeeId?.name}</td>
                  <td>{payslip.month}</td>
                  <td>{payslip.year}</td>
                  <td>{payslip.uploadedBy?.name}</td>
                  <td>{new Date(payslip.uploadedAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleDownload(payslip._id)}
                      className="btn-download"
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => handleDelete(payslip._id)}
                      className="btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No payslips found</p>
        )}
      </div>
    </div>
  );
};

export default PayslipManagement;
