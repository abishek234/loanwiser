import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import AddApplicantModal from '../modal/AddApplicantModal';
import axios from 'axios';

const DocumentUpload = () => {
  const [showModal, setShowModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Track the active tab

  // Fetch all applicants on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // Function to fetch all applicants
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/applicant/applicants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Updated token key
        }
      });
      // Ensure we're setting an array
      const data = Array.isArray(response.data) ? response.data : 
                   (response.data.applicants || response.data.data || []);
      setApplicants(data);
      setError(null);
      
      // Set active tab to first item if we have applicants
      if (data.length > 0 && activeTab >= data.length) {
        setActiveTab(0);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to load applicants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  
  // Function to add a new applicant
  const handleSave = async (name) => {
    if (name.trim()) {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:8000/api/applicant/applicants', 
          { name: name },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        // Add the newly created applicant to the state
        const newApplicants = [...applicants, response.data];
        setApplicants(newApplicants);
        // Set the active tab to the newly added applicant
        setActiveTab(newApplicants.length - 1);
        setError(null);
      } catch (err) {
        console.error('Error creating applicant:', err);
        setError('Failed to add applicant. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    handleClose();
  };

  // Function to delete an applicant
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/api/applicant/applicants/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      // Remove the deleted applicant from the state
      const filteredApplicants = applicants.filter(applicant => applicant._id !== id);
      setApplicants(filteredApplicants);
      
      // Adjust active tab if needed
      if (activeTab >= filteredApplicants.length && filteredApplicants.length > 0) {
        setActiveTab(filteredApplicants.length - 1);
      } else if (filteredApplicants.length === 0) {
        setActiveTab(0);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error deleting applicant:', err);
      setError('Failed to delete applicant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="px-0 py-md-1">
      <div className="shadow-sm border rounded-1 w-100 mx-auto">
        <div className="py-5 px-3 px-md-4">
          {/* Header with Document Upload title and Add Applicant button */}
          <Row className="mb-4 d-flex justify-content-between align-items-center">
            <Col>
              <h1 className="text-secondary">Document Upload</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={handleShow}
                className="rounded"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Loading...</span>
                  </>
                ) : (
                  '+ Add Applicant'
                )}
              </Button>
            </Col>
          </Row>
          
          {/* Error message display */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {/* Tab-like Navigation for Applicants */}
          {loading && !applicants.length ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : applicants.length > 0 ? (
            <div className="mb-4">
              <div className="d-flex">
                {applicants.map((applicant, index) => (
                  <div 
                    key={applicant._id || applicant.id} 
                    className="me-4"
                    onClick={() => setActiveTab(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className={`text-center px-2 py-2 ${activeTab === index ? 'border border-primary rounded' : ''}`}
                      style={{ 
                        borderRadius: '8px',
                        backgroundColor: activeTab === index ? '#e6f0ff' : 'transparent'
                      }}
                    >
                      <span 
                        className="d-block mb-2" 
                        style={{ 
                          color: '#6c757d',
                          marginLeft: '10px',
                          marginRight: '10px'
                        }}
                      >
                        {`a${index + 1}`}
                      </span>
                      <Button 
                        variant="primary" 
                        className="d-flex justify-content-center align-items-center" 
                        style={{ 
                          width: "50px", 
                          height: "50px",
                          borderRadius: "8px"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(applicant._id || applicant.id);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="mt-3" />
            </div>
          ) : null}
          
          {/* "No documents available" message and Add button */}
          {!applicants.length && (
            <>
              <p className="text-secondary my-4">No documents available</p>
              <Button 
                variant="primary" 
                className="d-flex align-items-center justify-content-center mb-4"
                onClick={handleShow}
                disabled={loading}
                style={{ width: '120px' }}
              >
                <span className="me-2">+</span>
                Add
              </Button>
            </>
          )}
          
          {/* Navigation buttons */}
          <Row className="mt-5 d-flex justify-content-between">
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="px-4 py-2"
                disabled={loading}
              >
                ← Back
              </Button>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="px-4 py-2"
                disabled={loading}
              >
                Next →
              </Button>
            </Col>
          </Row>
          
          {/* AddApplicantModal component */}
          <AddApplicantModal 
            show={showModal} 
            handleClose={handleClose} 
            handleSave={handleSave} 
            loading={loading}
          />
        </div>
      </div>
    </Container>
  );
};

export default DocumentUpload;