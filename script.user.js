// ==UserScript==
// @name         Nuget 某个包的 top 下载次数
// @namespace    http://tampermonkey.net/
// @version      2024-03-16
// @description  try to take over the world!
// @author       You
// @match        https://www.nuget.org/packages/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nuget.org
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function getData() {
    let dataList = [];
    let first = {};
    let last = {};
    let trList = document.querySelectorAll("#version-history tbody tr");

    for (let i = 0; i < trList.length; i++) {
      let item = trList[i];

      let version = item.querySelector("td:nth-child(1)").innerText;
      let count = Number.parseInt(
        item.querySelector("td:nth-child(2)").innerText.replace(/,/g, "")
      );
      let time = item.querySelector("td:nth-child(3)").innerText;
      let data = { version, count, time };
      dataList.push(data);

      if (i == 0) {
        last = { ...data };
      }
      if (i == trList.length - 1) {
        first = { ...data };
      }
    }

    dataList.sort(function (a, b) {
      return b.count - a.count; // 从高到低排序
    });

    return {
      first,
      last,
      dataList,
    };
  }

  function formatNumber(num) {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(0) + "亿";
    }

    if (num >= 10000) {
      return (num / 10000).toFixed(0) + "万";
    }
    return num.toString();
  }

  function showData() {
    let packageName = document.querySelector(".title").innerText;

    let info = getData();

    let data = info.dataList; //.slice(0, 20);
    data = data.map((a) => {
      a.count = formatNumber(a.count);
      return a;
    });

    // 创建表格元素
    let table = document.createElement("table");
    table.style.borderCollapse = "collapse"; // 设置表格边框重叠方式

    // 创建表头
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    headerRow.style.textAlign = "center"; // 设置表头文本居中对齐

    let topTh = document.createElement("th");
    topTh.appendChild(document.createTextNode("top"));
    topTh.style.padding = "0 10px";
    topTh.style.textAlign = "center";
    topTh.style.border = "1px solid black"; // 设置表头单元格边框
    headerRow.appendChild(topTh);

    for (let key in data[0]) {
      let th = document.createElement("th");
      th.appendChild(document.createTextNode(key));
      th.style.padding = "0 10px";
      th.style.textAlign = "center";
      th.style.border = "1px solid black"; // 设置表头单元格边框
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 创建表格内容
    let tbody = document.createElement("tbody");
    let index = 0;
    data.forEach(function (item) {
      let row = document.createElement("tr");

      index++;
      let topCell = document.createElement("td");
      topCell.appendChild(document.createTextNode(index));
      topCell.style.textAlign = "center";
      topCell.style.border = "1px solid black"; // 设置表格数据单元格边框
      row.appendChild(topCell);

      for (let key in item) {
        let cell = document.createElement("td");
        cell.appendChild(document.createTextNode(item[key]));
        cell.style = "padding:0 5px";
        cell.style.textAlign = "center";
        cell.style.border = "1px solid black"; // 设置表格数据单元格边框
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // 添加表格样式
    table.style = "background-color: linen;";
    table.style.width = "100%"; // 设置表格宽度为100%
    table.style.border = "1px solid black"; // 设置表格边框

    let dialog = document.createElement("dialog");
    dialog.style = `
    background-color: rgb(204, 232, 207);
    `;

    let btn = document.createElement("btn");
    btn.onclick = () => {
      dialog.close();
      dialog.remove();
    };
    btn.textContent = "x";
    btn.style = `
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid red;
    cursor: pointer;
    `;
    dialog.appendChild(btn);

    dialog.appendChild(createMyText(packageName, "font-size:20px;color:red;"));
    dialog.appendChild(createMyText("版本数量: " + data.length, "font-size:20px"));
    dialog.appendChild(createMyText("第一个版本:"));
    dialog.appendChild(createMyText(JSON.stringify(info.first)));
    dialog.appendChild(createMyText("最新版本:"));
    dialog.appendChild(createMyText(JSON.stringify(info.last)));

    dialog.appendChild(table);
    document.body.appendChild(dialog);
    dialog.showModal();
  }

  function createMyText(text, style) {
    let div = document.createElement("div");
    div.innerText = text;
    div.style = `
    display: flex;
    justify-content: center;
    align-items: center;
    ${style}
    `;
    return div;
  }

  let btn = document.createElement("button");
  btn.textContent = "Top下载量信息";
  btn.style = `
  position: fixed;
  top: 0px;
  left: 0px;
  z-index:999999;

  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  background-color: #4CAF50;
  color: white;
  border: 2px solid #4CAF50;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;
  `;
  btn.onclick = () => {
    showData();
  };

  document.body.appendChild(btn);
})();
