# Update CouchDB design document

Update CouchDB design document using individual files:

- `doc.json`
- `shows/*.js`
- `views/*/map.js`
- `views/*/reduce.js`
- `lists/*.js`
- `attachments/**/*`

Configure CouchDB destination using environment variables:

```sh
export COUCHDB_HOST=hostname:5984
export COUCHDB_DATABASE=database
export COUCHDB_USERNAME=username
export COUCHDB_PASSWORD=password
```

The `designdoc.js` javascript compiles the document assets and puts the design into CouchDB:

```sh
node designdoc.js
```

# Documentation

- [http://guide.couchdb.org/draft/design.html](http://guide.couchdb.org/draft/design.html)

# Todo

- signatures
- lib
