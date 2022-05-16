import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import classnames from 'classnames';
import {useDispatch} from 'react-redux'

import {actionSetPage, actionSetUsername} from '../store'

import './SignPage.css';

import {apiCreateUser, apiLogin} from '../api';

export function SignPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  return (
    <div className='sign-page-container'>
      <div className='sign-form-container'>
        <div className='sign-switch'>
          <div className={classnames('sign-switch-in', {'active': isSignIn})} onClick={()=>{setIsSignIn(true)}}>Вход</div>
          <div className={classnames('sign-switch-up', {'active': !isSignIn})} onClick={()=>setIsSignIn(false)}>Регистрация</div>
        </div>
        <div className='sign-form-content-container'>
          {isSignIn ? <div className='sign-form-content sign-form-content-sign-in'>
            <SignIn />
          </div>
          : <div className='sign-form-content sign-form-content-sign-up'>
            <SignUp />
            </div>}
        </div>
      </div>
    </div>
  )
}

function SignIn() {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data1 => {
    apiLogin(data1).then(({data}) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data1.username);
      dispatch(actionSetUsername(data1.username));
      dispatch(actionSetPage('cards'));
    });
  };
  return (
    <div className='sign'>
      <form onSubmit={handleSubmit(onSubmit)}>

      <label className='sign-label'><div className='sign-label-title'>Имя пользователя</div>
        <input className={classnames('sign-form-input', {'red': errors.username})} {...register("username", { required: true})} />
      </label>
      <div className='sign-form-error'>{errors.password && <span>Введите имя пользователя</span>}</div>
      
      <label className='sign-label'><div className='sign-label-title'>Пароль</div>
        <input className={classnames('sign-form-input', {'red': errors.password})} type='password' {...register("password", { required: true})} />
      </label>
      <div className='sign-form-error'>{errors.password && <span>Введите пароль</span>}</div>
      
      <input className='sign-button' type="submit" value='Войти' />
    </form>
  </div>
  )
}

function SignUp() {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => {
    apiCreateUser(data).then(({data}) => {
      localStorage.setItem('token', data.token);
      window.msysAddMessage('Успешная регистрация', 'green');
      localStorage.setItem('username', data.username);
      dispatch(actionSetUsername(data.username));
      dispatch(actionSetPage('cards'));
    });
  };
  return (
    <div  className='sign'>
      <form onSubmit={handleSubmit(onSubmit)}>
      
      <label className='sign-label'><div className='sign-label-title'>Имя пользователя</div>
        <input className={classnames('sign-form-input', {'red': errors.username})} {...register("username", { required: true, minLength:1, maxLength:150, pattern: /^[\w.@+-]+$/ })} />
      </label>
      <div className='sign-form-error'>{errors.username && <span>Длина 1 .. 150. Только буквы, цифры и символы</span>}</div>
      
      <label className='sign-label'><div className='sign-label-title'>Email (не обязательно)</div>
        <input className={classnames('sign-form-input', {'red': errors.email})} {...register("email", { pattern: /^([a-z0-9_.-])+@(([a-z0-9-])+\.)+([a-z0-9])+$/i, maxLength:254 })} />
      </label>
      <div className='sign-form-error'>{errors.email && <span>Некорректный адрес</span>}</div>
      
      <label className='sign-label'><div className='sign-label-title'>Пароль</div>
        <input className={classnames('sign-form-input', {'red': errors.password})} {...register("password", { required: true, minLength:8, maxLength:128 })} />
      </label>
      <div className='sign-form-error'>{errors.password && <span>Длина от 8 до 128</span>}</div>
      
      <input className='sign-button' type="submit" value='Отправить' />
    </form>
    </div>
  )
}