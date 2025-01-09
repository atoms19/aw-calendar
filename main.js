 import {input,label,$el,$$el,effect,state,tr,td,div,span,h4,li,button,i, option, h2, canvas, derived, DominityElement} from "dominity"
import swipeDetector from "./swipe"
import { formatDate, formatMoney, parseICS, removeFormatting } from "./utils"
import { ArcElement, BarController, Chart, Legend, PieController, PolarAreaController, RadialLinearScale, Tooltip } from "chart.js"
import { marked } from "marked"
import markedKatex from "marked-katex-extension"
import markedFootnote from "marked-footnote"
import markedAlert from "marked-alert"


marked.use(markedKatex({throwOnError:false}),markedFootnote(),markedAlert({
    className:'',
    variants:[] 
}))

  

localforage.config({
    name: 'calendar',
    version:2.0,
})





let calendarBody=$el("#calendar-body")
let yearDisplay=$el("#year-display")
let monthDisplay=$el("#month-display")

let currency=state(' $')
currency.value=localStorage.getItem('currency-marker') || ' $'
let chime=state(false)


let destroyer,destroyer2
monthDisplay.on('click',async()=>{
    $el('#calendar-section').elem.classList.add('d-none')
    $el('#month-view').elem.classList.remove('d-none')
    destroyer=await renderChart('pie-canvas')
    destroyer2=await renderChart('pie-canvas-income','income')

    $el('#total-gross',{class:'mt-5'}).html('total gross : '+formatMoney(-calculateMonthlySum(currentDate.getMonth(),'expense')+calculateMonthlySum(currentDate.getMonth(),'income'))+currency.value)

    

  
   
})

$el('#back-btn').on('click',()=>{
    $el('#calendar-section').elem.classList.remove('d-none')
    $el('#month-view').elem.classList.add('d-none')
    console.log(destroyer())
    destroyer2()
})

async function  getEvents() {
    events.value= await localforage.getItem('events') || []
}

let today=new Date()
export let events=state([])
let selected=0

getEvents()

