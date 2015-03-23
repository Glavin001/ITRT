var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var buildings = require('./buildings');

// Config
var database = 'coursemix'; // 'itrt';
var coursesCollection = 'course';

// Connection URL
var url = 'mongodb://localhost:27017/' + database;

var express = require('express')
var app = express()

// Public files
app.use(express.static('public'));

app.get('/api/buildings/stats', function(req, res) {

    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        // console.log("Connected correctly to server");

        var collection = db.collection(coursesCollection);

        buildings.getBuildingStats(collection, new Date(), function(err,
            results) {
            // console.log(JSON.stringify(results,
            //     undefined, 4));
            // console.log('Error:', err);
            // console.log('Unavailable buildings:',
                // results.length);
            res.json(results);
            db.close();
        });

    });
});

app.get('/api/buildings/available/:time', function(req, res) {

    var time = new Date(parseInt(req.params.time));

    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        // console.log("Connected correctly to server");

        var collection = db.collection(coursesCollection);

        buildings.getAvailableRooms(collection, time, function(err,
            results) {
            // console.log(JSON.stringify(results,
            //     undefined, 4));
            // console.log('Error:', err);
            // console.log('Unavailable buildings:',
                // results.length);
            res.json(results);
            db.close();
        });

    });
});

app.get('/api/buildings/unavailable/:time', function(req, res) {

    var time = new Date(parseInt(req.params.time));
    // console.log(req.params, time);

    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        // console.log("Connected correctly to server");

        var collection = db.collection(coursesCollection);

        buildings.getUnavailableRooms(collection, time, function(err,
            results) {
            // console.log(JSON.stringify(results,
            //     undefined, 4));
            // console.log('Error:', err);
            // console.log('Unavailable buildings:',
            //     results.length);
            res.json(results);
            db.close();
        });

    });
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})