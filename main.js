async function  main(params) {



let calendarBody=document.querySelector("#calendar-body")
let yearDisplay=document.querySelector("#year-display")
let monthDisplay=document.querySelector("#month-display")
let upBtn=document.querySelector("#calendar-up")
let downBtn=document.querySelector("#calendar-down")


let today=new Date()





let events=await localforage.getItem('events') || [{
    date:'16-10-2024',
    name:'project',
    type:'warning',
    isTask:false,
    subtasts:[],
    notes:'',
    time:''
    
},{
    date:'16-10-2024',
    name:'submission ',
    type:'primary',
    isTask:false,
    subtasts:[]
    ,notes:'',
    time:''

},]
console.log(events)

let selected=0

function loadCurrentMonth(year,month){
    calendarBody.innerHTML=''
    let nextmonth=new Date(year,month+1,1);
    nextmonth.setDate(nextmonth.getDate()-1)
    let lastday=nextmonth.getDate()
    
let currentDay=0
    if(today.getFullYear()==year && today.getMonth()==month){
         currentDay=today.getDate()
    }
    
   

    let m=new Date(year,month,1)
    monthDisplay.innerHTML=m.toLocaleString('default',{month:'long'})
    yearDisplay.innerHTML=m.getFullYear()
    let startat=m.getDay()

    let previousMonth=new Date(year,month,1)
    previousMonth.setDate(m.getDate()-1)
    let lastdayOfPreviousMonth=previousMonth.getDate()

    let realNextMonth=new Date(year,month+1,1)
    let firstDayOfNextMonth=realNextMonth.getDate()
    var selected=0

    for(let i=0;i<35;i++){
        if((i)%7==0 || i==0){
            currWeekContainer=document.createElement('tr')
            calendarBody.appendChild(currWeekContainer)
        }
      
        let elem=document.createElement('td')
        let elem1=document.createElement('div')
        elem1.classList.add('date')
        elem.appendChild(elem1)
        if(i>=startat && i<lastday+startat){
            let thisDate=new Date(year,month,1)
            thisDate.setDate(i-startat+1)
            
            elem.addEventListener('click',()=>selectDate(thisDate,elem))

            elem1.innerHTML=i-startat+1
            events.forEach(event=>{
                    let [day,month,year]=event.date.split('-')
                    let sampleDate=new Date(year,month-1,day)

                    if(thisDate.getDate()==sampleDate.getDate() && thisDate.getMonth()==sampleDate.getMonth() && thisDate.getFullYear()==sampleDate.getFullYear()){
                        let badge=document.createElement('span')
                        badge.classList.add('badge','text-bg-'+event.type)
                        badge.innerHTML=event.name
                        elem1.appendChild(badge)
                    }
                
            })
            
            
            
            if(i-startat+1==currentDay){
                elem.classList.add('border','border-primary','bg-primary','text-white')
            }
        }else if(i<startat){
            elem1.innerHTML=lastdayOfPreviousMonth-(startat-(i+1))
            elem1.classList.add('text-body-secondary')

        }else if(i>=lastday){
            elem1.innerHTML=firstDayOfNextMonth
            firstDayOfNextMonth+=1
            elem1.classList.add('text-body-secondary')
        }
        

      
        
        
        currWeekContainer.appendChild(elem)
    }
}




let currentDate=new Date()
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())



upBtn.addEventListener("click",()=>{
    currentDate.setMonth(currentDate.getMonth()-1)
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

})

downBtn.addEventListener("click",()=>{
    currentDate.setMonth(currentDate.getMonth()+1)
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

})

let selectedDateDisplay=document.querySelector("#selected-date")
let eventDisplay=document.querySelector('#event-display')
let eventName=document.querySelector('#event-name')
let eventForm=document.querySelector('#event-form')


let eventConfigForm=document.querySelector("#event-config-form")
let eventConfigClose=document.querySelector("#close-event")
let offCanvasEvent=document.querySelector('#offcanvas-event-config')


let colorInput=document.querySelector('#color-input')

colorInput.addEventListener('change',()=>{
    if(selectedEvent){
        events.forEach(e=>{
            if(e==selectedEvent){
                e.type=colorInput.value
            }
        })
        colorInput.classList.remove('bg-'+colorInput.value)
        localforage.setItem('events',events)
        
        updateEventList()
        loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
        
    }
})

eventConfigClose.addEventListener("click",()=>{
    offCanvasEvent.classList.remove('show')

})

let addEventBtn=document.querySelector('#add-event-btn')


eventForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    if(eventName.value.trim()=='') return
    events.push({
            date:`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`,
            name:eventName.value,
            type:'primary',
            isTask:false,
            subtasts:[],
            notes:''

    })
    localforage.setItem('events',events)
    updateEventList()
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
    eventName.value=''
})

