"use client"
import { useEffect, useState } from "react"
import {FaFire} from "react-icons/fa"
import {FiPlus, FiTrash} from "react-icons/fi"


export default function NotionKanban(){
    return(<div className="h-screen w-full bg-neutral-900 text-neutral-50">
        <Board/>
    </div>)
}



const Board = ()=>{
    const [cards, setCards] = useState([])
    const [hasChecked, setHasChecked] = useState(false)

    useEffect(()=>{
        hasChecked && localStorage.setItem("cards",JSON.stringify(cards))
    },[cards])

    useEffect(()=>{
        const cardData = localStorage.getItem("cards")
        setCards(cardData ? JSON.parse(cardData) : [])
        setHasChecked(true)
    },[])
    

    return <div className="flex h-full w-full gap-3 overflow-scroll p-12">
        <Column title="Backlog" column="backlog" headingColor="text-neutral-500" cards={cards} setCards={setCards} />

        <Column title="TODO" column="todo" headingColor="text-yellow-500" cards={cards} setCards={setCards} />

        <Column title="In progress" column="doing" headingColor="text-blue-500" cards={cards} setCards={setCards} />

        <Column title="Complete" column="done" headingColor="text-emerald-200" cards={cards} setCards={setCards} />

        <BurnBarrel setCards={setCards}/>
    </div>
}

const Column = ({title, headingColor, column, cards, setCards})=>{

    const [active, setActive] = useState(false)

    const handleDragStart = (e, card)=>{
        e.dataTransfer.setData("cardId", card.id)
    }

    const handleDragOver = (e)=>{
        e.preventDefault()
        highlightIndicator(e)
        setActive(true)
    }

    const highlightIndicator = (e)=>{
        const indicators = getIndicators()
        clearHighLights(indicators)
        const el = getNearestIndicator(e, indicators)
        el.element.style.opacity = "1"
    }

    const clearHighLights = (els)=>{
        const indicators = els || getIndicators()

        indicators.forEach((i) => {
            i.style.opacity = "0"
        });
    }

    const getNearestIndicator = (e, indicators)=>{
        const DISTANCE_OFFSET = 50       
        const el = indicators.reduce(
            (closest,child)=>{
                const box = child.getBoundingClientRect()
                const offset = e.clientY - (box.top + DISTANCE_OFFSET)
                if (offset < 0 && offset > closest.offset) {
                    return {offset: offset, element:child}
                }else{
                    return closest
                }
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: indicators[indicators.lenght -1]
            }
        )

        return el
    }

    const getIndicators = ()=>{
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`))
    }

    const handleDragLeave = ()=>{
        setActive(false)
        clearHighLights()

        
    }

    const handleDragEnd = (e)=>{
        setActive(false)
        clearHighLights()
        const cardId = e.dataTransfer.getData("cardId")
        const indicators = getIndicators()
        const {element} = getNearestIndicator(e,indicators)
        const before = element.dataset.before || "-1"

        if(before !== cardId){
            let copy = [...cards]

            let cardToTransfer = copy.find((c)=> c.id === cardId)
            if(!cardToTransfer) return;

            cardToTransfer = {...cardToTransfer,column}

            copy = copy.filter((c)=> c.id !== cardId)

            const moveToBack = before === "-1"

            if(moveToBack){
                copy.push(cardToTransfer)
            }else{
                const insertAtIndex = copy.findIndex((el)=>el.id === before)
                if(insertAtIndex === undefined) return

                copy.splice(insertAtIndex, 0,cardToTransfer)
            }

            setCards(copy)
        }
    }

    const filteredCards = cards.filter((c)=> c.column === column)

    

    return(
    <div className="w-56 shrink-0">
        <div className="mb-3 flex items-center justify-between">
            <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        </div>
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDragEnd}
            className={`${filteredCards == 0 ? "pt-4": ""}  h-full w-full transition-colors ${!active ? "bg-neutral-800/50" : "bg-neutral-800/0"}`}>
                {filteredCards.map((c)=> (<Card key={c.id} {...c}
                handleDragStart={handleDragStart}/>))}
                <DropIndicator beforeId='-1' column={column}/>
                <AddCard column={column} setCards={setCards}/>
        </div>
    </div>
    )
}

const Card = ({title,id,column, handleDragStart})=>{
    return(
        <>
        <DropIndicator beforeId={id} column={column}/>
        <div 
            draggable='true'
            onDragStart={(e)=>handleDragStart(e, {title, id, column})}
            className="cursor-grab rounded border border-neutral-700 bg-neutal-800 p-3 active:cursor-grabbing">
            <p className="text-sm text-neutral-100">{title}</p>
            
        </div>
        </>
    )
}

const DropIndicator = ({beforeId, column})=>{

    return(
        <div data-before={beforeId || "-1"} data-column={column} className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"></div>
    )

}

const BurnBarrel = ({setCards})=>{
    const [active, setActive]=useState(false)

    const handleDragOver = (e)=>{
        e.preventDefault()
        setActive(true)
    }

    const handleDragLeave = () =>{
        setActive(false)
    }

    const handleDragEnd = (e)=>{
        const cardId = e.dataTransfer.getData('cardId')
        
        setCards((pv)=> pv.filter((c)=> c.id !== cardId))

        setActive(false)
        
    }

    return <div
            onDrop={handleDragEnd}
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave}
            className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl
        ${active ? "border-red-800 bg-red-800/20 text-red-500" : "border-neutral-500 bg-neutral-500/20 text-neutral-500"}`}>
            {active ? <FaFire className="animate-bounce"/> : <FiTrash/>}
        </div>
}

