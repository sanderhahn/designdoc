function(doc) {
  if(doc.surveyId) {
    emit(doc.surveyId, null)
  }
}