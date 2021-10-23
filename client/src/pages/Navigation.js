import { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Navbar, Nav } from "react-bootstrap";
import { UserContext } from "../App";

function Navigation(props) {
  const user = useContext(UserContext);
  console.log("User: " + user);
  return (
    <Navbar bg="dark" expand="lg" className="navbar-dark fixed-top">
      <Container>
        <Navbar.Brand href="/">Rewards Vault</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/account">Account</Nav.Link>
            <Nav.Link href="/signin">{user ? "Sign Out" : "Sign In"}</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
