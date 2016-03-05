/**
 * Created by lizongyuan on 16/3/2.
 */
var mongodb = require('./db');

function Post(name, title, tags, post){
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback){
   var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    //要存入数据可的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        reprint_info: 0,
        pv: 0
    };
    //open database
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('posts', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(post, {
                safe: true
            }, function(err){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Post.getAll = function(name, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('posts', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           var query = {};
           if (name){
               query.name = name;
           }
           // 根据query对象查询文档
           collection.find(query).sort({
               time: -1
           }).toArray(function(err, docs){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null, docs);
           });
       });
   });
};

Post.getOne = function(name, day, title, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('posts', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           collection.findOne({
               'name': name,
               'time.day': day,
               'title': title
           }, function(err, doc){
               if (err){
                   mongodb.close();
                   return callback(err);
               }
               if (doc) {
                   collection.update({
                       "name": name,
                       "time.day": day,
                       "title": title
                   },{
                       $inc: {"pv": 1}
                   }, function(err){
                       mongodb.close();
                       if (err){
                           return callback(err);
                       }
                   });
                   callback(null, doc);
               }
           });
       });
   });
};

Post.edit = function(name, day, title, callback){
  mongodb.open(function(err, db){
      if (err){
          return callback(err);
      }
      db.collection('posts', function(err, collection){
          if (err){
              mongodb.close();
              return callback(err);
          }
          collection.findOne({
              'name': name,
              'time.day': day,
              'title': title
          }, function(err, doc){
              mongodb.close();
              if (err){
                  return callback(err);
              }
              callback(null, doc);
          });
      });
  });
};
Post.update = function(name, day, title, post, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('posts', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           collection.update({
               'name': name,
               'time.day': day,
               'title': title
           }, {
               $set: {post: post}
           }, function(err){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null);
           });
       });
   });
};
Post.remove = function(name, day, title, callback){
    mongodb.open(function(err, db){
        if (err){
            return callback(err);
        }
        db.collection('posts', function(err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function(err, doc){
                if (err){
                    mongodb.close();
                    return callback(err);
                }
                var reprint_from = "";
                if (doc.reprint_info.reprint_from){
                    reprint_from = doc.reprint_info.reprint_from;
                }
                if (reprint_from != ""){
                    collection.update({
                        "name": reprint_from.name,
                        "time.day": reprint_from.day,
                        "title": reprint_from.title
                    }, {
                        $pull: {
                            "reprint-info.reprint_to": {
                                "name": name,
                                "day": day,
                                "title": title
                            }
                        }
                    }, function(err){
                        if (err){
                            mongodb.close();
                            return callback(err);
                        }
                    });
                }
                collection.remove({
                    'name': name,
                    'time.day': day,
                    'title': title
                },{
                    w:1
                }, function(err){
                    mongodb.close();
                    if (err){
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });
};

//Post.remove = function(name, day, title, callback){
//    mongodb.open(function(err, db){
//        if (err){
//            return callback(err);
//        }
//        db.collection('posts', function(err, collection){
//            if (err){
//                mongodb.close();
//                return callback(err);
//            }
//            collection.remove({
//                'name': name,
//                'time.day': day,
//                'title': title
//            },{
//                w:1
//            },function(err){
//                mongodb.close();
//                if (err){
//                    return callback(err);
//                }
//                callback(null);
//            });
//        });
//    });
//};

Post.getArchive = function(callback){
  mongodb.open(function(err, db){
      if (err){
          return callback(err);
      }
      db.collection('posts', function(err, collection){
          if (err){
              mongodb.close();
              return callback(err);
          }
          collection.find({}, {
              "name": 1,
              "time": 1,
              "title": 1
          }).sort({
              time: -1
          }).toArray(function(err, docs){
              mongodb.close();
              if (err){
                  return callback(err);
              }
              callback(null, docs);
          });
      });
  });
};

Post.getTags = function(callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('posts', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           collection.distinct("tags", function(err, docs){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null, docs);
           });
       });
   });
};

Post.getTag = function(tag, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('posts', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           collection.find({
               "tags": tag
           }, {
               "name": 1,
               "time": 1,
               "title": 1
           }).sort({
               time: -1
           }).toArray(function(err, docs){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null, docs);
           })
       });
   });
};

Post.search = function(keyword, callback){
   mongodb.open(function(err, db){
       if (err){
           return callback(err);
       }
       db.collection('posts', function(err, collection){
           if (err){
               mongodb.close();
               return callback(err);
           }
           var pattern = new RegExp("^.*" + keyword + ".*$", "i");
           collection.find({
               "title": pattern
           }, {
               "name": 1,
               "time": 1,
               "title": 1
           }).sort({
               time: -1
           }).toArray(function(err, docs){
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null, docs);
           });
       });
   });
};

Post.reprint = function(reprint_from, reprint_to, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name": reprint_from.name,
                "time.day": reprint_from.day,
                "title": reprint_from.title
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                var date = new Date();
                var time = {
                    date: date,
                    year : date.getFullYear(),
                    month : date.getFullYear() + "-" + (date.getMonth() + 1),
                    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                };
                delete doc._id;
                doc.name = reprint_to.name;
                doc.head = reprint_to.head;
                doc.time = time;
                doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title; doc.comments = [];
                doc.reprint_info = {"reprint_from": reprint_from}; doc.pv = 0;
                collection.update({
                    "name": reprint_from.name,
                    "time.day": reprint_from.day,
                    "title": reprint_from.title
                }, {
                    $push: {
                        "reprint_info.reprint_to": {
                            "name": doc.name,
                            "day": time.day,
                            "title": doc.title
                        }
                    }
                }, function (err) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                });
                collection.insert(doc, {
                    safe: true
                }, function (err, post) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(err, post[0]);
                });
            });
        });
    });
};

