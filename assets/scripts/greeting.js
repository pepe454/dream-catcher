const settings = require('electron-settings')
const path = require('path')

let nameEntry = document.getElementById('name-entry-form')
const name = document.getElementById('name-entry')
nameEntry.addEventListener('submit', async (event) => {
  event.preventDefault()
  const userName = name.value
  console.log(userName)
  await settings.set('userName', userName)
  setGreetingAndBGImage()
})

async function setGreetingAndBGImage () {
  let timeOfDay = new Date()
  let morning = new Date()
  morning.setHours(3)
  let afternoon = new Date()
  afternoon.setHours(12)
  let nighttime = new Date()
  nighttime.setHours(18)

  let clsString = ''
  if (timeOfDay < morning) {
    clsString = 'evening'
  } else if (timeOfDay < afternoon) {
    clsString = 'morning' 
  } else if (timeOfDay < nighttime) {
    clsString = 'evening' 
  } else {
    clsString = 'evening' 
  }

  let userName = await settings.get('userName')
  console.log(userName)
  if(userName != undefined){
    document.querySelector('.welcome-greeting').classList.add(clsString)
    let greetingTag = document.createElement('h1')
    console.log(userName)
    greetingTag.innerText = 'Good ' + clsString + ' ' + userName + '!'
    document.querySelector('.welcome-greeting').appendChild(greetingTag)
    let greetingQuote = document.createElement('h4')
    greetingQuote.innerText = 'We know what we are, but know not what we may be'
    document.querySelector('.welcome-greeting').appendChild(greetingQuote)

  // show first time greeting and input form
  } else {
    let form = document.getElementById('name-entry')
    form.classList.remove('hide')
    let greetingMsg = document.getElementById('first-welcome')
    greetingMsg.classList.remove('hide')
  }
}

setGreetingAndBGImage()