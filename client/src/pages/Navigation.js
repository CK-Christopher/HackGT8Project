import { useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Navbar, Nav } from "react-bootstrap";
import { Route } from "react-router";
import apiurl from "../apiurl";
import { UserContext } from "../App";

function Navigation(props) {
  const [user, setUser] = useContext(UserContext);

  return (
    <Navbar bg="dark" expand="lg" className="navbar-dark fixed-top">
      <Container>
        <Navbar.Brand href="/">Rewardr</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/account">Account</Nav.Link>
            <Nav.Link
              href={user ? "/" : "/signin"}
              onClick={async () => {
                const res = await fetch(apiurl + "/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
              }}
            >
              {user ? "Sign Out" : "Sign In"}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
