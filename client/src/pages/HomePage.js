import { Container, Row, Col } from "react-bootstrap";
import { Navbar, Nav } from "react-bootstrap";
import { CustomerDashboard, BusinessDashboard } from "./Dashboards";
import { FormControl, InputGroup, Button } from "react-bootstrap";
import { useState } from "react";
import Navigation from "./Navigation";

function HomePage(props) {
  const [customerIsUser, setCustomerIsUser] = useState(false);
  return (
    <>
      <Navigation></Navigation>
      <section className="bg-info">
        <Container className="py-4">
          <Row className="d-flex align-items-center">
            <Col md>
              <h2>Hello User!</h2>
              <p className="lead">Do whatever stuff you need to do</p>
            </Col>
            <Col md>
              <h6>Find New Loyalty Programs</h6>
              <InputGroup className="mb-3">
                <FormControl
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                />
                <Button variant="primary">Search</Button>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </section>
      {customerIsUser ? <CustomerDashboard /> : <BusinessDashboard />}
    </>
  );
}

export default HomePage;
