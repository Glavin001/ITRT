// From http://stackoverflow.com/a/1187628/2578205
function arr_diff(a1, a2)
{
  var a=[], diff=[];
  for(var i=0;i<a1.length;i++)
    a[a1[i]]=true;
  for(var i=0;i<a2.length;i++)
    if(a[a2[i]]) delete a[a2[i]];
    else a[a2[i]]=true;
  for(var k in a)
    diff.push(k);
  return diff;
}

module.exports = {

    getBuildingStats: function(collection, cb) {
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
                buildings: {
                    $addToSet: '$$ROOT'
                }
            }
        }]);

        cursor.toArray(cb);
    },
    getAvailableRooms: function(collection, time, cb) {

        /*
        {
        	"_id" : ObjectId("550e1af8cb4439628704e6b9"),
        	"title" : "Feminist Philosophy",
        	"crn" : 24938,
        	"type" : "Class",
        	"scheduleType" : "Lecture",
        	"subject_id" : "WMST",
        	"course_id" : 4585,
        	"section" : "2",
        	"start_date" : ISODate("2016-01-05T04:00:00Z"),
        	"end_date" : ISODate("2016-04-21T03:00:00Z"),
        	"begin_time" : {
        		"hours" : 10,
        		"minutes" : 0
        	},
        	"end_time" : {
        		"hours" : 12,
        		"minutes" : 29
        	},
        	"on_monday" : false,
        	"on_tuesday" : true,
        	"on_wednesday" : false,
        	"on_thursday" : false,
        	"on_friday" : false,
        	"on_saturday" : false,
        	"on_sunday" : false,
        	"building_name" : "Sobey Building 152",
        	"room_code" : "",
        	"instructor" : "Lisa   Gannett (P)"
        }
        */

        //
        // var conditions = [];
        //
        // // Not on this day of week
        // var day = time.getDay();
        // var dayQuery = {};
        // var dayMap = {
        //     0: 'sunday',
        //     1: 'monday',
        //     2: 'tuesday',
        //     3: 'wednesday',
        //     4: 'thursday',
        //     5: 'friday',
        //     6: 'saturday'
        // }
        // dayQuery['on_' + dayMap[day]] = false; // false = not on that day
        // conditions.push(dayQuery);
        //
        // // Have starting time after given time
        // conditions.push({
        //     'begin_time.hours': {
        //         '$gt': time.getHours()
        //     },
        //     // Have ending time before given time
        //     'end_time.hours': {
        //         '$lt': time.getHours()
        //     }
        // });
        //
        // var query = {
        //     $match: {
        //         $or: conditions
        //     }
        // };
        // // console.log(JSON.stringify(query), undefined, 4);
        // var cursor = collection.aggregate([query, {
        //         '$group': {
        //             '_id': '$Bldg_code',
        //             // 'count_inactive_courses': {
        //             //     $sum: 1
        //             // },
        //             // 'inactive_courses': {
        //             //     $addToSet: '$$ROOT'
        //             // }
        //         }
        //     },
        //     // {
        //     //     '$group': {
        //     //         _id: 'buildings',
        //     //         usage_count: {
        //     //             $sum: 1
        //     //         },
        //     //         total: {
        //     //             $sum: '$count'
        //     //         },
        //     //         'buildings': {
        //     //             $addToSet: '$$ROOT'
        //     //         }
        //     //     }
        //     // }
        // ]).toArray(cb);

        var self = this;
        self.getBuildingStats(collection, function(err, stats) {
            // console.log(err, stats[0].buildings);

            var allRooms = stats[0].buildings.map(function(room) {
                return room._id;
            });

            self.getUnavailableRooms(collection, time, function(err, unavailable) {
                // console.log(err, unavailable);

                var roomNames = unavailable.map(function(item) {
                    return item._id;
                });
                var availableRooms = arr_diff(roomNames, allRooms).map(function(room) {
                    return {
                        _id: room
                    }
                });
                cb(err, availableRooms);
            });

        });

    },
    getUnavailableRooms: function(collection, time, cb) {

        var conditions = [];

        // Not on this day of week
        var day = time.getDay();
        var dayQuery = {};
        var dayMap = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        }
        dayQuery['on_' + dayMap[day]] = true; // false = not on that day
        conditions.push(dayQuery);

        // Have starting time begin given time
        conditions.push({
            'begin_time.hours': {
                '$lte': time.getHours()
            },
            // Have ending time after given time
            'end_time.hours': {
                '$gte': time.getHours()
            }
        });

        var query = {
            $match: {
                $and: conditions
            }
        };
        // console.log(JSON.stringify(query), undefined, 4);
        var cursor = collection.aggregate([query, {
            '$group': {
                '_id': '$Bldg_code',
                'active_courses': {
                    $addToSet: '$$ROOT'
                }
            }
        }]).toArray(cb);

    }
};