/**
 * Created by lizongyuan on 16/3/2.
 */
var settings = require('../settings.js'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, 27017), {safe: true});