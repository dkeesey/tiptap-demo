import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from 'react'
import { 
  FileTextIcon, 
  Heading1, 
  Heading2, 
  ListIcon, 
  ListOrderedIcon, 
  QuoteIcon, 
  CodeIcon, 
  SeparatorHorizontalIcon, 
  SparklesIcon,
  BookOpenIcon,
  WandIcon,
  EditIcon,
  TerminalIcon 
} from 'lucide-react'
import { SlashCommand } from '../../extensions/SlashCommandExtension'

interface SlashCommandsListProps {
  items: SlashCommand[]
  command: (command: SlashCommand) => void
}

// Map of icons for each command type
const commandIcons: Record<string, React.ReactNode> = {
  // Regular formatting commands
  'Text': <FileTextIcon className="w-4 h-4" />,
  'Heading 1': <Heading1 className="w-4 h-4" />,
  'Heading 2': <Heading2 className="w-4 h-4" />,
  'Bullet List': <ListIcon className="w-4 h-4" />,
  'Numbered List': <ListOrderedIcon className="w-4 h-4" />,
  'Blockquote': <QuoteIcon className="w-4 h-4" />,
  'Code Block': <CodeIcon className="w-4 h-4" />,
  'Horizontal Rule': <SeparatorHorizontalIcon className="w-4 h-4" />,
  
  // AI-specific commands
  'AI Prompt': <SparklesIcon className="w-4 h-4" />,
  'AI Explain': <BookOpenIcon className="w-4 h-4" />,
  'AI Summarize': <WandIcon className="w-4 h-4" />,
  'AI Improve Writing': <EditIcon className="w-4 h-4" />,
  'AI Code Assistant': <TerminalIcon className="w-4 h-4" />,
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
    <div className="slash-commands-list">
      <div className="pt-2 pb-2 max-h-80 overflow-y-auto">
        <div className="command-category">
          <span>Commands</span>
        </div>
        {props.items.map((item, index) => (
          <button
            key={index}
            className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => selectItem(index)}
          >
            <div className="command-icon">
              {commandIcons[item.title] || <FileTextIcon className="w-4 h-4" />}
            </div>
            <div className="command-content">
              <div className="command-title">{item.title}</div>
              <div className="command-description">{item.description}</div>
            </div>
          </button>
        ))}
        <div className="command-help">
          <div className="command-help-row">
            <span>Navigate</span>
            <span><span className="command-help-key">↑</span> <span className="command-help-key">↓</span></span>
          </div>
          <div className="command-help-row">
            <span>Select</span>
            <span><span className="command-help-key">Enter</span></span>
          </div>
          <div className="command-help-row">
            <span>Cancel</span>
            <span><span className="command-help-key">Esc</span></span>
          </div>
        </div>
      </div>
    </div>
  )
})
