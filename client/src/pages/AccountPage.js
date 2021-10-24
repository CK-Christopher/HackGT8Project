import Navigation from "./Navigation";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { UserContext } from "../App";
import { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import apiurl from "../apiurl";
function AccountPage(props) {
  const [user, setUser] = useContext(UserContext);
  const [changesMade, setChangesMade] = useState(false);
  const [validated, setValidated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [analzyingFace, setAnalyzingFace] = useState({
    status: false,
    result: null,
  });

  const [pictureValidated, setPictureValidated] = useState(false);

  useEffect(async () => {
    if (user && user.account_type) {
      const res = await fetch(apiurl + "/" + user.account_type + "/profile", {
        credentials: "include",
        method: "GET",
      });
      const json = await res.json();
      setUserProfile(json);
    }
  }, []);

  const checkChange = (e) => {
    if (user.name != e.target.value) {
      setChangesMade(true);
    } else {
      setChangesMade(false);
    }
  };

  const uploadImageToDB = async (form) => {
    const data = new FormData(form);
    setAnalyzingFace({ status: true, result: null });
    const res = await fetch(apiurl + "/faces/me", {
      method: "POST",
      credentials: "include",
      body: data,
    });
    if (res.status == 200) {
      // Face Detected
      setAnalyzingFace({ status: false, result: "Success" });
    } else {
      setAnalyzingFace({ status: false, result: "Fail" });
    }
  };

  const pictureHandleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      uploadImageToDB(form);
    }

    setPictureValidated(true);
  };

  const updateProfileInfo = async (form) => {
    const data = new URLSearchParams(new FormData(form));
    const res = await fetch(apiurl + "/" + user.account_type + "/profile", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        name: form.name.value,
        acct_type: form.account_type.value.toLowerCase(),
        location: form.location.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    window.location.reload(false);
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      updateProfileInfo(form);
    }

    setValidated(true);
  };

  const handleFileChange = () => {
    setAnalyzingFace({ status: false, result: null });
  };
  if (user == null) {
    return <Redirect to="/" />;
  }

  return !userProfile ? (
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  ) : (
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
              <a
                className="btn btn-outline-warning float-end"
                href="/"
                onClick={async () => {
                  const res = await fetch(apiurl + "/auth/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                }}
              >
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
                defaultValue={userProfile.name}
                onChange={checkChange}
                required
                name="name"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a non-empty name.
              </Form.Control.Feedback>
            </Form.Group>
            {userProfile.location && (
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  defaultValue={userProfile.location}
                  onChange={checkChange}
                  required
                  name="location"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a non-empty name.
                </Form.Control.Feedback>
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                plaintext
                readOnly
                className="form-control-plaintext"
                type="email"
                placeholder=""
                value={userProfile.email}
                name="email"
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
                name="account_type"
              />
            </Form.Group>
            <Button type="submit" className="mb-1" disabled={!changesMade}>
              Save Changes
            </Button>
            <hr />
          </Form>
          <Form
            onSubmit={pictureHandleSubmit}
            validated={pictureValidated}
            noValidate
          >
            <Form.Group controlId="formFile" className="mt-1">
              <Form.Label>Your Identifying Picture (Optional)</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/jpeg"
                onChange={handleFileChange}
                required
              />
              <Form.Text className="text-muted">
                Must be .jpg/.jpeg file
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                You must provide a file.
              </Form.Control.Feedback>
              {analzyingFace.status && (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              )}
              <Form.Group>
                {analzyingFace.result == "Success" && (
                  <Form.Text className="text-success">
                    Your face was detected and was uploaded to the database.
                  </Form.Text>
                )}{" "}
                {analzyingFace.result == "Fail" && (
                  <Form.Text className="text-danger">
                    Your face was not detected and was not uploaded to the
                    database.
                  </Form.Text>
                )}
              </Form.Group>
            </Form.Group>
            <Button type="submit" className="my-1">
              Upload Picture
            </Button>
          </Form>
        </Container>
      </section>
    </>
  );
}
export default AccountPage;
