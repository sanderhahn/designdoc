function(keys, values, rereduce) {
  var data
  for(var i in keys) {
    var key = keys[i]
    if(key[0][1] === 1) {
      data = values[i]
      data.response_count = 0
    } else {
      data.response_count++
    }
  }
  return data
}

