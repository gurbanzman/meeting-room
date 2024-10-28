// import getData from "../utils/getData.js";

import postData from "../utils/postData.js";
import getData from "../utils/getData.js";
import deleteData from "../utils/deleteData.js";
import putData from "../utils/putData.js";

// values
const room_btn = document.querySelector("#room_plus");
const table = document.querySelector(".table--body");
const pagination = document.querySelector(".pagination__link");
const prevPaginationBtn = document.querySelector("#prevPage");
const nextPaginationBtn = document.querySelector("#nextPage");
const skeleton = document.querySelector(".skeleton");

window.onload = async () => {
  skeleton.classList.add("none");
  const getSession = localStorage.getItem("admin");
  if (getSession === "true") {
    return true;
  } else {
    window.location.href = "adminPanelForm.html";
  }
};

let paginationLists;

const url = paramsSettings();
let currentPageCount = 4;
let currentCount = 1;
let roomDataCount = [];

function paramsSettings() {
  // we get url path name
  const pathNameSettings = window.location.pathname;
  const pathname = pathNameSettings.split("/").pop();

  // we get url search params
  // let urlSearchParams = new URLSearchParams(window.location.search);
  // let userID = urlSearchParams.get("user");
  // let roomID = urlSearchParams.get("room");

  return {
    pathName: pathname,
  };
}

let rooms = {
  room_number: "",
  room_seat_counts: "",
  corpus: "",
};
let corpusData = [];
let roomData = [];

if (url.pathName === "adminPanelRooms.html") {
  makeRoomsTables();
}

async function makeRoomsTables() {
  await getCorpusData();
  await getRoomsData();
  prevPaginationBtn.addEventListener("click", handleClickPrev);
  nextPaginationBtn.addEventListener("click", handleClickNext);
  await writePageByRooms(roomData);
  room_btn.addEventListener("click", createNewTableList);
  await paginationList();
}

function createNewTableList() {
  table.innerHTML += `
        <td class="table__body-title"><input type="text" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Otağın nömrəsi" name="room_number" class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Otaqdakı oturacaqların sayı..." name="room_seat_counts" class="form__info-input table--input"/></td>
        <td class="table__body-title"><select name="corpus" class="form__info-input table--input">
        <option value="" disabled select>Aid olduğu korpusu seçin</option>
          ${
            corpusData &&
            corpusData.map((item) => {
              return `
            <option value="${item._id}">${item.corpus_name}</option>`;
            })
          }
        </select></td>
        <td class="table__body-title"><button type="button" class=""> -- </button></td>
        <td class="table__body-title"><button type="button"  class="icon-checkmark4 pointer"></button></td>`;

  handleOnChange();
  handleOnClick();
}

async function getCorpusData() {
  const result = (await getData("/corpus")) || [];
  corpusData = result;
}
async function getRoomsData() {
  const result = (await getData("/rooms")) || [];
  roomData = result;
}

async function writePageByRooms(data) {
  let startIndex = (currentCount - 1) * currentPageCount;
  let endIndex = startIndex + currentPageCount;
  let emptyData = "";

  // skeleton.classList.add("none");
  data.slice(startIndex, endIndex)?.map((item, index) => {
    return (emptyData += `
          <tr class="table__body" data-id="${item._id}">
              <td class="table__body-title"><input type="text" name="room_id" value="${item._id}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="room_number"  class="form__info-input table--input" value="${item.room_number}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" class="form__info-input table--input" name="room_seat_counts" value="${item.room_seat_counts}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" class="form__info-input table--input" name="corpus" value="${item.corpus}" disabled="true"/></td>
              <td class="table__body-title"><button type="button" data-id="${item._id}" class="icon-trashcan1 pointer"></button></td>
              <td class="table__body-title"><button type="button" id="${item._id}" class="icon-edit pointer"></button></td>
          </tr>`);
  });
  table.innerHTML = emptyData;
  await deleteRoomData();
  await handleEditBtn();
}

function handleOnChange() {
  let allInputs = document.querySelectorAll(".table--input");
  allInputs.forEach((item) => {
    item.addEventListener("input", handleChangeTableInput);
  });
}

function handleChangeTableInput(e) {
  const { name, value } = e.target;
  rooms.corpus = corpusData[0]._id;
  rooms[name] = value.trim();
}

function handleOnClick() {
  let allBtns = document.querySelectorAll(".icon-checkmark4");
  allBtns.forEach((btn) => {
    btn.addEventListener("click", handleClickCheck);
  });
}

async function handleClickCheck() {
  const { room_number, room_seat_counts, corpus } = rooms;
  if (room_number === "" || room_seat_counts === "" || corpus === "") {
    toastr.warning("Sətirlərin hamısın doldurun zəhmət olmasa...");
  } else {
    try {
      location.reload();
      toastr.success("Uğurla əlavə olundu!");
      await postData("/rooms", rooms);
    } catch (error) {
      console.error(error);
    }
  }
}

async function deleteRoomData() {
  let currentBtn = document.querySelectorAll(`.icon-trashcan1`);
  currentBtn.forEach((btn) => {
    btn.addEventListener("click", handleClickDeleteById);
  });
}

async function handleClickDeleteById(e) {
  try {
    let getAttribute = e.target.getAttribute("data-id");
    roomData = roomData.filter((item) => item._id !== getAttribute);
    location.reload();
    toastr.success("Uğurla silindi!");
    await deleteData("/rooms/", getAttribute);
  } catch (error) {
    console.error(error);
  }
}

async function handleEditBtn() {
  let editBtns = document.querySelectorAll(".icon-edit");
  editBtns.forEach((btn) => {
    btn.addEventListener("click", handleClickEdit);
  });
}

function handleClickEdit(e) {
  let getId = e.target.getAttribute("id");
  let getTableById = document.querySelector(
    `.table__body[data-id = "${getId}"]`
  );

  let findCurrentRoom = roomData.find((item) => item._id === getId);
  getTableById.innerHTML = `<td class="table__body-title"><input type="text" value="${
    findCurrentRoom._id
  }" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" name="room_number" class="form__info-input table--input" value="${
          findCurrentRoom.room_number
        }"/></td>
        <td class="table__body-title"><input type="text" value="${
          findCurrentRoom.room_seat_counts
        }" name="room_seat_counts" class="form__info-input table--input"/></td>
        <td class="table__body-title"><select name="corpus" class="form__info-input table--input">
        <option value="" disabled select>Aid olduğu korpusu seçin</option>
          ${
            corpusData &&
            corpusData.map((item) => {
              return `
            <option value="${item._id}">${item.corpus_name}</option>`;
            })
          }
        </select></td>
        <td class="table__body-title"><button type="button" class="pointer"> -- </button></td>
        <td class="table__body-title"><button type="button" data-id="${
          findCurrentRoom._id
        }"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClickPut();
  rooms.room_number = findCurrentRoom.room_number;
  rooms.room_seat_counts = findCurrentRoom.room_seat_counts;
  rooms.corpus = findCurrentRoom.corpus;
}

async function handleOnClickPut() {
  let allCheckBtns = document.querySelectorAll(".icon-checkmark4");
  allCheckBtns.forEach((btn) => {
    btn.addEventListener("click", requestPutBtn);
  });
}

async function requestPutBtn(e) {
  let getAttribute = e.target.getAttribute("data-id");
  location.reload();
  await putData("/rooms/", getAttribute, rooms);
}

async function paginationList() {
  let emptyData = "";
  let currentPagination = Math.ceil(roomData.length / currentPageCount);
  for (let index = 0; index < currentPagination; index++) {
    emptyData += `<li class="link ${
      index == 0 ? "active" : ""
    }" value="${index}">${
      currentPagination - index <= 4 ? index + 1 : "..."
    }</li>`;
  }
  pagination.innerHTML = emptyData;
  await handleClickPaginationLists();
}
async function handleClickPrev() {
  if (currentCount >= 1) {
    currentCount = 2;
    currentCount--;
    await writePageByRooms(roomData);
    paginationLists[currentCount - 1].classList.add("active");
    paginationLists[currentCount].classList.remove("active");
  }
}
async function handleClickNext() {
  const totalPages = Math.ceil(roomData.length / currentPageCount);
  if (currentCount < totalPages) {
    currentCount++;
    await writePageByRooms(roomData);
  }
  paginationLists[currentCount - 1].classList.add("active");
  paginationLists[currentCount - 1 - 1].classList.remove("active");
}
async function handleClickPaginationLists() {
  paginationLists = document.querySelectorAll(".link");
  paginationLists.forEach((link) => {
    link.addEventListener("click", clickPagination);
  });
}
async function clickPagination(e) {
  paginationLists.forEach((link) => {
    link.classList.remove("active");
  });
  e.target.classList.add("active");
  let { value } = e.target;
  currentCount = ++value;
  await writePageByRooms(roomData);
}
