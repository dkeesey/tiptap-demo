import { Editor } from '@tiptap/react'
import { FileDown, FileUp, FileText } from 'lucide-react'
import { useState, useRef } from 'react'
import { 
  exportMarkdown, 
  downloadMarkdown, 
  importMarkdown, 
  readMarkdownFile 
} from '../../utils/markdown'

interface MarkdownControlsProps {
  editor: Editor
}

const MarkdownControls = ({ editor }: MarkdownControlsProps) => {
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) {
    return null
  }

  const handleExportMarkdown = () => {
    const markdown = exportMarkdown(editor)
    setMarkdownContent(markdown)
    setShowMarkdown(true)
  }

  const handleDownloadMarkdown = () => {
    downloadMarkdown(editor)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const markdownContent = await readMarkdownFile(file)
      importMarkdown(editor, markdownContent)
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error reading markdown file:', error)
      alert('Error reading markdown file. Please try again.')
    }
  }

  const handleCloseDialog = () => {
    setShowMarkdown(false)
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        alert('Markdown copied to clipboard!')
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error)
        alert('Failed to copy to clipboard.')
      })
  }

  return (
    <div className="flex items-center gap-1">
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={handleImportClick}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Import Markdown"
      >
        <FileUp size={18} />
      </button>
      
      <button
        onClick={handleExportMarkdown}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="View as Markdown"
      >
        <FileText size={18} />
      </button>
      
      <button
        onClick={handleDownloadMarkdown}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Download as Markdown"
      >
        <FileDown size={18} />
      </button>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".md,.markdown,text/markdown"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Markdown Preview Dialog */}
      {showMarkdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">Markdown Content</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"
                >
                  Copy
                </button>
                <button 
                  onClick={handleCloseDialog}
                  className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded border border-gray-200">
                {markdownContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarkdownControls