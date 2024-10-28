// import getData from "../utils/getData.js";

import postData from "../utils/postData.js";
import getData from "../utils/getData.js";
import deleteData from "../utils/deleteData.js";
import putData from "../utils/putData.js";
import myUrl from "../../assets/config/index.js";

// values
const measure_btn = document.querySelector("#room_plus");
const table = document.querySelector(".table--body");
const forms = document.querySelector("#admin--room");
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

let measure = {
  id: generateRandomString(24),
  measure_name: "",
  measure_info: "",
  measure_start: "",
  measure_end: "",
  users: myUrl.adminID,
  room: "",
  status: true,
};
let measureData = [];
let roomsData = [];
let roomsAndEquipments = [];

if (url.pathName === "adminPanelMeasure.html") {
  makeMeasureTables();
}
if (url.pathName === "adminMeasureEquipments.html") {
  makeRoomAndEquipmentsTables();
}

async function makeRoomAndEquipmentsTables() {
  await getRoomsAndEquipments();
  await writePageSelects(roomsAndEquipments);
}

async function getRoomsAndEquipments() {
  const result = await getData("/roomsandequipments");
  roomsAndEquipments = result;
}

// dynamic onchange function
async function handleDynamicOnChange(state, data, stateData) {
  state.addEventListener("input", (e) => {
    const { value } = e.target;
    stateData[data] = value.trim();
  });
}

async function writePageSelects(data) {
  let empty = "";
  data && data.length > 0
    ? data.map((item) => {
        return (empty += `  
       <option value="${item._id}">${item.equipment}</option>`);
      })
    : "";
  forms.corpus.innerHTML += empty;
}

async function makeMeasureTables() {
  await getMeasureData();
  await getRoomsData();
  prevPaginationBtn.addEventListener("click", handleClickPrev);
  nextPaginationBtn.addEventListener("click", handleClickNext);
  await writePageByRooms(measureData);
  measure_btn.addEventListener("click", createNewTableList);
  await paginationList();
}

function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += randomIndex;
  }
  return result;
}

