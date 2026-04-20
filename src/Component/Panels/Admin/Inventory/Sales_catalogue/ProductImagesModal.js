// ProductImagesModal.js
import React, { useState } from 'react';
import { Modal, Button, Carousel, Alert, Spinner } from 'react-bootstrap';
import { FaTimes, FaTrash, FaImage } from 'react-icons/fa';
import { baseurl } from "../../../../BaseURL/BaseURL";
import axios from 'axios';

const ProductImagesModal = ({ 
  show, 
  onClose, 
  productName, 
  images = [], 
  productId,
  onImageDeleted 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const handleDeleteImage = async (imagePath) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`${baseurl}/products/${productId}/image`, {
        data: { imagePath }
      });

      if (response.data.success) {
        showAlert('Image deleted successfully!', 'success');
        onImageDeleted(); // Trigger parent to refresh
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showAlert('Failed to delete image', 'danger');
    } finally {
      setDeleting(false);
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <FaImage className="me-2 text-info" />
          Product Images: {productName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert.show && (
          <Alert variant={alert.variant} className="mb-3">
            {alert.message}
          </Alert>
        )}

        {deleting && (
          <div className="text-center mb-3">
            <Spinner animation="border" size="sm" className="me-2" />
            Deleting image...
          </div>
        )}

        {images.length === 0 ? (
          <div className="text-center py-5">
            <FaImage size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No images found</h5>
            <p className="text-muted">This product doesn't have any images uploaded yet.</p>
          </div>
        ) : (
          <>
            {/* Image Carousel */}
            <Carousel activeIndex={activeIndex} onSelect={handleSelect} interval={null}>
              {images.map((image, index) => (
                <Carousel.Item key={index}>
                  <div className="text-center mb-3" style={{ maxHeight: '400px', overflow: 'hidden' }}>
                    <img
                      src={image.startsWith('/') ? `${baseurl}${image}` : image}
                      alt={`${productName} - Image ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      <small className="text-muted">
                        Image {index + 1} of {images.length}
                      </small>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteImage(image)}
                      disabled={deleting}
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="row mt-3">
                <div className="col-12">
                  <p className="mb-2">
                    <small className="text-muted">Click thumbnail to view:</small>
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`border rounded p-1 ${activeIndex === index ? 'border-primary' : 'border-light'}`}
                        style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                        onClick={() => setActiveIndex(index)}
                      >
                        <img
                          src={image.startsWith('/') ? `${baseurl}${image}` : image}
                          alt={`Thumb ${index + 1}`}
                          className="img-fluid h-100 w-100 object-fit-cover rounded"
                          style={{ opacity: activeIndex === index ? 1 : 0.7 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/60x60?text=Thumb';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            <small className="text-muted">
              Total images: {images.length}
            </small>
          </div>
          <Button variant="secondary" onClick={onClose}>
            <FaTimes className="me-1" /> Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductImagesModal;