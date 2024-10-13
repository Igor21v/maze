const showResp = (resp) => {
  const content = document.getElementById("content");
  content.replaceChildren();
  Object.entries(resp).map(([key, value]) => {
    const div = document.createElement("div");
    div.className = "stringContent";

    const pKey = document.createElement("p");
    pKey.innerHTML = key;

    const pVal = document.createElement("p");
    pVal.innerHTML = value;

    div.append(pKey, pVal);
    content.append(div);
  });
};

const showAns = (ans) => {
  const ansEl = document.getElementById("ans");
  ansEl.replaceChildren();
  ans.forEach((row) => {
    const rowEl = document.createElement("div");
    row.forEach((item) => {
      const itemEl = document.createElement("span");
      itemEl.innerHTML = item;
      itemEl.className = "itemAns";
      if (item === 88) {
        itemEl.classList.add("empty");
      }
      rowEl.append(itemEl);
    });
    ansEl.append(rowEl);
  });
};

const showPass = (pass) => {
  const passEl = document.getElementById("pass");
  passEl.replaceChildren();
  pass.forEach((row) => {
    const rowEl = document.createElement("div");
    row.forEach((item) => {
      const itemEl = document.createElement("span");
      itemEl.innerHTML = item;
      itemEl.className = "itemPass";
      if (item === 6) {
        itemEl.classList.add("passed");
      }
      rowEl.append(itemEl);
    });
    passEl.append(rowEl);
  });
};

const showTime = (startTime) => {
  const timeEl = document.getElementById("time");
  const diff = Math.ceil((Date.now() - startTime) / 1000);
  const sec = diff % 60;
  const min = Math.floor(diff / 60);
  timeEl.innerHTML = min + " : " + sec;
};

const showScore = (resp) => {
  const finishedEl = document.getElementById("finished");
  finishedEl.innerHTML = "Лабиринт пройден, счет: " + resp?.Score;
};
