function calcAns(resp) {
  const { canBack, canForward, canLeft, canRight } = canTurn(resp);
  let cU, cD, cL, cR;
  // cU -canUP - можно наверх, cD - можно вниз, cL - влево, cR-вправо
  const rotation = Math.round(resp.rotation_yaw);
  if (rotation === 0) {
    cU = canForward;
    cR = canRight;
    cD = canBack;
    cL = canLeft;
  } else if (rotation === 90) {
    cU = canLeft;
    cR = canForward;
    cD = canRight;
    cL = canBack;
  } else if (rotation === -180) {
    cU = canBack;
    cR = canLeft;
    cD = canForward;
    cL = canRight;
  } else if (rotation === -90) {
    cU = canRight;
    cR = canBack;
    cD = canLeft;
    cL = canForward;
  }
  const arr = Array(3);
  arr[0] = cU === true ? "0" : "1";
  arr[1] = cR === true ? "0" : "1";
  arr[2] = cD === true ? "0" : "1";
  arr[3] = cL === true ? "0" : "1";
  arrStr = arr.join("");
  if (arrStr === "0000") {
    return 0;
  } else if (arrStr === "0001") {
    return 1;
  } else if (arrStr === "1000") {
    return 2;
  } else if (arrStr === "0100") {
    return 3;
  } else if (arrStr === "0010") {
    return 4;
  } else if (arrStr === "0011") {
    return 5;
  } else if (arrStr === "0110") {
    return 6;
  } else if (arrStr === "1100") {
    return 7;
  } else if (arrStr === "1001") {
    return 8;
  } else if (arrStr === "0101") {
    return 9;
  } else if (arrStr === "1010") {
    return 10;
  } else if (arrStr === "1110") {
    return 11;
  } else if (arrStr === "1101") {
    return 12;
  } else if (arrStr === "1011") {
    return 13;
  } else if (arrStr === "0111") {
    return 14;
  } else {
    return 15;
  }
}
