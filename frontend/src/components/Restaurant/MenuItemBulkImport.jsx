import React, { useState } from 'react';
import axios from 'axios';

const MenuItemBulkImport = ({ restaurantId, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);

  // Validate restaurantId prop
  if (!restaurantId) {
    alert('Missing Restaurant ID: Restaurant ID is required to import menu items.');
    onClose(); // Close the modal if restaurantId is missing
    return null;
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('No file selected: Please select a CSV or JSON file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5003/api/menu/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(`Bulk import completed: Imported: ${response.data.imported}, Failed: ${response.data.failed}`);

      // Display detailed errors if any imports failed
      if (response.data.failed > 0) {
        const errorMessage = response.data.errors
          .map((error, idx) => `Row ${idx + 1}: ${error.message || error.error || 'Unknown error'}`)
          .join('\n');
        alert(`Import Details:\n${errorMessage}`);
      }

      onSubmit();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error';
      const errors = error.response?.data?.errors || [];
      const errorDetails = errors.length > 0
        ? errors.map((error, idx) => `Row ${idx + 1}: ${error.message || error.error || 'Unknown error'}`).join('\n')
        : '';
      alert(`Error during bulk import:\n${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
          position: 'relative',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0' }}>Bulk Import Menu Items</h2>
        <button
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          ×
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label htmlFor="file" style={{ display: 'block', marginBottom: '5px' }}>
              Upload CSV or JSON File
            </label>
            <input
              type="file"
              id="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <strong>Expected Format:</strong>
            <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
              Ensure the file includes the following fields for each menu item:
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>
              - CSV: name,description,category,price,restaurantId,createdBy,... (nested fields as JSON strings)
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>
              - JSON: Array of menu item objects
            </p>
            <p style={{ fontSize: '14px', color: 'red', margin: '5px 0' }}>
              Note: The restaurantId in the file must match the current restaurant ID ({restaurantId}).
            </p>
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={handleSubmit}
          >
            Import
          </button>
          <button
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemBulkImport;