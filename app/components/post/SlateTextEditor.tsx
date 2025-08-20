'use client'

import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Text, Path, Node } from 'slate'
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, ReactEditor, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import { CustomElement, CustomText, SlateTextEditorRef } from '../../types/editor'

// 기존 함수들
const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

    try {
        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as any)[blockType] === format,
            })
        )
        return !!match
    } catch (error) {
        console.warn('Error checking block active state:', error)
        return false
    }
}

const isMarkActive = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
    try {
        const marks = Editor.marks(editor)
        return marks ? (marks as any)[format] === true : false
    } catch (error) {
        console.warn('Error checking mark active state:', error)
        return false
    }
}

const isListItemActive = (editor: Editor) => {
    const { selection } = editor
    if (!selection) return false

    try {
        const [match] = Array.from(
            Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as CustomElement).type === 'list-item',
            })
        )
        return !!match
    } catch (error) {
        console.warn('Error checking list item active state:', error)
        return false
    }
}

const getCurrentListItem = (editor: Editor) => {
    const { selection } = editor
    if (!selection) return null

    try {
        const [match] = Array.from(
            Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as CustomElement).type === 'list-item',
            })
        )
        return match ? (match[0] as CustomElement) : null
    } catch (error) {
        console.warn('Error getting current list item:', error)
        return null
    }
}

const getListItemIndex = (editor: Editor, path: Path, level: number, listType: 'bulleted' | 'numbered'): number => {
    let index = 0
    const parentPath = Path.parent(path)
    const currentIndex = path[path.length - 1]

    for (let i = 0; i < currentIndex; i++) {
        const siblingPath = [...parentPath, i]
        try {
            const siblingNode = Node.get(editor, siblingPath)
            if (SlateElement.isElement(siblingNode) &&
                siblingNode.type === 'list-item' &&
                (siblingNode.level || 0) === level &&
                siblingNode.listType === listType) {
                index++
            }
        } catch (e) {
            continue
        }
    }
    return index
}

const getListMarker = (listType: 'bulleted' | 'numbered', level: number, index: number) => {
    if (listType === 'bulleted') {
        const markers = ['•', '◦', '▪', '‣', '⁃']
        return markers[level % markers.length] || '•'
    } else {
        switch (level) {
            case 0: return `${index + 1}.`
            case 1: {
                const letters = 'abcdefghijklmnopqrstuvwxyz'
                return `${letters[index % 26]}.`
            }
            case 2: {
                const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
                    'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx']
                return `${romans[index % romans.length] || 'i'}.`
            }
            default: return `${index + 1}.`
        }
    }
}

const toggleList = (editor: Editor, listType: 'bulleted' | 'numbered') => {
    const currentItem = getCurrentListItem(editor)

    if (currentItem && currentItem.listType === listType) {
        Transforms.setNodes(editor, {
            type: 'paragraph',
            level: undefined,
            listType: undefined
        })
    } else {
        Transforms.setNodes(editor, {
            type: 'list-item',
            level: 0,
            listType: listType
        })
    }
}

const increaseListLevel = (editor: Editor) => {
    const currentItem = getCurrentListItem(editor)
    if (!currentItem) return

    const currentLevel = currentItem.level || 0
    if (currentLevel < 4) {
        Transforms.setNodes(editor, {
            level: currentLevel + 1
        })
    }
}

const decreaseListLevel = (editor: Editor) => {
    const currentItem = getCurrentListItem(editor)
    if (!currentItem) return

    const currentLevel = currentItem.level || 0
    if (currentLevel > 0) {
        Transforms.setNodes(editor, {
            level: currentLevel - 1
        })
    } else {
        Transforms.setNodes(editor, {
            type: 'paragraph',
            level: undefined,
            listType: undefined
        })
    }
}

const toggleBlock = (editor: Editor, format: string) => {
    if (format === 'bulleted-list') {
        toggleList(editor, 'bulleted')
        return
    }
    if (format === 'numbered-list') {
        toggleList(editor, 'numbered')
        return
    }

    const isActive = isBlockActive(editor, format)
    Transforms.setNodes<SlateElement>(editor, {
        type: isActive ? 'paragraph' : (format as any),
        level: undefined,
        listType: undefined
    })
}

const toggleMark = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
        Editor.removeMark(editor, format as string) // 타입 단언 추가
    } else {
        Editor.addMark(editor, format as string, true) // 타입 단언 추가
    }
}

// 렌더링 컴포넌트들
const Element = React.memo(({ attributes, children, element }: RenderElementProps) => {
    const style = { textAlign: (element as any).align }

    switch (element.type) {
        case 'list-item':
            const level = (element as CustomElement).level || 0
            const listType = (element as CustomElement).listType || 'bulleted'
            const paddingLeft = 20 + (level * 20)

            return (
                <ListItemElement
                    attributes={attributes}
                    element={element as CustomElement}
                    style={style}
                    level={level}
                    listType={listType}
                    paddingLeft={paddingLeft}
                >
                    {children}
                </ListItemElement>
            )
        case 'blockquote':
            return (
                <blockquote
                    style={{
                        ...style,
                        borderLeft: '4px solid #007bff',
                        paddingLeft: '16px',
                        marginLeft: '0',
                        fontStyle: 'italic',
                        color: '#6c757d',
                        background: '#f8f9fa',
                        borderRadius: '0 4px 4px 0'
                    }}
                    {...attributes}
                >
                    {children}
                </blockquote>
            )
        case 'heading-1':
            return (
                <h1 style={{
                    ...style,
                    fontSize: '2em',
                    fontWeight: 'bold',
                    margin: '0.67em 0',
                    borderBottom: '2px solid #e9ecef',
                    paddingBottom: '0.3em'
                }} {...attributes}>
                    {children}
                </h1>
            )
        case 'heading-2':
            return (
                <h2 style={{
                    ...style,
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    margin: '0.83em 0',
                    borderBottom: '1px solid #e9ecef',
                    paddingBottom: '0.3em'
                }} {...attributes}>
                    {children}
                </h2>
            )
        case 'heading-3':
            return (
                <h3 style={{ ...style, fontSize: '1.17em', fontWeight: 'bold', margin: '1em 0' }} {...attributes}>
                    {children}
                </h3>
            )
        case 'code-block':
            return (
                <pre
                    style={{
                        ...style,
                        background: '#282c34',
                        color: '#abb2bf',
                        padding: '16px',
                        borderRadius: '8px',
                        fontFamily: '"Fira Code", Monaco, Consolas, monospace',
                        fontSize: '14px',
                        overflow: 'auto',
                        border: '1px solid #3c4043'
                    }}
                    {...attributes}
                >
                    <code>{children}</code>
                </pre>
            )
        default:
            return (
                <p style={{ ...style, margin: '0.5em 0' }} {...attributes}>
                    {children}
                </p>
            )
    }
})

const ListItemElement = React.memo<{
    attributes: any
    element: CustomElement
    style: any
    level: number
    listType: 'bulleted' | 'numbered'
    paddingLeft: number
    children: React.ReactNode
}>(({ attributes, element, style, level, listType, paddingLeft, children }) => {
    const editor = useSlate()

    const path = useMemo(() => {
        try {
            return ReactEditor.findPath(editor, element)
        } catch (error) {
            console.warn('Error finding path for list item:', error)
            return [0]
        }
    }, [editor, element])

    const index = useMemo(() =>
        getListItemIndex(editor, path, level, listType),
        [editor, path, level, listType]
    )

    const marker = useMemo(() =>
        getListMarker(listType, level, index),
        [listType, level, index]
    )

    return (
        <div
            style={{
                ...style,
                paddingLeft: `${paddingLeft}px`,
                display: 'flex',
                alignItems: 'flex-start',
                margin: '2px 0'
            }}
            {...attributes}
        >
            <span
                contentEditable={false}
                style={{
                    marginRight: '8px',
                    minWidth: '24px',
                    fontSize: '14px',
                    fontWeight: listType === 'numbered' ? 'normal' : 'bold',
                    color: '#6c757d',
                    userSelect: 'none'
                }}
            >
                {marker}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </div>
    )
})

const Leaf = React.memo(({ attributes, children, leaf }: RenderLeafProps) => {
    let style: React.CSSProperties = {}

    if (leaf.fontSize) style.fontSize = `${leaf.fontSize}px`
    if (leaf.color) style.color = leaf.color

    if (leaf.bold) children = <strong>{children}</strong>
    if (leaf.italic) children = <em>{children}</em>
    if (leaf.underline) children = <u>{children}</u>

    if (leaf.code) {
        children = (
            <code
                style={{
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: '"Fira Code", Monaco, Consolas, monospace',
                    fontSize: leaf.fontSize ? `${Math.max(leaf.fontSize - 2, 12)}px` : '13px',
                    color: leaf.color || '#d63384'
                }}
            >
                {children}
            </code>
        )
    }

    return <span {...attributes} style={style}>{children}</span>
})

const ToolbarButton = React.memo<{
    format: string
    icon: string
    isActive: boolean
    onMouseDown: (event: React.MouseEvent, format: string) => void
    title?: string
}>(({ format, icon, isActive, onMouseDown, title }) => {
    return (
        <button
            className={`toolbar-button ${isActive ? 'active' : ''}`}
            onMouseDown={(event) => onMouseDown(event, format)}
            title={title || format}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: '1px solid transparent',
                background: isActive ? '#007bff' : 'transparent',
                color: isActive ? 'white' : '#495057',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.15s ease',
                userSelect: 'none'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = '#f8f9fa'
                    target.style.borderColor = '#dee2e6'
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    const target = e.target as HTMLButtonElement
                    target.style.background = 'transparent'
                    target.style.borderColor = 'transparent'
                }
            }}
        >
            {icon}
        </button>
    )
})

