export function HashCode(obj: any) {
  const j = JSON.stringify(obj);

  var hash = 0;
  for (var i = 0; i < j.length; i++) {
    var code = j.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash;
  }
  return hash;
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function randomNumber(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
