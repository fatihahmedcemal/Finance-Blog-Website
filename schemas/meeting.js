module.exports = class Meeting {
    constructor(date, link, helper, customer, id) {  // Constructor
      this.id = id;
      this.meetingDate = date;
      this.meetingLink = link;
      this.helper = helper;
      this.customer = customer;
    }
}