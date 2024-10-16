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
    notes:''
    
},{
    date:'16-10-2024',
    name:'submission ',
    type:'primary',
    isTask:false,
    subtasts:[]
    ,notes:''

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
            deleteBtn.onclick=()=>{
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





selectedEvent;

function openEvent(te){
    offCanvasEvent.classList.add('show')
    console.log('event has been opened ')
    selectedEvent=te

}



}

main()