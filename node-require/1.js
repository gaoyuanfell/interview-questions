function maxStr(str) {
  let array = str.split("");
  let obj = {};
  array.forEach(element => {
    if (obj[element]) {
      ++obj[element];
    } else {
      obj[element] = 1;
    }
  });

  let _max = 0;
  let _key = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value > _max) {
      _max = value;
      _key = key;
    }
  }

  return [_key, _max];
}

function eq(a, b) {
  if (a instanceof Array && b instanceof Array) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function compareVersion(version1, version2) {
  if (!version1 || !version2) return 0;
  let v1 = version1.split(".").reverse();
  let v2 = version2.split(".").reverse();

  function bijiao(v1, v2) {
    let s1 = v1.pop() || -1;
    let s2 = v2.pop() || -1;

    if (s1 === s2 && s1 !== -1 && s2 !== -1) {
      return bijiao(v1, v2);
    } else {
      return s1 > s2 ? 1 : -1;
    }
  }

  return bijiao(v1, v2);
}
