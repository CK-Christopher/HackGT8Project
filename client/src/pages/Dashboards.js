import { ListGroup, Spinner } from "react-bootstrap";
import { Container, Row, Col } from "react-bootstrap";
import { Badge, Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import apiurl from "../apiurl";
import { UserContext } from "../App";

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
  const [showReward, setShowReward] = useState({ show: false, reward: null });
  const [showInvoice, setShowInvoice] = useState(false);
  const [customers, setCustomers] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [user, setUser] = useContext(UserContext);

  const handleClose = (e) => {
    const index = e.target.key;
    setShowReward({ show: false, reward: null });
  };
  const handleShow = (index) => {
    console.log(index);
    setShowReward({ show: true, reward: rewards.rewards[index] });
  };

  useEffect(async () => {
    const res = await fetch(apiurl + "/business/customers", {
      credentials: "include",
      method: "GET",
    });
    const json = await res.json();
    setCustomers(json);
  }, []);

  useEffect(async () => {
    const res = await fetch(apiurl + "/business/me/rewards", {
      credentials: "include",
      method: "GET",
    });
    const json = await res.json();
    console.log(json);
    setRewards(json);
  }, []);

  useEffect(async () => {
    const res = await fetch(apiurl + "/business/me/invoices", {
      credentials: "include",
      method: "GET",
    });
    const json = await res.json();
    console.log(json);
    setInvoices(json);
  }, []);

  return (
    <>
      <Container className="pt-4">
        <h3 className="text-center">Business Dashboard</h3>
        <Row>
          <Col md className="col-lg-6">
            <ListGroup>
              <h4>Customers</h4>
              {!customers ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                customers.customers.map((customer) => {
                  return (
                    <ListGroup.Item
                      as="li"
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{customer.user}</div>
                      </div>
                      <Badge variant="primary" pill>
                        {customer.points}
                      </Badge>
                    </ListGroup.Item>
                  );
                })
              )}
            </ListGroup>
            <Button className="mt-2 float-right">Clear All</Button>
          </Col>
          <Col md className="col-lg-6">
            <ListGroup>
              <h4>Rewards</h4>
              {!rewards ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                rewards.rewards.map((reward, index) => (
                  <ListGroup.Item
                    as="li"
                    className="d-flex justify-content-between align-items-start award-item"
                    onClick={handleShow.bind(this, index)}
                  >
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{reward.name}</div>
                    </div>
                    <Badge bg="success" pill>
                      {reward.cost}
                    </Badge>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
            <a className="btn btn-success my-2 float-right" href="/reward/add">
              Add New Reward
            </a>
          </Col>
          <Col md>
            <ListGroup>
              <h4>Invoices</h4>
              {!invoices ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                invoices.invoices.map((invoice) => (
                  <a className="div" href="/">
                    <ListGroup.Item
                      as="li"
                      className="d-flex justify-content-between align-items-start invoice-item"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{invoice.transaction_num}</div>
                        {invoice.transaction_date}
                      </div>
                      <Badge bg="dark" pill>
                        {invoice.points}
                      </Badge>
                    </ListGroup.Item>
                  </a>
                ))
              )}
            </ListGroup>
            <a
              variant="dark"
              className="btn btn-dark mt-2 float-right"
              href="/invoice/add"
            >
              Add New Invoice
            </a>
          </Col>
        </Row>
      </Container>
      <ViewRewardModal
        show={showReward.show}
        reward={showReward.reward}
        handleClose={handleClose}
      />
    </>
  );
}

function ViewRewardModal(props) {
  const reward = props.reward;
  return !reward ? (
    <></>
  ) : (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{reward.name}</Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <p className="fw-bold">Name</p>
          <p>{reward.description}</p>
          <h3>
            <Badge bg="success" size="lg" pill>
              {reward.cost}
            </Badge>
          </h3>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <a
            className="btn btn-primary"
            href={"/reward/update/" + reward.id}
            variant="primary"
          >
            Update
          </a>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export { CustomerDashboard, BusinessDashboard, ViewRewardModal };
