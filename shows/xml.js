function(doc, req) {
  return {
    body : '<foo>' + doc.name + '</foo>',
    headers : {
      "Content-Type" : "application/xml",
      "X-My-Own-Header": "you can set your own headers"
    }
  }
}