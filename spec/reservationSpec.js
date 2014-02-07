global.test_mode = true;
var application = require('../main.js');
var server = application.server;

var unirest = require('unirest');

require('./jasmine.js').onComplete(function() {
    server.close();
});

var compareReservations = function(one, other) {
    expect(one).toBeDefined();
    expect(other).toBeDefined();
    expect(one.restaurantId).toBe(other.restaurantId);
    expect(one.name).toBe(other.name);
    expect(one.phone).toBe(other.phone);
    expect(one.guests).toBe(other.guests);
    expect(one.time).toBe(other.time);
};

var getValidRestaurantId = function(callback) {
    unirest.get('http://localhost:9000/restaurants').end(function(response) {
        callback(response.body[0].id);
    });
};
var getReservations = function(restaurantId, callback) {
    unirest.get('http://localhost:9000/reservations/?restaurantId=' + restaurantId).end(function(response) {
        callback(response.body);
    });
};

describe('Restaurant Service', function() {
    it ('Is fully tested', function() {
        pass();
    });

    it ('GET /reservations/ is not supported', function (done) {
        unirest.get('http://localhost:9000/reservations/')
            .end(function(response) {
                expect(response.status).toBe(500);
                expect(response.body.message).toBeDefined();
                done();
            });
    });

    it ('GET /reservations/?restaurantId=<xxx> filters reservations for a restaurant', function(done) {
        getValidRestaurantId(function(restaurantId) {
            getReservations(restaurantId, function(reservations) {
                var time = reservations[0].time;
                var json = {
                    restaurantId: restaurantId,
                    name: 'Testervation',
                    phone: '123-456-7890',
                    guests: 2,
                    time: time
                };
                unirest.put('http://localhost:9000/reservations/').send(json)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareReservations(response.body, json);
                        var id = response.body.id;
                        unirest.get('http://localhost:9000/reservations/' + id)
                            .end(function(response) {
                                var reservation = response.body;
                                compareReservations(reservation, json);
                                expect(id).toBe(reservation.id);
                                done();
                            });
                    });
            });
        });
    });

    it ('PUT /reservations/ saves a new reservation', function(done) {
        getValidRestaurantId(function(restaurantId) {
            getReservations(restaurantId, function(reservations) {
                var time = reservations[0].time;
                var json = {
                    restaurantId: restaurantId,
                    name: 'Testervation',
                    phone: '123-456-7890',
                    guests: 2,
                    time: time
                };
                unirest.put('http://localhost:9000/reservations/').send(json)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareReservations(response.body, json);
                        done();
                    });
            });
        });
    });

    it ('POST /reservations/ saves a new reservation', function(done) {
        getValidRestaurantId(function(restaurantId) {
            getReservations(restaurantId, function(reservations) {
                var time = reservations[0].time;
                var json = {
                    restaurantId: restaurantId,
                    name: 'Testervation',
                    phone: '123-456-7890',
                    guests: 2,
                    time: time
                };
                unirest.post('http://localhost:9000/reservations/').send(json)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareReservations(response.body, json);
                        done();
                    });
            });
        });
    });

    it ('PUT /reservations/:id modifies a reservation', function(done) {
        getValidRestaurantId(function(restaurantId) {
            getReservations(restaurantId, function(reservations) {
                var time = reservations[0].time;
                var json = {
                    restaurantId: restaurantId,
                    name: 'Testervation',
                    phone: '123-456-7890',
                    guests: 2,
                    time: time
                };
                unirest.put('http://localhost:9000/reservations/').send(json)
                    .end(function(response) {
                        var reservation = response.body;
                        reservation.name = 'name changed';
                        reservation.guests = 100;
                        unirest.put('http://localhost:9000/reservations/' + reservation.id).send(reservation)
                            .end(function(response) {
                                compareReservations(response.body, reservation);
                                expect(response.body.id).toBe(reservation.id);
                                done();
                            });
                    });
            });
        });
    });

    it ('POST /reservations/:id modifies a reservation', function(done) {
        getValidRestaurantId(function(restaurantId) {
            getReservations(restaurantId, function(reservations) {
                var time = reservations[0].time;
                var json = {
                    restaurantId: restaurantId,
                    name: 'Testervation',
                    phone: '123-456-7890',
                    guests: 2,
                    time: time
                };
                unirest.post('http://localhost:9000/reservations/').send(json)
                    .end(function(response) {
                        var reservation = response.body;
                        reservation.name = 'name changed';
                        reservation.guests = 100;
                        unirest.post('http://localhost:9000/reservations/' + reservation.id).send(reservation)
                            .end(function(response) {
                                compareReservations(response.body, reservation);
                                expect(response.body.id).toBe(reservation.id);
                                done();
                            });
                    });
            });
        });
    });

    it ('DELETE /reservations/:id deletes a reservation', function(done) {
        getValidRestaurantId(function(restaurantId) {
            getReservations(restaurantId, function(reservations) {
                var time = reservations[0].time;
                var json = {
                    restaurantId: restaurantId,
                    name: 'Testervation',
                    phone: '123-456-7890',
                    guests: 2,
                    time: time
                };
                unirest.put('http://localhost:9000/reservations/').send(json)
                    .end(function(response) {
                        var reservation = response.body;
                        reservation.name = 'name changed';
                        reservation.guests = 100;
                        unirest.delete('http://localhost:9000/reservations/' + reservation.id)
                            .end(function() {
                                unirest.get('http://localhost:9000/reservations/' + reservation.id)
                                    .end(function(response) {
                                        expect(response.body).toBeUndefined();
                                        done();
                                    });
                            });
                    });
            });
        });
    });

    it ('DELETE /reservations/ is not supported', function(done) {
        unirest.delete('http://localhost:9000/reservations/')
            .end(function(response) {
                expect(response.status).toBe(404);
                done();
            });
    });
});