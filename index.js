var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Config
var database = 'coursemix'; // 'itrt';
var coursesCollection = 'course';

// Connection URL
var url = 'mongodb://localhost:27017/' + database;

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    var collection = db.collection(coursesCollection);


    var cursor = collection.aggregate([{
        '$group': {
            '_id': '$Bldg_code',
            'count': {
                $sum: 1
            }
        }
    }, {
        '$group': {
            _id: 'buildings',
            count: {
                $sum: 1
            },
            total: {
                $sum: '$count'
            },
            'buildings': {
                $addToSet: {
                    name: '$_id',
                    count: '$count'
                }
            }
        }
    }]);

    cursor.toArray(function(err, results) {

        console.log(JSON.stringify(results, undefined, 4));

        db.close();

    });

});