import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { useSelector, useDispatch } from 'react-redux'

import './App.css';

import {actionSetPage, actionSetCards, actionSetUsername, actionResetState} from '../store'
import {apiRefreshToken, apiGetCards, apiUpdateCard, apiAddCard, apiDelCard} from '../api';

import { SignPage } from './SignPage'


export const appPages = {
  sign: 'sign',
  cards: 'cards'
}

function Header() {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.username);
  const [buttons, setButtons] = useState(false);

  const exitHandle = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    dispatch(actionSetPage(appPages.sign));
    dispatch(actionSetUsername(''));
    dispatch(actionSetCards([]));
  }
  
  return (
    <header className={classnames('header', {'header-buttons-visible': buttons})}>
      <div className='header-container'>
        <div className='header-top'>
          <div className='header-toggle' onClick={()=>setButtons(b=>!b)}>
            <div className='header-toggle-burger'><div></div><div></div><div></div></div>
            <div className='header-toggle-close'>{'\u00D7'}</div>
          </div>
        </div>
      </div>
      <div className='header-container'>
          <div className='header-buttons'>
            <div className='header-button header-button-exit' onClick={exitHandle}><b>{username+' '}</b>Выйти</div>
          </div>
      </div>
    </header>
  )
}

export function App() {
  const cards = useSelector((state) => state.cards);
  const dispatch = useDispatch()
  const page = useSelector((state) => state.page);
  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(actionSetPage(appPages.sign));
      return;
    };
    apiRefreshToken(token).then(({data})=>{
      localStorage.setItem('token', data.token);
      const username = localStorage.getItem('username');
      dispatch(actionSetUsername(username));
      dispatch(actionSetPage(appPages.cards));
      
      setInterval(()=>{
        apiRefreshToken(token).then(({data})=>{
          localStorage.setItem('token', data.token);
        });
      }, 600000)
    }).catch(()=>{
      dispatch(actionSetPage(appPages.sign));
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    })
  },[])
  return (<>
    {page===appPages.sign && <SignPage />}
    
    {page===appPages.cards && <CardsPage cards={cards} />}
    </>);
}

function CardsPage({cards}) {
  const dispatch = useDispatch();
  useEffect(()=>{
    apiGetCards().then(({data}) => {
      dispatch(actionSetCards(data));
    });
  },[])
  return (<><Header /><div className="container">
  {cards && <>
    <Collection title='ON HOLD' bgc='#FF9755' cards={cards.filter((card) => card.row === '0')} row='0' />
    <Collection title='IN PROGRESS' bgc='#4C9BCD' cards={cards.filter((card) => card.row === '1')}  row='1' />
    <Collection title='NEEDS REVIEW' bgc='#FCD058' cards={cards.filter((card) => card.row === '2')}  row='2' />
    <Collection title='APPROWED' bgc='#5CB678' cards={cards.filter((card) => card.row === '3')}  row='3' />
  </>}
</div></>)
}

function Collection({ cards, title, bgc, row }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  return (
    <div className="collection">
      <div className="collection-title" style={{backgroundColor: bgc}}>{`${title} (${cards.length})`}</div>
      <div className="collection-growing collection-growing-top" data-row={row}></div>
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
      <div className="collection-growing collection-growing-bottom" data-row={row}></div>
      {editing ?
        <div className='collection-editing'>
          <textarea className='collection-editing-textarea' value={text} onChange={(e)=>setText(e.target.value)} placeholder='Ввести заголовок для этой карточки'></textarea>
          <div className='collection-editing-buttons'>
            <div className='collection-editing-add' onClick={()=>{
              if (text !=='') apiAddCard({row, text}).then(()=>{
                apiGetCards().then(({data}) => {
                  setEditing(false);
                  setText('');
                  dispatch(actionSetCards(data));
                });
              })
            }}>Добавить карточку</div>
            <div className='collection-editing-cansel' onClick={()=>{setEditing(false);setText('')}}>{'\u00D7'}</div>
          </div>
        </div> :
        <div className='collection-open-editing' onClick={()=>setEditing(true)}>
          <div className='collection-editing-plus'>+</div>
          <div>Добавить карточку</div>
        </div>
      }
    </div>
  );
}


