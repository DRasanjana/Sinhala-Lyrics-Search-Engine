//up the elasticsearch server
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
   hosts: [ 'http://localhost:9200']
});
// check Elasticsearch is up
client.ping({
     requestTimeout: 30000,
 }, function(error) {
     if (error) {
         console.error('Something went wrong! Elasticsearch cluster is down');
     }
 });

 // create a new index called songs-test
client.indices.create({
    index: 'sinhala_songs'
//     body: {
//         "mappings":{
//         "songs": {
//             "properties":{
//                 "track_id": {"type": "string"},
//                 "track_name_en": {"type": "string"},
//                 "track_name_si": {"type": "string"},
//                 "track_rating": {"type": "integer"},
//                 "album_name_en": {"type": "string"},
//                 "album_name_si": {"type": "string"},
//                 "artist_name_en":{"type": "string"},
//                 "artist_name_si" : {"type": "string"},
//                 "artist_rating": {"type": "integer"},
//                 "lyrics": {"type": "string"}
//             }
//         }
//     }
// }
},

function(error, response, status) {
    if (error) {
        console.log(error);
    } else {
        console.log("Index was created", response);
    }
});

const sinhala_songs = require('./sinhala_songs.json');
var bulk = [];

sinhala_songs.forEach(song =>{
   bulk.push({index:{ 
                 _index:"sinhala_songs", 
                 _type:"songs",
             }          
         })
  bulk.push(song)
})

client.bulk({body:bulk}, function( err, response  ){ 
         if( err ){ 
             console.log("Failed Bulk operation".red, err) 
         } else { 
             console.log("Successfully imported %s".green, sinhala_songs.length); 
         } 
}); 