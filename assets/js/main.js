import postData from "../../assets/utils/postData.js";
import getData, { getByUserId } from "../../assets/utils/getData.js";

// import mongoose from "mongoose";

// calling values
const skeleton = document.querySelector(".skeleton");
const selectFaculty = document.querySelector(".select--faculty");
const userForm = document.querySelector("#user--form");
const roomForm = document.querySelector("#room--form");
const measureForm = document.querySelector("#measure--form");
const equipmentForm = document.querySelector("#equipment--form");
const adminForm = document.querySelector("#admin--form");
const tableBody = document.querySelector(".table__body");
const formCheckbox = document.querySelector(".form__check");

// when page has been risen, skeleton has none style
window.onload = async () => {
  skeleton.classList.add("none");
  if (
    (!url.urlSearchParams.has("user") || !url.urlSearchParams.has("room")) &&
    !url.urlSearchParams.has("redirected")
  ) {
    window.location.href = "index.html?redirected=true";
  }
};

const { v4: uuidv4 } = uuid;

const url = paramsSettings();

// create allData
let allData = [];

// create allRooms
let allRooms = [];

// create allFaculties
let allFaculties = [];

// create allEquipments
let allEquipments = [];

// create all roomsAndEquipments
let allRoomsAndEquipments = [];

// create allMeasureData
let allMeasureData = [];

// create userData
let userData = {
  id: generateRandomString(24),
  user_name: "",
  user_surname: "",
  user_phone: "",
  user_mail: "",
  faculty: "",
};

// create roomData
let roomData = {
  room: "",
};

// create measureData
let measureData = {
  id: generateRandomString(24),
  measure_name: "",
  measure_info: "",
  measure_start: "",
  measure_end: "",
  users: "",
  room: url.room,
  status: false
};

// create room and equipment together data
let roomAndEquipmentData = {
  id: generateRandomString(24),
  measures: "",
  measure_equipments: [],
  users_message: "",
};

// get from LocalStorage
let getUser = localStorage.getItem("users");
let getMeasure = localStorage.getItem("measure");
if (getUser) {
  try {
    allData = JSON.parse(getUser);
  } catch (error) {
    console.error(error);
  }
}
if (getMeasure) {
  try {
    allMeasureData = JSON.parse(getMeasure);
  } catch (error) {
    console.error(error);
  }
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

function paramsSettings() {
  // we get url path name
  const pathNameSettings = window.location.pathname;
  const pathname = pathNameSettings.split("/").pop();

  // we get url search params
  let urlSearchParams = new URLSearchParams(window.location.search);
  let userID = urlSearchParams.get("user");
  let roomID = urlSearchParams.get("room");
  let measureID = urlSearchParams.get("measure");

  return {
    pathName: pathname,
    urlSearchParams: urlSearchParams,
    user: userID,
    room: roomID,
    measure: measureID,
  };
}

// ! Pages
if (url.pathName === "index.html") {
  asyncGetData();
  // IMask
  const maskOptions = {
    mask: "+{994}(00)000-00-00",
  };
  const mask = IMask(userForm.phone, maskOptions);
}
if (url.pathName === "room.html") {
  asyncRoomData();
}
if (url.pathName === "measure.html") {
  asyncMeasureData();
}
if (url.pathName === "equipment.html") {
  asyncEquipmentData();
}
if (url.pathName === "users.html") {
  asyncUsersData();
}

async function asyncGetData() {
  await getFacultyData();
  await handleOnChange(userForm.name, "user_name", userData);
  await handleOnChange(userForm.surname, "user_surname", userData);
  await handleOnChange(userForm.phone, "user_phone", userData);
  await handleOnChange(userForm.mail, "user_mail", userData);
  await handleOnChange(userForm.faculty, "faculty", userData);

  userForm.user_btn.addEventListener("click", (e) => {
    e.preventDefault();
    const { user_name, user_surname, user_phone, user_mail, faculty } =
      userData;
    if (
      user_name === "" ||
      user_surname === "" ||
      user_phone === "" ||
      user_mail === "" ||
      faculty === ""
    ) {
      toastr.error("Zəhmət olmasa, bütün xanaları doldurun");
    } else {
      allData.push(userData);
      postData("/users", userData);
      window.location.href = `room.html?user=${userData.id}&&redirected=true`;
    }
  });
}

async function getFacultyData() {
  allFaculties = await getByData("/faculty");
  let emptyData = "";
  allFaculties.map((item) => {
    return (emptyData += `<option value="${item._id}">${item.faculty_name}</option> `);
  });
  selectFaculty.innerHTML += emptyData;
}

// dynamic onchange function
async function handleOnChange(state, data, stateData) {
  state.addEventListener("input", (e) => {
    const { value } = e.target;
    stateData[data] = value.trim();
  });
}

// get fetch data
async function fetchingData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(error);
  }
}

