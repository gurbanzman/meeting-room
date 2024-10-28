import myUrl from "../../assets/config/index.js";

export default async function putData(url, end,object) {
  try {
    const response = await fetch(myUrl.url + url + end, {
      method: "PUT",
      body: JSON.stringify(object),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}
