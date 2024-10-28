import myUrl from "../../assets/config/index.js";

export default async function postData(url,object){
   try {
      const response = await fetch(myUrl.url + url,{
         method: "POST",
         body: JSON.stringify(object),
         headers: {
            "Content-Type": "application/json"
         }
      });
      return response.json();
   } catch (error) {
      console.error(error);
   }
}