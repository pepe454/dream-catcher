const settings = require('electron-settings')

let nameEntry = document.getElementById('name-entry-form')
nameEntry.addEventListener('submit', async (event) => {
  event.preventDefault()
  const name = document.getElementById('name-entry').value
  await settings.set('userName', name)
  document.querySelector('.welcome-modal').classList.add('hide')
  setGreetingAndBGImage()
})

async function setGreetingAndBGImage () {
  const name = await settings.get('userName')
  console.log(name)
  let modal = document.querySelector('.welcome-modal')
  if(name == undefined)
    modal.classList.remove('hide')
  else
    modal.classList.add('hide')
}

setGreetingAndBGImage()