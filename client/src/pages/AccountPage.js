import Navigation from "./Navigation";
import { Container, Row, Col } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { UserContext } from "../App";
import { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
function AccountPage(props) {
  const [user, setUser] = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);
  const [validated, setValidated] = useState(false);

  const checkChange = (e) => {
    if (user.name != e.target.value) {
      setChangesMade(true);
    } else {
      setChangesMade(false);
    }
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    console.log("submit");
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };
  if (user == null) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Navigation></Navigation>
      <section className="bg-secondary text-light py-3">
        <Container>
          <Row className="d-flex align-items-center">
            <Col md>
              <h2>Account Settings</h2>
              <p className="lead">Configure your account settings here.</p>
            </Col>
            <Col md className="pe-auto">
              <a className="btn btn-outline-warning float-end" href="/">
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </a>
              <a className="btn btn-primary me-2 float-end" href="/">
                <i className="bi bi-arrow-left"></i> Back to Dashboard
              </a>
            </Col>
          </Row>
        </Container>
      </section>
      <section className="bg-light py-3">
        <Container className="text-black py-3 w-50">
          <Form onSubmit={handleSubmit} validated={validated} noValidate>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder=""
                defaultValue={user.name}
                onChange={checkChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a non-empty name.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                plaintext
                readOnly
                className="form-control-plaintext"
                type="email"
                placeholder=""
                value={user.email}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Account Type</Form.Label>
              <Form.Control
                plaintext
                readOnly
                type="text"
                placeholder=""
                value={
                  user.account_type.charAt(0).toUpperCase() +
                  user.account_type.slice(1)
                }
              />
              <Button
                type="submit"
                className="float-right"
                disabled={!changesMade}
              >
                Save Changes
              </Button>
            </Form.Group>
          </Form>
        </Container>
      </section>
    </>
  );
}
export default AccountPage;
