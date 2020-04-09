import { Authenticator, Greetings, SignUp } from "aws-amplify-react";
import React, { useState } from "react";
import { Container } from "react-bootstrap";

import Header from "./components/Header";
import CustomerSummary from "./components/CustomerSummary";

import gateway from "./utils/gateway";

export default () => {
  const [authState, setAuthState] = useState(undefined);
  const [currentPage, setCurrentPage] = useState("customer");

  const loadCustomer = () => setCurrentPage("customer");

  const classNames = ["App"];
  if (authState !== "signedIn") classNames.push("amplify-auth");

  return (
    <div className={classNames.join(" ")}>
      <Authenticator
        onStateChange={s => setAuthState(s)}
        hide={[Greetings, SignUp]}
      >
        {authState === "signedIn" && (
          <>
            <Header
              currentPage={currentPage}
              loadCustomer={loadCustomer}
            />
            <Container>
              {currentPage === "customer" && (
                <CustomerSummary
                  gateway={gateway}
                />
              )}
            </Container>
          </>
        )}
      </Authenticator>
    </div>
  );
};
