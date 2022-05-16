import './messageSystem.scss';

// ИСПОЛЬЗОВАНИЕ
/*
 * msysAddMessage(newMessage, color)
 *
 * newMessage = String
 * color = undefinend, 'red', 'green'
 */

let messageTime = 3000; // время в течение которого отображается сообщение (мс)
let msysDisappearTime = 300; // время в течение которого будет исчезать сообщение (мс)

let msysTransform = 0;
const messages = [];
const messageSystem = document.createElement('div');
messageSystem.id = 'message-system';
const messageSystemContainer = document.createElement('div');
messageSystemContainer.classList.add('message-system-container');
messageSystem.appendChild(messageSystemContainer);
document.body.appendChild(messageSystem);

messageSystemContainer.style.transform = 'translateY(0px)';

window.msysAddMessage = (newMessage, color) => {
  const newElement = document.createElement('div');
  newElement.classList.add('message-system-message');
  if (color) {
    switch (color) {
      case 'green':
        newElement.classList.add('message-system-message-green');
        break;
      case 'red':
        newElement.classList.add('message-system-message-red');
        break;
      default:
        break;
    }
  }
  const newElementBox = document.createElement('div');
  newElementBox.classList.add('message-system-box');
  newElementBox.innerHTML = newMessage;
  newElement.appendChild(newElementBox);
  messages.push(newElement);
  messageSystemContainer.appendChild(newElement);
  setTimeout(() => {
    const h = newElement.offsetHeight;
    let hLeft = h;
    newElement.classList.add('message-system-message-disappear');
    requestAnimationFrame(function(startTime) {
      let prevTime = startTime;
      requestAnimationFrame(function disappear(time) {
        const progress = (time-startTime)/msysDisappearTime;
        let diff;
        if (progress > 1) msysTransform -= hLeft;
        else {diff = (time-prevTime)/msysDisappearTime;
          hLeft -= h*diff;
          msysTransform -= h*diff;
        }
        if (Math.abs(msysTransform)<0.2) msysTransform = 0;
        messageSystemContainer.style.transform = 'translateY('+msysTransform+'px)';
        if (progress < 1) requestAnimationFrame(disappear);
        else {
          requestAnimationFrame(()=>{
            messageSystemContainer.removeChild(messages[0]);
            msysTransform += h;
            if (Math.abs(msysTransform)<0.2) msysTransform = 0;
            messageSystemContainer.style.transform = 'translateY('+msysTransform+'px)';
            messages.shift();
          });
        }
        prevTime = time;
      })
    })
  }, messageTime);
};
