# Sinhala-Lyrics-Search-Engine
## Getting Started
###  Setting Up Elasticsearch
1. Download [Elasticsearch](https://www.elastic.co/downloads/elasticsearch) and run on the port 9200.<br>
2. Download [Kibana](https://www.elastic.co/downloads/kibana) (optional) and run on the port 5601 for below query operations.<br>
###  Setting Up Index
1. Create index named ```sinhala_songs``` and run following code in the Kibana console.<br>
```
PUT sinhala_songs
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "number_of_replicas": 1
    },
    "analysis": {
      "analyzer": {
        "names-analyser-si": {
          "type": "custom",
          "tokenizer": "icu_tokenizer",
          "char_filter": ["punctuation_char_filter"],
          "filter": ["edge_n_gram_filter"]
        },
        "lyrics-analyser-si": {
          "type": "custom",
          "tokenizer": "icu_tokenizer"
        },
        "names-search-analyser-si": {
          "type": "custom",
          "tokenizer": "icu_tokenizer",
          "char_filter": ["punctuation_char_filter"],
          "filter": ["sinhala_stop_filter"]
        }
      },
      "char_filter": {
        "punctuation_char_filter": {
          "type": "mapping",
          "mappings": [
            ".=>\\u0020",
            "|=>",
            "-=>",
            "_=>",
            "'=>",
            "/=>",
            ",=>\\u0020"
          ]
        }
      },
      "filter": {
        "edge_n_gram_filter": {
          "type": "edge_ngram",
          "min_gram": "2",
          "max_gram": "10"
        },
        "sinhala_stop_filter": {
          "type": "stop",
          "stopwords": [
            "සහ",
            "හා",
            "වැනි",
            "සේ",
            "මෙන්",
            "සමග",
            "කල",
            "කළ",
            "කරපු",
            "කරන"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "song_id": {
        "type": "integer"
      },
      "title": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "names-search-analyser-si"
      },
      "artist": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "names-search-analyser-si"
      },
      "genre": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "names-search-analyser-si"
      },
      "writer": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "names-search-analyser-si"
      },
      "music": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "names-search-analyser-si"
      },
      "visits": {
        "type": "integer",
        "index": false
      },
      "lyrics": {
        "type": "search_as_you_type",
        "analyzer": "lyrics-analyser-si"
      }
    }
  }
}
```
### Running the Project
1. Run node commands ```node data.js``` and ```node index.js```<br>
2. Visit [http://localhost:3001]( http://localhost:3001) and start searching.

## Main Functionalities
The major capabilites of the engine are listed below.<br>
  - Search songs by entering any word of the song.<br>
  Eg: 
  - Search songs based on artist or writer or musician.<br>
  Eg: සුනිල් ආරියරත්න ලියූ සින්දු – The search result shows all songs written by <br>
  - Search songs in a definite range.<br>
  Eg: සුනිල් ආරියරත්න ලියූ හොදම සින්දු 10 – The search result is sorted based on the number of visits per each song and the best 10 songs are returned. <br>
  - Search phrases support synonyms of the keywords. <br>
  Eg:- Presence of any word out of'ගායකයා','ගයනවා','ගායනා','ගායනා','ගැයු','ගයන' , identifies the search as a search for an artist.
