import { Container, Row, Col } from "react-bootstrap";
import { Navbar, Nav } from "react-bootstrap";
import { CustomerDashboard, BusinessDashboard } from "./Dashboards";
import { FormControl, InputGroup, Button } from "react-bootstrap";
import { Profiler, useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Navigation from "./Navigation";
import { UserContext } from "../App";
import apiurl from "../apiurl";
import logo from "../Rewardr-logos.jpeg";

function HomePage(props) {
  const [user, setUser] = useContext(UserContext);
  const [userProfile, setUserProfile] = useState(null);
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
  if (!user) {
    return (
      <>
        <Navigation />
        <div className="bg-image text-light">
          <div
            className="mask"
            style={{ "background-color": "rgba(0, 0, 0, 0.6)" }}
          >
            <div className="welcome-box d-flex justify-content-center align-items-center h-100 bg-secondary">
              <Container className="py-5">
                <Row className="d-flex align-items-center justify-items-center">
                  <img className="logo" src={logo} alt="" />
                  <h2>Welcome!</h2>
                  <p className="lead text-white">
                    To use our services, please sign in or create a new account
                  </p>
                  <Row className="m-auto">
                    <Col>
                      <a
                        href="/signin"
                        className="standard-btn btn btn-outline-light"
                      >
                        Sign In
                      </a>
                    </Col>
                    <Col>
                      <a href="/signup" className="standard-btn btn btn-light">
                        Create A New Account
                      </a>
                    </Col>
                  </Row>
                </Row>
              </Container>
            </div>
          </div>
        </div>
      </>
    );
  }

  return !userProfile ? (
    <div className="spinner-container">
      <Spinner animation="border" role="status" className="big-spinner">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  ) : (
    <>
      <Navigation></Navigation>
      <section className="bg-info text-light">
        <Container className="py-4">
          <Row className="d-flex align-items-center">
            <Col md>
              <h2>Hello {userProfile.name}!</h2>
              <p className="lead">
                {" "}
                {user.account_type == "customer"
                  ? "Redeem points earned from your shopping to receive rewards from your favorite businesses"
                  : "Manage your business's loyalty system and its participants, rewards, and invoices"}
              </p>
            </Col>
          </Row>
        </Container>
      </section>
      {user.account_type === "customer" ? (
        <CustomerDashboard />
      ) : (
        <BusinessDashboard />
      )}
    </>
  );
}

export default HomePage;