let istaskMode=state(false)
let dateCheck={}
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
         if(i>=startat && i<lastday+startat){
            e.preventDefault()
            dateElem.elem.classList.add('bg-secondary')
         }
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
                        
                        dateElem.child(0)
                        span(
                            {class:'badge text-bg-'+event.type+' color-auto'},
                            event.name
                        ).addTo(dateElem.child(0))

                        if(event.endDate){

                            dateElem.attr({class:'bg-'+event.type+' text-white'}).css({
                                border:'1px solid var(--bs-'+event.type+'-border-subtle)',
                                
                            })
                            let [startDay,startMonth,startYear]=event.date.split('-')
                            let [endDay,endMonth,endYear]=event.endDate.split('-')
                            dateCheck.start=new Date(startYear,startMonth-1,startDay)
                            dateCheck.end=new Date(endYear,endMonth-1,endDay)
                            dateCheck.color=event.type
                            dateCheck.event=event
                        }

            })

                if (thisDate>dateCheck.start && thisDate<dateCheck.end){
                    
                    dateElem.attr({class:'bg-'+dateCheck.color+'-subtle'})
                }
                
                if(thisDate>=dateCheck.end && thisDate <=dateCheck.end){
                    console.log('end of range',thisDate)
                    dateElem.attr({class:'bg-'+dateCheck.event.type+' text-white'}).css({
                        border:'1px solid var(--bs-'+dateCheck.event.type+'-border-subtle)',
                        
                    })
                   
                    
                }
                
            


            
            
            
            if(i-startat+1==currentDay){
               // dateElem.elem.classList.add('border','border-primary','bg-primary','text-white')
               dateElem.css({
                background:'var(--bs-primary-bg-subtle)',
                border:'2px solid var(--bs-primary)', 
                fontWeight:'bold',
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

setTimeout(()=>{
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

},200)



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
$el('#event-title').on('input',()=>{
    selectedEvent.name=$el('#event-title').elem.innerText
    localforage.setItem('events',events.value)
})

$el('#endDateInp').on('change',()=>{
    selectedEvent.endDate=$el('#endDateInp').elem.value
    
    localforage.setItem('events',events.value)
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

})

$el('#startDateInp').on('change',()=>{
    selectedEvent.date=$el('#startDateInp').elem.value
    
    localforage.setItem('events',events.value)
    loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

})

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

    $el("#sort-btn").elem.classList.remove('d-none')
 d=date
    selectedDateDisplay.html(d.toLocaleString("default",{day:'numeric',month:'long',year:'numeric'}))
    if(elem){
        if(!selected){
            selected=elem
            selected.elem.classList.add('selected')
        }else{
            selected.elem.classList.remove('selected')
            selected=elem
            selected.elem.classList.add('selected')
        }
    }

    updateEventList()
    

    window.scrollTo(0, document.body.scrollHeight);
}


function updateEventList(){

    let targetEvents=events.value.filter(e=>{
        if(e.date && e.endDate){
            let [startDay,startMonth,startYear]=e.date.split('-')
            let [endDay,endMonth,endYear]=e.endDate.split('-')
            let start=new Date(startYear,startMonth-1,startDay)
            let end=new Date(endYear,endMonth-1,endDay)
            return d>=start && d<=end
        }
        return e.date==`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`
    })
    
    eventDisplay.html('')

    if(typeof targetEvents ==typeof []){
        targetEvents.forEach((te)=>{
            let eventChecked=state(te.subtasks.every(task=>task.done))
            
        
            li({draggable:'true',class:'list-group-item list-group-item-'+te.type+' d-flex  align-items-center justify-content-between'},div({class:'d-flex gap-2'},
                input({class:`form-check-input border-2 border-${te.type}-subtle`,type:'checkbox'}).model(eventChecked).showIf(state(te.subtasks.length!=0)).on('change',(e)=>{
                        te.subtasks.forEach(task=>{
                            task.done=eventChecked.value
                        })
                        if(eventChecked.value && chime.value==true){
                            sound.play()
                        }

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
        loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
    }
})

export let selectedEvent;


let [viewMap,marker]=loadMap(0,0)
function openEvent(te){
    offCanvasEvent.elem.classList.add('show')

    $$el('.menu-target').forEach(el=>{
        if($el('#'+el.attr('for')).elem.checked) el.elem.click()  //automatically close all edit options when opening a new event 
        
    })
    $el('#event-title').elem.innerText=te.name
    $el('#startDateInp').elem.value=te.date
    $el('#endDateInp').elem.value=te.endDate ||''

    if(te.location!=undefined){
        viewMap.setView([te.location.lat,te.location.long],13)
        marker.setLatLng([te.location.lat,te.location.long]).bindPopup(te.location.name).openPopup()
        $el('#map').elem.classList.remove('d-none')
    }else{
        $el('#map').elem.classList.add('d-none')

    }

    console.log('event has been opened ')
    selectedEvent=te
    noteDisplay.html('')

    noteTextarea.elem.value=te.note ||''
    colorInput.elem.value=te.type
    colorbind.value=te.type
    timeInp.elem.value=te.time ||''
    if(te.transactions){
        eventTransactions.value=te.transactions
    }else{
        eventTransactions.value=[]
    }
    noteDisplay.html(marked.parse(te.note||'').replaceAll('<table','<table class="table my-4 table-striped"'))
    //renderMathInElement(noteDisplay.elem)
    hljs.highlightAll()
  updateTaskList()
 
}






let noteDisplay=$el("#note-display")
let note =state('')
noteTextarea.model(note)
noteTextarea.on("input",()=>{
    selectedEvent.note=note.value
    localforage.setItem('events',events.value)
    noteDisplay.html(marked.parse(note.value).replaceAll('<table','<table class="table my-4 table-striped"'))
   // renderMathInElement(noteDisplay.elem)
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

let sound=new Audio('.success.mp3')
sound.preload='auto'



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
            if(done.value && chime.value==true){
                sound.play()
            }
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
let themed=async ()=>{
    isDarkMode.value=await localforage.getItem('theme')
}

themed()

effect(()=>{
    if(isDarkMode.value=='auto'){
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-bs-theme','dark')
            
        }
        console.log('auto')
    }else if(isDarkMode.value=='dark'){
        document.body.setAttribute('data-bs-theme','dark')
        console.log('dark')
    }else{
        document.body.setAttribute('data-bs-theme','light')
        console.log('light')
    }

    localforage.setItem('theme',isDarkMode.value)

})



$el("#event-chooser").on("click",()=>{
    if(!istaskMode.value){
        $el("#event-chooser").html("Tasks")
        istaskMode.value=true
    }else{
        $el("#event-chooser").html("Events")
        istaskMode.value=false
    }
})

// $el("#add-event-btn").html(()=>istaskMode.value?'add task':'add event')  

let s=['light','dark','auto']
let ic=0
$el('#dark-theme-btn',' :',isDarkMode).on('click',()=>{
    isDarkMode.value=s[ic%s.length]
    
    ic+=1

})

let themeName=state(localStorage.getItem('custom-themeName')||'litera')
let themes=['litera','vapor','sandstone','lux','quartz','minty','sketchy','yeti','solar','zephyr','slate','simplex','morph','journal','cerulean','cosmo','cyborg','flatly','lumen','darkly','pulse','superhero','materia']
let itheme=themes.indexOf(themeName.value)

$el('#theme-btn',' :',themeName).on('click',()=>{
    localStorage.setItem('custom-themeName',themes[itheme%themes.length])
    themeName.value=themes[itheme%themes.length]
    $el('#theme-shifter').attr('href','https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/'+themeName.value+'/bootstrap.min.css')
    itheme+=1
})


$el('#curr-inp').attr('value',currency.value).on('change',(e)=>{

    currency.value=' '+e.target.value
    localStorage.setItem('currency-marker',currency.value)
    
})



$el('#ics-select').on('change',async(e)=>{
    let file= e.target.files[0]
    if (!file) return 
    let data=await file.text()

    events.value=[...events.value,...parseICS(data)]
    localforage.setItem('events',events.value)
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())

    


})

//----------------------------------expense tracker ---------------------------------------------------



let eventTransactions=state([])

$el('#transaction-list').html('').forEvery(eventTransactions,(e)=>{
    return li({class:'list-group-item justify-content-between d-flex'},div(span(e.categories.map((v)=>v.split(' ')[0]).join(' ')).css({
        fontWeight:600,
    }),' ',e.info),div({class:'ms-auto '+(e.type=='income' ? 'text-primary':' text-danger')},(e.type=='income'?'+':'-')+formatMoney(e.amount)+currency.value,
    button( {class:'btn btn-sm',style:'margin-left:1rem;'},i({class:'bi bi-trash'})).on('click',()=>{
        eventTransactions.value=eventTransactions.value.filter(t=>t.info1!=e.info && t.amount!=e.amount)
        selectedEvent.transactions=eventTransactions.value
        localforage.setItem('events',events.value)

    }))
)
})



$el('#exp-btn').on('click',()=>{
    $el('#exp-edit').elem.classList.toggle('d-none')
})

$el('#loc-btn').on('click',()=>{
    $el('#loc-edit').elem.classList.toggle('d-none')
})

let amount=state(null)
let info=state(null)
let tType=state('expense')
let categories=state([])

async function loadCategories(){
    categories.value=await localforage.getItem('categories') ||[]
}

loadCategories()
let catOptions=derived(()=>categories.value.filter(c=>c.type==tType.value))

$el('#cat-select').html('').forEvery(catOptions,(c,i)=>{
    return option({value:c.name},c.name||c)
})

$el('#spendinp').model(amount).on('input',e=>{
    amount.value=formatMoney(parseFloat(removeFormatting(e.target.value)||0))
})
$el('#nameinp').model(info)
$el('#economy-select').model(tType)

let isIncome=derived(()=>tType.value=='income')
$el('#spendinp-add').bindClass(isIncome,'btn-primary','btn-danger').html(()=>isIncome.value?'add income':'add expense')




$el('#spendform').on('submit',e=>{
    e.preventDefault()

    if(!selectedEvent || info.value.trim()=='' || amount.value==0){
        return
    }


    

    if(!selectedEvent.transactions){
        selectedEvent.transactions=[]
    }

    selectedEvent.transactions.push({
        amount:removeFormatting(amount.value),
        info:info.value,
        type:tType.value,
        categories: Array.from($el('#cat-select').elem.selectedOptions).map(option => option.value),
    })

   eventTransactions.value=[...selectedEvent.transactions]

    info.value=''
    amount.value=0

    localforage.setItem('events',events.value)
    
})




function getDataSet(year,month,listed='expense'){
    

    function getCategorySum(category){
        let catSum=0
        events.value.filter((e)=>e.date.includes(`-${month+1}-${year}`)).forEach(e=>{
            if (e.transactions!=undefined){

            e.transactions.forEach(t=>{
                if(t.categories.includes(category)){
                    if(t.type){
                        if(t.type==listed){
                            catSum+=t.amount
                        }
                    }else{
                    catSum+=t.amount
                    }
            }
    
            })
        }
        })
        return catSum
    }

    return categories.value.filter(c=>{
        if (c.type){
            return c.type==listed
        }else{
            return true 
        }
    }).map(category=>{

        return getCategorySum(category.name || category)
    })
    
   
}




async function renderChart(canva,listed='expense') {

    let can= document.getElementById(canva)
    can.width=window.innerWidth/2 
    can.height=window.innerHeight/2
   let geneventData=getDataSet(currentDate.getFullYear(),currentDate.getMonth(),listed)
let totalSum=state(0)

   
const data = {
    labels:categories.value.filter(c=>c.type==listed).map(c=>c.name || c),
    datasets: [{
      label: currentDate.toLocaleDateString('default',{month:'long'}),
      data: geneventData,
      backgroundColor: [
        'rgb(99, 138, 255)',
        'rgb(96, 255, 162)',
        'rgb(255, 205, 86)',
        'rgb(201, 203, 207)',
        'rgb(235, 102, 54)',
        'rgb(193, 99, 255)',
        'rgb(192, 75, 161)',
        'rgb(185, 255, 86)',
        'rgb(29, 186, 210)',
        'rgb(90, 76, 161)'
      ]
    }]
  };
 
  
    Chart.register(PieController);
    Chart.register(RadialLinearScale)
    Chart.register(ArcElement)
    Chart.register(Tooltip)
    Chart.register(Legend)
    
    let l= new Chart(
     can,
      {
        type: 'pie',
        data: data,
        options: {
            responsive:false,
            width: 400, // Set the width of the canvas
            height: 200,
           animation: {
            onComplete: function(animation) {
                //alert('onAnimationComplete');
                
                let fulldata=getDataSet(currentDate.getFullYear(),currentDate.getMonth(),listed)
                let sum=fulldata.reduce((a,b)=>a+b,0)
                   Object.keys(animation.chart._hiddenIndices).forEach((key) => {
                        if(animation.chart._hiddenIndices[key]){
                            sum-=fulldata[key]
                        }
                   })
                totalSum.value=sum
                
                
            }
        }
        }
      }
    );

    let categoryDisplay=derived(()=>categories.value.filter(c=>c.type==listed))

    $el(`#cat-list-${listed}-editor`).forEvery(categoryDisplay,(c,index)=>{
        return li({class:'list-group-item d-flex gap-3 justify-content-between align-items-center',},c.name||c,span(span(`${formatMoney(geneventData[index])}${currency.value}`),
        
        button({class:'btn btn-sm ',style:'margin-left:1rem;'},i({class:'bi bi-trash'})).on('click',(e)=>{
            e.stopPropagation()
           if(confirm(`are you sure you want to delete ${c.name||c}?`)){ 
            categories.value=categories.value.filter(cat=>(cat.name||cat)!=(c.name||c))
            localforage.setItem('categories',categories.value)
           }
        }))).bindClass(derived(()=>c.isSubCat),'bg-secondary-subtle').on('click',(event)=>{
            $el('#list-'+listed).html('')
            events.value.filter((e)=>e.date.includes(`-${currentDate.getMonth()+1}-${currentDate.getFullYear()}`)).forEach(e=>{
                if(e.transactions){

                    e.transactions.forEach(t=>{ 
                        if(t.categories.includes(c.name||c)){
                            li({class:'list-group-item justify-content-between align-items-center d-flex '},
                                div({class:'d-flex flex-column '},span({class:''},t.info),span({class:'text-secondary'},e.date,' from ',e.name)),
                                div({style:'margin-left:1rem;',class:''+(t.type=='income' ? ' text-primary':' text-danger')},(t.type=='income'?'+':'-')+formatMoney(t.amount)+currency.value,
                        )).on('click',(s)=>{
                            s.stopPropagation()
                            selectedEvent=e
                            openEvent(e)
                        }).addTo($el('#list-'+listed))
                        }
                    })
                }
    
            })
            
        })
    })

  $el('#tally-'+listed,'visible sum: ',span({class:listed=='expense'?'text-danger':'text-primary'},listed=='expense'?'-':'+',()=>formatMoney(totalSum.value),currency.value))
$el('#actual-'+listed,'total sum: ',span({class:listed=='expense'?'text-danger':'text-primary'},listed=='expense'?'-':'+',()=>formatMoney(calculateMonthlySum(currentDate.getMonth(),listed)),currency.value))

    return ()=>{
        $el('#tally-'+listed).html('')
        $el('#actual-'+listed).html('')
        l.destroy()
    }
  }
  


  //renderChart()

  let isModalOpen=state(false)
$el('.modal').bindClass(isModalOpen,'show').on('click',()=>isModalOpen.value=false)
$el('.modal-content').on('click',e=>e.stopPropagation()) 

$el('.modal-close').on('click',()=>isModalOpen.value=false)

$el('#cat-add').on('click',()=>{
    isModalOpen.value=true
    catType.value='expense'
})

$el('#cat-income-add').on('click',()=>{
    isModalOpen.value=true
    catType.value='income'
})

let newCatName=state('')
let catType=state('expense')
let isSubCat=state(false)

$el('#cat-type').model(catType)

$el('#cat-nameInp').model(newCatName)
$el('#is-subcat').model(isSubCat)
$el('#cat-adder').on('click',()=>{

    if(newCatName.value.trim()==''){    
        return
    }
    categories.value=[...categories.value,{
        name:newCatName.value,
        type:catType.value,
        isSubCat:isSubCat.value
    }]

    localforage.setItem('categories',categories.value)
    newCatName.value=''
    isModalOpen.value=false
    
})

//tab system--------------------------------------------

let tabVisible=state('expense')

$$el('.tab-chooser').forEach(e=>{
    let isActive=derived(()=>tabVisible.value==e.attr('data-tab'))
    e.bindClass(isActive,'active')
    e.on('click',()=>{
        tabVisible.value=e.attr('data-tab')
    })
})

$$el('.tab-children').forEach(e=>{
    e.showIf(()=>tabVisible.value==e.attr('tab-name'))
})



function calculateMonthlySum(month,listed='expense'){
    let sum=0
    events.value.filter((e)=>e.date.includes(`-${month+1}-${currentDate.getFullYear()}`)).forEach(e=>{
        if(e.transactions){
            e.transactions.forEach(t=>{
                if(t.type==undefined){
                    sum+=t.amount
                }else if(t.type==listed){
                    sum+=t.amount
                }
            })
        }
    })
    return sum   
}
// habbit tracker -----------------------------------------------------------------------


$$el('.dropdowntoggle').forEach(ele=>{
    let isOpen=state(false)
    ele.elem.parentNode.addEventListener('click',(e)=>{
        e.stopPropagation()
    })
    $el('#'+ele.attr('for')).bindClass(isOpen,'show')
    ele.on('click',()=>{
        isOpen.value=true 
        let dom=document.addEventListener('click',()=>{
            isOpen.value=false
            document.removeEventListener('click',dom)
        })
    })
}) 

$el('#duplicate-btn').on('click',()=>{
    let dupeEvent={
        name:selectedEvent.name,
        id:'d'+Date.now()+Math.floor(Math.random()*100),
        from:selectedEvent.id,
        isTask:selectedEvent.isTask,
        subtasks:selectedEvent.subtasks.map(e=>{
            return {
                name:e.name,
                done:false, 
            }
        }),
        note:selectedEvent.note,
        date:selectedEvent.date,
        type:selectedEvent.type
    }
    console.log(dupeEvent)
    events.value=[...events.value,dupeEvent]
    
    localforage.setItem('events',events.value)

    updateEventList()
    
    alert('duplicated successfully')
})

let habits =state([])


/* $el('#habits-display',
    div({class:'d-flex flex-column gap-y-2 '},
            li({class:'py-2 mt-4 px-4 rounded w-100 bg-secondary-subtle d-flex justify-content-between align-items-center'},
                div({class:'text-bold d-flex align-items-center gap-x-2'},span({class:'color-badge'}).css({
                    
                }),'habit name'),
                div({class:'d-flex '},
                    input({class:'form-check-input habit-check',type:'checkbox'})
                )
            ),
            li({class:'py-2 px-4 mt-2 rounded w-100 bg-secondary-subtle d-flex justify-content-between align-items-center'},
                div({class:'text-bold d-flex align-items-center gap-x-2'},span({class:'color-badge'}).css({
                    
                }),'habit name'),
                div({class:'d-flex w-25'},
                    input({class:'form-control      habit-check',type:'number'})
                )
            )
    )



)

*/

// maps --------------------------------

function loadMap(lat,long){

    let map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker=L.marker([lat,long]).addTo(map).bindPopup('You are here!').openPopup()


    return [map,marker]
    
    }
    
    let pickerMap=L.map('pickermap').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(pickerMap);
    let pickerMarker;
      // Get current location and set view
    function pickerMapLocationSet(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            pickerMap.setView([latitude, longitude], 13); // Center map at current location
             pickerMarker=L.marker([latitude, longitude]).addTo(pickerMap).bindPopup('You are here!').openPopup();
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      } else {
        alert('this app uses location for the maps feature in the events , it doesnt store or sell your data consider enabling perms for a smooth experience ')
        pickerMap.setView([40.7128,74.0060 ], 13); // Center map at current location
        pickerMarker=L.marker([latitude, longitude]).addTo(pickerMap).bindPopup('').openPopup();
      }
    }
    
      pickerMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if(selectedEvent.location==undefined){
            selectedEvent.location={
                name:$el('#location-inp').elem.value,
            }
        }
        selectedEvent.location.name=$el('#location-inp').elem.value
        selectedEvent.location.lat=lat 
        selectedEvent.location.long=lng 
        localforage.setItem('events',events.value)
        pickerMarker.setLatLng([lat, lng]).bindPopup(`Marker moved to: ${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();
      });
    
      
$el('#location-add').on('click',async ()=>{
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent($el('#location-inp').elem.value)}`;
    
      const response = await fetch(url);
      const results = await response.json();
      if (results.length === 0) {
        alert('Location not found!');
        return;
      }
      const { lat, lon, display_name } = results[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      // Update the map view
      pickerMap.setView([latitude, longitude], 13);


})

$el('#remove-pin').on('click',()=>{
    selectedEvent.location=undefined
    localforage.setItem('events',events.value)
    openEvent(selectedEvent)
   // pickerMapLocationSet()
})
pickerMapLocationSet()


$el('#search-wrap').on('click',(e)=>$el('#search-wrap').elem.classList.add('d-none'))
$el("#search-btn").on('click',e=>$el('.search-wrapper').elem.classList.remove('d-none'))
let querySearch=state('')
$el('#ev-search-inp').model(querySearch).on('click',e=>e.stopPropagation())

let searchResults=derived(()=>{
    return events.value.filter((e)=>{
       return e.name.startsWith(querySearch.value) || e?.location?.name.startsWith(querySearch.value)
    })
})

$el("#ev-result-display").forEvery(searchResults,(r)=>{
    return div({class:'list-group-item'},r.name).on('click',(e)=>{
        e.stopPropagation()
        let [date,month,year]=r.date.split('-')
        currentDate=new Date(`${year}-${month}-${date}`)   
loadCurrentMonth(currentDate.getFullYear(),currentDate.getMonth())
        
        selectDate(currentDate)
        openEvent(r)
        

        
    })
})


$el("#reminder-btn").on("click",()=>{
    alert('scheduled notification')
    if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify(  {
            type: "scheduleNotification", // Identify the message type
            title:selectedEvent.name+' upcomming!',      // Notification title
            body: `Your event  ${selectedEvent.name} starts soon!`, // Notification body
            time: 60,                    // Trigger after 60 seconds
        }))
        
    }
})
