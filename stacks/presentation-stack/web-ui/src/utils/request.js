import Amplify, { API } from "aws-amplify";
import { retryWrapper } from "./index";

const settings = window.apiGwSettings || {};
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
retryWrapper(() => API.get("apiGatewayApi", `customers/${data.username}`, {
  headers: {
    'Accept': 'application/json'
  }
}));