window.onload = async () => {
  const getSession = localStorage.getItem("admin");
  if (getSession === "true") {
    return true;
  } else {
    window.location.href = "adminPanelForm.html";
  }
};
