let needStop = false;
const pass = Array.from(Array(16), () => Array(16).fill(0));
const ans = Array.from(Array(16), () => Array(16).fill(88));
let startTime;
// Флаг движения из тупика
let deadEnd = true;

async function main() {
  if (!needStop) {
    let response = await fetch(
      "http://127.0.0.1:8801/api/v1/robot-cells/sensor-data?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a"
    );
    let resp = await response.json();
    const posY = Math.round((resp.down_y_offset + 1250) / 167);
    const posX = Math.round(15 - (resp.down_x_offset + 1250) / 167);
    ans[posX][posY] = calcAns(resp);
    const go = selectRoute(resp, posX, posY);
    if (go === "back") {
      reverse();
    } else if (go === "left") {
      left();
    } else if (go === "forward") {
      forward();
    } else if (go === "right") {
      right();
    } else {
      sendAns();
    }
  }
}

function selectRoute(resp, posX, posY) {
  const { backPass, forwardPass, leftPass, rightPass } = getPass(
    resp,
    posX,
    posY
  );
  const { canBack, canForward, canLeft, canRight } = canTurn(resp);
  const possibleRoutes = [];
  // Здесь можно поменять приоритет сворота
  if (canBack) {
    possibleRoutes.push({ rout: "back", pass: backPass });
  }
  if (canLeft) {
    possibleRoutes.push({ rout: "left", pass: leftPass });
  }
  if (canForward) {
    possibleRoutes.push({ rout: "forward", pass: forwardPass });
  }
  if (canRight) {
    possibleRoutes.push({ rout: "right", pass: rightPass });
  }

  let go = "back";
  let min = Infinity;
  // Количество маршрутов на которвые еще можно уйти
  let openRouts = 0;
  possibleRoutes.forEach((item) => {
    if (item.pass < min) {
      min = item.pass;
      go = item.rout;
    }
    if (item.pass < 6) {
      openRouts++;
    }
  });
  // Больше не пройденных маршрутов нет
  if (openRouts === 0) {
    go = "stop";
  }

  if (openRouts > 1) {
    deadEnd = false;
  } else {
    deadEnd = true;
  }
  const routs = possibleRoutes.length;
  markPass({ go, routs, posX, posY });

  return go;
}

function markPass({ routs, posX, posY }) {
  if (deadEnd) {
    pass[posX][posY] = 6;
  } else if (routs === 4) {
    pass[posX][posY] += 1.5;
  } else if (routs === 3) {
    pass[posX][posY] += 2;
  } else {
    pass[posX][posY] += 3;
  }
}

function getPass(resp, posX, posY) {
  let rightPass, leftPass, backPass, forwardPass;
  const rotation = Math.round(resp.rotation_yaw);
  if (rotation === 0) {
    forwardPass = pass[posX - 1]?.[posY];
    backPass = pass[posX + 1]?.[posY];
    rightPass = pass[posX]?.[posY + 1];
    leftPass = pass[posX]?.[posY - 1];
  } else if (rotation === 90) {
    forwardPass = pass[posX]?.[posY + 1];
    backPass = pass[posX]?.[posY - 1];
    rightPass = pass[posX + 1]?.[posY];
    leftPass = pass[posX - 1]?.[posY];
  } else if (rotation === -90) {
    forwardPass = pass[posX]?.[posY - 1];
    backPass = pass[posX]?.[posY + 1];
    rightPass = pass[posX - 1]?.[posY];
    leftPass = pass[posX + 1]?.[posY];
  } else if (rotation === -180) {
    forwardPass = pass[posX + 1]?.[posY];
    backPass = pass[posX - 1]?.[posY];
    rightPass = pass[posX]?.[posY - 1];
    leftPass = pass[posX]?.[posY + 1];
  }
  return { rightPass, leftPass, forwardPass, backPass };
}

function canTurn(resp) {
  const limit = 100;
  const front_distance = resp.front_distance;
  const right_distance = resp.right_side_distance;
  const left_distance = resp.left_side_distance;
  const back_distance = resp.back_distance;
  let canLeft, canRight, canForward, canBack;
  if (front_distance > limit) {
    canForward = true;
  }
  if (back_distance > limit) {
    canBack = true;
  }
  if (left_distance > limit) {
    canLeft = true;
  }
  if (right_distance > limit) {
    canRight = true;
  }
  if (right_distance > limit) {
    canRight = true;
  }
  return { canForward, canLeft, canRight, canBack };
}

async function forward() {
  let response = await fetch(
    "http://127.0.0.1:8801/api/v1/robot-cells/forward?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
    }
  );
  let result = await response.json();
  main();
}
async function backward() {
  let response = await fetch(
    "http://127.0.0.1:8801/api/v1/robot-cells/backward?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
    }
  );
  let result = await response.json();
  main();
}
async function reverse() {
  await fetch(
    "http://127.0.0.1:8801/api/v1/robot-cells/left?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
    }
  );
  await fetch(
    "http://127.0.0.1:8801/api/v1/robot-cells/left?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
    }
  );
  forward();
}

async function left() {
  let response = await fetch(
    "http://127.0.0.1:8801/api/v1/robot-cells/left?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
    }
  );
  let result = await response.json();
  forward();
}
async function right() {
  let response = await fetch(
    "http://127.0.0.1:8801/api/v1/robot-cells/right?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
    }
  );
  let result = await response.json();
  forward();
}

function stop() {
  needStop = true;
}

function start() {
  startTime = Date.now();
  needStop = false;
  main();
}

// Резерв
function getStrCords(posX, posY) {
  return ("0" + posX).slice(-2) + ("0" + posY).slice(-2);
}

async function sendAns() {
  let response = await fetch(
    "http://127.0.0.1:8801/api/v1/matrix/send?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ans),
    }
  );
  let resp = await response.json();
}

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

start();
