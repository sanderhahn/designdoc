function(doc) {
  if(doc.type === 'survey') {
    emit([doc._id, 1], {name: doc.name, item_count: doc.items.length})
  } else if(doc.surveyId) {
    emit([doc.surveyId, 0], {response_count: 1});
  }
}
