import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddApplicantModal = ({ show, handleClose, handleSave }) => {
  const [applicantName, setApplicantName] = useState('');

  const onSave = () => {
    handleSave(applicantName);
    setApplicantName('');
  };

  const onClose = () => {
    handleClose();
    setApplicantName('');
  };

  const buttonStyle = {
    width: '120px',
    borderRadius: '8px',
    padding: '10px 0',
    margin: '0 5px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <Modal show={show} onHide={onClose} centered className="border-0">
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title>Add Applicant</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-4 pb-5">
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder=""
              className="rounded border p-2"
              autoFocus
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <div className="d-flex justify-content-end pe-4 pb-4">
        <Button 
          variant="primary" 
          onClick={onSave}
          style={{...buttonStyle, backgroundColor: '#1a73e8'}}
        >
          <span className="me-2">✓</span> Save
        </Button>
        <Button 
          variant="secondary" 
          onClick={onClose}
          style={{...buttonStyle, backgroundColor: '#6c757d'}}
        >
          <span className="me-2">✕</span> Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default AddApplicantModal;