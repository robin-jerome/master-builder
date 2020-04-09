import React, { useEffect, useState } from "react";
import { Alert, Card, Spinner, Table } from "react-bootstrap";
import { formatErrorMessage, mapResults } from "../utils";

export default ({ gateway }) => {
  const [customer, setCustomer] = useState(undefined);
  const [errorDetails, setErrorDetails] = useState(undefined);
  const [customerRefreshCycle] = useState(1);

  useEffect(() => {
    gateway
      .getCustomer()
      .then(x => setCustomer(mapResults(x)))
      .catch(e => setErrorDetails(formatErrorMessage(e)));
  }, [gateway, customerRefreshCycle]);

  return (
    <div className="customer tab-content">
      <div className="logo">
        <img src="/personalization.png" alt="Octank personalization demo" />
      </div>
      <h2>Octank FSI Personalization Demo</h2>
      <div className="powered">powered by Amazon Connect, Transcribe, Comprehend and SageMaker </div>
      {errorDetails && (
        <Alert variant="danger" style={{ marginTop: "30px" }}>
          {errorDetails}.{" "}
          <a href={window.location.href}>Retry</a>.
        </Alert>
      )}
      {!errorDetails && !customer && (
        <Spinner animation="border" role="status" style={{ marginTop: "30px" }}>
          <span className="sr-only">Loading...</span>
        </Spinner>
      )}
      {customer &&
        Object.keys(customer).map((category, index) => (
          <Card key={index}>
            <Card.Header>{category}</Card.Header>
            <Card.Body>
              <Table>
                <tbody>
                {customer[category].map((productName, index) => (
                    <tr key={`v-${index}`}>
                      <td>
                        {productName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))}
    </div>
  );
};
