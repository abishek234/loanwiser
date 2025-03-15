import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Card, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPlus, FaUpload, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import AddApplicantModal from '../modal/AddApplicantModal';
import AddDocumentModal from '../modal/AddDocument';
import { getApplicants, createApplicant } from '../services/ApplicantServices';

const DocumentUpload = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await getApplicants();
      if (response.success) {
        setApplicants(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const handleDocumentClose = () => setShowDocumentModal(false);
  const handleDocumentShow = () => {
    setNewDocumentName('');
    setShowDocumentModal(true);
  };

  const handleSave = async (name) => {
    if (name.trim()) {
      try {
        setLoading(true);
        const response = await createApplicant(name);
        if (response.success) {
          await fetchApplicants();
        }
      } catch (error) {
        console.error('Error creating applicant:', error);
      } finally {
        setLoading(false);
      }
    }
    handleClose();
  };

  const handleAddDocument = () => {
    if (!newDocumentName.trim()) return;
    const newDocument = {
      id: Date.now() + Math.random().toString(36).substring(2, 10),
      name: newDocumentName,
      applicantIndex: selectedApplicantIndex
    };
    setDocuments([...documents, newDocument]);
    handleDocumentClose();
  };

  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const navigateApplicants = (direction) => {
    if (applicants.length === 0) return;
    let newIndex = selectedApplicantIndex + direction;
    if (newIndex < 0) newIndex = applicants.length - 1;
    if (newIndex >= applicants.length) newIndex = 0;
    setSelectedApplicantIndex(newIndex);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Handle the dropped files here
    console.log('Files dropped:', e.dataTransfer.files);
  };

  const handleChoose = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log('Files selected:', selectedFiles);
    // You can process the files here or add them to your documents state
  };

  const handleUpload = () => {
    // Implement your upload functionality here
    console.log('Upload button clicked');
  };
  
  const handleCancel = () => {
    // Clear selected files or cancel upload
    console.log('Cancel button clicked');
  };

  return (
    <Container fluid className="p-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="d-none"
        multiple
      />
      
      {/* Header */}
      <Row className="mb-5 align-items-center">
        <Col>
          <h1 className="text-secondary" style={{ fontSize: '2.5rem', color: '#4A5568' }}>Document Upload</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={handleShow} 
            className="rounded-md py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            <FaPlus className="me-2" /> Add Applicant
          </Button>
        </Col>
      </Row>

      {/* Applicant section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <span className="text-primary me-2" style={{ color: '#3B82F6' }}>hi</span>
            <Button 
              variant="primary" 
              className="d-flex align-items-center justify-content-center p-2"
              style={{ backgroundColor: '#3B82F6', width: '40px', height: '40px' }}
              onClick={() => {
                // Delete applicant functionality
                if (applicants.length > 0 && selectedApplicantIndex >= 0) {
                  const updatedApplicants = [...applicants];
                  updatedApplicants.splice(selectedApplicantIndex, 1);
                  setApplicants(updatedApplicants);
                  if (selectedApplicantIndex >= updatedApplicants.length) {
                    setSelectedApplicantIndex(Math.max(0, updatedApplicants.length - 1));
                  }
                }
              }}
            >
              <FaTrash />
            </Button>
          </div>
          <div className="border-bottom" style={{ borderColor: '#E2E8F0' }}></div>
        </Col>
      </Row>

      {/* Main content */}
      <Row>
        <Col md="auto" className="me-4">
          {/* Left sidebar */}
          <div className="d-flex flex-column gap-4">
            <Button 
              variant="primary" 
              className="d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: '#3B82F6', 
                width: '90px', 
                height: '60px',
                borderRadius: '8px'
              }}
            >
              hello
            </Button>
            
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center justify-content-center"
              style={{ 
                backgroundColor: 'transparent', 
                color: '#3B82F6', 
                borderColor: '#3B82F6', 
                width: '90px', 
                height: '50px',
                border: '2px solid #3B82F6',
                borderRadius: '8px'
              }}
              onClick={handleDocumentShow}
            >
              <FaPlus className="me-1" /> Add
            </Button>
          </div>
        </Col>
        
        <Col>
          {/* Right content */}
          <div className="border rounded-md" style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}>
            {/* Action buttons */}
            <div className="p-3 d-flex gap-2">
              <Button 
                variant="primary"
                className="py-2 px-3 d-flex align-items-center"
                style={{ backgroundColor: '#3B82F6', width: '120px' }}
                onClick={handleChoose}
              >
                <FaPlus className="me-2" /> Choose
              </Button>
              <Button 
                variant="primary"
                className="py-2 px-3 d-flex align-items-center"
                style={{ backgroundColor: '#60A5FA', width: '120px' }}
                onClick={handleUpload}
              >
                <FaUpload className="me-2" /> Upload
              </Button>
              <Button 
                variant="primary"
                className="py-2 px-3 d-flex align-items-center"
                style={{ backgroundColor: '#93C5FD', width: '120px' }}
                onClick={handleCancel}
              >
                <FaTimes className="me-2" /> Cancel
              </Button>
            </div>
            
            {/* Drag and drop area */}
            <div 
              className="p-5 border-top d-flex justify-content-start align-items-center"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ 
                minHeight: '120px', 
                borderColor: '#E2E8F0',
                backgroundColor: isDragging ? '#EFF6FF' : 'transparent'
              }}
            >
              <p className="mb-0 text-secondary">Drag and Drop files here.</p>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Navigation buttons */}
      <Row className="mt-5">
        <Col>
          <Button 
            variant="primary" 
            className="py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', width: '120px' }}
            onClick={() => navigateApplicants(-1)}
          >
            <FaArrowLeft className="me-2" /> Back
          </Button>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            className="py-2 px-4 d-flex align-items-center ms-auto"
            style={{ backgroundColor: '#3B82F6', width: '120px' }}
            onClick={() => navigateApplicants(1)}
          >
            Next <FaArrowRight className="ms-2" />
          </Button>
        </Col>
      </Row>

      {/* Add Applicant Modal */}
      <AddApplicantModal show={showModal} handleClose={handleClose} handleSave={handleSave} />

      {/* Add Document Modal */}
      <AddDocumentModal 
        show={showDocumentModal} 
        handleClose={handleDocumentClose} 
        handleSave={handleAddDocument} 
      />
    </Container>
  );
};

export default DocumentUpload;