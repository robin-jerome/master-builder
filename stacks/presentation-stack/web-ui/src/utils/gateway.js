import request from "./request";

export default {

  getCustomer() {
    return request("GetCustomer");
  }

};
