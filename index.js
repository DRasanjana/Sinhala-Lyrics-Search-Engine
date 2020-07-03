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
    is_title = true;
    is_artist = false;
    is_lyrics = false;
    is_writer = false;
    is_music = false;
    is_genre = false;
    new_query = " ";
    fields_list = [];
    output_size = -1;

    var inputlist = req.query.q.split(' ').map(item => item.trim());
    console.log(inputlist);

    movie_list = ['චිත්‍රපට', 'සිනමා']
    music_keywords = ['සංගීතමය', 'සංගීතවත්', 'අධ්‍යක්ෂණය', 'සංගීත']
    genre_keywords = ['පැරණි', 'පොප්ස්', 'පොප්', 'පරණ', 'ක්ලැසික්', 'ක්ලැසි', 'ඉල්ලීම', 'චිත්‍රපට', 'නව']
    artist_keywords = ['කීව', 'කී', 'ගායනා කරන', 'ගයන', 'ගායනා', '‌ගේ', 'හඩින්', 'කියනා', 'කිව්ව', 'කිව්', 'කිව', 'ගායනය',
                   'ගායනා කළා', 'ගායනා කල', 'ගැයූ']
    writer_keywords = ['ලියා', 'ලියූ', 'ලිව්ව', 'ලිව්', 'රචනා', 'ලියා ඇති', 'රචිත', 'ලියන ලද', 'ලියන', 'හදපු', 'පද',
                    'රචනය', 'හැදූ', 'හැදුව', 'ලියන', 'ලියන්න', 'ලීව', 'ලියපු', 'ලියා ඇත', 'ලිඛිත']
    is_popular_query = false
    var quality_list = ['හොඳම', 'හොදම', 'ප්‍රසිද්ධ', 'ප්‍රසිද්ධම', 'ජනප්‍රිය', 'ජනප්‍රියතම', 'ඉස්තරම්', 'ඉස්තරම්ම', 'සුපිරි', 'සුපිරිම', 'පට්ට', 'මරු', 'ප්‍රචලිත'];

    inputlist.forEach(element => {
        if(music_keywords.includes(element)){
            is_music = true;
        }
        else if (genre_keywords.includes(element)){
            is_genre = true;
        }
        else if( quality_list.includes(element)){
            is_popular_query = true;
        }
        else if(writer_keywords.includes(element)){
            is_writer = true;
        }
        else if (!isNaN(element)){
            output_size= element;

        }
        else{    new_query = new_query + element + " "}  
    });
    console.log(new_query)
    input_query = new_query
    
    d_title = "title*";
    d_artist = "artist*";
    d_lyrics = "lyrics*";
    d_writer = "writer*";
    d_music = "music*";
    d_genre = "genre";

    if (d_writer || d_artist || d_music || d_genre){
        is_title = false
    }
    if (is_music){
        if (is_popular_query)
            fields_list.push(d_music);
        else
            d_music += "^4";
        }
    if (is_artist){
        if (is_popular_query)
            fields_list.push(d_artist);
        else
            d_artist += "^4";
        }
    if (is_writer){
        if (is_popular_query)
            fields_list.push(d_writer);
        else
            d_writer += "^4";
        }
    if (is_genre){
        if (is_popular_query)
            fields_list.push(d_genre)
        else
            d_genre += "^4"
        }
    if (is_title){
        if (is_popular_query)
            fields_list.push(d_title);
        else
            d_title += "^4";
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
        fields_list = [d_title, d_artist, d_lyrics, d_writer, d_music, d_genre]
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


