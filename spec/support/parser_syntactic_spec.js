const POI = require('../../POI');
const VpfParser = require('../../VpfParser');

describe("Program Syntactic testing of VpfParser", function() {
    beforeAll(function() {
        this.analyzer = new VpfParser(false, false);
        this.p = new POI("Sample POI", 48.857735, 2.394987, [1, 3, 2]);
    });

    it("can read a name from a simulated input", function() {
        let input = ["name", "Café d'Albert"];
        expect(this.analyzer.name(input)).toBe("Café d'Albert");
    });

    it("can read a lat lng coordinate from a simulated input", function() {
		let input = ["latlng", "-48.866205;2.399279"];
		expect(this.analyzer.latlng(input)).toEqual({ lat: -48.866205, lng: 2.399279 }); // 使用浮点数
	});
	

    it("can parse negative GPS coordinates", function() {
        let input = "START_POI\r\nname: Test POI\r\nlatlng: -48.857735;-2.394987\r\nEND_POI\r\n$$";
        let parser = new VpfParser();
        parser.parse(input);
        expect(parser.errorCount).toBe(0);
    });

    it("should ignore invalid ratings", function() {
        this.p.addRating(6);
        this.p.addRating(-1);
        expect(this.p.ratings).toEqual([1, 3, 2]);
    });

	it("should create a complete POI from its description string", function() {
		let input = "START_POI\r\nname: Chez Gabin\r\nlatlng: 48.871794;2.379538\r\nnote: 3\r\nnote: 2\r\nEND_POI";
		let parser = new VpfParser(false, false);
		parser.parse(input);
	
		// 检查解析出的 POI 对象
		expect(parser.parsedPOI.length).toBe(1);
		let poi = parser.parsedPOI[0];
		expect(poi.name).toBe("Chez Gabin");
		expect(poi.lat).toBe(48.871794);
		expect(poi.lng).toBe(2.379538);
		expect(poi.ratings).toEqual([3, 2]);
	});	

});