// 메인 에디터 컴포넌트
const SlateTextEditor = forwardRef<SlateTextEditorRef>((props, ref) => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const composingRef = useRef(false)

    const [html, setHtml] = useState<string>('')
    const [value, setValue] = useState<Descendant[]>([
        {
            type: 'paragraph',
            children: [{ text: '여기에 텍스트를 입력하세요...' }],
        },
    ])

    const [fontSize, setFontSize] = useState<number>(16)
    const [textColor, setTextColor] = useState<string>('#000000')

    useImperativeHandle(ref, () => ({
        getHTML: () => html,
        clear: () => {
            setValue([{
                type: 'paragraph',
                children: [{ text: '' }],
            }])
            setHtml('')
        }
    }))

    const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setHtml(serializeToHTML(value))
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [value])

    const applyFontSize = useCallback((size: number) => {
        const { selection } = editor
        if (selection) {
            Transforms.setNodes(
                editor,
                { fontSize: size },
                { match: n => Text.isText(n), split: true }
            )
        }
    }, [editor])

    const applyTextColor = useCallback((color: string) => {
        const { selection } = editor
        if (selection) {
            Transforms.setNodes(
                editor,
                { color: color },
                { match: n => Text.isText(n), split: true }
            )
        }
    }, [editor])

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if ((event.nativeEvent as any).isComposing) return
        if ((event.nativeEvent as any).keyCode === 229) return
        if (composingRef.current) return

        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault()
            Editor.insertText(editor, '\n')
            return
        }

        if (event.key === 'Tab') {
            event.preventDefault()
            if (event.shiftKey) {
                decreaseListLevel(editor)
            } else {
                increaseListLevel(editor)
            }
            return
        }

        if (event.key === 'Enter') {
            const currentItem = getCurrentListItem(editor)
            if (currentItem) {
                event.preventDefault()
                const { selection } = editor
                if (selection) {
                    const currentText = Editor.string(editor, selection.focus.path)
                    if (currentText.trim().length === 0) {
                        decreaseListLevel(editor)
                    } else {
                        Transforms.insertNodes(editor, {
                            type: 'list-item',
                            level: currentItem.level || 0,
                            listType: currentItem.listType || 'bulleted',
                            children: [{ text: '' }],
                        })
                    }
                }
                return
            }
        }

        if ((event.ctrlKey || event.metaKey)) {
            switch (event.key) {
                case 'b':
                    event.preventDefault()
                    toggleMark(editor, 'bold')
                    break
                case 'i':
                    event.preventDefault()
                    toggleMark(editor, 'italic')
                    break
                case 'u':
                    event.preventDefault()
                    toggleMark(editor, 'underline')
                    break
                case '`':
                    event.preventDefault()
                    toggleMark(editor, 'code')
                    break
                case 'a':
                    event.preventDefault()
                    Transforms.select(editor, Editor.range(editor, []))
                    break
            }
        }
    }, [editor])

    const handleToolbarMouseDown = useCallback((event: React.MouseEvent, format: string) => {
        event.preventDefault()
        const markFormats = ['bold', 'italic', 'underline', 'code']

        if (markFormats.includes(format)) {
            toggleMark(editor, format as keyof Omit<CustomText, 'text'>)
        } else {
            toggleBlock(editor, format)
        }
    }, [editor])

    const handleFontSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const size = parseInt(event.target.value)
        setFontSize(size)
        applyFontSize(size)
    }, [applyFontSize])

    const handleColorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const color = event.target.value
        setTextColor(color)
        applyTextColor(color)
    }, [applyTextColor])

    const serializeToHTML = useCallback((nodes: Descendant[]): string => {
        try {
            return nodes
                .map((node) => {
                    if (isEmptyParagraph(node)) {
                        return '<br />'
                    }
                    return serializeNode(node)
                })
                .join('')
        } catch (error) {
            console.error('Error serializing to HTML:', error)
            return ''
        }
    }, [])

    const isEmptyParagraph = useCallback((node: Descendant): boolean => {
        return (
            !Text.isText(node) &&
            node.type === 'paragraph' &&
            Array.isArray((node as SlateElement).children) &&
            (node as SlateElement).children.length === 1 &&
            Text.isText((node as SlateElement).children[0]) &&
            (node as SlateElement).children[0].text === ''
        )
    }, [])

    const serializeNode = useCallback((node: Descendant): string => {
        if (Text.isText(node)) {
            let text = node.text

            text = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')

            text = text.replace(/ {2,}/g, (m) => '&nbsp;'.repeat(m.length))
            text = text.replace(/\n/g, '<br />')

            if (node.bold) text = `<strong>${text}</strong>`
            if (node.italic) text = `<em>${text}</em>`
            if (node.underline) text = `<u>${text}</u>`
            if (node.code) text = `<code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${text}</code>`
            if (node.color) text = `<span style="color: ${node.color}">${text}</span>`
            if (node.fontSize) text = `<span style="font-size: ${node.fontSize}px">${text}</span>`

            return text
        }

        const element = node as SlateElement
        const children = element.children.map(serializeNode).join('')

        switch (element.type) {
            case 'heading-1': return `<h1>${children}</h1>`
            case 'heading-2': return `<h2>${children}</h2>`
            case 'heading-3': return `<h3>${children}</h3>`
            case 'blockquote': return `<blockquote>${children}</blockquote>`
            case 'code-block': return `<pre><code>${children}</code></pre>`
            case 'list-item': return `<li>${children}</li>`
            case 'bulleted-list': return `<ul>${children}</ul>`
            case 'numbered-list': return `<ol>${children}</ol>`
            default: return `<p>${children}</p>`
        }
    }, [])

    return (
        <div className="flex flex-col w-full h-full">
            <div style={{
                width: '100%',
                height: '100%',
                background: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                border: '1px solid #e9ecef'
            }}>
                <Slate
                    editor={editor}
                    initialValue={value}
                    onChange={setValue}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        gap: '6px',
                        padding: '12px 16px',
                        background: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef',
                        flexWrap: 'wrap'
                    }}>
                        <select
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6',
                                background: 'white',
                                fontSize: '14px',
                                color: '#000000',
                                marginRight: '8px',
                                minWidth: '70px'
                            }}
                        >
                            {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(size => (
                                <option key={size} value={size}>{size}px</option>
                            ))}
                        </select>

                        <input
                            type="color"
                            value={textColor}
                            onChange={handleColorChange}
                            style={{
                                width: '60px',
                                height: '36px',
                                border: '1px solid #dee2e6',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: '2px',
                                marginRight: '8px'
                            }}
                            title="텍스트 색상"
                        />

                        <div style={{ width: '1px', height: '24px', background: '#dee2e6', margin: '0 4px' }} />

                        <ToolbarButton format="bold" icon="B" isActive={isMarkActive(editor, 'bold')} onMouseDown={handleToolbarMouseDown} title="굵게 (Ctrl+B)" />
                        <ToolbarButton format="italic" icon="I" isActive={isMarkActive(editor, 'italic')} onMouseDown={handleToolbarMouseDown} title="기울임 (Ctrl+I)" />
                        <ToolbarButton format="underline" icon="U" isActive={isMarkActive(editor, 'underline')} onMouseDown={handleToolbarMouseDown} title="밑줄 (Ctrl+U)" />
                        <ToolbarButton format="code" icon="<>" isActive={isMarkActive(editor, 'code')} onMouseDown={handleToolbarMouseDown} title="인라인 코드 (Ctrl+`)" />

                        <div style={{ width: '1px', height: '24px', background: '#dee2e6', margin: '0 4px' }} />

                        <ToolbarButton format="heading-1" icon="H1" isActive={isBlockActive(editor, 'heading-1')} onMouseDown={handleToolbarMouseDown} title="제목 1" />
                        <ToolbarButton format="heading-2" icon="H2" isActive={isBlockActive(editor, 'heading-2')} onMouseDown={handleToolbarMouseDown} title="제목 2" />
                        <ToolbarButton format="heading-3" icon="H3" isActive={isBlockActive(editor, 'heading-3')} onMouseDown={handleToolbarMouseDown} title="제목 3" />

                        <div style={{ width: '1px', height: '24px', background: '#dee2e6', margin: '0 4px' }} />

                        <ToolbarButton format="bulleted-list" icon="•" isActive={isListItemActive(editor) && getCurrentListItem(editor)?.listType === 'bulleted'} onMouseDown={handleToolbarMouseDown} title="불릿 리스트" />
                        <ToolbarButton format="numbered-list" icon="1." isActive={isListItemActive(editor) && getCurrentListItem(editor)?.listType === 'numbered'} onMouseDown={handleToolbarMouseDown} title="번호 리스트" />
                        <ToolbarButton format="blockquote" icon="❝" isActive={isBlockActive(editor, 'blockquote')} onMouseDown={handleToolbarMouseDown} title="인용" />
                        <ToolbarButton format="code-block" icon="{ }" isActive={isBlockActive(editor, 'code-block')} onMouseDown={handleToolbarMouseDown} title="코드 블록" />
                    </div>

                    <Editable
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        spellCheck
                        autoFocus
                        onKeyDown={handleKeyDown}
                        onCompositionStart={() => { composingRef.current = true }}
                        onCompositionEnd={() => { composingRef.current = false }}
                        style={{
                            padding: '20px',
                            height: '350px',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            color: '#212529',
                            outline: 'none',
                            overflowY: 'auto'
                        }}
                        placeholder="여기에 텍스트를 입력하세요..."
                    />
                </Slate>
            </div>
        </div>
    )
})

SlateTextEditor.displayName = 'SlateTextEditor'

export default SlateTextEditor