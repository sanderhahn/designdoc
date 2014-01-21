// http://guide.couchdb.org/draft/validation.html

function (newDoc, oldDoc, userCtx) {
  // throw ({unauthorized: 'Unauthorized'})
  // throw ({forbidden: 'Forbidden'})

  function require(field, message) {
    message = message || "Document must have a " + field;
    if (!newDoc[field]) throw({forbidden : message});
  };

  if (newDoc.type === 'survey') {
    require('name');
  }
  if (newDoc.type === 'response') {
    require('surveyId');
  }

  function unchanged(field) {
    if (oldDoc && toJSON(oldDoc[field]) != toJSON(newDoc[field]))
      throw({forbidden : "Field can't be changed: " + field});
  }
  unchanged("created_at");

  // function(newDoc, oldDoc, userCtx) {
  //   if (newDoc.author) {
  //     enforce(newDoc.author == userCtx.name,
  //       "You may only update documents with author " + userCtx.name);
  //   }
  // }
}
