let array1 = {
  "0": "零",
  "1": "一",
  "2": "二",
  "3": "三",
  "4": "四",
  "5": "五",
  "6": "六",
  "7": "七",
  "8": "八",
  "9": "九",
};

let array2 = [
  ["千", "百", "十", ""],
  ["千", "百", "十", "万"], // 1亿2千3百2十 1万2千3百4十
  ["千", "百", "十", "亿"],
  ["千", "百", "十", "兆"], //"兆",
];

function number2String(number) {
  let numberList = numberSplit2(number);
  console.info(numberList);
  let str = [];
  for (let index = 0; index < numberList.length; index++) {
    const nl = numberList[index];
    // console.info(nl);
    // console.info(array2[index]);
    str.push(splitNumber2string(nl, index, numberList.length));
  }
  console.info(str.reverse().join(""));
  return str.reverse().join();
}

function splitNumber2string(array, index, maxLength) {
  let str = "";
  let arr = array2[index];
  debugger;
  let is0 = [];
  let cache0 = [];

  array.forEach((ele, i) => {
    // if (ele == 0) {
    //   cache0.push(ele);
    //   if (maxLength - 1 != index && !is0[i - 1]) {
    //     str += "零";
    //   }
    //   is0.push(true);
    // } else {
    //   str = str + array1[ele] + arr[i];
    // }

    if (ele != 0) {
      str = str + array1[ele] + arr[i];
    } else {
      if (maxLength - 1 != index && !is0[i - 1]) {
        cache0.push("零");
      }
      is0.push(true);
    }

    if (array.length - 1 === i && ele == 0) {
      str = str + arr[i];
    }

    // if (ele != 0) {
    //   str = str + array1[ele] + arr[i];
    // }

    // else if (array.length - 1 === i) {
    //   str = str + arr[i];
    // }
    // else {
    //   if (maxLength - 1 != index && !is0[i - 1]) {
    //     str += "零";
    //     cache0.push("零");
    //   }
    //   is0.push(true);
    // }
  });
  console.info(cache0);
  return str;
}

function numberSplit2(_number) {
  let number = String(_number);
  let nums = number.split("").reverse();
  let arr = [];

  let _arr = [];
  for (let index = 0; index < nums.length; index++) {
    if (_arr.length >= 4) {
      arr.push(_arr.reverse());
      _arr = [];
    }
    _arr.push(nums[index]);
    if (nums.length - 1 === index) {
      let __arr = _arr.reverse();
      while (__arr.length != 4) {
        __arr.unshift("0");
      }
      arr.push(__arr);
    }
  }
  return arr;
}
