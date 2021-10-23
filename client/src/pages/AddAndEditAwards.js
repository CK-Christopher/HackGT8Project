import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { useState } from "react";

function RewardsEditor(props) {
  const { rewardid } = useParams();
  const { mode } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleShow = () => setShowDeleteModal(true);
  const handleClose = () => setShowDeleteModal(false);

  return (
    <>
      <Navigation></Navigation>
      <Container>
        <div className="reward-form-container mt-5">
          <h3 className="mt-3">
            {mode === "add" ? "Add New Reward" : "Update Reward"}
          </h3>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reward name"
                required
              />
              <Form.Text className="text-muted">
                Make this name appealing.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Give a description of reward"
                required
              />
              <Form.Text className="text-muted">
                Have a good description
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="Provide a cost of reward points"
                required
              />
            </Form.Group>
            <Button
              type="submit"
              variant="success"
              className="float-right mx-1"
            >
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
        <Modal.Title>Reward Title</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you wish to delete this reward?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Cancel
        </Button>
        <Button variant="danger">Delete</Button>
      </Modal.Footer>
    </Modal>
  );
}
export default RewardsEditor;