function Card({ card }) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [mouseDown, setMouseDown] = useState(true);
  return (
    <>
      <div className="card-container" data-row={card.row} data-seq_num={card.seq_num}>
        <div className='card-container-padding'>
        <div className="growing-top"></div>
        <div
          className="card"
          ref={ref}
          onMouseDown={(e) => {
            if (!mouseDown) return;
            console.log('MOUSE DOWN')
            setMouseDown(false)

            const dragFrom = {...card};
            let dragPlace = '';

            ref.current.style.zIndex = '1';
            const refTransition = getComputedStyle(ref.current).transition;
            ref.current.style.transition = 'none';

            const draggedCont =  ref.current.parentElement.parentElement;
            const draggedContPrevEl = draggedCont.previousElementSibling;
            const draggedContHeight = draggedCont.getBoundingClientRect().height;
            const draggedContTransition = getComputedStyle(draggedCont).transition;
            draggedCont.style.transition = 'none';
            draggedCont.style.height = draggedContHeight + 'px';
            
            const refRect = ref.current.getBoundingClientRect();
            const shift = {top: e.clientY-refRect.top, left: e.clientX-refRect.left}
            ref.current.style.width = refRect.width + 'px';
            ref.current.style.position = 'fixed';
            
            ref.current.style.top = e.clientY-shift.top + 'px';
            ref.current.style.left = e.clientX-shift.left + 'px';

            

            
            let cardContainers = Array.from(document.querySelectorAll('.card-container'));
            cardContainers = cardContainers.filter((cont) => cont !== draggedCont);


            // CONSTANTS
            const draggedContTransitionDuration = 200 // height: auto
            const cardContainerPaddingTop = 4;
            const cardContainerPaddingLeft = 8;
            const collectionGrowingDefaultH = 4;
            let collectionGrowings = Array.from(document.querySelectorAll('.collection-growing'));

            let trackContainers = [];
            let trackCollectionGrowings = [];
            

            {
              const nextEl = draggedCont.nextElementSibling;
              if (nextEl.classList.contains('card-container')) {
                const growingTopEl = nextEl.querySelector('.growing-top');
                const transitionEl = getComputedStyle(growingTopEl).transition;
                growingTopEl.style.transition = 'none';
                growingTopEl.style.height = draggedContHeight +'px';
                draggedCont.style.height = '0';
                setTimeout(()=>{growingTopEl.style.transition = transitionEl;}, 0);
                trackContainers.unshift(nextEl);
                dragPlace = 'before';
              } else {
                const transitionEl = getComputedStyle(nextEl).transition;
                nextEl.style.transition = 'none';
                nextEl.style.height = draggedContHeight + collectionGrowingDefaultH +'px';
                draggedCont.style.height = '0';
                setTimeout(()=>{nextEl.style.transition = transitionEl;}, 0);
                trackCollectionGrowings.unshift(nextEl);
                dragPlace = 'before';
              }
            }

            function move(e) {
              ref.current.style.top = e.clientY-shift.top + 'px';
              ref.current.style.left = e.clientX-shift.left + 'px';
              
              cardContainers.forEach(cont => {
                const rect = cont.getBoundingClientRect();
                
                if (rect.top+window.scrollY<=e.pageY && rect.bottom+window.scrollY>=e.pageY
                  && rect.left<=e.pageX && rect.right>=e.pageX) {
                  
                  trackContainers = trackContainers.filter(co => {
                    if (co === cont) return true;
                    co.querySelector('.growing-top').style.height = '0';
                    co.querySelector('.growing-bottom').style.height = '0';
                    return false;
                  });
                  
                  if (!trackContainers.includes(cont)) {
                    trackContainers.unshift(cont);
                  }

                  const topGrowingH = cont.querySelector('.growing-top').getBoundingClientRect().height;
                  const bottomGrowingH = cont.querySelector('.growing-bottom').getBoundingClientRect().height;
                  if (rect.top+topGrowingH+window.scrollY+((rect.height-topGrowingH-bottomGrowingH)/2)>e.pageY) {
                    cont.querySelector('.growing-top').style.height = draggedContHeight +'px';
                    cont.querySelector('.growing-bottom').style.height = '0';
                    dragPlace = 'before';
                  } else {
                    cont.querySelector('.growing-bottom').style.height = draggedContHeight +'px';
                    cont.querySelector('.growing-top').style.height = '0';
                    dragPlace = 'after';
                  }
                  trackCollectionGrowings.forEach(grow => {
                    grow.style.height = collectionGrowingDefaultH + 'px';
                  });
                  trackCollectionGrowings = [];
                }
              });

              collectionGrowings.forEach(grow => {
                const rect = grow.getBoundingClientRect();
                if (rect.top+window.scrollY<=e.pageY && rect.bottom+window.scrollY>=e.pageY
                  && rect.left<=e.pageX && rect.right>=e.pageX) {
                  if (!trackCollectionGrowings.includes(grow)) trackCollectionGrowings.unshift(grow);
                  grow.style.height = draggedContHeight + collectionGrowingDefaultH +'px';
                  if (grow.classList.contains('collection-growing-top')) {dragPlace='after'} else {dragPlace='before'}
                  
                  trackContainers.forEach(co => {
                    co.querySelector('.growing-top').style.height = '0';
                    co.querySelector('.growing-bottom').style.height = '0';
                  });
                  trackContainers = [];
                }
              });

              trackContainers = trackContainers.filter(cont => {
                const rect = cont.getBoundingClientRect();
                if (rect.top+window.scrollY>e.pageY || rect.bottom+window.scrollY<e.pageY
                  || rect.left>e.pageX || rect.right<e.pageX) {
                  cont.querySelector('.growing-top').style.height = '0';
                  cont.querySelector('.growing-bottom').style.height = '0';
                  return false;
                } else {
                  return true
                }
              });
              
              trackCollectionGrowings = trackCollectionGrowings.filter(grow => {
                const rect = grow.getBoundingClientRect();
                if (rect.top+window.scrollY>e.pageY || rect.bottom+window.scrollY<e.pageY
                  || rect.left>e.pageX || rect.right<e.pageX) {
                  grow.style.height = collectionGrowingDefaultH + 'px';
                  return false;
                } else {
                  return true
                }
              });
            }

            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', function up() {
              console.log('MOUSE UP')
              window.removeEventListener('mousemove', move);
              window.removeEventListener('mouseup', up);
              setTimeout(()=> {
                ref.current.style.zIndex = '0';
              },200);
              console.log('trackContainers',trackContainers);
              console.log('trackCollectionGrowings',trackCollectionGrowings);
              const dragTo = {};

              function moveCardToCont() {
                const refRect = ref.current.getBoundingClientRect();
                const contRect = draggedCont.getBoundingClientRect();
                const translateX = refRect.left - contRect.left - cardContainerPaddingLeft;
                let translateY = refRect.top - contRect.top - cardContainerPaddingTop;
                ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
                ref.current.style.top = '0';
                ref.current.style.left = '0';
                ref.current.style.position = 'relative';
                ref.current.style.width = 'auto';
                setTimeout(()=> {
                  ref.current.style.transition = refTransition;
                  ref.current.style.transform = 'translate(0px, 0px)';
                },0);
                draggedCont.style.transition = draggedContTransition;
                draggedCont.style.height = draggedContHeight +'px';
                setTimeout(()=> {
                  draggedCont.style.height = 'auto';
                },draggedContTransitionDuration);
              }

              dragTo.id = dragFrom.id;
              console.log('dragPlace', dragPlace);
              (()=>{
                if (trackContainers.length===0 && trackCollectionGrowings.length===0) {
                  return;
                }

                if (trackContainers.length!==0) {
                  if ((dragPlace==='before' && trackContainers[0].previousElementSibling===draggedCont)
                    || (dragPlace==='after' && trackContainers[0].nextElementSibling===draggedCont)) {
                    return;
                  }
                } else {
                  if ((trackCollectionGrowings[0].classList.contains('collection-growing-top') && trackCollectionGrowings[0].nextElementSibling===draggedCont)
                    || (trackCollectionGrowings[0].classList.contains('collection-growing-bottom') && trackCollectionGrowings[0].previousElementSibling===draggedCont)) {
                    return;
                  }
                }

                if (trackContainers.length!==0) {
                  dragTo.row = trackContainers[0].dataset.row;
                  if (dragPlace==='before') {
                    dragTo.seq_num = +trackContainers[0].dataset.seq_num;

                    insertBefore(draggedCont, trackContainers[0]);
                  } else {
                    if (trackContainers[0].nextElementSibling.classList.contains('card-container')) {
                      dragTo.seq_num = +trackContainers[0].nextElementSibling.dataset.seq_num;
                    } else {
                      dragTo.seq_num = (+trackContainers[0].dataset.seq_num)+1;
                    }
                    insertAfter(draggedCont, trackContainers[0]);
                  }
                } else {
                  dragTo.row = trackCollectionGrowings[0].dataset.row;
                  if (trackCollectionGrowings[0].classList.contains('collection-growing-top')) {
                    if (trackCollectionGrowings[0].nextElementSibling.classList.contains('card-container')) {
                      dragTo.seq_num = +trackCollectionGrowings[0].nextElementSibling.dataset.seq_num;
                    } else {
                      dragTo.seq_num = 0;
                    }
                    insertAfter(draggedCont, trackCollectionGrowings[0]);
                  } else {
                    if (trackCollectionGrowings[0].previousElementSibling.classList.contains('card-container')) {
                      dragTo.seq_num = (+trackCollectionGrowings[0].previousElementSibling.dataset.seq_num)+1;
                    }
                    insertBefore(draggedCont, trackCollectionGrowings[0]);
                  }
                }
                dragTo.text = dragFrom.text;
              })()

              apiUpdateCard(dragTo).then(()=> {
                apiGetCards().then(({data}) => {
                  insertAfter(draggedCont, draggedContPrevEl);
                  dispatch(actionSetCards(data));
                })
              })

              moveCardToCont();

              trackContainers.forEach(cont => {
                cont.querySelector('.growing-top').style.height = '0';
                cont.querySelector('.growing-bottom').style.height = '0';
              });
              trackCollectionGrowings.forEach(grow =>{
                grow.style.height = collectionGrowingDefaultH + 'px';
              });

              console.log('dragFrom',dragFrom)
              console.log('dragTo',dragTo)

              setMouseDown(true);
            });
          }}
        >
          <div className='card-del-container'><div className='card-del' onClick={()=>{
            apiDelCard({id: card.id}).then(()=> {
              apiGetCards().then(({data}) => {
                dispatch(actionSetCards(data));
              })
            })
          }} onMouseDown={(e)=>e.stopPropagation()}>{'\u00D7'}</div></div>
          <div className='card-id'><b>id:</b> {card.id}</div>
          <div>{card.text}</div>
        </div>
        <div className="growing-bottom"></div></div>
      </div>
    </>
  );
}

function insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export default App;
