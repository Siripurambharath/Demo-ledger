import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { baseurl } from './../../../../BaseURL/BaseURL';

const AddUnitModal = ({ show, onClose, onSave }) => {
  const [unitName, setUnitName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!unitName) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseurl}/units`, { name: unitName });
      onSave(response.data); // send new unit back
      setUnitName('');
    } catch (error) {
      console.error('Error adding unit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Unit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Unit Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter unit name"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Spinner animation="border" size="sm" /> : 'Save Unit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUnitModal;
