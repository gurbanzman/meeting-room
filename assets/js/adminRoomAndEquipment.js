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
  if(getSession === "true"){
    return true
  }else{
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

let roomsAndEquipment = {
  room: "",
  equipment: "",
};
let equipmentData = [];
let roomData = [];
let equipmentAndRoom = [];

if (url.pathName === "adminPanelRoomsAndEquipments.html") {
  makeRoomsTables();
}

async function makeRoomsTables() {
  await getEquipmentData();
  await getRoomsData();
  await getRoomsAndEquipmentsData();
  prevPaginationBtn.addEventListener("click", handleClickPrev);
  nextPaginationBtn.addEventListener("click", handleClickNext);
  room_btn.addEventListener("click", createNewTableList);
  await writePageByRooms(equipmentAndRoom);
  await paginationList();
}

async function getAllRoomsAndEquipmentsData() {
  return roomData.map((room) => {
    const roomsOrders = equipmentAndRoom.filter(relation => relation.room === room._id)
    .map(relation => equipmentData.find(equip => equip._id === relation.equipment).equipment_name);

    return {
      roomNumber: room.room_number,
      equipments: roomsOrders
    }
  })
}

function createNewTableList() {
  table.innerHTML += `
        <td class="table__body-title"><input type="text" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><select name="room" class="form__info-input table--input">
        <option value="" disabled select>Otağın nömrəsini seçin</option>
          ${
            roomData &&
            roomData.map((item) => {
              return `
            <option value="${item._id}">${item.room_number}</option>`;
            })
          }
        </select>
        </td>
        <td class="table__body-title"><select name="equipment" class="form__info-input table--input">
        <option value="" disabled select>Avadanlığı seçin</option>
          ${
            equipmentData &&
            equipmentData.map((item) => {
              return `
            <option value="${item._id}">${item.equipment_name}</option>`;
            })
          }
        </select>
        </td>
        <td class="table__body-title"><button type="button" class=""> -- </button></td>
        <td class="table__body-title"><button type="button"  class="icon-checkmark4 pointer"></button></td>`;

  handleOnChange();
  handleOnClick();
}

async function getEquipmentData() {
  const result = (await getData("/equipment")) || [];
  equipmentData = result;
}
async function getRoomsData() {
  const result = (await getData("/rooms")) || [];
  roomData = result;
}
async function getRoomsAndEquipmentsData() {
  const result = (await getData("/roomsAndEquipments")) || [];
  equipmentAndRoom = result;
}

async function writePageByRooms(data) {
  let startIndex = (currentCount - 1) * currentPageCount;
  let endIndex = startIndex + currentPageCount;
  let emptyData = "";

  // let allData = data.filter((item) => {
  //   const allRooms = roomData.find((room) => room._id === item.room);
  //   const allEquipments = equipmentData.find(
  //     (equipment) => equipment._id === item.equipment
  //   );
  //   return {
  //     allRooms,
  //     allEquipments,
  //   };
  // });

  // skeleton.classList.add("none");

  const anyData = await getAllRoomsAndEquipmentsData();
  console.log(anyData);
  
  data.slice(startIndex, endIndex)?.map((item, index) => {
    const findRoom = roomData.find(room => room._id === item.room);
    const findEquipments = equipmentData.find(equipment => equipment._id === item.equipment);
    return (emptyData += `
          <tr class="table__body" data-id="${item._id}">
              <td class="table__body-title"><input type="text" name="room_id" value="${item._id}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" name="room"  class="form__info-input table--input" value="${findRoom.room_number}" disabled="true"/></td>
              <td class="table__body-title"><input type="text" class="form__info-input table--input" name="equipment" value="${findEquipments.equipment_name}" disabled="true"/></td>
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
  roomsAndEquipment.room = roomData[0]._id;
  roomsAndEquipment.equipment = equipmentData[0]._id;
  roomsAndEquipment[name] = value.trim();
  console.log(roomsAndEquipment);
    
}

function handleOnClick() {
  let allBtns = document.querySelectorAll(".icon-checkmark4");
  allBtns.forEach((btn) => {
    btn.addEventListener("click", handleClickCheck);
  });
}

async function handleClickCheck() {
  let { room, equipment } = roomsAndEquipment;
  if (room === "" || equipment === "") {
    toastr.warning("Sətirlərin hamısın doldurun zəhmət olmasa...");
  } else {
    try {
      location.reload();
      toastr.success("Uğurla əlavə olundu!");
      await postData("/roomsAndEquipments", roomsAndEquipment);
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
    equipmentAndRoom = equipmentAndRoom.filter(
      (item) => item._id !== getAttribute
    );
    location.reload();
    toastr.success("Uğurla silindi!");
    await deleteData("/roomsAndEquipments", getAttribute);
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

  let findCurrentRoom = equipmentAndRoom.find((item) => item._id === getId);
  getTableById.innerHTML = `<td class="table__body-title"><input type="text" value="${findCurrentRoom._id}" readOnly class="form__info-input table--input"/></td>
        <td class="table__body-title"><input type="text" name="room" class="form__info-input table--input" value="${findCurrentRoom.room}"/></td>
        <td class="table__body-title"><input type="text" value="${findCurrentRoom.equipment}" name="equipment" class="form__info-input table--input"/></td>
        <td class="table__body-title"><button type="button" class="pointer"> -- </button></td>
        <td class="table__body-title"><button type="button" data-id="${findCurrentRoom._id}"  class="icon-checkmark4 pointer"></button></td>`;
  handleOnChange();
  handleOnClickPut();
  roomsAndEquipment.room = findCurrentRoom.room;
  roomsAndEquipment.equipment = findCurrentRoom.equipment;
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
  await putData("/roomsAndEquipments/", getAttribute, equipmentAndRoom);
}

async function paginationList() {
  let emptyData = "";
  let currentPagination = Math.ceil(equipmentAndRoom.length / currentPageCount);
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
  const totalPages = Math.ceil(equipmentAndRoom.length / currentPageCount);
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