const AddCard = ({column, setCards})=>{

    const [text, setText] = useState('')
    const [adding, setAdding] = useState(false)

    const handleSubmit = (e)=>{
        e.preventDefault()

        if(!text.trim().length) return;

        const newCard = {
            column,
            title: text.trim(),
            id: Math.random().toString()
        }

        setCards((pv)=>[...pv,newCard])
        setAdding(false)

    }

    return <>
        {adding ?(
            <form onSubmit={handleSubmit}>
                <textarea 
                    onChange={(e)=>setText(e.target.value)} 
                    autoFocus 
                    placeholder="Add new task..." 
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"/>
                    <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        <button
                         onClick={()=>{setAdding(false)}}
                         className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50">
                            Close
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300">
                            <span>Add</span>
                            <FiPlus/>
                        </button>
                    </div>
            </form>) : <button onClick={()=>setAdding(true)} className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"><span>Add Card</span><FiPlus/></button>}
    </>
}


const DEFAULT_CARDS = [
    {title: "Este é o teste 1", id: "1", column: "backlog"},
    {title: "Este é o teste 2", id: "2", column: "backlog"},
    {title: "Este é o teste 3", id: "3", column: "backlog"},
    {title: "Este é o teste 4", id: "4", column: "backlog"},
    
    {title: "Este é o teste 5", id: "5", column: "todo"},
    {title: "Este é o teste 6", id: "6", column: "todo"},
    {title: "Este é o teste 7", id: "7", column: "todo"},
    {title: "Este é o teste 8", id: "8", column: "todo"},
    
    {title: "Este é o teste 9", id: "9", column: "doing"},
    {title: "Este é o teste 10", id: "10", column: "doing"},
    {title: "Este é o teste 11", id: "11", column: "doing"},
    {title: "Este é o teste 12", id: "12", column: "doing"},
    
    {title: "Este é o teste 13", id: "13", column: "done"},
    {title: "Este é o teste 14", id: "14", column: "done"},
    {title: "Este é o teste 15", id: "15", column: "done"},
    {title: "Este é o teste 16", id: "16", column: "done"}
]



//  https://www.youtube.com/watch?v=O5lZqqy7VQE