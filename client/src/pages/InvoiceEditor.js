import { Container, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { useState } from "react";
import apiurl from "../apiurl";

function InvoiceEditor(props) {
  const { invoiceid } = useParams();
  const { mode } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const handleShow = () => setShowDeleteModal(true);
  const handleClose = () => setShowDeleteModal(false);
  const [loading, setLoading] = useState({ status: false, result: null });
  const [qrcodeURL, setQrcodeURL] = useState(null);

  const addToInvoiceDB = async (form) => {
    const data = new FormData(form);
    setLoading({ status: true, result: null });
    const res = await fetch(apiurl + "/business/me/invoices", {
      credentials: "include",
      method: "POST",
      body: data,
    });

    if (res.status == 409) {
      setLoading({
        status: false,
        result: "Transaction Number Already In Use",
      });
    } else if (res.status == 204) {
      window.location = "/";
    } else {
      setLoading({
        status: false,
        result: "Face Cannot be Idenified. QR Code is Provided Below.",
      });
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setQrcodeURL(imageObjectURL);
    }
    //
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      addToInvoiceDB(form);
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
              <Form.Label>Transaction Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter invoice transaction ID"
                required
                name="transaction_num"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a transaction number.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                placeholder="Provide a cost of reward points"
                min="1"
                name="points"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter points greater than or equal to 1
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formFile" className="mt-3">
              <Form.Label>Customer Identifying Picture (Optional)</Form.Label>
              <Form.Control type="file" name="image" />
              <Form.Text className="text-muted">Must be .jpeg file</Form.Text>
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
            {loading.status && (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
            {loading.result && <Form.Text>{loading.result}</Form.Text>}
          </Form>

          {qrcodeURL && <img src={qrcodeURL} className="m-auto d-block"></img>}
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
