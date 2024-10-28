import myUrl from "../../assets/config/index.js";

export default async function deleteData(url, end) {
  try {
    const response = await fetch(myUrl.url + url + end, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}
