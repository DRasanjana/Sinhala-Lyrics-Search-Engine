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
          "char_filter": ["char_filter"],
          "filter": ["auto_complete"]
        },
        "sinhala-lyric-analyser": {
          "type": "custom",
          "tokenizer": "icu_tokenizer"
        },
        "sinhala-name-analyser": {
          "type": "custom",
          "tokenizer": "icu_tokenizer",
          "char_filter": ["char_filter"]
        }
      },
      "char_filter": {
        "char_filter": {
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
        "auto_complete": {
          "type": "edge_ngram",
          "min_gram": "2",
          "max_gram": "10"
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
        "search_analyzer": "sinhala-name-analyser"
      },
      "artist": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "sinhala-name-analyser"
      },
      "genre": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "sinhala-name-analyser"
      },
      "writer": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "sinhala-name-analyser"
      },
      "music": {
        "type": "search_as_you_type",
        "analyzer": "names-analyser-si",
        "search_analyzer": "sinhala-name-analyser"
      },
      "visits": {
        "type": "integer",
        "index": false
      },
      "lyrics": {
        "type": "search_as_you_type",
        "analyzer": "sinhala-lyric-analyser"
      }
    }
  }
}
```
2. Download [sinhala_songs.json](https://github.com/DRasanjana/Sinhala-Lyrics-Search-Engine/blob/master/sinhala_songs.json) and add documents to the created index using the Bulk API.

Without creating a custom index, we can build a default index settings. However, creating custom index as mentioned before is more effective. <br>
If you use default indexing settings, use command  ```node data.js``` to run data.js file. <br>

### Running the Project
1. Run the node command ```node index.js```<br>
2. Visit [http://localhost:3001]( http://localhost:3001) and start searching.

## Main Functionalities
The major capabilites of the engine are listed below.<br>
  - Search songs by entering any word of the song.<br>
  Eg: අම්මා - The search result shows all songs that contains the word අම්මා<br>
  - Search songs based on artist or writer or musician.<br>
  Eg: අමරදේව ගැයූ සිංදු - The searc result shows all songs sang by W.D. අමරදේව <br> 
      සුනිල් ආරියරත්න ලියූ සින්දු – The search result shows all songs written by සුනිල් ආරියරත්න <br>
      වික්ටර් රත්නායක සංගීතවත් කල සිංදු - The search result shows all songs composed music by වික්ටර් රත්නායක<br>
  - Search songs in a definite range.<br>
  Eg: අමරදේව ගැයූ හොදම සින්දු 10 – The search result is sorted based on the number of visits per each song and the best 10 songs are returned. <br>
  - Search phrases support synonyms of the keywords. <br>
  Eg:- Presence of any word out of'ගායකයා','ගයනවා','ගායනා','ගායනා','ගැයු','ගයන' , identifies the search as a search for an artist.<br><br>
Screen shots of the user interface are put in the ```image``` folder

## Structure of the Data
Each song contains the following data metadata. <br>
    1. title - name ofthe song <br>
    2. artist - singer of the song <br>
    3. genre - list contains genres <br>
    4. writer - composer of the somg <br>
    5. music - musician of the song <br>
    6. visits - no of visits for the song in original site <br>
    7. lyrics - lyric (each line seperated by a \n character)<br><br>
Data is scraped from the [https://sinhalasongbook.com/](https://sinhalasongbook.com/) site for educational purposes and all the English metadata fields were translated to Sinhala using the Google Translate API and mtranslate python library.

## Querying Techniques
### Rule Based Classification
A rule based classification has been used to classify the user search queries into different types of searches. The search phrase is scanned both fully and token-wise for keywords and based on the keywords present, different rules are applied.

Eg: If the phrase contains a number, do a range query and sort the result by visits and return the best matching number of songs equal to the given number

### Boosting
Boosting has been used as the main query optimization technique. Each field of a search is boosted by a certain value based on the keywords present in the search phrase.

Eg: If the phrase contains the word “ලියූ" boost the writer field
