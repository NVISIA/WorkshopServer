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

/**
 * @author jgitter
 */

var _ = require('underscore');
var crypto = require('crypto');

var _hash = function(clear) {
    return crypto.createHash('md5').update(clear).digest('hex');
};

exports.secureStatic = function(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    } else {
        next();
    }
};

exports.authenticate = function(req, res, next) {
    var user = req.body.user;
    var pass = req.body.password;
    var hash = _hash(pass);
    db.users.findOne({ user: user }, function(err, doc) {
        if (doc && doc.pass === hash) {
            req.session.authenticated = true;
            req.session.user = user;
            req.session.email = doc.email;
            res.send({
                success: true
            });
        } else {
            res.send({
                success: false,
                errors: ['Invalid User/Password']
            });
        }
    });
};

exports.register = function(req, res, next) {
    var user = req.body.user;
    var pass = req.body.password;
    var email = req.body.email;
    var errors = [];

    if (user === undefined || user === "") {
        errors.push('User name is required');
    }

    if (pass === undefined || pass === "") {
        errors.push('Password is required');
    }

    db.users.findOne({ user: user }, function(err, doc) {
        if (doc) {
            errors.push('User name is already in use');
        }
        if (errors.length > 0) {
            res.send({
                success: false,
                errors: errors
            });
        } else {
            db.users.insert({
                user: user,
                pass: _hash(pass),
                email: email
            }, function() {
                req.session.authenticated = true;
                req.session.user = user;
                req.session.email = email;
                res.send({
                    success: true
                });
            });
        }
    });
};

exports.secureService = function(req, res, next) {
    if (!req.session.authenticated) {
        res.statusCode = 403;
        res.send("Not authorized!");
    } else {
        next();
    }
};

exports.who = function(req, res) {
    res.send({
        user: req.session.user,
        email: req.session.email
    })
};

exports.logout = function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
};