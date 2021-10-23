import { useParams } from "react-router";
import Navigation from "./Navigation";
import { Container, Row, Col } from "react-bootstrap";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Badge, ListGroup } from "react-bootstrap";
import { ViewRewardModal } from "./Dashboards";
import { Modal, Button, Form } from "react-bootstrap";

function BusinessPage(props) {
  const user = useContext(UserContext);
  const [show, setShow] = useState(false);
  const handleShow = () => {
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };
  const { businessid } = useParams();
  return (
    <>
      <Navigation />
      <section className="bg-info py-3">
        <Container>
          <h2>Business: {businessid}</h2>
        </Container>
      </section>
      {user.account_type == "customer" && (
        <section className="bg-light">
          <Container>
            <Row>
              <Col className="pt-1">
                <div>
                  <p className="lead">
                    Your Points:{" "}
                    <h2 className="d-inline">
                      <Badge bg="primary" pill>
                        28
                      </Badge>
                    </h2>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
      <section>
        <Container>
          <Row>
            <Col md className="pt-1">
              <ListGroup>
                <h3>Rewards</h3>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
                  onClick={handleShow}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Free T-Shirts</div>
                  </div>
                  <Badge bg="success" pill>
                    475
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
                  onClick={handleShow}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Free Donuts</div>
                  </div>
                  <Badge bg="success" pill>
                    28
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
                  onClick={handleShow}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Free free free</div>
                  </div>
                  <Badge bg="success" pill>
                    30
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md className="pt-1">
              <ListGroup>
                <h3>Your Invoices</h3>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
                  onClick={handleShow}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Free T-Shirts</div>
                  </div>
                  <Badge bg="dark" pill>
                    475
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
                  onClick={handleShow}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Free Donuts</div>
                  </div>
                  <Badge bg="dark" pill>
                    28
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
                  onClick={handleShow}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Free free free</div>
                  </div>
                  <Badge bg="dark" pill>
                    30
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </Container>
      </section>

      <RedeemRewardModal
        show={show}
        handleClose={handleClose}
      ></RedeemRewardModal>
    </>
  );
}

function RedeemRewardModal(props) {
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
      <Form>
        <Modal.Body>
          <p className="fw-bold">Name</p>
          <p>
            Description: Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Architecto ullam esse enim atque modi. Consequuntur tempora
            praesentium pariatur! Recusandae reiciendis non nisi commodi
            possimus in! Corrupti laboriosam rem magnam iste at consequuntur
            fuga facilis necessitatibus perferendis nam fugit temporibus nobis
            sed, reprehenderit excepturi quia aperiam sapiente? Delectus culpa
            quis voluptates?
          </p>
          <h3>
            <Badge bg="success" size="lg" pill>
              30
            </Badge>
          </h3>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <a
            className="btn btn-primary"
            href="/reward/update/69"
            variant="primary"
          >
            Redeem
          </a>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
export default BusinessPage;
