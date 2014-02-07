global.test_mode = true;
var application = require('../main.js');
var server = application.server;

var unirest = require('unirest');

require('./jasmine.js').onComplete(function() {
    server.close();
});

var compareRestaurants = function(one, other) {
    expect(one).toBeDefined();
    expect(other).toBeDefined();
    expect(one.name).toBe(other.name);
    expect(one.cuisine).toBe(other.cuisine);
    expect(one.address).toBe(other.address);
    expect(one.price).toBe(other.price);
    expect(one.rating).toBe(other.rating);
    expect(one.tagline).toBe(other.tagline);
    expect(one.description).toBe(other.description);
};

describe('Restaurant Service', function() {
    beforeEach(function() {
        require('../modules/bootstrap.js').reset();
    });

    it ('Is fully tested', function() {
        expect(true).toBe(true);
    });

    it ('GET /restaurants/ returns all restaurants', function(done) {
        unirest.get('http://localhost:9000/restaurants/')
            .end(function(response) {
                expect(response.body.length).toBe(10);
                done();
            }); 
    });

    it ('GET /restaurants/:id returns a single restaurant', function(done) {
        unirest.get('http://localhost:9000/restaurants/')
            .end(function(response) {
                var restaurant = response.body[0];
                unirest.get('http://localhost:9000/restaurants/' + restaurant.id)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareRestaurants(response.body, restaurant);
                        done();
                    });
            });
    });

    it ('PUT /restaurants/ saves a new restaurant', function(done) {
        var json = {
            name: 'Testaurant',
            cuisine: 'test',
            address: '100 test way',
            price: 3,
            rating: 50,
            tagline: 'testing testing 1..2..3..',
            description: 'Testaurant is Testacular'
        };
        unirest.put('http://localhost:9000/restaurants/').send(json)
            .end(function(response) {
                expect(response.body).toBeDefined();
                compareRestaurants(response.body, json);
                var id = response.body.id;
                unirest.get('http://localhost:9000/restaurants/' + id)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareRestaurants(response.body, json);
                        expect(id).toBe(response.body.id);
                        done();
                    });
            });
    });

    it ('POST /restaurants/ saves a new restaurant', function(done) {
        var json = {
            name: 'Testaurant',
            cuisine: 'test',
            address: '100 test way',
            price: 3,
            rating: 50,
            tagline: 'testing testing 1..2..3..',
            description: 'Testaurant is Testacular'
        };
        unirest.post('http://localhost:9000/restaurants/').send(json)
            .end(function(response) {
                expect(response.body).toBeDefined();
                compareRestaurants(response.body, json);
                var id = response.body.id;
                unirest.get('http://localhost:9000/restaurants/' + id)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareRestaurants(response.body, json);
                        expect(id).toBe(response.body.id);
                        done();
                    });
            });
    });

    it ('PUT /restaurants/:id modifies a restaurant', function(done) {
        unirest.get('http://localhost:9000/restaurants/')
            .end(function(response) {
                var restaurant = response.body[0];
                restaurant.name = 'name has changed';
                restaurant.tagline = 'tagline has changed';
                unirest.put('http://localhost:9000/restaurants/' + restaurant.id).send(restaurant)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareRestaurants(response.body, restaurant);
                        unirest.get('http://localhost:9000/restaurants/' + restaurant.id)
                            .end(function(response) {
                                expect(response.body).toBeDefined();
                                compareRestaurants(response.body, restaurant);
                                expect(response.body.id).toBe(restaurant.id);
                                done();
                            });
                    });
            });
    });

    it ('POST /restaurants/:id modifies a restaurant', function(done) {
        unirest.get('http://localhost:9000/restaurants/')
            .end(function(response) {
                var restaurant = response.body[0];
                restaurant.name = 'name has changed';
                restaurant.tagline = 'tagline has changed';
                unirest.post('http://localhost:9000/restaurants/' + restaurant.id).send(restaurant)
                    .end(function(response) {
                        expect(response.body).toBeDefined();
                        compareRestaurants(response.body, restaurant);
                        unirest.get('http://localhost:9000/restaurants/' + restaurant.id)
                            .end(function(response) {
                                expect(response.body).toBeDefined();
                                compareRestaurants(response.body, restaurant);
                                expect(response.body.id).toBe(restaurant.id);
                                done();
                            });
                    });
            });
    });

    it ('DELETE /restaurants/:id deletes a restaurant', function(done) {
        unirest.get('http://localhost:9000/restaurants/')
            .end(function(response) {
                var restaurant = response.body[0];
                unirest.delete('http://localhost:9000/restaurants/' + restaurant.id)
                    .end(function() {
                        unirest.get('http://localhost:9000/restaurants/')
                            .end(function(response) {
                                expect(response.body).toBeDefined();
                                expect(response.body.length).toBe(9);
                                done();
                            });
                    });
            });
    });

    it ('DELETE /restaurants/ is not supported', function(done) {
        unirest.delete('http://localhost:9000/restaurants/')
            .end(function(response) {
                expect(response.status).toBe(404);
                done();
            });
    });
});