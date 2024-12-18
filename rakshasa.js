let rakshasaActions={
    toggleClass:(inducer,statement)=>{
        console.log(inducer)
        let e;
        if (inducer.getAttribute('Rak-target')){
             e=getTarget(inducer)
        }else{
            e=inducer
        }
        e.classList.toggle(statement[1])
    }
}

let rakshasaConditions={
    outside:(elem,e)=> elem.contains(e.target)==false
    
}   

document.querySelectorAll('[Rak-click]').forEach(elem=>{
    let action=rakshasaActions[elem.getAttribute('Rak-click').split(':')[0]]
    
    elem.addEventListener('click',(e)=>{
        if(!getCondition(elem)(elem,e)) return
        action(elem,elem.getAttribute('Rak-click').split(':'))
    })
})

document.querySelectorAll('[Rak-click-outside]').forEach(elem=>{
    let action=rakshasaActions[elem.getAttribute('Rak-click').split(':')[0]]
    
    window.addEventListener('click',(e)=>{
        if(!getCondition(elem)(elem,e)) return
        action(elem,elem.getAttribute('Rak-click').split(':'))
    })

    elem.addEventListener('click',e=>e.stopPropagation())
})

function getCondition(elem){
    let condition=elem.getAttribute('Rak-condition')
    if (!condition){
        return ()=>true
    }
    return rakshasaConditions[condition]
}


function getTarget(elem){
    let targetDefenition =elem.getAttribute('Rak-target')
    if (targetDefenition){
        if (! targetDefenition.startsWith('$')) return document.querySelector(targetDefenition) 
            let [targetType,operator]=targetDefenition.split(':')
        if (targetType=='$next') return elem.nextElementSibling
        if (targetType=='$parent') return elem.parentElement
        if (targetType=='$document') return document
        if (targetType=='$child') {
            if (!operator) return elem.children[0]
            return elem.children[parseInt(operator)]
        }
    }else{
        return elem
    }
}


