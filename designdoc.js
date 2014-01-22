/*jslint indent: 2 node: true nomen: true stupid: true */

"use strict";

var Q = require('q'),
  fs = require('fs'),
  request = Q.denodeify(require('request')),
  glob = Q.denodeify(require('glob')),
  mime = require('mime');

function readView(viewDir) {
  var mapFile = viewDir + '/map.js',
    view = {},
    reduceFile;
  if (fs.existsSync(mapFile)) {
    view.map = fs.readFileSync(mapFile).toString();
    reduceFile = viewDir + '/reduce.js';
    if (fs.existsSync(reduceFile)) {
      view.reduce = fs.readFileSync(reduceFile).toString();
    }
    return view;
  }
}

function generateShows(showsFiles) {
  var shows = {};
  showsFiles.map(function (showFile) {
    var showName = showFile.substr('shows/'.length, showFile.length - 'shows/.js'.length),
      show = fs.readFileSync(showFile).toString();
    shows[showName] = show;
  });
  return shows;
}

function generateViews(viewDirs) {
  var views = {};
  viewDirs.map(function (viewDir) {
    var viewName = viewDir.substr('views/'.length),
      view = readView(viewDir);
    if (view !== null) {
      views[viewName] = view;
    }
  });
  return views;
}

function generateLists(listsFiles) {
  var lists = {};
  listsFiles.map(function (listFile) {
    var listName = listFile.substr('lists/'.length, listFile.length - 'lists/.js'.length),
      list = fs.readFileSync(listFile).toString();
    lists[listName] = list;
  });
  return lists;
}

function generateAttachments(attachmentFiles) {
  var attachments = {};
  attachmentFiles.map(function (attachmentFile) {
    var attachmentName = attachmentFile.substr('attachments/'.length),
      stats = fs.statSync(attachmentFile),
      isDir = fs.lstatSync(attachmentFile).isDirectory(),
      mime_type;

    if (!isDir) {
      mime_type = mime.lookup(attachmentFile);
      attachments[attachmentName] = {
        follows: true,
        content_type: mime_type,
        length: stats.size
      };
    }
  });
  return attachments;
}

function showInfo(url, design) {
  var name;
  console.log('Possible parameters: include_docs=true, group_level=1');
  console.log('Shows:');
  for (name in design.shows) {
    if (design.shows.hasOwnProperty(name)) {
      console.log("\t" + url + '/_show/' + name + '/:id');
    }
  }
  console.log('Views:');
  for (name in design.views) {
    if (design.views.hasOwnProperty(name)) {
      console.log("\t" + url + '/_view/' + name);
    }
  }
  console.log('Lists:');
  for (name in design.lists) {
    if (design.lists.hasOwnProperty(name)) {
      console.log("\t" + url + '/_list/' + name + '/:view');
    }
  }
}

function storeDesign(design) {
  var host = process.env.COUCHDB_HOST,
    db = process.env.COUCHDB_DATABASE,

    user = process.env.COUCHDB_USERNAME,
    password = process.env.COUCHDB_PASSWORD,
    auth = '',

    base_url,
    url;

  if (host === undefined || db === undefined) {
    throw "Please set COUCHDB_HOST and COUCHDB_DATABASE environment variables";
  }

  if (user && password) {
    auth = user + ':' + password + '@';
  }

  base_url = 'http://' + [host, db, design._id].join('/');
  url = 'http://' + [auth + host, db, design._id].join('/');

  request({
    url: url,
    method: 'HEAD'
  }).then(function (args) {
    var response = args.shift(),
      etag;
    if (response.headers.etag) {
      etag = response.headers.etag;
      design._rev = etag.substr(1, etag.length - 2);
    }
  }).then(function () {
    var multipart, attachmentFile;

    multipart = [{
      'content-type': 'application/json',
      body: JSON.stringify(design)
    }];

    for (attachmentFile in design._attachments) {
      if (design._attachments.hasOwnProperty(attachmentFile)) {
        multipart.push({body: fs.readFileSync('attachments/' + attachmentFile)});
      }
    }

    request({
      url: url,
      method: 'PUT',
      // json: design
      multipart: multipart
    }).then(function (args) {
      var body;
      // response =
      args.shift();
      body = args.shift();
      console.log(body);
    }).catch(function (error) {
      console.log(error);
      process.exit(1);
    });

    showInfo(base_url, design);

  }).catch(function (error) {
    console.log(error);
    process.exit(1);
  });

}

var design;
Q.all([
  glob('shows/*.js'),
  glob('views/*'),
  glob('lists/*.js'),
  glob('attachments/**/*')
]).then(function (all) {

  design = JSON.parse(fs.readFileSync('doc.json').toString());

  var shows = all.shift(),
    views = all.shift(),
    lists = all.shift(),
    attachments = all.shift();

  design.shows = generateShows(shows);
  design.views = generateViews(views);
  design.lists = generateLists(lists);
  design._attachments = generateAttachments(attachments);

  if (fs.existsSync('validate_doc_update.js')) {
    design.validate_doc_update = fs.readFileSync('validate_doc_update.js').toString();
  }

}).then(function () {

  storeDesign(design);

}).catch(function (error) {
  console.log(error);
  process.exit(1);
});
