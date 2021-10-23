import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";

function RewardsEditor(props) {
  const { rewardid } = useParams();
  const { mode } = props;

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
            <Button type="submit" variant="success" className="float-right">
              {mode === "add" ? "Add" : "Update"}
            </Button>
          </Form>
        </div>
      </Container>
    </>
  );
}

export default RewardsEditor;
