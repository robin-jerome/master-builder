import Amplify, { API } from "aws-amplify";
import { retryWrapper } from "./index";

const settings = window.apiGwSettings || {
  cognitoIdentityPool: "us-east-1:cb4f7f5e-0725-41fb-bf13-410d8258774b",
  cognitoUserPoolId: "us-east-1_8twvxp97N",
  cognitoUserPoolClientId: "49cilmpftgeehm5r1gdrl8buqe",
  region: "us-east-1",
  apiGwEndpoint: "https://ln2dshjaoh.execute-api.us-east-1.amazonaws.com/Dev"
};
const region = settings.region || "eu-west-1";

Amplify.configure({
  Auth: {
    identityPoolId: settings.cognitoIdentityPool,
    region,
    mandatorySignIn: true,
    userPoolId: settings.cognitoUserPoolId,
    userPoolWebClientId: settings.cognitoUserPoolClientId
  },
  API: {
    endpoints: [{
      name: "apiGatewayApi",
      endpoint: settings.apiGwEndpoint,
      region,
      service: "apiGateway"
    }]
  }
});

export default (endpointName, data) =>
retryWrapper(() =>
  API.get("apiGatewayApi", "/customers/asdfg", {
    headers: {
      'Accept': 'application/json'
    }
  })
);