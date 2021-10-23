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
            <Button variant="success" className="mt-2 float-right">
              Add New Award
            </Button>
          </Col>
        </Row>
      </Container>
      <ViewAwardModal show={show} handleClose={handleClose} />
    </>
  );
}

function ViewAwardModal(props) {
  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Award</Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Cancel
          </Button>
          <Button variant="primary">Understood</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export { CustomerDashboard, BusinessDashboard };