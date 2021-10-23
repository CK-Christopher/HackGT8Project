import { useParams } from "react-router";
import Navigation from "./Navigation";
import { Container, Row, Col } from "react-bootstrap";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Badge, ListGroup } from "react-bootstrap";
import { ViewRewardModal } from "./Dashboards";
import { Modal, Button, Form } from "react-bootstrap";

function CustomerPage(props) {
  const user = useContext(UserContext);
  const [show, setShow] = useState(false);
  const handleShow = () => {
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };
  const { customerid } = useParams();
  return (
    <>
      <Navigation />
      <section className="bg-info py-3">
        <Container>
          <h2>Customer ID: {customerid}</h2>
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
            <Col className="pt-1">
              <ListGroup>
                <h3>Redeemed Rewards</h3>
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
            <Col className="pt-1">
              <ListGroup>
                <h3>Provided Invoices</h3>
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start award-item"
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
      <ViewRewardModal show={show} handleClose={handleClose}></ViewRewardModal>
    </>
  );
}

export default CustomerPage;
