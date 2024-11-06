 import {input,label,$el,$$el,effect,state,tr,td,div,span,li,button,i} from 'https://esm.sh/dominity@latest'


localforage.config({
    name: 'calendar',
    version:2.0,

    
})




let calendarBody=$el("#calendar-body")
let yearDisplay=$el("#year-display")
let monthDisplay=$el("#month-display")


let today=new Date()




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
        this.restraint=125
        
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

let events=state(await localforage.getItem('events') || [])



let selected=0

function loadCurrentMonth(year,month){

    calendarBody.html('')
    let nextmonth=new Date(year,month+1,1);
    nextmonth.setDate(nextmonth.getDate()-1)
    let lastday=nextmonth.getDate()
    
let currentDay=0
    if(today.getFullYear()==year && today.getMonth()==month){
         currentDay=today.getDate()
    }
    
   

    let m=new Date(year,month,1)
    monthDisplay.html(m.toLocaleString('default',{month:'long'}))
    yearDisplay.html(m.getFullYear())
    let startat=m.getDay()

    let previousMonth=new Date(year,month,1)
    previousMonth.setDate(m.getDate()-1)
    let lastdayOfPreviousMonth=previousMonth.getDate()

    let realNextMonth=new Date(year,month+1,1)
    let firstDayOfNextMonth=realNextMonth.getDate()
    var selected=0
    let currWeekContainer
    for(let i=0;i<35;i++){
        
        if((i)%7==0 || i==0){
            currWeekContainer=tr()
            currWeekContainer.addTo(calendarBody)
        }
        let dateElem=td(
            div(
                {class:'date'},

            )
        )

        dateElem.on("dragover",(e)=>{
            e.preventDefault()
            dateElem.elem.classList.add('bg-secondary')
        })
        dateElem.on('dragleave',()=>{  
            dateElem.elem.classList.remove('bg-secondary')
         })
        dateElem.on('drop',(e)=>{
         console.log('dropped ')
         let id=e.dataTransfer.getData('text/plain')
         events.value.filter((e)=>e.id==id)[0].date=`${i-startat+1}-${month+1}-${year}`
         localforage.setItem('events',events.value)
         loadCurrentMonth(year,month)
         updateEventList()
        })




        if(i>=startat && i<lastday+startat){
            let thisDate=new Date(year,month,1)
            thisDate.setDate(i-startat+1)
            
            dateElem.on('click',()=>selectDate(thisDate,dateElem))

            dateElem.child(0).html(i-startat+1)

            events.value.forEach(event=>{
                    let [day,month,year]=event.date.split('-')
                    let sampleDate=new Date(year,month-1,day)

                    if(thisDate.getDate()==sampleDate.getDate() && thisDate.getMonth()==sampleDate.getMonth() && thisDate.getFullYear()==sampleDate.getFullYear()){
                        dateElem.child(0)

                        span(
                            {class:'badge text-bg-'+event.type},
                            event.name
                        ).addTo(dateElem.child(0))
                            
                    }
                
            })
            
            
            
            if(i-startat+1==currentDay){
               // dateElem.elem.classList.add('border','border-primary','bg-primary','text-white')
               dateElem.css({
                background:'var(--bs-primary-bg-subtle)'
               })
            }
        }else if(i<startat){
            dateElem.child(0).html(lastdayOfPreviousMonth-(startat-(i+1)))
            dateElem.child(0).elem.classList.add('text-body-secondary')

        }else if(i>=lastday){
            dateElem.child(0).html(firstDayOfNextMonth)
            firstDayOfNextMonth+=1
            dateElem.child(0).elem.classList.add('text-body-secondary')
        }
        
        dateElem.addTo(currWeekContainer)
    }
}




let currentDate=new Date()
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())



let monthUp=()=>{
    currentDate.setMonth(currentDate.getMonth()-1)
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

}

let monthDown=()=>{
    currentDate.setMonth(currentDate.getMonth()+1)
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

}


let upBtn=$el("#calendar-up").on('click',monthUp)
let downBtn=$el("#calendar-down").on('click',monthDown)

let selectedDateDisplay=$el("#selected-date")
let eventDisplay=$el('#event-display')
let eventForm=$el('#event-form')


let eventConfigForm=$el("#event-config-form")
let eventConfigClose=$el("#close-event")
let offCanvasEvent=$el('#offcanvas-event-config')


let colorInput=$el('#color-input')

colorInput.on('change',()=>{
    if(selectedEvent){
        events.value.forEach(e=>{
            if(e==selectedEvent){
                e.type=colorInput.elem.value
            } 
        })
        colorInput.elem.classList.remove('bg-'+colorInput.elem.value)
        localforage.setItem('events',events.value)
        loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
    updateEventList()
    }
})



eventConfigClose.on("click",()=>{
    offCanvasEvent.elem.classList.remove('show')

})

let addEventBtn=$el('#add-event-btn')
let eventName=state('')

$el('#event-name').model(eventName)

eventForm.on('submit',(e)=>{
    e.preventDefault()
    if(eventName.value.trim()=='') return
    events.value=[...events.value,{
            id:'e'+Date.now(),
            date:`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`,
            name:eventName.value,
            type:'primary',
            isTask:false,
            subtasks:[],
            notes:''

    }]
    eventName.value=''
    localforage.setItem('events',events.value)
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
    updateEventList()

})

let d;
function selectDate(date,elem){
    if($el('#event-name').elem.hasAttribute('disabled')){
        $el('#event-name').elem.removeAttribute('disabled')
    }
 d=date
    selectedDateDisplay.html(d.toLocaleString("default",{day:'numeric',month:'long',year:'numeric'}))
    if(!selected){
        selected=elem
        selected.elem.classList.add('selected')
    }else{
        selected.elem.classList.remove('selected')
        selected=elem
        selected.elem.classList.add('selected')
    }

    updateEventList()
}


