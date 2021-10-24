import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { useState } from "react";
import apiurl from "../apiurl";

function RewardsEditor(props) {
  const { rewardid } = useParams();
  const { mode } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleShow = () => setShowDeleteModal(true);
  const handleClose = () => setShowDeleteModal(false);

  const addToRewardDB = async (form) => {
    const data = new URLSearchParams(new FormData(form));
    const res = await fetch(apiurl + "/business/me/rewards", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        cost: form.cost.value,
        name: form.name.value,
        description: form.description.value,
      }),
    });
    window.location = "/";
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      addToRewardDB(form);
    }

    setValidated(true);
  };

  return (
    <>
      <Navigation></Navigation>
      <Container>
        <div className="reward-form-container mt-5">
          <h3 className="mt-3">
            {mode === "add" ? "Add New Reward" : "Update Reward"}
          </h3>
          <Form validated={validated} onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="formBasicEmail" required>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reward name"
                name="name"
                required
              />
              <Form.Text className="text-muted">
                Make this name appealing.
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                Please provide a reward name.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                placeholder="Give a description of reward"
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
                min="1"
                name="cost"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter a cost greater than or equal to 1
              </Form.Control.Feedback>
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
