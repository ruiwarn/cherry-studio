import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  OnDragEndResponder,
  OnDragStartResponder,
  ResponderProvided
} from '@hello-pangea/dnd'
import { droppableReorder } from '@renderer/utils'
import { FC } from 'react'

interface Props<T> {
  list: T[]
  style?: React.CSSProperties
  listStyle?: React.CSSProperties
  children: (item: T, index: number) => React.ReactNode
  onUpdate: (list: T[]) => void
  onDragStart?: OnDragStartResponder
  onDragEnd?: OnDragEndResponder
}

const DragableList: FC<Props<any>> = ({ children, list, style, listStyle, onDragStart, onUpdate, onDragEnd }) => {
  const _onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided)
    if (result.destination) {
      const sourceIndex = result.source.index
      const destIndex = result.destination.index
      const reorderAgents = droppableReorder(list, sourceIndex, destIndex)
      onUpdate(reorderAgents)
    }
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={_onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} style={{ ...style }}>
            {list.map((item, index) => (
              <Draggable key={`draggable_${item.id}_${index}`} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style, marginBottom: 8, ...listStyle }}>
                    {children(item, index)}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragableList
