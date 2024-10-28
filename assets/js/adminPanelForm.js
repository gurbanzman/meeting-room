import postData from "../../assets/utils/postData.js";

const roomForm = document.querySelector("#admin--room");
const skeleton = document.querySelector(".skeleton");

window.onload = async () => {
  skeleton.classList.add("none");
}
 


const url = paramsSettings();

function paramsSettings() {
  // we get url path name
  const pathNameSettings = window.location.pathname;
  const pathname = pathNameSettings.split("/").pop();

  // we get url search params
  let urlSearchParams = new URLSearchParams(window.location.search);
  let userID = urlSearchParams.get("user");
  let roomID = urlSearchParams.get("room");

  return {
    pathName: pathname,
    urlSearchParams: urlSearchParams,
    user: userID,
    room: roomID,
  };
}

//  create admin
let admin = {
  username: "",
  password: ""
}

if (url.pathName === "adminPanelForm.html") {
  asyncRoomForm();
}

async function asyncRoomForm(){
  await handleOnChange(roomForm.username,'username',admin);
  await handleOnChange(roomForm.password,'password',admin);
  roomForm.admin_btn.addEventListener("click",(e) => handleOnClick(e,admin,admin,"adminPanelList.html"));
}
// async function asyncFacultyForm(){
//   await handleOnChange(facultyForm.username,'username',admin);
//   await handleOnChange(facultyForm.password,'password',admin);
//   facultyForm.admin_btn.addEventListener("click",(e) => handleOnClick(e,admin,admin,"adminPanelFaculty.html"));
// }
// async function asyncEquipmentAndRoomForm(){
//   await handleOnChange(equipmentAndRoomForm.username,'username',admin);
//   await handleOnChange(equipmentAndRoomForm.password,'password',admin);
//   equipmentAndRoomForm.admin_btn.addEventListener("click",(e) => handleOnClick(e,admin,admin,"adminPanelRoomsAndEquipments.html"));
// }

// async function asyncEquipmentForm(){
//   await handleOnChange(equipmentForm.username,'username',admin);
//   await handleOnChange(equipmentForm.password,'password',admin);
//   equipmentForm.admin_btn.addEventListener("click", (e) => handleOnClick(e,admin,admin,"adminPanelEquipments.html"));
// }

// dynamic onchange function
async function handleOnChange(state, data, stateData) {
  state.addEventListener("input", (e) => {
    const { value } = e.target;
    stateData[data] = value.trim();
  });
}

async function handleOnClick(e,admin,state,url){
  e.preventDefault();
  const {username,password} = admin;
  if(username === "" || password === ""){
    toastr.warning("Xanaları doldurun!")
  }else{
    const response = await postData("/admin",state);
    if(response.success){
      window.location.href = url;
      localStorage.setItem("admin",true)
    }else{
      toastr.error("Yazdığınız şifrə yaxud istifadəçi adı yanlışdır!");
    }
  }
  
}
