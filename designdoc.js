"use strict";

var Q = require('q'),
    fs = require('fs'),
    request = Q.denodeify(require('request')),
    glob = Q.denodeify(require('glob'));

function readView (viewDir) {
  var mapFile = viewDir + '/map.js'
  var view = {}
  if(fs.existsSync(mapFile)) {
    view.map = fs.readFileSync(mapFile).toString()
    var reduceFile = viewDir + '/reduce.js'
    if(fs.existsSync(reduceFile)) {
      view.reduce = fs.readFileSync(reduceFile).toString()
    }
    return view
  }
}

function generateShows (showsFiles) {
  var shows = {}
  showsFiles.map(function (showFile) {
    var showName = showFile.substr('shows/'.length, showFile.length - 'shows/.js'.length)
    var show = fs.readFileSync(showFile).toString()
    shows[showName] = show
  })
  return shows
}

function generateViews (viewDirs) {
  var views = {}
  viewDirs.map(function (viewDir) {
    var viewName = viewDir.substr('views/'.length)
    var view = readView(viewDir)
    if (view !== null) {
      views[viewName] = view
    }
  })
  return views
}

function generateLists (listsFiles) {
  var lists = {}
  listsFiles.map(function (listFile) {
    var listName = listFile.substr('lists/'.length, listFile.length - 'lists/.js'.length)
    var list = fs.readFileSync(listFile).toString()
    lists[listName] = list
  })
  return lists
}

function showInfo (url, design) {
  console.log('Possible parameters: include_docs=true, group_level=1')
  console.log('Shows:')
  for(var name in design.shows) {
    console.log("\t" + url + '/_show/' + name + '/:id')
  }
  console.log('Views:')
  for(var name in design.views) {
    console.log("\t" + url + '/_view/' + name)
  }
  console.log('Lists:')
  for(var name in design.lists) {
    console.log("\t" + url + '/_list/' + name + '/:view')
  }
}

function storeDesign (design) {
  var host = process.env.COUCHDB_HOST
  var db = process.env.COUCHDB_DATABASE

  var user = process.env.COUCHDB_USER
  var password = process.env.COUCHDB_PASSWORD
  var auth = ''

  if (user && password) {
    auth = user + ':' + password + '@'
  }

  var base_url = 'http://' + [host, db, design._id].join ('/')
  var url = 'http://' + [auth + host, db, design._id].join ('/')

  request ({
    url: url,
    method: 'HEAD'
  }).then (function (args) {
    var response = args.shift ()
    var body = args.shift ()
    if (response.headers.etag) {
      var etag = response.headers.etag
      design._rev = etag.substr (1, etag.length - 2)
    }
  }).then(function () {

    request ({
      url: url,
      method: 'PUT',
      json: design
    }).then (function (args) {
      var response = args.shift()
      var body = args.shift()
      console.log (body)
    }).catch (function (error) {
      console.log (error)
      process.exit (1)
    })

    showInfo (base_url, design)

  }).catch (function (error) {
    console.log (error)
    process.exit (1)
  })

}

var design
Q.all([
  glob ('shows/*.js'),
  glob ('views/*'),
  glob ('lists/*.js')
]).then(function (all) {

  design = JSON.parse (fs.readFileSync ('doc.json').toString ())

  var shows = all.shift ()
  var views = all.shift ()
  var lists = all.shift ()

  design.shows = generateShows (shows)
  design.views = generateViews (views)
  design.lists = generateLists (lists)

  if (fs.existsSync ('validate_doc_update.js')) {
    design.validate_doc_update = fs.readFileSync ('validate_doc_update.js').toString()
  }

}).then (function () {
  storeDesign(design)
}).catch (function (error) {
  console.log (error)
  process.exit(1)
})
