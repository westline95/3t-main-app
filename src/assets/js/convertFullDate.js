const convertToFullDate = (dateInput, separator) => {
    const date = new Date(dateInput);
  
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
  
    return date.toLocaleString('id-ID', options).replaceAll("/",separator);
}

const convertToBeautyDate = (dateInput) => {
  const date = new Date(dateInput);

  const options = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  };

  return date.toLocaleString('id-ID', options).replaceAll("/"," ");
}

export default {
  convertToFullDate,
  convertToBeautyDate
};