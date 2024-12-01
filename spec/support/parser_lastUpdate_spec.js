const POI = require('../../POI');

describe("POI lastUpdate functionality", function() {

    beforeAll(function() {
        jasmine.clock().install(); // 安装模拟时钟
        this.currentDate = new Date(2023, 10, 20); // 假设当前时间为 2023 年 11 月 20 日
        jasmine.clock().mockDate(this.currentDate);
    });

    afterAll(function() {
        jasmine.clock().uninstall(); // 卸载模拟时钟
    });

    it("should initialize lastUpdate correctly when POI is created", function() {
        let poi = new POI("Test POI", 48.857735, 2.394987, []);
        expect(poi.lastUpdate).toBe("20/11/2023");
    });

    it("should update lastUpdate when a rating is added", function() {
        let poi = new POI("Test POI", 48.857735, 2.394987, []);
        poi.addRating(5);
        
        let updatedDate = new Date(2023, 10, 21); // 模拟下一天
        jasmine.clock().mockDate(updatedDate);
        
        poi.addRating(4);
        expect(poi.lastUpdate).toBe("21/11/2023");
    });

});
