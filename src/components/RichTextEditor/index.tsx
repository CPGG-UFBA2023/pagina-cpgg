import { useRef, useCallback, useEffect } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Palette, Type
} from 'lucide-react'
import styles from './RichTextEditor.module.css'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }
    isInternalChange.current = false
  }, [value])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    handleInput()
  }, [handleInput])

  const fontSizes = [
    { label: '12px', value: '1' },
    { label: '14px', value: '2' },
    { label: '16px', value: '3' },
    { label: '18px', value: '4' },
    { label: '24px', value: '5' },
    { label: '32px', value: '6' },
    { label: '48px', value: '7' },
  ]

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('bold')} title="Negrito">
            <Bold size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('italic')} title="Itálico">
            <Italic size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('underline')} title="Sublinhado">
            <Underline size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('strikeThrough')} title="Riscado">
            <Strikethrough size={16} />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolbarSelect}
            onChange={(e) => exec('fontSize', e.target.value)}
            defaultValue="3"
            title="Tamanho da fonte"
          >
            {fontSizes.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolbarSelect}
            onChange={(e) => {
              if (e.target.value) exec('fontName', e.target.value)
            }}
            defaultValue=""
            title="Fonte"
          >
            <option value="">Fonte</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <label title="Cor do texto" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 4 }}>
            <Type size={14} />
            <input
              type="color"
              className={styles.colorInput}
              defaultValue="#000000"
              onChange={(e) => exec('foreColor', e.target.value)}
            />
          </label>
          <label title="Cor de fundo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 4 }}>
            <Palette size={14} />
            <input
              type="color"
              className={styles.colorInput}
              defaultValue="#ffffff"
              onChange={(e) => exec('hiliteColor', e.target.value)}
            />
          </label>
        </div>

        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('justifyLeft')} title="Alinhar à esquerda">
            <AlignLeft size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('justifyCenter')} title="Centralizar">
            <AlignCenter size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('justifyRight')} title="Alinhar à direita">
            <AlignRight size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('justifyFull')} title="Justificar">
            <AlignJustify size={16} />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('insertUnorderedList')} title="Lista">
            <List size={16} />
          </button>
          <button type="button" className={styles.toolbarBtn} onClick={() => exec('insertOrderedList')} title="Lista numerada">
            <ListOrdered size={16} />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  )
}
