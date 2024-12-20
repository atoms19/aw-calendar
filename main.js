 import {input,label,$el,$$el,effect,state,tr,td,div,span,h4,li,button,i} from "dominity"
import swipeDetector from "./swipe"


localforage.config({
    name: 'calendar',
    version:2.0,

    
})

let calendarBody=$el("#calendar-body")
let yearDisplay=$el("#year-display")
let monthDisplay=$el("#month-display")

async function  getEvents() {
    events.value= await localforage.getItem('events')
}

let today=new Date()
let events=state([])
let selected=0

getEvents()

let istaskMode=state(false)
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

           let  monthlyEvents=events.value.filter((e)=>e.date==`${i-startat+1}-${month+1}-${year}`)
            monthlyEvents.forEach(event=>{
                   

                    if(event.date==`${i-startat+1}-${month+1}-${year}`){
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
$el(".table").elem.classList.add('animate-up')
setTimeout(()=>{
    $el(".table").elem.classList.remove('animate-up')
},200)

}

let monthDown=()=>{
    currentDate.setMonth(currentDate.getMonth()+1)
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
$el(".table").elem.classList.add('animate-down')
setTimeout(()=>{
    $el(".table").elem.classList.remove('animate-down')
},200)



}


let upBtn=$el("#calendar-up").on('click',monthUp)
let downBtn=$el("#calendar-down").on('click',monthDown)

let selectedDateDisplay=$el("#selected-date")
let eventDisplay=$el('#event-display')
let eventForm=$el('#event-form')


let eventConfigForm=$el("#event-config-form")
let eventConfigClose=$el("#close-event")
let offCanvasEvent=$el('#offcanvas-event-config')

let colorbind=state('primary')
let colorInput=$el('#color-input',{
  class:()=>'form-select bg-'+colorbind.value+'-subtle border-2 border-'+colorbind.value
})

colorInput.on('change',()=>{
    if(selectedEvent){
        events.value.forEach(e=>{
            if(e==selectedEvent){
              e.type=colorInput.elem.value
              colorbind.value=e.type
            } 
        })
        
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
            subtasks:istaskMode.value?[{name:'',done:false}]:[],
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
    

    window.scrollTo(0, document.body.scrollHeight);
}


function updateEventList(){

    let targetEvents=events.value.filter(e=>e.date==`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`)
    eventDisplay.html('')

    if(typeof targetEvents ==typeof []){
        targetEvents.forEach((te)=>{
            let eventChecked=state(te.subtasks.every(task=>task.done))
            
        
            li({draggable:'true',class:'list-group-item list-group-item-'+te.type+' d-flex  align-items-center justify-content-between'},div({class:'d-flex gap-2'},
                input({class:`form-check-input border-2 border-${te.type}-subtle`,type:'checkbox'}).model(eventChecked).showIf(state(te.subtasks.length!=0)).on('change',(e)=>{
                        te.subtasks.forEach(task=>{
                            task.done=eventChecked.value
                        })
                        localforage.setItem('events',events.value)
                        updateTaskList()
                        loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
                        updateEventList()
                    
                }),
                span(te.name)),
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

export let selectedEvent;

function openEvent(te){
    offCanvasEvent.elem.classList.add('show')
    console.log('event has been opened ')
    selectedEvent=te
    noteDisplay.html('')

    noteTextarea.elem.value=te.note ||''
    colorInput.elem.value=te.type
    colorbind.value=te.type
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
    updateEventList()
    
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
function promoteToEvent(){
    let d=div({class:'promotion-zone'},'promote to event').css("display",'none').on('dragover',(e)=>{
    e.preventDefault()
     d.css({
        background:'var(--bs-primary-bg-subtle)'
     })
    }).on('drop',(e)=>{
        convertTaskToEvent(e)
    })
    return d
}

function convertTaskToEvent(te){
    let data=te.dataTransfer.getData('text/plain')
        let index=parseInt(data)
        let task=selectedEvent.subtasks[index]

        let event={
            name:task.name,
            date:selectedEvent.date,
            id:selectedEvent.id+Math.floor(Math.random()*1000),
            type:selectedEvent.type,
            isTask:false,
            subtasks:[{name:'',done:false}],
            notes:''
        }
    
        events.value=[...events.value,event]
        selectedEvent.subtasks.splice(index,1)


        localforage.setItem('events',events.value)
        updateTaskList()
        updateEventList()
}

function updateTaskList(){
   
    let tasklist=$el('#task-list')
    tasklist.html('')
    promoteToEvent().addTo(tasklist)

  

    /*
    
    
    */
   selectedEvent.subtasks.forEach((t,i)=>{

let done=state(t.done)
let d=dropZone(i)
d.addTo(tasklist)

 let tas=div({class:'d-flex justify-content-between rounded-2 mb-1 shadow-sm py-2 px-3','draggable':'true'},
    div({class:'form-check'},
        input({class:'form-check-input',type:'checkbox'}).model(done).on("change",()=>{
            updateEventList()
        }),
        label({class:'form-check-label px-2', for:'flexCheckDefault'},t.name)
    ),
    button({class:'btn btn-close btn-sm'}).on("click",()=>{
        selectedEvent.subtasks.splice(i,1)
        localforage.setItem('events',events.value)
        updateTaskList()
    })
).addTo(tasklist).on("dragstart",(e)=>{
    console.log('drag-start-initial-stop')
    tas.elem.classList.add('dragging')
    e.dataTransfer.setData('text/plain',i)
   setTimeout(()=>{ $$el('.drop-zone').forEach(d=>{
      
        d.css({
            display:'block',
            height:'1rem',
            width:'100%',
            background:'var(--bs-primary-bg-subtle)',
        })
    })


    $el('.promotion-zone').css({
         height:'3rem',
         display:'flex',
         marginBottom:'1rem',
         justifyContent:'center',
         alignItems:'center',
         background:'var(--bs-success-bg-subtle)'
    })
  

   },100)
}).on("dragend",(e)=>{
    tas.elem.classList.remove('dragging')
    $$el('.drop-zone').forEach(d=>{
        d.css({
            height:'0rem'
        })
    })

    $el('.promotion-zone').css({
        height:'0rem',
        display:'none'
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




}


let isDarkMode=state('auto')

effect(()=>{
    if(isDarkMode.value=='auto'){
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-bs-theme','dark')
        }
    }else if(isDarkMode.value=='on'){
        document.body.setAttribute('data-bs-theme','dark')
    }else{
        document.body.setAttribute('data-bs-theme','light')
    }

})



$el("#event-chooser").on("click",()=>{
    if(!istaskMode.value){
        $el("#event-chooser").html("task-events")
        istaskMode.value=true
    }else{
        $el("#event-chooser").html("events")
        istaskMode.value=false
    }
})

// $el("#add-event-btn").html(()=>istaskMode.value?'add task':'add event')  

let s=['light','dark','auto']
let ic=0
$el('#myday-btn').on('click',()=>{
    isDarkMode.value=s[ic%s.length]
    ic+=1

})