// import getData from "../utils/getData.js";

import postData from "../utils/postData.js";
import getData from "../utils/getData.js";
import deleteData from "../utils/deleteData.js";
import putData from "../utils/putData.js";


// values
const faculty_btn = document.querySelector("#room_plus");
const table = document.querySelector(".table--body");
const pagination = document.querySelector(".pagination__link");
const prevPaginationBtn = document.querySelector("#prevPage");
const nextPaginationBtn = document.querySelector("#nextPage");
const skeleton = document.querySelector(".skeleton");


window.onload = async () => {
  skeleton.classList.add("none");
  const getSession = localStorage.getItem("admin");
  if(getSession === "true"){
    return true
  }else{
    window.location.href = "adminPanelForm.html";
  }
}


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

let faculty = {
  faculty_name: ""
};
let facultyData = [];

if (url.pathName === "adminPanelFaculty.html") {
  makeFacultyTables();
}

async function makeFacultyTables() {
  await getFacultyData();
  prevPaginationBtn.addEventListener("click", handleClickPrev);
  nextPaginationBtn.addEventListener("click", handleClickNext);
  await writePageByRooms(facultyData);
  faculty_btn.addEventListener("click", createNewTableList);
  await paginationList();
}

function createNewTableList() {
  table.innerHTML += `
        <td class="table__body-title"><input type="text" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Fakültənin adı..." name="faculty_name" class="form__info-input table--input"/></td>
        <td class="table__body-title"><button type="button" class=""> -- </button></td>
        <td class="table__body-title"><button type="button"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClick();
}

async function getFacultyData() {
  const result = (await getData("/faculty")) || [];
  facultyData = result;
}
async function writePageByRooms(data) {  
  let startIndex = (currentCount - 1) * currentPageCount;
  let endIndex = startIndex + currentPageCount;
  let emptyData = "";
  
    // skeleton.classList.add("none");
    data.slice(startIndex, endIndex)?.map((item, index) => {
      return (emptyData += `
          <tr class="table__body" data-id="${item._id}">
              <td class="table__body-title"><input type="text" value="${item._id}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="faculty_name"  class="form__info-input table--input" value="${item.faculty_name}" disabled="true"/></td>
              <td class="table__body-title"><button type="button" data-id="${item._id}" class="icon-trashcan1 pointer"></button></td>
              <td class="table__body-title"><button type="button" id="${item._id}" class="icon-edit pointer"></button></td>
          </tr>`);
    })
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
  faculty[name] = value.trim();
}

function handleOnClick() {
  let allBtns = document.querySelectorAll(".icon-checkmark4");
  allBtns.forEach((btn) => {
    btn.addEventListener("click", handleClickCheck);
  });
}

async function handleClickCheck() {
  const { faculty_name } = faculty;
  if (faculty_name === "") {
    toastr.warning("Sətirlərin hamısın doldurun zəhmət olmasa...");
  } else {
    try {
      await postData("/faculty", faculty);
      toastr.success("Uğurla əlavə olundu!");
      location.reload();
    } catch (error) {
      console.error(error);
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
    facultyData = facultyData.filter((item) => item._id !== getAttribute);
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

  let findCurrentRoom = facultyData.find((item) => item._id === getId);
  getTableById.innerHTML = `<td class="table__body-title"><input type="text" value="${
    findCurrentRoom._id
  }" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" name="faculty_name" class="form__info-input table--input" value="${
          findCurrentRoom.faculty_name
        }"/></td>
        <td class="table__body-title"><button type="button" class="pointer"> -- </button></td>
        <td class="table__body-title"><button type="button" data-id="${
          findCurrentRoom._id
        }"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClickPut();
  (faculty.faculty_name = findCurrentRoom.faculty_name);
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
  let currentPagination = Math.ceil(facultyData.length / currentPageCount);
  for (let index = 0; index < currentPagination; index++) {
    emptyData += `<li class="link ${
      index == 0 ? "active" : ""
    }" value="${index}">${currentPagination - index <= 4 ? index + 1 : "..."}</li>`;
  }
  pagination.innerHTML = emptyData;
  await handleClickPaginationLists();
}
async function handleClickPrev() {
  if (currentCount >= 1) {
    currentCount = 2;
    currentCount--;
    await writePageByRooms(facultyData);
    paginationLists[currentCount - 1].classList.add("active");
    paginationLists[currentCount].classList.remove("active");
  }
}
async function handleClickNext() {
  const totalPages = Math.ceil(facultyData.length / currentPageCount);
  if (currentCount < totalPages) {
    currentCount++;
    await writePageByRooms(facultyData);
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
  await writePageByRooms(facultyData);
}
