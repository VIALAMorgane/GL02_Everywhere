const POI = require('../../POI');
const VpfParser = require('../../VpfParser');

describe("Program Semantic testing of POI", function() {
    beforeAll(function() {
        this.p = new POI("Café d'Albert", 48.857735, 2.394987, [1, 3, 2]);
    });

    it("can create a new POI", function() {
        expect(this.p).toBeDefined();
        expect(this.p.name).toBe("Café d'Albert");
        expect(this.p).toEqual(jasmine.objectContaining({ name: "Café d'Albert" }));
    });

    it("can add a new ranking", function() {
        this.p.addRating(2);
        expect(this.p.ratings).toEqual([1, 3, 2, 2]);
    });

    it("can calculate average rating", function() {
        let avg = this.p.averageRatings();
        expect(avg).toBe(2);
    });

    it("should parse negative GPS coordinates", function() {
        var input = "START_POI\r\nname: Negative Place\r\nlatlng: -48.871794;-2.379538\r\nnote: 3\r\nEND_POI";
        var parser = new VpfParser(false, false);
        parser.parse(input);
        expect(parser.parsedPOI[0].lat).toBe(-48.871794);
        expect(parser.parsedPOI[0].lng).toBe(-2.379538);
    });
});
