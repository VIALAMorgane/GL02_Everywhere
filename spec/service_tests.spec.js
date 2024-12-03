const Service = require('../service.js');

describe("Program testing of service", function(){
    beforeAll(function() {
		this.service = new Service();
	});

    it("can check room availability with a timeslot",function(){
        let timeslot=new Timeslot()
        expect(this.service.roomAvailable(timeslot, "data.txt")).toBe("[Insert here answer expected]")
        // expect(1).toBe(1)
    })

});