// room pages
async function asyncRoomData() {
  await getRoomData();
  await handleOnChange(roomForm.room, "room", roomData);
  roomForm.room_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const { room } = roomData;
    if (room === "") {
      toastr.error("Otaq Nömrənizi seçin!");
      console.log(roomData);
    } else {
      window.location.href = `measure.html?user=${url.user}&&room=${room}&&redirected=true`;
    }
  });
}

async function getRoomData() {
  let getRoom = await getByData("/rooms");
  let emptyData = "";
  getRoom.map((item) => {
    return (emptyData += `<option class="all-rooms" value="${item._id}">${item.room_number}</option>`);
  });
  roomForm.room.innerHTML += emptyData;
}

// dynamic handleChangeByTable
function handleChangeTableInput(e, state) {
  const { name, value } = e.target;
  state[name] = value.trim();
}

async function getByData(url) {
  let result = (await getData(url)) || [];
  return result;
}

async function getByDataById(url, end) {
  let result = (await getByUserId(url, end)) || [];
  return result;
}

// measure pages
async function asyncMeasureData() {
  allMeasureData = await getByData("/measure");
  allData = await getByData("/users");
  const findUserById = allData.find((user) => user.id === url.user);

  await handleOnChange(measureForm.measure_name, "measure_name", measureData);
  await handleOnChange(measureForm.measure_info, "measure_info", measureData);
  await handleOnChange(measureForm.measure_start, "measure_start", measureData);
  await handleOnChange(measureForm.measure_end, "measure_end", measureData);

  measureForm.measure_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const { measure_name,measure_info, measure_start, measure_end } = measureData;
    const findData =
      allMeasureData.filter(
        (item) =>
          item?.room === url.room &&
          item?.measure_start === measure_start &&
          item?.measure_end === measure_end
      ) || [];
    if (measure_name !== "" &&  measure_info !== ""&& measure_start !== "" && measure_end !== "") {
      if (findData.length == 0) {
        await postData("/measure", { ...measureData, users: findUserById._id });
        window.location.href = `equipment.html?user=${findUserById._id}&&room=${url.room}&&measure=${measureData.id}&&redirected=true`;
      }
    } else {
      toastr.warning("hata");
    }
  });
}

// * Equipment Pages
async function asyncEquipmentData() {
  await getEquipmentByRooms();
  await writeRoomAndEquipmentsDataByPages();
  const findByMeasure = allMeasureData.find(
    (measure) => measure.id === url.measure
  );
  await handleOnChange(
    equipmentForm.users_message,
    "users_message",
    roomAndEquipmentData
  );
  roomAndEquipmentData.measures = findByMeasure._id;
  equipmentForm.equipment_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    let { users_message, measures } = roomAndEquipmentData;
    if (users_message === "" || measures === "") {
      toastr.warning("Xanaları doldurun!");
    } else {
      await postData("/others", roomAndEquipmentData);
      toastr.success("Qeydiyyatınız Administratora göndərildi! Nəticəniz mailinizə göndəriləcəkdir.");
      setTimeout(() => {
        window.location.href = `index.html?redirect=true`;
      }, 3000);
    }
  });
}

