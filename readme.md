# Couch Design Updater

Update CouchDB design document using individual files:

- doc.json
- shows/*.js
- views/*/map.js
- views/*/reduce.js
- lists/*.js

Configure CouchDB destination using environment variables:

```sh
export COUCHDB_USER=username
export COUCHDB_PASSWORD=password
export COUCHDB_DATABASE=database
export COUCHDB_HOST=hostname:5984
```

The `designdoc.js` javascript compiles the document assets and puts the design into CouchDB:

```sh
node designdoc.js
```

# Documentation

- [http://guide.couchdb.org/draft/design.html](http://guide.couchdb.org/draft/design.html)

# Todo

-_attachments
- signatures
- lib