function createNewTableList() {
  table.innerHTML += `
        <td class="table__body-title"><input type="text" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Tədbirin adı..." name="measure_name" class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Tədbirin məqsədi adı..." name="measure_info" class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="datetime-local" placeholder="Tədbirin zamanı adı..." name="measure_start" class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="datetime-local" placeholder="Rəhbərlik" name="measure_end" class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Otağın nömrəsi" name="users" class="form__info-input table--input" value=${
          myUrl.adminID
        } /></td>
        <td class="table__body-title"><select name="room" class="form__info-input table--input">
        <option value="" disabled select>Aid olduğu korpusu seçin</option>
          ${
            roomsData &&
            roomsData.map((item) => {
              return `
            <option value="${item._id}">${item.room_number}</option>`;
            })
          }
        </select></td>
        <td class="table__body-title"><input type="text" value="Qüvvədədir" placeholder="Qüvvədədir" name="status" class="form__info-input table--input"/></td>
        <td class="table__body-title"><button type="button" class=""> -- </button></td>
        <td class="table__body-title"><button type="button"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClick();
}

async function getMeasureData() {
  const result = (await getData("/admin-measure")) || [];
  measureData = result;
}
async function getRoomsData() {
  const result = (await getData("/rooms")) || [];
  roomsData = result;
}
const currentTime = (time) => {
  return new Date(time).toLocaleString("en-EN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "numeric",
  });
};
async function writePageByRooms(data) {
  let startIndex = (currentCount - 1) * currentPageCount;
  let endIndex = startIndex + currentPageCount;
  let emptyData = "";

  // skeleton.classList.add("none");
  data.slice(startIndex, endIndex)?.map((item, index) => {
    if (item.status) {
      return (emptyData += `
          <tr class="table__body" data-id="${item._id}">
              <td class="table__body-title"><input type="text" value="${
                item._id
              }" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="measure_name"  class="form__info-input table--input" value="${
                item.measure_name
              }" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="measure_time"  class="form__info-input table--input" value="${
                item.measure_info
              }" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="users" class="form__info-input table--input" value="${currentTime(
                item.measure_start
              )}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="faculty_name"  class="form__info-input table--input" value="${currentTime(
                item.measure_end
              )}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="faculty_name"  class="form__info-input table--input" value="${
                item.userDetails.user_name
              }" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="faculty_name"  class="form__info-input table--input" value="${
                item.rooms[0].room_number
              }" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="faculty_name"  class="form__info-input table--input" value="Qüvvədədir" disabled="true"/></td>
              <td class="table__body-title">${
                item.users !== myUrl.adminID
                  ? "--"
                  : `<button
                    type="button"
                    data-id="${item._id}"
                    class="icon-trashcan1 pointer"
                  ></button>`
              }</td>
              <td class="table__body-title">${
                item.users !== myUrl.adminID
                  ? `--`
                  : `<button type="button" id="${item._id}" class="icon-edit pointer"></button>`
              }</td>
          </tr>`);
    }
  });
  table.innerHTML = emptyData;
  await deleteFacultyData();
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
  measure.room = roomsData[0]._id;
  measure[name] = value.trim();
}

function handleOnClick() {
  let allBtns = document.querySelectorAll(".icon-checkmark4");
  allBtns.forEach((btn) => {
    btn.addEventListener("click", handleClickCheck);
  });
}

async function handleClickCheck() {
  const { id, measure_name, measure_start, measure_end, measure_info, room } =
    measure;
  const findData =
    measureData.filter(
      (item) =>
        item?.room === room &&
        item?.measure_start === measure_start &&
        item?.measure_end === measure_end
    ) || [];
  if (
    measure_name === "" ||
    measure_start === "" ||
    measure_end === "" ||
    measure_info === "" ||
    room === ""
  ) {
    toastr.warning("Sətirlərin hamısın doldurun zəhmət olmasa...");
  } else {
    if (findData.length == 0) {
      try {
        toastr.success(
          "Tədbirinizin son mərhələsi üçün səhifə sizi lazımi avadanlıqlar mərhələsinə yönləndirəcəkdir!"
        );
        await postData("/measure", measure);
        setTimeout(() => {
          // console.log("duzgun calismir");

          window.location.href = `adminMeasureEquipments.html?measure=${id}`;
        }, 3000);
      } catch (error) {
        console.error(error);
      }
    } else {
      toastr.warning("Bu tarixdə artıq bir tədbir salınıbdır!");
    }
  }
}

async function deleteFacultyData() {
  let currentBtn = document.querySelectorAll(`.icon-trashcan1`);
  currentBtn.forEach((btn) => {
    btn.addEventListener("click", handleClickDeleteById);
  });
}

async function handleClickDeleteById(e) {
  try {
    let getAttribute = e.target.getAttribute("data-id");
    measureData = measureData.filter((item) => item._id !== getAttribute);
    location.reload();
    toastr.success("Uğurla silindi!");
    await deleteData("/faculty/", getAttribute);
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

  let findCurrentRoom = measureData.find((item) => item._id === getId);
  getTableById.innerHTML = `<td class="table__body-title"><input type="text" value="${findCurrentRoom._id}" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" name="faculty_name" class="form__info-input table--input" value="${findCurrentRoom.faculty_name}"/></td>
        <td class="table__body-title"><button type="button" class="pointer"> -- </button></td>
        <td class="table__body-title"><button type="button" data-id="${findCurrentRoom._id}"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClickPut();
  faculty.faculty_name = findCurrentRoom.faculty_name;
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
  await putData("/faculty/", getAttribute, faculty);
}

async function paginationList() {
  let emptyData = "";
  let currentPagination = Math.ceil(measureData.length / currentPageCount);
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
    await writePageByRooms(measureData);
    paginationLists[currentCount - 1].classList.add("active");
    paginationLists[currentCount].classList.remove("active");
  }
}
async function handleClickNext() {
  const totalPages = Math.ceil(measureData.length / currentPageCount);
  if (currentCount < totalPages) {
    currentCount++;
    await writePageByRooms(measureData);
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
  await writePageByRooms(measureData);
}
