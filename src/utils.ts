function HashCode(obj: any) {
  const j = JSON.stringify(obj);

  var hash = 0;
  for (var i = 0; i < j.length; i++) {
    var code = j.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash;
  }
  return hash;
}
