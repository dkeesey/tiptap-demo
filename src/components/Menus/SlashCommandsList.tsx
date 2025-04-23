import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from 'react'
import { FileTextIcon, Heading1, Heading2, ListIcon, ListOrderedIcon, QuoteIcon, CodeIcon, SeparatorHorizontalIcon, SparklesIcon } from 'lucide-react'
import { SlashCommand } from '../../extensions/SlashCommandExtension'

interface SlashCommandsListProps {
  items: SlashCommand[]
  command: (command: SlashCommand) => void
}

// Map of icons for each command type
const commandIcons: Record<string, React.ReactNode> = {
  'Text': <FileTextIcon className="w-4 h-4" />,
  'Heading 1': <Heading1 className="w-4 h-4" />,
  'Heading 2': <Heading2 className="w-4 h-4" />,
  'Bullet List': <ListIcon className="w-4 h-4" />,
  'Numbered List': <ListOrderedIcon className="w-4 h-4" />,
  'Blockquote': <QuoteIcon className="w-4 h-4" />,
  'Code Block': <CodeIcon className="w-4 h-4" />,
  'Horizontal Rule': <SeparatorHorizontalIcon className="w-4 h-4" />,
  'AI Prompt': <SparklesIcon className="w-4 h-4" />,
}

export default forwardRef((props: SlashCommandsListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback((index: number) => {
    const item = props.items[index]

    if (item) {
      props.command(item)
    }
  }, [props.items, props.command])

  const upHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }, [selectedIndex, props.items.length])

  const downHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }, [selectedIndex, props.items.length])

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex)
  }, [selectedIndex, selectItem])

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  if (props.items.length === 0) {
    return null
  }

  return (
    <div className="slash-commands-list bg-white rounded-md shadow-md border border-gray-200 overflow-hidden w-72">
      <div className="py-1 max-h-80 overflow-y-auto">
        {props.items.map((item, index) => (
          <button
            key={index}
            className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-gray-100 ${
              index === selectedIndex ? 'bg-gray-100' : ''
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center justify-center w-6 h-6 mt-0.5 bg-gray-100 text-gray-600 rounded">
              {commandIcons[item.title] || <FileTextIcon className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-medium text-gray-800">{item.title}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
})
