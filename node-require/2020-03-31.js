1：判断一个字符串"xyzzzzzzzzzyxyz"中出现次数最多的字符，并统计次数。

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

2：写一个 eq 函数用来判断两个参数是否相等，使用效果如下：

function eq(a, b) { ... }
var a = [1];
var b = [1];
console.log(eq(a, b)) // true

function eq(a, b) {
  if (a instanceof Array && b instanceof Array) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

3：实现一个方法，用于比较两个版本号（version1、version2）

/**
 * 如果version1 > version2，返回1；如果version1 < version2，返回-1，其他情况返回0
 * 版本号规则`x.y.z`，xyz均为大于等于0的整数，至少有x位
 * 示例：
 * compareVersion('0.1', '1.1.1'); // 返回-1
 * compareVersion('13.37', '1.2 '); // 返回1
 * compareVersion('1.1', '1.1.0'); // 返回0
 */

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