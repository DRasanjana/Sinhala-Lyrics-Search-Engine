const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://localhost:9200']
});
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const path = require('path');

client.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});

 
app.use(bodyParser.json())

app.set('port', process.env.PORT || 3001);

app.use(express.static(path.join(__dirname, 'public')));
 
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    console.log('sending template...');
    res.sendFile('template.html', {
        root: path.join(__dirname, 'views')
    });
})
 
app.get('/search', function (req, res) {

    let body = '';
    new_query = " ";
    output_size = -1;
    fields_list = [];
    boost_title = true;
    boost_artist = false;
    boost_genre = false;
    boost_writer = false;
    boost_music = false;
    boost_lyrics = false;
    
    var input_list = req.query.q.split(' ').map(item => item.trim());

    movie_related = ['චිත්‍රපට', 'සිනමා']
    artist_related = ['කීව', 'කී', 'ගායනා කරන', 'ගයන', 'ගායනා', '‌ගේ', 'හඩින්', 'කියනා', 'කිව්ව', 'කිව්', 'කිව', 'ගායනය',
                   'ගායනා කළා', 'ගායනා කල', 'ගැයූ']
    genre_related = ['පැරණි', 'පොප්ස්', 'පොප්', 'පරණ', 'ක්ලැසික්', 'ක්ලැසි', 'ඉල්ලීම', 'චිත්‍රපට', 'නව']
    writer_related = ['ලියා', 'ලියූ', 'ලිව්ව', 'ලිව්', 'රචනා', 'ලියා ඇති', 'රචිත', 'ලියන ලද', 'ලියන', 'හදපු', 'පද',
    'රචනය', 'හැදූ', 'හැදුව', 'ලියන', 'ලියන්න', 'ලීව', 'ලියපු', 'ලියා ඇත', 'ලිඛිත']
    music_related = ['සංගීතමය', 'සංගීතවත්', 'අධ්‍යක්ෂණය', 'සංගීත']
    
    is_popular_query = false
    var popular_list = ['හොඳම', 'හොදම', 'ප්‍රසිද්ධ', 'ප්‍රසිද්ධම', 'ජනප්‍රිය', 'ජනප්‍රියතම', 'ඉස්තරම්', 'ඉස්තරම්ම', 'සුපිරි', 'සුපිරිම', 'පට්ට', 'මරු', 'ප්‍රචලිත'];

    input_list.forEach(element => {
        if(music_related.includes(element)){
            boost_music = true;
        }
        else if (genre_related.includes(element)){
            boost_genre = true;
        }
        else if( popular_list.includes(element)){
            is_popular_query = true;
        }
        else if(writer_related.includes(element)){
            boost_writer = true;
        }
        else if (!isNaN(element)){
            output_size= element;

        }
        else{    
            new_query = new_query + element + " "
        }  
    });
   
    input_query = new_query
    
    f_title = "title*";
    f_genre = "genre";
    f_artist = "artist*";
    f_writer = "writer*";
    f_music = "music*";
    f_lyrics = "lyrics*";
    
    if (f_writer || f_artist || f_music || f_genre){
        boost_title = false
    }
    if (boost_music){
        if (is_popular_query)
            fields_list.push(f_music);
        else
            f_music += "^4";
        }
    if (boost_artist){
        if (is_popular_query)
            fields_list.push(f_artist);
        else
            f_artist += "^4";
        }
    if (boost_writer){
        if (is_popular_query)
            fields_list.push(f_writer);
        else
            f_writer += "^4";
        }
    if (boost_genre){
        if (is_popular_query)
            fields_list.push(f_genre)
        else
            f_genre += "^4"
        }
    if (boost_title){
        if (is_popular_query)
            fields_list.push(f_title);
        else
            f_title += "^4";
    }
    if (is_popular_query){
        if (output_size == -1)
            output_size = 40
        if (input_query.trim().length == 0){
            body = {
                "sort": [{
                    "visits": {
                    "order": "desc"
                        }
                }
                    ],
                "size": output_size
                }
            }
           
        else{
            body = {
                "query": {
                    "query_string": {
                        "query": input_query,
                        "type": "bool_prefix",
                        "fields": fields_list,
                        "fuzziness": "AUTO",
                        "analyze_wildcard": true
                    }
                },
                "sort": [
                    {
                        "visits": {
                            "order": "desc"
                        }
                    }
                ],
                "size": output_size
            }
            
        }
    }
    else{
        fields_list = [f_title, f_artist, f_lyrics, f_writer, f_music, f_genre]
        body = {
            "query": {
                "query_string": {
                    "query": input_query,
                    "type": "bool_prefix",
                    "fields": fields_list,
                }
            }
        }
    }

    client.search({
        index: 'sinhala_songs',
        type: 'songs',
        body: body
    })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

})

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


