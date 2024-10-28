import myUrl from "../../assets/config/index.js";

export default async function getData(url){
   try {
      const response = await fetch(myUrl.url + url);
      const data = await response.json();
      return data;
   } catch (error) {
      console.error(error);
   } 
}

export async function getByUserId(url,end){
   try {
      const response = await fetch(myUrl.url + url + end);
      const data = await response.json();
      return data;
   } catch (error) {
      console.error(error);
   } 
}