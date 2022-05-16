import axios from 'axios';

axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  for (let key in error.response.data) {
    let html = error.response.data[key].join('<br>');
    window.msysAddMessage(html, 'red');
  }
  return Promise.reject(error);
});

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'JWT ' + token;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

export const apiCreateUser = (data) => {
  return axios.post('https://trello.backend.tests.nekidaem.ru/api/v1/users/create/', data);
}

export const apiRefreshToken = () => {
  const token = localStorage.getItem('token');
  const data = {token}
  return axios.post('https://trello.backend.tests.nekidaem.ru/api/v1/users/refresh_token/', data);
}

export const apiLogin = (data) => {
  return axios.post('https://trello.backend.tests.nekidaem.ru/api/v1/users/login/', data);
}

export const apiGetCards = () => {
  return axios.get('https://trello.backend.tests.nekidaem.ru/api/v1/cards/');
}

export const apiUpdateCard = (data) => {
  return axios.patch(`https://trello.backend.tests.nekidaem.ru/api/v1/cards/${data.id}/`, data);
}

export const apiAddCard = (data) => {
  return axios.post('https://trello.backend.tests.nekidaem.ru/api/v1/cards/', data);
}

export const apiDelCard = (data) => {
  return axios.delete(`https://trello.backend.tests.nekidaem.ru/api/v1/cards/${data.id}/`);
}