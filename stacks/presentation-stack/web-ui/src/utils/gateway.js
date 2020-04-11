import request from "./request";
import { Auth } from "aws-amplify";

export default {

  getCustomer() {
    return Auth.currentAuthenticatedUser()
    .then(user => {
      return request("GetCustomer", user);
    });
  }

};
