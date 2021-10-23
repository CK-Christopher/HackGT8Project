import { Form } from "react-bootstrap";
import { Container, Row, Col } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useState } from "react";

function SignUp() {
  const [formState, setFormState] = useState({
    selectAns: 0,
    buttonDisabled: true,
  });
  return (
    <Container>
      <div className="sign-form-container mt-5">
        <h2>Sign up to Rewards Vault</h2>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>
          <Form.Group>
            <Form.Label>Account Type</Form.Label>
            <Form.Select
              aria-label="Account Type Select"
              onChange={(e) => {
                setFormState({
                  selectAns: e.target.value,
                  buttonDisabled: e.target.value > 0 ? false : true,
                });
              }}
              value={formState.selectAns}
            >
              <option value="0">Choose an Account Type</option>
              <option value="1">Customer</option>
              <option value="2">Business</option>
            </Form.Select>
          </Form.Group>
          {formState.selectAns != 0 && (
            <Form.Group>
              <Form.Label className="mt-2">
                {formState.selectAns == 1 ? "Personal Name" : "Company Name"}
              </Form.Label>
              <Form.Control type="text" placeholder="Enter name" />
            </Form.Group>
          )}
          <Button
            variant="primary"
            type="submit"
            className="mt-4"
            disabled={formState.buttonDisabled}
          >
            Sign Up
          </Button>
        </Form>
      </div>
    </Container>
  );
}

function SignIn(props) {
  return (
    <Container>
      <div className="sign-form-container mt-5">
        <h2>Sign up to Rewards Vault</h2>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-4">
            Sign In
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export { SignUp, SignIn };
