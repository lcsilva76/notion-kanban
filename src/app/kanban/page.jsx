import { useState } from "react"

export default function NotionKanban(){
    return(<div className="h-screen w-full bg-neutral-900 text-neutral-50">
        <Board/>
    </div>)
}



const Board = ()=>{
    const [cards, setCards] = useState([])

    return <div className="flex h-full w-full gap-3 overflow-scroll p-12">
        <Column
            title="Backlog"
            column="backlog"
            headingColor="text-neutral-500"
            cards={cards}
            setCards={setCards}
        />
        <Column
            title="TODO"
            column="todo"
            headingColor="text-yellow-500"
            cards={cards}
            setCards={setCards}
        />
        <Column
            title="In progress"
            column="doing"
            headingColor="text-blue-500"
            cards={cards}
            setCards={setCards}
        />
        <Column
            title="Complete"
            column="done"
            headingColor="text-emerald-200"
            cards={cards}
            setCards={setCards}
        />
    </div>
}

const Column = ({title, headingColor, column, cards, setCards})=>{
    return(
    <div className="w-56 shrink-0">
        <div className="mb-3 flex items-center justify-between">
            <h3 className={`font-medium ${headingColor}`}>{title}</h3>
            <span className="rounded text-sm text-neutral-400">{cards.lenght}</span>
        </div>
    </div>
    )
}