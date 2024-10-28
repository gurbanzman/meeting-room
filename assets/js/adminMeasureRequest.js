// import getData from "../utils/getData.js";

import postData from "../utils/postData.js";
import getData from "../utils/getData.js";
import deleteData from "../utils/deleteData.js";
import putData from "../utils/putData.js";

// values
const presentComponent = document.querySelector(".request__users");
const emptyGif = document.querySelector(".request__list-gif");
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

let faculty = {
  faculty_name: "",
};
let measureData = [];
let usersData = [];
let others = [];

makeMeasureTables();

async function makeMeasureTables() {
  await getMeasureData();
  await getUserData();
  await getOthersData();
  //   prevPaginationBtn.addEventListener("click", handleClickPrev);
  //   nextPaginationBtn.addEventListener("click", handleClickNext);
  await writePageByRooms(measureData);
  //   faculty_btn.addEventListener("click", createNewTableList);
  //   await paginationList();
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

function createNewTableList() {
  table.innerHTML += `
        <td class="table__body-title"><input type="text" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" placeholder="Fakültənin adı..." name="faculty_name" class="form__info-input table--input"/></td>
        <td class="table__body-title"><button type="button" class=""> -- </button></td>
        <td class="table__body-title"><button type="button"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClick();
}

async function getMeasureData() {
  const result = (await getData("/measure")) || [];
  measureData = result;
}
async function getUserData() {
  const result = (await getData("/users")) || [];
  usersData = result;
}
async function getOthersData() {
  const result = (await getData("/others")) || [];
  others = result;
}
async function writePageByRooms(data) {
  let emptyData = "";

  // skeleton.classList.add("none");

  data && data.length > 0
    ? data.map((item, index) => {
        let findCurrentUser = usersData.find((user) => user._id === item.users);
        let findCurrentOthers = others.find(
          (other) => other.measures === item._id
        );
        if (item.status) {
          emptyGif.innerHTML = '';
          return (emptyData += `
            <li class="users__measure-list">
                     <div class="users__measure-head">
                        <p class="users__measure-count">
                           <span class="measure__list-count">
                              ${++index}
                           </span>
                        </p>
                        <ul class="users__measure-about">
                           <li class="users__measure--head">${
                             item.measure_name
                           }, ${currentTime(
            item.measure_start
          )} :: ${currentTime(item.measure_end)}</li>
                           <li class="users__measure--desc">${
                             findCurrentUser.user_name +
                             " " +
                             findCurrentUser.user_surname
                           }</li>
                        </ul>
                     </div>
                     <ul class="users__measure-btn">
                        <li class="measure__btn-app">
                           <button type="button" data-id="${
                             item._id
                           }" data-user="${findCurrentUser._id}" data-others="${
            findCurrentOthers?._id
          }" data-mail="${
            findCurrentUser?.user_mail
          }" class="app-btn delete-btn">Sil</button>
                        </li>
                        <li class="measure__btn-app">
                           <button type="button" data-id="${
                             item._id
                           }" class="app-btn accept-btn">Qəbul et</button>
                        </li>
                     </ul>
                  </li>
             `);
        }
        else{
          return (emptyGif.innerHTML += '<img src="assets/public/empty.gif" alt="">')
        }
      })
      : (emptyData += '<p><img src="assets/public/empty.gif" alt=""></p>');
      presentComponent.innerHTML = emptyData;
      await deleteMeasureData();
      await handleAcceptBtn();
      return emptyData;
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

async function deleteMeasureData() {
  let currentBtn = document.querySelectorAll(`.delete-btn`);
  currentBtn.forEach((btn) => {
    btn.addEventListener("click", handleClickDeleteById);
  });
}

async function handleClickDeleteById(e) {
  try {
    let getAttribute = e.target.getAttribute("data-id");
    let getUserAttribute = e.target.getAttribute("data-user");
    let getOthersAttribute = e.target.getAttribute("data-others");
    let getUserMailAttribute = e.target.getAttribute("data-mail");
    await Promise.all([
      deleteData("/measure/", getAttribute),
      deleteData("/users/", getUserAttribute),
      deleteData("/others/", getOthersAttribute),
      postData("/send", {
        to: getUserMailAttribute,
        subject: "Rəhbərlik tərəfindən",
        html: "Hörmətli Namizəd, təəssüflə qeydiyyat istəyiniz qəbul olunmamışdır...",
      }),
    ]);
    location.reload();
  } catch (error) {
    console.error(error);
  }
}

async function handleAcceptBtn() {
  let acceptBtns = document.querySelectorAll(".accept-btn");
  acceptBtns.forEach((btn) => {
    btn.addEventListener("click", handleClickAccept);
  });
}

async function handleClickAccept(e) {
  let getId = e.target.getAttribute("data-id");
  await Promise.all([
    putData("/measure/", getId, {
      status: true,
    }),
    postData("/send", {
      to: getUserMailAttribute,
      subject: "Rəhbərlik tərəfindən",
      html: "Hörmətli Namizəd, Qeydiyyatınız uğurla təsdiqlənmişdir!",
    }),
  ]);
  location.reload();
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
