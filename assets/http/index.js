async function getFetchingData(url) {
   try {
      const response = await fetch(url);
      const responseData = await response.json();
      return {responseData}
   } catch (error) {
      console.error(error);
   }
}

export default getFetchingData;