let d;
function selectDate(date,elem){
    if(eventName.hasAttribute('disabled')){
        eventName.removeAttribute('disabled')
    }
 d=date
    selectedDateDisplay.innerHTML=d.toLocaleString("default",{day:'numeric',month:'long',year:'numeric'})
    if(!selected){
        selected=elem
        selected.classList.add('selected')
    }else{
        selected.classList.remove('selected')
        selected=elem
        selected.classList.add('selected')
    }

    updateEventList()
}


function updateEventList(){

    let targetEvents=events.filter(e=>e.date==`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`)
    eventDisplay.innerHTML=''
    if(typeof targetEvents ==typeof []){
        targetEvents.forEach((te)=>{
            let litem=document.createElement('li')
            litem.classList.add('list-group-item','list-group-item-'+te.type,'d-flex','justify-content-between')

            let btnContainer=document.createElement('div')
            btnContainer.classList.add('d-flex','gap-3')



            let deleteBtn=document.createElement('button')
            deleteBtn.classList.add('btn','btn-'+te.type)
            deleteBtn.innerHTML='<i class="bi bi-trash"></i>'
            deleteBtn.onclick=(e)=>{
                e.stopPropagation()
                events=events.filter((e)=>e.name!=te.name)
                localforage.setItem('events',events)
                updateEventList()
                loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
                
            }

            litem.onclick=()=>{
                openEvent(te)
            }
           
            litem.innerHTML=te.name

        
            btnContainer.appendChild(deleteBtn)
            litem.appendChild(btnContainer)
            eventDisplay.appendChild(litem)
        })
    }



}


let timeInp=document.querySelector('#time-input')
let noteTextarea=document.querySelector('#note-text')


timeInp.addEventListener('change',()=>{
    if(selectedEvent){
        selectedEvent.time=timeInp.value
        localforage.setItem('events',events)
    }
})

let selectedEvent;

function openEvent(te){
    offCanvasEvent.classList.add('show')
    console.log('event has been opened ')
    selectedEvent=te
    noteDisplay.innerHTML=''

    noteTextarea.value=te.note ||''
    colorInput.value=te.type
    timeInp.value=te.time ||''
    noteDisplay.innerHTML=marked.parse(te.note)
    renderMathInElement(noteDisplay)
    hljs.highlightAll()


}


let noteDisplay=document.querySelector("#note-display")
noteTextarea.addEventListener("input",()=>{
    console.log(selectedEvent)
    selectedEvent.note=noteTextarea.value
    localforage.setItem('events',events)
    noteDisplay.innerHTML=marked.parse(noteTextarea.value)
    renderMathInElement(noteDisplay)
    hljs.highlightAll()

})


//solution was from stack overflow
noteTextarea.addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;

      this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end);
  
      this.selectionStart =
        this.selectionEnd = start + 1;
    }
  });

let editBtn=document.querySelector('#edit-btn')
editBtn.onclick=(e)=>{
  
    document.querySelector('#note-edit').classList.toggle('d-none')
}

let fb=document.getElementById('calendar-table')
let ts=new swipeDetector(fb)

fb.addEventListener('swipeup',()=>{ 
    currentDate.setMonth(currentDate.getMonth()-1)
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
})

fb.addEventListener('swipedown',()=>{
    currentDate.setMonth(currentDate.getMonth()+1)
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
})

}

main()



class swipeDetector{
    constructor(elem){
        this.elem=elem
        this.elem.addEventListener('touchstart',this.start.bind(this))
        this.elem.addEventListener('touchmove', (e)=>{
            e.preventDefault() 
        }, false)
        this.elem.addEventListener('touchend',this.end.bind(this))
        this.allowedTime=300
        this.threshold=150
        this.restraint=100
        
    }

    start(e){
        this.startX=e.touches[0].clientX
        this.startY=e.touches[0].clientY
        this.startTime=Date.now()
       
    
    }

    end(e){
        this.endX=e.changedTouches[0].clientX
        this.endY=e.changedTouches[0].clientY
        this.endTime=Date.now()
        this.deltaT=this.endTime-this.startTime
        this.deltaX=this.endX-this.startX
        this.deltaY=this.endY-this.startY
        

        

        if( this.deltaT<=this.allowedTime){
            if(Math.abs(this.deltaX)>=this.threshold && Math.abs(this.deltaY)<=this.restraint){ 
                if(this.deltaX>0){
                    this.elem.dispatchEvent(new CustomEvent('swipeleft'))
                }else{
                this.elem.dispatchEvent(new CustomEvent('swiperight'))
                }
            }else if(Math.abs(this.deltaY)>=this.threshold && Math.abs(this.deltaX)<=this.restraint){
                if(this.deltaY>0){
                    this.elem.dispatchEvent(new CustomEvent('swipeup'))
                }else if(this.deltaY<0){
                    this.elem.dispatchEvent(new CustomEvent('swipedown'))
                }
            }  
            }

  
        }
    }