function updateEventList(){

    let targetEvents=events.value.filter(e=>e.date==`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`)
    eventDisplay.html('')

    if(typeof targetEvents ==typeof []){
        targetEvents.forEach((te)=>{

        
            li({draggable:'true',class:'list-group-item list-group-item-'+te.type+' d-flex justify-content-between'},te.name,
                div({class:'d-flex gap-3'},
                    button({class:'btn btn-'+te.type},
                        i({class:'bi bi-trash'})
                    ).on('click',(e)=>{
                        e.stopPropagation()
                        events.value=events.value.filter((e)=>e.id!=te.id)
                        localforage.setItem('events',events.value)
                        updateEventList()
                        loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
                        
                    })
                )
            
            ).on('click',()=>{
                openEvent(te)
            }).on('dragstart',(e)=>{
                e.dataTransfer.allowedEffect='all'
                e.dataTransfer.setData('text/plain',te.id)
            }).addTo(eventDisplay)
            
        })
    }



}


let timeInp=$el('#time-input')
let noteTextarea=$el('#note-text')


timeInp.on('change',()=>{
    if(selectedEvent){
        selectedEvent.time=timeInp.value
        localforage.setItem('events',events.value)
        loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
    }
})

let selectedEvent;

function openEvent(te){
    offCanvasEvent.elem.classList.add('show')
    console.log('event has been opened ')
    selectedEvent=te
    noteDisplay.html('')

    noteTextarea.elem.value=te.note ||''
    colorInput.elem.value=te.type
    timeInp.elem.value=te.time ||''
    noteDisplay.html(marked.parse(te.note||''))
    renderMathInElement(noteDisplay.elem)
    hljs.highlightAll()
  updateTaskList()


}


let noteDisplay=$el("#note-display")
let note =state('')
noteTextarea.model(note)
noteTextarea.on("input",()=>{
    selectedEvent.note=note.value
    localforage.setItem('events',events.value)
    noteDisplay.html(marked.parse(note.value))
    renderMathInElement(noteDisplay.elem)
    hljs.highlightAll()

})


//solution was from stack overflow
noteTextarea.on('keydown', function(e) {
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

let editBtn=$el('#edit-btn')
editBtn.on("click",(e)=>{
    $el('#note-edit').elem.classList.toggle('d-none')
})

let fb=$el('#calendar-table')
let ts=new swipeDetector(fb.elem)

fb.on('swipeup',monthUp)

fb.on('swipedown',monthDown)


let taskBtn=$el("#task-btn")
let taskInp=$el("#task-input")



let taskAddBtn=$el("#task-add")


let taskname=state('')
$el('#taskinp').model(taskname)

$el("#taskform").on("submit",(e)=>{
e.preventDefault()
    if(taskname.value.trim()=='') return
    selectedEvent.isTask=true
    selectedEvent.subtasks.push({
        id:Math.random()*100+Date.now(),
        name:taskname.value,
    done:false})
    localforage.setItem('events',events.value)
    taskname.value=''
        
    updateTaskList()
    
})

taskBtn.on("click",()=>{
    taskInp.elem.classList.toggle('d-none')
    
})


function dropZone(i){
    let d= div({class:'drop-zone'}).css({
        transition:'height 0.15s ease-in'
    }).on('dragover',(e)=>{
        e.preventDefault()
     d.css({
        height:'3rem',
        background:'var(--bs-success-bg-subtle)'
     })
    }).on('dragleave',()=>{
        d.css({
           height:'1rem',
            background:'var(--bs-primary-bg-subtle)'
        })
    }).on('drop',(e)=>{
    
        let data=e.dataTransfer.getData('text/plain')
        let index=parseInt(data)
    
        let movingTask=selectedEvent.subtasks.splice(index,1)[0]
        selectedEvent.subtasks.splice(i,0,movingTask)
    
        localforage.setItem('events',events.value)
        updateTaskList()
    
    
    
    })

    return d
}

function updateTaskList(){
   
    let tasklist=$el('#task-list')
    tasklist.html('')
  

    /*
    
    
    */
   selectedEvent.subtasks.forEach((t,i)=>{
     
    let done=state(t.done)
let d=dropZone(i)


d.addTo(tasklist)


 let tas=div({class:'d-flex justify-content-between rounded-2 mb-1 shadow-sm py-2 px-5','draggable':'true'},
    div({class:'form-check'},
        input({class:'form-check-input',type:'checkbox'}).model(done),
        label({class:'form-check-label px-2', for:'flexCheckDefault'},t.name)
    ),
    button({class:'btn btn-close btn-sm'}).on("click",()=>{
        selectedEvent.subtasks.splice(i,1)
        localforage.setItem('events',events.value)
        updateTaskList()
    })
).addTo(tasklist).on("dragstart",(e)=>{
    tas.elem.classList.add('dragging')
    e.dataTransfer.setData('text/plain',i)
    $$el('.drop-zone').forEach(d=>{
      
        d.css({
            display:'block',
            height:'1rem',
            width:'100%',
            background:'var(--bs-primary-bg-subtle)',
        })
    })
}).on("dragend",(e)=>{
    tas.elem.classList.remove('dragging')
    $$el('.drop-zone').forEach(d=>{
        d.css({
            height:'0rem'
        })
    })
})

if(i==selectedEvent.subtasks.length-1){
    dropZone(i+1).addTo(tasklist)
}

effect(()=>{
  console.log(done.value)
  t.done=done.value
  localforage.setItem('events',events.value)

})
    })

if(selectedEvent.subtasks.length==0){
    $el('#task-heading').elem.classList.add('d-none')

}else{
    $el('#task-heading').elem.classList.remove('d-none')
}



}



