let needStop = false;
const pass = Array.from(Array(16), () => Array(16).fill(0));
const ans = Array.from(Array(16), () => Array(16).fill(88));
let startTime;
// Помечаем первый туннель чтобы в него не возвращаться
let firstTunnel = true;

async function main() {
  if (!needStop) {
    let response = await fetch(
      "http://127.0.0.1:8801/api/v1/robot-cells/sensor-data?token=df314662-ea9b-4f05-867b-9e7d7e7a382666eab0dc-e1ff-4172-9901-5568e7cda90a"
    );
    let resp = await response.json();
    showResp(resp);
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
    showTime(startTime);
    showAns(ans);
    showPass(pass);
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
  if (canRight) {
    possibleRoutes.push({ rout: "right", pass: rightPass });
  }
  if (canForward) {
    possibleRoutes.push({ rout: "forward", pass: forwardPass });
  }
  if (canLeft) {
    possibleRoutes.push({ rout: "left", pass: leftPass });
  }

  let go = "back";
  let min = Infinity;
  possibleRoutes.forEach((item) => {
    if (item.pass < min) {
      min = item.pass;
      go = item.rout;
    }
  });
  // Больше не пройденных маршрутов нет
  if (min > 5) {
    go = "stop";
  }
  if (min > 1) {
    firstTunnel = false;
  }
  const routs = possibleRoutes.length;
  markPass({ go, routs, posX, posY });

  return go;
}

function markPass({ go, routs, posX, posY }) {
  if (routs === 4) {
    pass[posX][posY] += 1.5;
  } else if (routs === 3) {
    pass[posX][posY] += 2;
  } else if (go === "back" || firstTunnel) {
    pass[posX][posY] += 6;
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
  console.log(resp);
  showScore(resp);
}
