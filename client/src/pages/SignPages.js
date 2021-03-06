import { Form } from "react-bootstrap";
import { Container, Row, Col } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { useContext, useState } from "react";
import path from "path";
import { UserContext } from "../App";
import apiurl from "../apiurl.js";

function SignUp() {
  const [formState, setFormState] = useState({
    selectAns: 0,
    buttonDisabled: true,
  });
  const [validated, setValidated] = useState(false);
  const [user, setUser] = useContext(UserContext);

  const route =
    apiurl +
    "/auth/register" +
    (formState.selectAns == "1" ? "/customer" : "/business");

  const signInIntoAPI = async (form) => {
    const data = new URLSearchParams(new FormData(form));
    const res = await fetch(route, {
      method: "POST",
      body: new URLSearchParams(new FormData(form)),
      credentials: "include",
    });
    window.location = "/";
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      signInIntoAPI(form);
    }

    setValidated(true);
  };

  return (
    <Container>
      <div className="sign-form-container mt-5">
        <h2>Sign up to Rewardr</h2>
        <Form
          validated={validated}
          onSubmit={handleSubmit}
          method="POST"
          action={route}
          noValidate
        >
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Enter email"
              required
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Please provide a valid email address.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a non-empty password.
            </Form.Control.Feedback>
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
              required
            >
              <option value="">Choose an Account Type</option>
              <option value="1">Customer</option>
              <option value="2">Business</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select an account type.
            </Form.Control.Feedback>
          </Form.Group>
          {formState.selectAns != "" && (
            <Form.Group>
              <Form.Label className="mt-3">
                {formState.selectAns == 1 ? "Personal Name" : "Company Name"}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a personal name.
              </Form.Control.Feedback>
            </Form.Group>
          )}
          {formState.selectAns == 2 && (
            <Form.Group controlId="formFile" className="mt-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your business address"
                name="location"
                required
              />
              <Form.Text className="text-muted">
                Customers need to know where your business is
              </Form.Text>
            </Form.Group>
          )}
          <p className="lead mt-2">
            Already have an account? <a href="/signin">Sign In</a>
          </p>
          <Button
            variant="primary"
            type="submit"
            className="mt-2"
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
  const [validated, setValidated] = useState(false);
  const [user, setUser] = useContext(UserContext);

  const route = apiurl + "/auth/login";
  const signInIntoAPI = async (form) => {
    const data = new URLSearchParams(new FormData(form));
    const res = await fetch(route, {
      method: "POST",
      body: new URLSearchParams(new FormData(form)),
      credentials: "include",
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
      signInIntoAPI(form);
    }

    setValidated(true);
  };
  return (
    <Container>
      <div className="sign-form-container mt-5">
        <h2>Sign in to Rewardr</h2>
        <Form validated={validated} noValidate onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid email address.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              name="password"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a non-empty password.
            </Form.Control.Feedback>
          </Form.Group>

          <p className="lead">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
          <Button variant="primary" type="submit" className="mt-2">
            Sign In
          </Button>
        </Form>
      </div>
    </Container>
  );
}

export { SignUp, SignIn };
