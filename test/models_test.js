import { expect, Assertion } from "chai";
import moment from "moment";
import {Routine} from "../scripts/models";


Assertion.addMethod('almost', function (value) {
  if (value instanceof Date) {
    var diff = moment(this._obj).diff(value, 'seconds');
    new Assertion(diff).to.be.within(-1, 1);
  }
  else {
    new Assertion(this._obj).to.be.within(value - 1, value + 1);
  }
});


describe("Routine", () => {

  var routine;

  beforeEach(() => {
    let period = {value: 4, unit: "days"};
    routine = new Routine("Call mum", period);
  });


  describe("New routine", () => {

    it("has time left equal to period in seconds", () => {
      let fourDays = 4 * 24 * 3600;
      expect(routine.timeleft).to.be.almost(fourDays);
    });

    it("has no past occurence.", () => {
      expect(routine.last).to.be.undefined;
    });

    it("has next occurence computed from now", () => {
      let inFourDays = moment().add(4, "days").toDate();
      expect(routine.next).to.almost(inFourDays);
    });

    it("has status ok", () => {
      expect(routine.status).to.eql(Routine.status.OK);
    });
  });


  describe("Usual routine", () => {

    beforeEach(() => {
      // Simulates checked 1 day ago.
      let yesterday = moment().subtract(1, "days").toDate();
      routine.occurences.push(yesterday);
    });

    it("has last occurence.", () => {
      expect(routine.last).to.exist;
    });

    it("has elapsed equal seconds since last", () => {
      let oneDay = 24 * 3600;
      expect(routine.elapsed).to.be.almost(oneDay);
    });

    it("has next occurence computed from last one", () => {
      let inThreeDays = moment().add(3, "days").toDate();
      expect(routine.next).to.be.almost(inThreeDays);
    });

    it("has time left equal to period minus elapsed", () => {
      let threeDays = 3 * 24 * 3600;
      expect(routine.timeleft).to.be.almost(threeDays);
    });

    it("is shifted from now when checked", () => {
      routine.check();
      let inFourDays = moment().add(4, "days").toDate();
      expect(routine.next).to.be.almost(inFourDays);
    });

    it("has status ok if next occurence is far", () => {
      expect(routine.status).to.eql(Routine.status.OK);
    });

    it("has status warning if next occurence is close", () => {
      let threeDaysAgo = moment().subtract(4, "days")
                                 .add(2, "hours")
                                 .toDate();
      routine.occurences.push(threeDaysAgo);
      expect(routine.status).to.eql(Routine.status.WARNING);
    });
  });


  describe("Overdue routine", () => {

    beforeEach(() => {
      // Simulates checked 6 days ago.
      let longTimeAgo = moment().subtract(6, "days").toDate();
      routine.occurences.push(longTimeAgo);
    });

    it("has negative time left", () => {
      expect(routine.timeleft).to.be.negative;
    });

    it("has next occurence in the past", () => {
      let comparison = moment(routine.next).isBefore(new Date());
      expect(comparison).to.be.true;
    });

    it("is shifted from now when checked", () => {
      routine.check();
      let inFourDays = moment().add(4, "days").toDate();
      expect(routine.next).to.be.almost(inFourDays);
    });

    it("has status warning if missed occurence is close", () => {
      let someTimeAgo = moment().subtract(4, "days")
                                .subtract(2, "hours")
                                .toDate();
      routine.occurences.push(someTimeAgo);
      expect(routine.status).to.eql(Routine.status.WARNING);
    });

    it("has status overdue if missed occurence is far", () => {
      expect(routine.status).to.eql(Routine.status.OVERDUE);
    });

    it("has status critical if missed occurence is more than period", () => {
      let someTimeAgo = moment().subtract(9, "days")
                                .toDate();
      routine.occurences.push(someTimeAgo);
      expect(routine.status).to.eql(Routine.status.CRITICAL);
    });
  });


  describe("Serialization", () => {
    it("serializes as mapping", () => {
      const serialized = routine.serialize();
      expect(serialized).to.eql({
        label: "Call mum",
        period: {value: 4, unit: "days"},
        occurences: []
      });
    });

    it("exports occurences as list of ISO strings", () => {
      routine.occurences.push(new Date(Date.UTC(1995, 11, 17)));
      const serialized = routine.serialize();
      expect(serialized.occurences).to.eql(["1995-12-17T00:00:00.000Z"]);
    });

    it("exports every Kinto attributes", () => {
      routine.id = "42";
      routine._status = "sync";
      routine.last_modified = 234;
      const serialized = routine.serialize();
      expect(serialized.id).to.eql("42");
      expect(serialized._status).to.eql("sync");
      expect(serialized.last_modified).to.eql(234);
    });

    it("ignores class attributes", () => {
      const serialized = routine.serialize();
      expect(serialized._period).to.not.exist;
    });
  });


  describe("Deserialization", () => {
    const serialized = {
      label: "Call dad",
      period: {value: 2, unit: "months"},
      occurences: ["1995-12-17T00:00:00.000Z"]
    };

    it("deserializes a mapping", () => {
      const routine = Routine.deserialize(serialized);
      expect(routine.label).to.eql("Call dad");
      expect(routine.period.value).to.eql(2);
      expect(routine.period.unit).to.eql("months");
    });

    it("import occurences from ISO to native dates", () => {
      const routine = Routine.deserialize(serialized);
      expect(routine.occurences).to.eql([new Date(Date.UTC(1995, 11, 17))]);
    });

    it("import serialized attributes", () => {
      serialized._status = "sync";
      const routine = Routine.deserialize(serialized);
      expect(routine._status).to.eql("sync");
    })
  });
});
