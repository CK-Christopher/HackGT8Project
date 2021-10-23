import { ListGroup } from "react-bootstrap";
import { Container, Row, Col } from "react-bootstrap";
import { Badge, Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { useState } from "react";
import { Form } from "react-bootstrap";

function CustomerDashboard(props) {
  return (
    <Container className="pt-4">
      <h3 className="text-center">Customer Dashboard</h3>
      <ListGroup>
        <ListGroup.Item
          as="li"
          className="d-flex justify-content-between align-items-start"
        >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Andrew's Awesome ML Co.</div>
            Restaurant
          </div>
          <Badge variant="primary" pill>
            475
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item
          as="li"
          className="d-flex justify-content-between align-items-start"
        >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Mum and Dad's Shop</div>
            Grocery Store
          </div>
          <Badge variant="primary" pill>
            28
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item
          as="li"
          className="d-flex justify-content-between align-items-start"
        >
          <div className="ms-2 me-auto">
            <div className="fw-bold">Small Business 3</div>
            Thrift Shop
          </div>
          <Badge variant="primary" pill>
            30
          </Badge>
        </ListGroup.Item>
      </ListGroup>
    </Container>
  );
}

function BusinessDashboard() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Container className="pt-4">
        <h3 className="text-center">Business Dashboard</h3>
        <Row>
          <Col md>
            <ListGroup>
              <h4>Customers</h4>
              <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Mary Joe</div>
                  ID: 223892
                </div>
                <Badge variant="primary" pill>
                  475
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Hope Wild</div>
                  ID: 223892
                </div>
                <Badge variant="primary" pill>
                  28
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto award-item">
                  <div className="fw-bold">Customer 3</div>
                  ID: 223892
                </div>
                <Badge variant="primary" pill>
                  30
                </Badge>
              </ListGroup.Item>
            </ListGroup>
            <Button className="mt-2 float-right">Clear All</Button>
          </Col>
          <Col md>
            <ListGroup>
              <h4>Awards</h4>
              <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start award-item"
                onClick={handleShow}
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Andrew's Awesome ML Co.</div>
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
                  <div className="fw-bold">Mum and Dad's Shop</div>
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
                  <div className="fw-bold">Small Business 3</div>
                </div>
                <Badge bg="success" pill>
                  30
                </Badge>
              </ListGroup.Item>
            </ListGroup>
            <a className="btn btn-success mt-2 float-right" href="/reward/add">
              Add New Reward
            </a>
          </Col>
        </Row>
      </Container>
      <ViewRewardModal show={show} handleClose={handleClose} />
    </>
  );
}

function ViewRewardModal(props) {
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
            Update
          </a>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export { CustomerDashboard, BusinessDashboard };
