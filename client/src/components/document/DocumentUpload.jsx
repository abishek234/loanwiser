import React, { useState, useEffect, useRef,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button,Card } from 'react-bootstrap';
import { FaTrash, FaPlus, FaUpload, FaTimes, FaArrowLeft, FaArrowRight,FaSignOutAlt } from 'react-icons/fa';
import AddApplicantModal from '../modal/AddApplicantModal';
import AddDocumentModal from '../modal/AddDocument';
import { getApplicants, createApplicant, deleteApplicant } from '../services/applicantsServices';
import { uploadDocument } from '../services/documentService';
import { createDocumentType, getDocumentTypesByApplicant } from '../services/documenttypeServices';
import AuthContext from '../../context/AuthContext';


const DocumentUpload = () => {
  // State variables
  const [currentStep, setCurrentStep] = useState(1); // 1: Initial, 2: After Add Applicant, 3: After Add Document
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(0);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocumentTypeIndex, setSelectedDocumentTypeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [fileProgress, setFileProgress] = useState({});
  const fileInputRef = useRef(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Fetch applicants on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // Determine the current step based on state
  useEffect(() => {
    if (applicants.length === 0) {
      setCurrentStep(1); // Initial view
    } else if (documentTypes.length === 0) {
      setCurrentStep(2); // After adding applicant
    } else {
      setCurrentStep(3); // After adding document type
    }
  }, [applicants, documentTypes]);

  // Fetch document types when selected applicant changes
  useEffect(() => {
    if (applicants.length > 0) {
      const currentApplicantId = applicants[selectedApplicantIndex]?.id;
      if (currentApplicantId) {
        fetchDocumentTypes(currentApplicantId);
      }
    }
  }, [applicants, selectedApplicantIndex]);

  // API Calls
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await getApplicants();
      
      if (response.success) {
        // Explicitly reverse the order if the API returns newest first
        // This ensures older applicants appear first in the list
        const orderedApplicants = [...(response.data || [])].reverse();
        setApplicants(orderedApplicants);
        
        // After reversing, if we need to select the newest applicant (at the end),
        // we would set the index to the last item
        if (response.data && response.data.length > 0) {
          // Only auto-select if we're coming from initial screen
          if (currentStep === 1) {
            setSelectedApplicantIndex(0); // Select the first (oldest) applicant
          }
        }
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentTypes = async (applicantId) => {
    try {
      setLoading(true);
      const response = await getDocumentTypesByApplicant(applicantId);
      
      // Make sure we're getting an array
      const types = Array.isArray(response) ? response : [];
      setDocumentTypes(types);
      // Reset to first document type when list changes (or none if empty)
      setSelectedDocumentTypeIndex(types.length > 0 ? 0 : -1);
    } catch (error) {
      console.error('Error fetching document types:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modal Handlers
  const handleApplicantModalClose = () => setShowApplicantModal(false);
  const handleApplicantModalShow = () => setShowApplicantModal(true);
  const handleDocumentModalClose = () => setShowDocumentModal(false);
  const handleDocumentModalShow = () => setShowDocumentModal(true);

  // Main functionality handlers
  const handleSaveApplicant = async (name) => {
    if (name.trim()) {
      try {
        setLoading(true);
        const response = await createApplicant(name);
        if (response.success) {
          // After creating a new applicant, fetch the full list again
          await fetchApplicants();
          
          // Find the index of the newly added applicant in the reversed list
          // It should be at the end of the list (highest index)
          const updatedApplicants = await getApplicants();
          if (updatedApplicants.success && updatedApplicants.data) {
            // Since we reversed the list, the newest applicant is at the end
            // of our reversed array
            setSelectedApplicantIndex(updatedApplicants.data.length - 1);
          }
          setCurrentStep(2); // Advance to next step
        }
      } catch (error) {
        console.error('Error creating applicant:', error);
      } finally {
        setLoading(false);
      }
    }
    handleApplicantModalClose();
  };

  const handleAddDocument = async (documentName) => {
    if (!documentName.trim()) return;

    const currentApplicantId = applicants[selectedApplicantIndex]?.id;
    if (!currentApplicantId) {
      alert("Please select a valid applicant.");
      return;
    }

    try {
      setLoading(true);
      const response = await createDocumentType(documentName, currentApplicantId);
      if (response?.id) {
        await fetchDocumentTypes(currentApplicantId);
        setCurrentStep(3); // Advance to final step
      }
    } catch (error) {
      console.error('Error adding document type:', error);
    } finally {
      setLoading(false);
      handleDocumentModalClose();
    }
  };

  const handleDeleteApplicant = async (index, e) => {
    e.stopPropagation();
    if (applicants.length === 0) return;
    
    const applicant = applicants[index];
    const currentIndex = selectedApplicantIndex;
    
    try {
      setLoading(true);
      const response = await deleteApplicant(applicant.id);
      
      if (response.success) {
        // Before fetching new applicants, calculate which index to select after deletion
        let newSelectedIndex;
        
        // If we're deleting the currently selected applicant
        if (index === currentIndex) {
          // If it's the last item in the list, select the previous one
          if (index === applicants.length - 1 && index > 0) {
            newSelectedIndex = index - 1;
          } 
          // Otherwise select the next one (which will be at the same index after deletion)
          else if (index < applicants.length - 1) {
            newSelectedIndex = index;
          }
          // If it's the only item, there won't be any selection after
          else {
            newSelectedIndex = -1;
          }
        } 
        // If we're deleting an applicant before the selected one, decrement the selection index
        else if (index < currentIndex) {
          newSelectedIndex = currentIndex - 1;
        }
        // If we're deleting an applicant after the selected one, keep the same selection index
        else {
          newSelectedIndex = currentIndex;
        }
        
        // Fetch updated applicants
        await fetchApplicants();
        
        // Apply the calculated selection index (only if valid)
        if (newSelectedIndex >= 0 && newSelectedIndex < applicants.length - 1) {
          setSelectedApplicantIndex(newSelectedIndex);
        }
      }
    } catch (error) {
      alert('applicant contain data cannot be deleted');
      console.error('Error deleting applicant:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const navigateApplicants = (direction) => {
    if (applicants.length === 0) return;
    let newIndex = selectedApplicantIndex + direction;
    if (newIndex < 0) newIndex = applicants.length - 1;
    if (newIndex >= applicants.length) newIndex = 0;
    setSelectedApplicantIndex(newIndex);
  };

  // File handlers
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
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Set dropped files status to Pending by default
    const newStatuses = {...fileStatuses};
    files.forEach(file => {
      newStatuses[file.name] = 'Pending';
    });
    setFileStatuses(newStatuses);
  };

  const handleChoose = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Set selected files status to Pending by default
    const newStatuses = {...fileStatuses};
    const newProgress = {...fileProgress};
    
    files.forEach(file => {
      newStatuses[file.name] = 'Pending';
      newProgress[file.name] = 0;
    });
    
    setFileStatuses(newStatuses);
    setFileProgress(newProgress);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || applicants.length === 0 || selectedApplicantIndex < 0) {
      return;
    }
  
    const applicantId = applicants[selectedApplicantIndex].id;
    const documentTypeId = documentTypes[selectedDocumentTypeIndex]?.id;

  
    if (!documentTypeId) {
      console.error("Document Type ID is missing");
      return;
    }
  
    // Set all files to pending status with 0% progress
    const initialStatuses = {};
    const initialProgress = {};
    selectedFiles.forEach(file => {
      initialStatuses[file.name] = 'Pending';
      initialProgress[file.name] = 0;
    });
    setFileStatuses(initialStatuses);
    setFileProgress(initialProgress);
  
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        // Simulate upload progress
        const updateProgress = () => {
          return new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 20;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                resolve();
              }
              setFileProgress(prev => ({
                ...prev,
                [file.name]: Math.min(Math.round(progress), 100)
              }));
            }, 300 + (index * 100)); // Stagger uploads slightly
          });
        };
  
        // Wait for progress simulation to complete
        await updateProgress();
        
        // Perform actual upload
        const response = await uploadDocument(applicantId, documentTypeId, file.name, file);
        
        // Update status for this specific file
        setFileStatuses(prev => ({
          ...prev,
          [file.name]: response.success ? 'Completed' : 'Failed'
        }));
        
        return response;
      });
  
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark failed uploads
      const failedStatuses = {...fileStatuses};
      selectedFiles.forEach(file => {
        if (failedStatuses[file.name] !== 'Completed') {
          failedStatuses[file.name] = 'Failed';
        }
      });
      setFileStatuses(failedStatuses);
    }
  };
  
  
  const handleCancel = () => {
    setSelectedFiles([]); // Clear selected files
    setFileStatuses({}); // Clear file statuses
    setFileProgress({}); // Clear progress
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset file input
    }
  };

  const calculateOverallProgress = () => {
    if (selectedFiles.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    selectedFiles.forEach(file => {
      const progress = fileProgress[file.name] || 0;
      total += progress;
      count++;
    });
    
    return count > 0 ? Math.round(total / count) : 0;
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    const removedFile = updatedFiles[index];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    
    // Also update file statuses and progress if necessary
    if (removedFile) {
      const fileName = removedFile.name;
      
      setFileStatuses(prev => {
        const updated = {...prev};
        delete updated[fileName];
        return updated;
      });
      
      setFileProgress(prev => {
        const updated = {...prev};
        delete updated[fileName];
        return updated;
      });
    }
  };

  // Render functions based on current step
  
  const renderInitialView = () => (
    <Container fluid className="px-0 py-md-1">
      <Card className="shadow-sm border rounded-1 w-100 mx-auto">
        <Card.Body className="py-4 px-2 px-md-4">
          {/* Header */}
          <Row className="mb-5 align-items-center">
            <Col>
              <h1 className="text-secondary" style={{ fontSize: '2.5rem', color: '#4A5568' }}>Document Upload</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={handleApplicantModalShow} 
                className="rounded-md py-2 px-4 d-flex align-items-center"
                style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
              >
                <FaPlus className="me-2" /> Add Applicant
              </Button>
            </Col>
            <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleLogout}
            className="rounded-md py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            <FaSignOutAlt className="me-2" />Logout
            </Button>
        </Col>
          </Row>

  
          
          {/* Horizontal divider with more space */}
          <hr className="my-4" style={{ borderColor: 'grey' }} />
          
          {/* Add empty space to match the layout in the image */}
          <div style={{ minHeight: '100px' }}></div>
          
          {/* Navigation Buttons */}
          <Row className="mt-5 d-flex justify-content-between">
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="px-4 py-2" 
                onClick={() => {}}
                style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
              >
                <FaArrowLeft className="me-2" /> Back
              </Button>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="px-4 py-2" 
                onClick={() => {}}
                style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
              >
                <FaArrowRight className="me-2" />  Next 
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );

  const renderApplicantView = () => (
    <Container fluid className="px-0 py-md-1">
    <Card className="shadow-sm border rounded-1 w-100 mx-auto">
      <Card.Body className="py-4 px-2 px-md-4">
      {/* Header */}
      <Row className="mb-5 align-items-center">
        <Col>
          <h1 className="text-secondary" style={{ fontSize: '2.5rem', color: '#4A5568' }}>Document Upload</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={handleApplicantModalShow} 
            className="rounded-md py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            <FaPlus className="me-2" /> Add Applicant
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleLogout}
            className="rounded-md py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            <FaSignOutAlt className="me-2" />Logout
            </Button>
        </Col>
      </Row>

      {/* Horizontal Applicants Section */}
      <Row className="mb-4">
        <Col>
          <div className="mb-3">
            <div className="d-flex">
              {loading ? (
                <div className="d-flex justify-content-center p-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : applicants.length === 0 ? (
                <div className="p-3 text-center text-secondary">
                  No applicants found
                </div>
              ) : (
                applicants.map((applicant, index) => (
                  <div 
                    key={applicant.id || index}
                    style={{ 
                      cursor: 'pointer',
                      marginRight: '20px',
                      display: 'inline-block',
                      position: 'relative'
                    }}
                    onClick={() => setSelectedApplicantIndex(index)}
                  >
                    <div className="d-flex align-items-center">
                      <span 
                        className={`${selectedApplicantIndex === index ? 'text-primary' : 'text-secondary'} me-2`}
                        style={{ fontWeight: selectedApplicantIndex === index ? '600' : '400' }}
                      >
                        {applicant.name || `Applicant ${index + 1}`}
                      </span>
                      <Button 
                        variant="primary" 
                        className="d-flex align-items-center justify-content-center p-2"
                        style={{ 
                          backgroundColor: '#3B82F6', 
                          width: '40px', 
                          height: '40px',
                          borderRadius: '4px'
                        }}
                        onClick={(e) => handleDeleteApplicant(index, e)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    </div>
                    
                    {/* Individual progress indicator for each applicant */}
                    {selectedApplicantIndex === index ? (
                      <div 
                        style={{ 
                          position: 'absolute',
                          bottom: '-15px',
                          left: '-10px',
                          width: 'calc(100% + 20px)',
                          height: '3px',
                          backgroundColor: '#3B82F6'
                        }}
                      ></div>
                    ) : (
                      <div 
                        style={{ 
                          position: 'absolute',
                          bottom: '-15px',
                          left: 0,
                          width: '100%',
                          height: '1px',
                          backgroundColor: '#E2E8F0'
                        }}
                      ></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Border below all applicants */}
          <div className="border-bottom" style={{ borderColor: '#E2E8F0', marginTop: '15px' }}></div>
        </Col>
      </Row>

      {/* No documents message */}
      <Row className="mb-4">
        <Col>
          <div className="text-secondary mb-3">No documents available</div>
        </Col>
      </Row>

      {/* Add document button */}
      <Row className="mb-4">
        <Col xs="auto">
          <Button 
            variant="primary"
            className="d-flex align-items-center justify-content-center"
            style={{ 
              backgroundColor: '#3B82F6',
              color: 'white',
              width: '100px',
              height: '50px',
              borderRadius: '8px'
            }}
            onClick={handleDocumentModalShow}
          >
            <FaPlus className="me-2" /> Add
          </Button>
        </Col>
      </Row>

      {/* Navigation Buttons */}
      <Row className="mt-4 d-flex justify-content-between">
        <Col xs="auto">
          <Button variant="primary" className="px-4 py-2" onClick={() => navigateApplicants(-1)}>
            <FaArrowLeft className="me-2" /> Back
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="primary" className="px-4 py-2" onClick={() => navigateApplicants(1)}>
          <FaArrowRight className="me-2" />  Next 
          </Button>
        </Col>
      </Row>
      </Card.Body>
      </Card>
    </Container>
  );

  const renderDocumentTypeView = () => (
    <Container fluid className="px-0 py-md-1">
      <Card className="shadow-sm border rounded-1 w-100 mx-auto">
        <Card.Body className="py-4 px-2 px-md-4">
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
            onClick={handleApplicantModalShow} 
            className="rounded-md py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            <FaPlus className="me-2" /> Add Applicant
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleLogout}
            className="rounded-md py-2 px-4 d-flex align-items-center"
            style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
          >
            <FaSignOutAlt className="me-2" />Logout
            </Button>
        </Col>
      </Row>

      {/* Horizontal Applicants Section */}
      <Row className="mb-4">
        <Col>
          <div className="mb-3">
            <div className="d-flex">
              {loading ? (
                <div className="d-flex justify-content-center p-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                applicants.map((applicant, index) => (
                  <div 
                    key={applicant.id || index}
                    style={{ 
                      cursor: 'pointer',
                      marginRight: '20px',
                      display: 'inline-block',
                      position: 'relative'
                    }}
                    onClick={() => setSelectedApplicantIndex(index)}
                  >
                    <div className="d-flex align-items-center">
                      <span 
                        className={`${selectedApplicantIndex === index ? 'text-primary' : 'text-secondary'} me-2`}
                        style={{ fontWeight: selectedApplicantIndex === index ? '600' : '400' }}
                      >
                        {applicant.name || `Applicant ${index + 1}`}
                      </span>
                      <Button 
                        variant="primary" 
                        className="d-flex align-items-center justify-content-center p-2"
                        style={{ 
                          backgroundColor: '#3B82F6', 
                          width: '40px', 
                          height: '40px',
                          borderRadius: '4px'
                        }}
                        onClick={(e) => handleDeleteApplicant(index, e)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    </div>
                    
                    {/* Individual progress indicator for each applicant */}
                    {selectedApplicantIndex === index ? (
                      <div 
                        style={{ 
                          position: 'absolute',
                          bottom: '-15px',
                          left: '-10px',
                          width: 'calc(100% + 20px)',
                          height: '3px',
                          backgroundColor: '#3B82F6'
                        }}
                      ></div>
                    ) : (
                      <div 
                        style={{ 
                          position: 'absolute',
                          bottom: '-15px',
                          left: 0,
                          width: '100%',
                          height: '1px',
                          backgroundColor: '#E2E8F0'
                        }}
                      ></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Border below all applicants */}
          <div className="border-bottom" style={{ borderColor: '#E2E8F0', marginTop: '15px' }}></div>
        </Col>
      </Row>

      {/* Main Content with Document Types and Upload Area */}
      <Row>
        {/* Left sidebar - Document Types */}
        <Col md="auto" className="me-4">
          <div className="mb-4" style={{ width: '200px' }}>
            {/* Display document types */}
            {documentTypes.map((docType, index) => (
              <div 
                key={docType.id || index}
                className="mb-3"
                style={{
                  cursor: selectedDocumentTypeIndex !== index ? 'pointer' : 'default'
                }}
                onClick={() => setSelectedDocumentTypeIndex(index)}
              >
                <div 
                  style={{
                    backgroundColor: selectedDocumentTypeIndex === index ? '#3B82F6' : '#FFFFFF',
                    color: selectedDocumentTypeIndex === index ? 'white' : 'grey',
                    borderRadius: '8px',
                    padding: '20px',
                    fontWeight: '500',
                    textAlign: 'center',
                    width: '120px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {docType.name}
                </div>
              </div>
            ))}
            
            {/* Add button */}
            <div className="d-flex">
              <Button 
                variant="primary"
                className="d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  width: '100px',
                  height: '50px',
                  borderRadius: '8px',
                  marginRight: '15px'
                }}
                onClick={handleDocumentModalShow}
              >
                <FaPlus className="me-2" /> Add
              </Button>
            </div>
          </div>
        </Col>
        
        {/* Right Content - File Upload Area */}
        <Col>
          {/* Right content */}
          <div className="border rounded-md" style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}>
            {/* Action buttons */}
            <div className="d-flex gap-2 p-3" style={{ borderColor: '#E2E8F0' }}>
              <Button 
                variant="primary"
                className="py-2 px-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#3B82F6', width: '120px' }}
                onClick={handleChoose}
              >
                <FaPlus className="me-2" /> Choose
              </Button>
              <Button 
                variant="primary"
                className="py-2 px-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor:  selectedFiles.length > 0 ? '#3B82F6' : '#93C5FD',  width: '120px' }}
                onClick={handleUpload}
              >
                <FaUpload className="me-2" /> Upload
              </Button>
              <Button 
                variant="primary"
                className="py-2 px-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor:  selectedFiles.length > 0 ? '#3B82F6' : '#93C5FD',  width: '120px' }}
                onClick={handleCancel}
              >
                <FaTimes className="me-2" /> Cancel
              </Button>
            </div>
            
            {/* Progress line for all uploads - placed below buttons */}
            <div style={{ position: 'relative', height: '1px', backgroundColor: '#E2E8F0' }}>
              {selectedFiles.length > 0 && (
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '1px',
                    width: `${calculateOverallProgress()}%`,
                    backgroundColor: '#3B82F6'
                  }}
                ></div>
              )}
            </div>
            
            {/* Conditional rendering based on whether files are selected */}
            {selectedFiles.length === 0 ? (
              // Drag and drop area (only shown when no files are selected)
              <div 
                className="p-5 d-flex justify-content-center align-items-center"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                  minHeight: '200px', 
                  backgroundColor: isDragging ? '#EFF6FF' : 'transparent'
                }}
              >
                <p className="mb-0 text-secondary">Drag and Drop files here.</p>
              </div>
            ) : (
              // File list (shown when files are selected)
              <div>
                {selectedFiles.map((file, index) => (
                  <div key={index}>
                    <div className="d-flex align-items-center justify-content-between py-3 px-4" style={{backgroundColor: "white"}}>
                      <div className="d-flex align-items-center">
                        {/* File thumbnail */}
                        <div 
                          className="me-3 d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            backgroundColor: '#FFFFFF', 
                            borderRadius: '4px',
                            overflow: 'hidden' 
                          }}
                        >
                          {file.type && file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="thumbnail" 
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#CBD5E0' }}></div>
                          )}
                        </div>
                        
                        {/* File details */}
                        <div className="flex-grow-1">
                        <div 
  className="text-dark text-truncate" 
  style={{ maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
>
  {file.name}
</div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-secondary">{(file.size / 1024).toFixed(1)} KB</span>
                            
                            {/* Status badge */}
                            <span 
                              className="px-2 py-1 rounded-pill text-white"
                              style={{ 
                                backgroundColor: 
                                  fileStatuses[file.name] === 'Completed' ? '#48BB78' : 
                                  fileStatuses[file.name] === 'Failed' ? '#F56565' : 
                                  '#F6AD55',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              {fileStatuses[file.name] || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <button 
                        onClick={() => handleRemoveFile(index)}
                        className="btn btn-sm text-danger ms-5"
                        style={{ background: 'none', border: 'none' }}
                      >
                        <FaTimes style={{ color: '#F56565' }} />
                      </button>
                    </div>
                    
                    {/* Individual file divider without progress bar */}
                    <div className="border-bottom" style={{ borderColor: '#E2E8F0' }}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Navigation Buttons */}
      <Row className="mt-4 d-flex justify-content-between">
        <Col xs="auto">
          <Button variant="primary" className="px-4 py-2" onClick={() => navigateApplicants(-1)}>
            <FaArrowLeft className="me-2" /> Back
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="primary" className="px-4 py-2" onClick={() => navigateApplicants(1)}>
          <FaArrowRight className="me-2" />  Next 
          </Button>
        </Col>
      </Row>
      </Card.Body>
      </Card>
    </Container>
  );

  // Determine which view to render based on current step
  const renderCurrentView = () => {
    switch (currentStep) {
      case 1:
        return renderInitialView();
      case 2:
        return renderApplicantView();
      case 3:
        return renderDocumentTypeView();
      default:
        return renderInitialView();
    }
  };

  return (
    <>
      {renderCurrentView()}
      
      {/* Add Applicant Modal */}
      <AddApplicantModal 
        show={showApplicantModal}
        handleClose={handleApplicantModalClose}
        handleSave={handleSaveApplicant}
      />

      {/* Add Document Modal */}
      <AddDocumentModal
        show={showDocumentModal}
        handleClose={handleDocumentModalClose}
        handleSave={handleAddDocument}
      />
    </>
  );
};

export default DocumentUpload;