async function getEquipmentByRooms() {
  // const roomData = await fetchingData(`/assets/custom/base/rooms/index.json`);
  // const equipmentData = await fetchingData(
  //   `/assets/custom/base/equipment/index.json`
  // );
  // const roomAndEquipment = await fetchingData(
  //   `/assets/custom/base/roomAndEquipment/index.json`
  // );
  allRoomsAndEquipments = await getByData("/roomsAndEquipments");
  allRooms = await getByData("/rooms");
  allEquipments = await getByData("/equipment");
  allMeasureData = await getByData("/measure");
}

async function getAllRoomsAndEquipmentsData() {
  return allRooms.map((room) => {
    const roomsOrders = allRoomsAndEquipments
      .filter((relation) => relation.roomID === room._id)
      .map(
        (relation) =>
          allEquipments.find((equip) => equip._id === relation.equipmentID)
            .equipment_name
      );

    return {
      roomNumber: room.room_number,
      equipments: roomsOrders,
    };
  });
}

async function writeRoomAndEquipmentsDataByPages() {
  // const result = await getAllRoomsAndEquipmentsData();

  let emptyData = "";
  allRoomsAndEquipments.map((item) => {
    const singleRoomNumber = allRooms.find((room) => room._id === item.room);
    const singleEquipment = allEquipments.find(
      (equip) => equip._id === item.equipment
    );
    return (emptyData += `<div class="form__info-section form--select col-12 equipment__form">      
                  <input type="checkbox" name="measure_equipments" class="checkbox" value="${item._id}">
                  <label for="rooms" class="form__info-title">${singleRoomNumber.room_number} - ${singleEquipment.equipment_name}</label>
    </div> `);
  });
  formCheckbox.innerHTML = emptyData;
  handleOnChangeByCheckbox();
}

async function handleOnChangeByCheckbox() {
  let allCheckboxes = document.querySelectorAll(".checkbox");
  allCheckboxes.forEach((check) => {
    check.addEventListener("input", handleChangeByCheck);
  });
}

async function handleChangeByCheck(e) {
  let { checked, value } = e.target;
  if (checked) {
    roomAndEquipmentData.measure_equipments.push(value.trim());
  } else {
    roomAndEquipmentData.measure_equipments =
      roomAndEquipmentData.measure_equipments.filter(
        (item) => item !== value.trim()
      );
  }
}

// * Users Pages
async function asyncUsersData() {
  const { data } = await fetchingData(`/assets/custom/base/rooms/index.json`);

  const filtersUser = allData.find((user) => {
    const filterUserByMeasure = allMeasureData.filter(
      (measure) => measure.userID === user._id
    );
    return filterUserByMeasure;
  });

  const filterRooms = data.find((room) => {
    const filterRoomByMeasure = allMeasureData.filter(
      (measure) => measure.roomID === room._id
    );
    return filterRoomByMeasure;
  });

  let emptyData = "";
  allMeasureData.map((item, index) => {
    return (emptyData += `
            <td class="table__body-title">${++index}</td>
            <td class="table__body-title">${
              filtersUser.user_name + " " + filtersUser.user_surname
            }</td>
            <td class="table__body-title">${item.measureName}</td>
            <td class="table__body-title">${new Date(
              item.measureStart
            ).toLocaleString()} - ${new Date(
      item.measureEnd
    ).toLocaleString()}</td>
            <td class="table__body-title">${filterRooms.room_number}</td>`);
  });
  tableBody.innerHTML += emptyData;
  // link.forEach(links => {
  //   links.addEventListener("click", handleClickLink)
  // })
}

// async function handleClickLink(e){
//   link.forEach(links => {
//     links.classList.remove("active");
//   });
//   e.target.classList.add("active");
// }
