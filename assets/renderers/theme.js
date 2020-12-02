async function setGreetingAndBGImage () {
  let timeOfDay = new Date()
  let morning = new Date()
  let afternoon = new Date()
  let nighttime = new Date()
  morning.setHours(4)
  afternoon.setHours(12)
  nighttime.setHours(16)

  let todString = ''
  if (timeOfDay < morning)
    todString = 'evening'
  else if (timeOfDay < afternoon)
    todString = 'morning' 
  else if (timeOfDay < nighttime)
    todString = 'midday' 
  else
    todString = 'evening' 

  document.querySelector('.menu-bar').classList.add(todString)
  document.querySelector('.navigation').classList.add(todString)
  document.querySelector('.main-content').classList.add(todString)
}

setGreetingAndBGImage();