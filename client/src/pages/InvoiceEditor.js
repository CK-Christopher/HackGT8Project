import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { useState } from "react";

function InvoiceEditor(props) {
  const { invoiceid } = useParams();
  const { mode } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const handleShow = () => setShowDeleteModal(true);
  const handleClose = () => setShowDeleteModal(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  return (
    <>
      <Navigation></Navigation>
      <Container>
        <div className="reward-form-container mt-5">
          <h3 className="mt-3">
            {mode === "add" ? "Add New Invoice" : "Update Invoice"}
          </h3>
          <Form validated={validated} onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="formBasicEmail" required>
              <Form.Label>Transaction ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter invoice transaction ID"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a reward name.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recipient</Form.Label>
              <Form.Select aria-label="Account Type Select" required>
                <option value="">Select Recipient</option>
                <option value="1">Jody Starks</option>
                <option value="2">Bob Bill</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                placeholder="Provide a cost of reward points"
                min="1"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter points greater than or equal to 1
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="dark" className="float-right mx-1">
              {mode === "add" ? "Add" : "Update"}
            </Button>
            {mode === "update" && (
              <Button
                variant="danger"
                className="float-right mx-1"
                onClick={handleShow}
              >
                Delete
              </Button>
            )}
          </Form>
        </div>
      </Container>
      <ConfirmDeleteModal
        show={showDeleteModal}
        handleClose={handleClose}
      ></ConfirmDeleteModal>
    </>
  );
}
function ConfirmDeleteModal(props) {
  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Transaction Number</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you wish to delete this invoice?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Cancel
        </Button>
        <Button variant="danger">Delete</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InvoiceEditor;
