var POI = function(nm, lt, lg, r) {
    this.name = nm;
    this.lat = lt;
    this.lng = lg;
    this.ratings = [].concat(r);
    this.lastUpdate = this.formatDate(new Date()); // 初始化 lastUpdate
};

POI.prototype.formatDate = function(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

POI.prototype.averageRatings = function() {
    var total = this.ratings.reduce((acc, elt) => acc + parseInt(elt), 0);
    return total / this.ratings.length;
};

POI.prototype.addRating = function(rating) {
    rating = parseInt(rating);
    if (rating >= 0 && rating <= 5) {
        this.ratings.push(rating);
        this.lastUpdate = this.formatDate(new Date()); // 更新 lastUpdate
    } else {
        console.log("Invalid rating: " + rating);
    }
};

module.exports = POI;

