import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { SignOut } from 'aws-amplify-react';

export default ({ currentPage }) => (
  <Navbar
    style={{ backgroundColor: "#232f3e", marginBottom: "20px" }}
    variant="dark"
  >
    <Container>
      <Navbar.Brand>
        <div className="awslogo" />
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="ml-auto">
          {currentPage !== "customer"}
        </Nav>
      </Navbar.Collapse>
      <SignOut />
    </Container>
  </Navbar>
);
