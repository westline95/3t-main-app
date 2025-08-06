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

const FriendlyDate = (inputDate) => {
    let date = new Date(inputDate);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }

    return (year+'-' + month + '-'+dt);
}

const LocaleStringDate = (inputDate) => {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('id-ID', { month: 'long' });
    const day = date.toLocaleString('id-ID', { weekday: 'long' });
    let dt = date.getDate();


    if (dt < 10) {
        dt = '0' + dt;
    }

    return (`${day}, ${dt} ${month} ${year}`);
}


export default {
  convertToFullDate,
  convertToBeautyDate,
  FriendlyDate,
  LocaleStringDate
};