const {ipcRenderer} = require('electron')

document.body.addEventListener('click', (event) => {
  // console.log(event);
  // load things with this
  if (event.target.dataset.request) {
    const request = `${event.target.dataset.request}-request`;
    const args = {
      'command': event.target.dataset.command, 
      'title': event.target.dataset.title
    }
    if (event.target.dataset.command === 'setTask') {
      args['taskName'] = event.target.dataset.taskname;
      // see if the checkbox is checked
      // console.log(event.target.checked); 
      args['completed'] = !event.target.hasAttribute('checked'); 
      args['difficulty'] = event.target.dataset.difficulty;
    }
    // console.log('sending payload and request: ');
    // console.log(request, args); 
    ipcRenderer.send(request, args); 
  }

  if (event.target.dataset.section) {
    handleSectionTrigger(event);
    console.log('trying to switch now'); 

  }
})

function handleSectionTrigger (event) {
  hideAllSectionsAndDeselectButtons()
  // Highlight clicked button
  event.target.classList.add('mdc-list-item--activated')
  // Display the current section
  const sectionId = `${event.target.dataset.section}-section`
  document.getElementById(sectionId).classList.remove('hide')
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.app-content')
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.add('hide')
  })

  const buttons = document.querySelectorAll('.mdc-list-item--activated')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('mdc-list-item--activated')
  })
}