import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { NodeSelection } from '@tiptap/pm/state'


import 'highlight.js/styles/github-dark.css'

import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'

const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('python', python)

type TipTapEditorProps = {
  content: string
  onChange: (content: string) => void
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
      }),
      Placeholder.configure({
        placeholder: 'Digite seu conteúdo aqui...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: 'auto',
              parseHTML: element => element.getAttribute('width'),
              renderHTML: attributes => {
                if (!attributes.width) return {}
                return { width: attributes.width }
              },
            },
            align: {
              default: 'center',
              parseHTML: element => element.getAttribute('align') || 'center',
              renderHTML: attributes => {
                if (!attributes.align) return {}
                return { style: `display: block; margin: ${attributes.align === 'center' ? '0 auto' : attributes.align === 'right' ? '0 0 0 auto' : '0 auto 0 0'}` }
              },
            },
          }
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // ✅ Upload de imagem para Cloudinary
  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'tiptap-images')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (data.secure_url) {
      return data.secure_url
    } else {
      throw new Error('Erro no upload da imagem')
    }
  }

  // ✅ Tratamento do paste isolado por instância
  useEffect(() => {
    if (!editor) return

    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            try {
              const url = await uploadImageToCloudinary(file)
              editor.chain().focus().setImage({ src: url }).run()
            } catch (error) {
              console.error('Erro ao fazer upload da imagem:', error)
            }
          }
        }
      }
    }

    const dom = editor.view.dom

    dom.addEventListener('paste', handlePaste)

    return () => {
      dom.removeEventListener('paste', handlePaste)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="border rounded-2xl bg-white">
      {/* Toolbar fixa */}
      <div className="sticky top-0 z-10 bg-white border-b p-2 flex flex-wrap gap-2">
        {/* Botões da Toolbar*/}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}><u>U</u></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}><s>S</s></button>

        {/* Cabeçalhos */}
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}>H2</button>

        {/* Listas */}
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}>• Lista</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}>1. Lista</button>

        {/* Outros */}
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}>“ Citação ”</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700 px-2 rounded' : 'px-2'}>{'</>'}</button>

        {/* Links */}
        <button onClick={() => {
          const url = window.prompt('URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }} className="px-2">🔗 Link</button>
        <button onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} className="px-2">❌ Link</button>

        {/* Undo Redo */}
        <button onClick={() => editor.chain().focus().undo().run()} className="px-2">↩️ Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="px-2">↪️ Redo</button>

        {/* Alinhamento de imagem */}
        <button onClick={() => {
          const selection = editor.state.selection
            if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
              editor.commands.updateAttributes('image', { align: 'left' })
            }
        }} className="px-2">⬅️ Img Left</button>
        <button onClick={() => {
          const selection = editor.state.selection
          if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
            editor.commands.updateAttributes('image', { align: 'center' })
          }
        }} className="px-2">↔️ Img Center</button>
        <button onClick={() => {
          const selection = editor.state.selection
          if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
            editor.commands.updateAttributes('image', { align: 'right' })
          }
        }} className="px-2">➡️ Img Right</button>

        {/* Redimensionamento */}
        <button onClick={() => {
          const width = window.prompt('Largura da imagem (ex: 100px ou auto)', 'auto')
          if (width) {
            editor.commands.updateAttributes('image', { width })
          }
        }} className="px-2">📐 Img Size</button>
      </div>

      {/* Editor */}
      {/* Área de conteúdo com rolagem */}
    <div className="max-h-[800px] overflow-y-auto p-4">
      <EditorContent editor={editor} className="prose max-w-none min-h-[200px]" />
    </div>
  </div>
  )
}

export default TipTapEditor
