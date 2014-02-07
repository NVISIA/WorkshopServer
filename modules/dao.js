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

var stripTime = function(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

var getValidReservationTimes = function(date) {
    var arr = [];
    var start = stripTime(new Date(date));
    start.setHours(16);

    var stop = stripTime(new Date(date));
    stop.setHours(22);

    while (start.getTime() <= stop.getTime()) {
        arr.push(start.getTime());
        // add 30 minutes
        start = new Date(start.getTime() + (1000 * 60 * 30));
    }

    return arr;
};

exports.getRestaurantList = function(handler) {
    db.restaurants.find({}, function(err, docs) {
        _.each(docs, function(doc) {
            doc.id = doc._id;
        });
        handler(err, docs);
    });
};

exports.getRestaurant = function(id, handler) {
    db.restaurants.findOne({ _id: id }, function(err, doc) {
        if (doc) doc.id = doc._id;
        handler(err, doc);
    });
};

exports.createRestaurant = function(json, handler) {
    var restaurant = new Restaurant(json);
    db.restaurants.insert(restaurant, function(err, doc) {
        doc.id = doc._id;
        handler(err, doc);
    });
};

exports.updateRestaurant = function(json, handler) {
    var restaurant = new Restaurant(json);
    db.restaurants.update({ _id: restaurant.id }, {
        $set: restaurant
    }, {}, function(err, num) {
        if (err) {
            handler(err);
        }
        else {
            exports.getRestaurant(restaurant.id, handler);
        }
    });
};

exports.deleteRestaurant = function(id, handler) {
    db.restaurants.remove({ _id : id }, {}, handler);
};

exports.getReservation = function(id, handler) {
    db.reservations.findOne({ _id: id }, function(err, doc) {
        if (doc) doc.id = doc._id;
        handler(err, doc);
    });
};

exports.getReservationList = function(query, handler) {
    if (!query.restaurantId) {
        handler("Restaurant Id is required when performing a reservation search!");
    }
    var date = stripTime(query.date ? new Date(query.date * 1) : new Date());
    var range = {
        from: date.getTime(),
        to: new Date(date).setHours(24)
    }
    var criteria = {
        restaurantId: query.restaurantId,
        time: {
            $gte: range.from,
            $lt: range.to
        }
    };

    db.reservations.find(criteria).sort({ time: 1 }).exec(function(err, docs) {
        var result = [];
        _.each(getValidReservationTimes(date), function(time) {
            var reservation = _.find(docs, function(r) { return (r.time === time); });
            result.push({
                time: time,
                reservationId: reservation ? reservation._id : null,
                restaurantId: query.restaurantId
            });
        });

        handler(err, result);
    });
};

exports.createReservation = function(json, handler) {
    var reservation = new Reservation(json);
    db.reservations.insert(reservation, function(err, doc) {
        if (doc) doc.id = doc._id;
        handler(err, doc);
    });
}

exports.updateReservation = function(json, handler) {
    var reservation = new Reservation(json);

    db.reservations.update({ _id: reservation.id }, {
        $set: reservation
    }, {}, function(err, num) {
        if (err) {
            handler(err);
        }
        else {
            exports.getReservation(reservation.id, handler);
        }
    });
};

exports.deleteReservation = function(id, handler) {
    db.reservations.remove({ _id : id }, {}, handler);
};