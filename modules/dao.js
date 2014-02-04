/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 © NVISIA, LLC.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var _ = require("underscore");
var db = global.db;

var Restaurant = function(json) {
    this.id = json.id;
    this.name = json.name || "John Doe";
    this.cuisine = json.cuisine || "Food";
    this.tagline = json.tagline || "";
    this.description = json.description || "";
    this.address = json.address || "";
    this.rating = json.rating * 1;
    this.price = json.price * 1;
};
exports.Restaurant = Restaurant;

var Reservation = function(json) {
    this.id = json.id;
    this.restaurantId = json.restaurantId;
    this.name = json.name || "";
    this.phone = json.phone || "";
    this.guests = json.guests * 1;
    this.time = json.time * 1;
    this.created = new Date().getTime();
};
exports.Reservation = Reservation;

var validReservationTimes = (function() {
    var arr = [];
    var start = new Date();
    start.setHours(16);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);

    var stop = new Date(start.getTime());
    stop.setHours(22);

    while (start.getTime() <= stop.getTime()) {
        arr.push(start.getTime());
        // add 30 minutes
        start = new Date(start.getTime() + (1000 * 60 * 30));
    }

    return arr;
})();

exports.getRestaurantList = function(res) {
    db.restaurants.find({}, function(err, docs) {
        _.each(docs, function(doc) {
            doc.id = doc._id;
        });
        res.send(docs);
    });
};

exports.getRestaurant = function(res, id) {
    db.restaurants.findOne({ _id: id }, function(err, doc) {
        if (doc) doc.id = doc._id;
        res.send(doc || undefined);
    });
};

exports.createRestaurant = function(res, json) {
    var restaurant = new Restaurant(json);
    db.restaurants.insert(restaurant, function(err, created) {
        created.id = created._id;
        res.send(created);
    });
};

exports.updateRestaurant = function(res, json) {
    var restaurant = new Restaurant(json);
    db.restaurants.update({ _id: restaurant.id }, {
        $set: restaurant
    }, function() {
        db.restaurants.findOne({ _id: restaurant.id }, function(err, doc) {
            if (doc) doc.id = doc._id;
            res.send(doc || undefined);
        });
    });
};

exports.deleteRestaurant = function(res, id) {
    db.restaurants.remove({ _id : id});
    res.send("Restaurant " + id + " deleted");
};

exports.getReservationList = function(res, id) {
    db.reservations.find({ restaurantId: id}, function(err, docs) {
        var available = _.difference(validReservationTimes, _.pluck(docs, "time"));
        _.each(docs, function(doc) {
            doc.id = doc._id;
        });
        res.send({
            reservations: docs,
            available: available
        });
    });
};

exports.getReservation = function(res, id) {
    db.reservations.findOne({ _id: id }, function(err, doc) {
        if (doc) doc.id = doc._id;
        res.send(doc || undefined);
    });
};

exports.createReservation = function(res, json) {
    var reservation = new Reservation(json);
    db.reservations.insert(reservation, function(err, doc) {
        if (doc) doc.id = doc._id;
        res.send(doc || undefined);
    });
}

exports.updateReservation = function(res, json) {
    var reservation = new Reservation(json);

    db.reservations.update({ _id: reservation.id }, {
        $set: reservation
    }, function() {
        db.reservations.findOne({ _id: reservation.id }, function(err, doc) {
            if (doc) doc.id = doc._id;
            res.send(doc || undefined);
        });
    });
};

exports.deleteReservation = function(res, id) {
    db.reservations.remove({ _id: id });
    res.send("Reservation " + id + " deleted");
};