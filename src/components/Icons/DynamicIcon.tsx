import React from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Highlighter, 
  Quote, 
  Undo, 
  Redo,
  Image,
  Link,
  FileText,
  Code
} from 'lucide-react'

// All possible icon names used across the editor
export type IconName = 
  | 'Bold'
  | 'Italic'
  | 'Underline'
  | 'Heading1'
  | 'Heading2'
  | 'List'
  | 'ListOrdered'
  | 'AlignLeft'
  | 'AlignCenter'
  | 'AlignRight'
  | 'Highlighter'
  | 'Quote'
  | 'Undo'
  | 'Redo'
  | 'Image'
  | 'Link'
  | 'FileText'
  | 'Code'

// Icon component
interface IconComponentProps {
  name: IconName
  size?: number
}

const IconComponent = ({ name, size = 18 }: IconComponentProps) => {
  // Map of all available icons
  const iconMap: Record<IconName, React.ComponentType<any>> = {
    Bold,
    Italic,
    Underline,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Quote,
    Undo,
    Redo,
    Image,
    Link,
    FileText,
    Code
  }
  
  const Icon = iconMap[name]
  
  if (!Icon) {
    // Fallback if icon isn't found
    return <div style={{ width: size, height: size }}></div>
  }

  return <Icon size={size} />
}

export default IconComponent
