'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Text, BaseEditor, Path, Node } from 'slate'
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, ReactEditor, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'

// 타입 정의
type CustomElement = {
    type: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'bulleted-list' | 'numbered-list' | 'list-item' | 'blockquote' | 'code-block'
    children: CustomText[]
    level?: number
    listType?: 'bulleted' | 'numbered'
}

type CustomText = {
    text: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    code?: boolean
    fontSize?: number
    color?: string
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor
        Element: CustomElement
        Text: CustomText
    }
}

// 헬퍼 함수들
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']
const LIST_TYPES = ['numbered-list', 'bulleted-list']

const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

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
}

const isMarkActive = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const isListItemActive = (editor: Editor) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
        Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n as CustomElement).type === 'list-item',
        })
    )

    return !!match
}

const getCurrentListItem = (editor: Editor) => {
    const { selection } = editor
    if (!selection) return null

    const [match] = Array.from(
        Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n as CustomElement).type === 'list-item',
        })
    )

    return match ? (match[0] as CustomElement) : null
}

// 리스트 아이템의 인덱스를 계산하는 함수
const getListItemIndex = (editor: Editor, path: Path, level: number, listType: 'bulleted' | 'numbered'): number => {
    let index = 0

    // 현재 노드의 부모를 찾습니다
    const parentPath = Path.parent(path)

    // 현재 노드의 인덱스를 가져옵니다
    const currentIndex = path[path.length - 1]

    // 같은 레벨의 이전 리스트 아이템들을 세어봅니다
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
            // 노드가 존재하지 않을 경우 무시
            continue
        }
    }

    return index
}

const getListMarker = (listType: 'bulleted' | 'numbered', level: number, index: number) => {
    if (listType === 'bulleted') {
        const markers = ['•', '◦', '▪']
        return markers[level % 3] || '•'
    } else {
        if (level === 0) return `${index + 1}.`
        if (level === 1) {
            const letters = 'abcdefghijklmnopqrstuvwxyz'
            return `${letters[index % 26]}.`
        }
        if (level === 2) {
            const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']
            return `${romans[index % 10] || 'i'}.`
        }
        return `${index + 1}.`
    }
}

const toggleList = (editor: Editor, listType: 'bulleted' | 'numbered') => {
    const currentItem = getCurrentListItem(editor)

    if (currentItem && currentItem.listType === listType) {
        // 같은 타입의 리스트가 이미 활성화되어 있으면 해제
        Transforms.setNodes(editor, {
            type: 'paragraph',
            level: undefined,
            listType: undefined
        })
    } else {
        // 리스트 아이템으로 변환
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
    if (currentLevel < 2) { // 최대 3레벨 (0, 1, 2)
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
        // 레벨 0에서 더 줄이면 일반 paragraph로 변환
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
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

// 렌더링 컴포넌트들
const Element = ({ attributes, children, element }: RenderElementProps) => {
    const style = { textAlign: (element as any).align }

    switch (element.type) {
        case 'list-item':
            const level = (element as CustomElement).level || 0
            const listType = (element as CustomElement).listType || 'bulleted'
            const paddingLeft = 20 + (level * 20) // 레벨에 따른 들여쓰기

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
                        borderLeft: '4px solid #ddd',
                        paddingLeft: '16px',
                        marginLeft: '0',
                        fontStyle: 'italic',
                        color: '#666'
                    }}
                    {...attributes}
                >
                    {children}
                </blockquote>
            )
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            )
        case 'heading-1':
            return (
                <h1 style={{ ...style, fontSize: '2em', fontWeight: 'bold', margin: '0.5em 0' }} {...attributes}>
                    {children}
                </h1>
            )
        case 'heading-2':
            return (
                <h2 style={{ ...style, fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' }} {...attributes}>
                    {children}
                </h2>
            )
        case 'heading-3':
            return (
                <h3 style={{ ...style, fontSize: '1.2em', fontWeight: 'bold', margin: '0.5em 0' }} {...attributes}>
                    {children}
                </h3>
            )
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            )
        case 'code-block':
            return (
                <pre
                    style={{
                        ...style,
                        background: '#f4f4f4',
                        padding: '16px',
                        borderRadius: '4px',
                        fontFamily: 'Monaco, Consolas, monospace',
                        fontSize: '14px',
                        overflow: 'auto'
                    }}
                    {...attributes}
                >
                    <code>{children}</code>
                </pre>
            )
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            )
    }
}

// 별도의 리스트 아이템 컴포넌트
const ListItemElement: React.FC<{
    attributes: any
    element: CustomElement
    style: any
    level: number
    listType: 'bulleted' | 'numbered'
    paddingLeft: number
    children: React.ReactNode
}> = ({ attributes, element, style, level, listType, paddingLeft, children }) => {
    const editor = useSlate(); // ✅ 올바른 방법

    // 현재 엘리먼트의 경로를 찾습니다
    const path = ReactEditor.findPath(editor, element)

    // 인덱스를 계산합니다
    const index = getListItemIndex(editor, path, level, listType)
    const marker = getListMarker(listType, level, index)

    return (
        <div
            style={{
                ...style,
                paddingLeft: `${paddingLeft}px`,
                display: 'flex',
                alignItems: 'flex-start',
                margin: '4px 0'
            }}
            {...attributes}
        >
            <span
                contentEditable={false}
                style={{
                    marginRight: '8px',
                    minWidth: '20px',
                    fontSize: '14px',
                    fontWeight: listType === 'numbered' ? 'normal' : 'bold'
                }}
            >
                {marker}
            </span>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    )
}

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    let style: React.CSSProperties = {}

    if (leaf.fontSize) {
        style.fontSize = `${leaf.fontSize}px`
    }

    if (leaf.color) {
        style.color = leaf.color
    }

    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.code) {
        children = (
            <code
                style={{
                    background: '#f4f4f4',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: leaf.fontSize ? `${leaf.fontSize}px` : '14px',
                    color: leaf.color || '#333'
                }}
            >
                {children}
            </code>
        )
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }

    return <span {...attributes} style={style}>{children}</span>
}

// 툴바 버튼 컴포넌트
interface ToolbarButtonProps {
    format: string
    icon: string
    isActive: boolean
    onMouseDown: (event: React.MouseEvent, format: string) => void
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ format, icon, isActive, onMouseDown }) => {
    return (
        <button
            className={`toolbar-button ${isActive ? 'active' : ''}`}
            onMouseDown={(event) => onMouseDown(event, format)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                background: isActive ? '#007bff' : 'transparent',
                color: isActive ? 'white' : '#495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    (e.target as HTMLButtonElement).style.background = '#e9ecef'
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    (e.target as HTMLButtonElement).style.background = 'transparent'
                }
            }}
        >
            {icon}
        </button>
    )
}

// 메인 에디터 컴포넌트
const SlateTextEditor: React.FC = () => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const composingRef = useRef(false) // ✅ IME 조합 상태

    const [html, setHtml] = useState<string>('')
    const [value, setValue] = useState<Descendant[]>([
        {
            type: 'paragraph',
            children: [{ text: '여기에 텍스트를 입력하세요...' }],
        },
    ])

    const [fontSize, setFontSize] = useState<number>(16)
    const [textColor, setTextColor] = useState<string>('#000000')

    const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])

    const applyFontSize = (size: number) => {
        const { selection } = editor
        if (selection) {
            Transforms.setNodes(
                editor,
                { fontSize: size },
                { match: n => Text.isText(n), split: true }
            )
        }
    }

    const applyTextColor = (color: string) => {
        const { selection } = editor
        if (selection) {
            Transforms.setNodes(
                editor,
                { color: color },
                { match: n => Text.isText(n), split: true }
            )
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // ✅ 한글 IME 조합 중엔 아무것도 하지 않음
        // 1) 표준
        if ((event.nativeEvent as any).isComposing) return
        // 2) 일부 브라우저/IME는 keyCode 229로 전달
        if ((event.nativeEvent as any).keyCode === 229) return
        if (composingRef.current) return

        // --- 이하 기존 로직 ---
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault()
            Editor.insertText(editor, '\n')
            return
        }


        if (event.key === 'Tab') {
            event.preventDefault()

            if (event.shiftKey) {
                // Shift + Tab: 리스트 레벨 감소
                decreaseListLevel(editor)
            } else {
                // Tab: 리스트 레벨 증가
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
                        // 빈 리스트 아이템에서 Enter를 누르면 리스트에서 나가기
                        decreaseListLevel(editor)
                    } else {
                        // 내용이 있는 리스트 아이템에서 Enter를 누르면 새로운 리스트 아이템 생성
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

        if (!event.ctrlKey && !event.metaKey) {
            return
        }

        switch (event.key) {
            case 'b': {
                event.preventDefault()
                toggleMark(editor, 'bold')
                break
            }
            case 'i': {
                event.preventDefault()
                toggleMark(editor, 'italic')
                break
            }
            case 'u': {
                event.preventDefault()
                toggleMark(editor, 'underline')
                break
            }
            case '`': {
                event.preventDefault()
                toggleMark(editor, 'code')
                break
            }
        }
    }

    const handleToolbarMouseDown = (event: React.MouseEvent, format: string) => {
        event.preventDefault()

        const markFormats = ['bold', 'italic', 'underline', 'code']

        if (markFormats.includes(format)) {
            toggleMark(editor, format as keyof Omit<CustomText, 'text'>)
        } else {
            toggleBlock(editor, format)
        }
    }

    const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const size = parseInt(event.target.value)
        setFontSize(size)
        applyFontSize(size)
    }

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const color = event.target.value
        setTextColor(color)
        applyTextColor(color)
    }

    const serializeToHTML = (nodes: Descendant[]): string => {
        return nodes
            .map((node) => {
                if (isEmptyParagraph(node)) {
                    return '<br />';
                }
                return serializeNode(node);
            })
            .join('');
    };

    // ⚠️ 타입 가드: 빈 단락인지 확인
    const isEmptyParagraph = (node: Descendant): boolean => {
        return (
            !Text.isText(node) &&
            node.type === 'paragraph' &&
            Array.isArray((node as SlateElement).children) &&
            (node as SlateElement).children.length === 1 &&
            Text.isText((node as SlateElement).children[0]) &&
            (node as SlateElement).children[0].text === ''
        );
    };

    const serializeNode = (node: Descendant): string => {
        if (Text.isText(node)) {
            let text = node.text;

            // 연속된 공백을 &nbsp;로 치환
            text = text.replace(/ {2,}/g, (m) => '&nbsp;'.repeat(m.length));

            // (실제로는 Slate엔 \n이 없음. 있어도 대응)
            text = text.replace(/\n/g, '<br />');

            if (node.bold) text = `<strong>${text}</strong>`;
            if (node.italic) text = `<em>${text}</em>`;
            if (node.underline) text = `<u>${text}</u>`;
            if (node.code)
                text = `<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px;">${text}</code>`;
            if (node.color) text = `<span style="color: ${node.color}">${text}</span>`;
            if (node.fontSize) text = `<span style="font-size: ${node.fontSize}px">${text}</span>`;

            return text;
        }

        const element = node as SlateElement;
        const children = element.children.map(serializeNode).join('');

        switch (element.type) {
            case 'heading-1':
                return `<h1>${children}</h1>`;
            case 'heading-2':
                return `<h2>${children}</h2>`;
            case 'heading-3':
                return `<h3>${children}</h3>`;
            case 'blockquote':
                return `<blockquote>${children}</blockquote>`;
            case 'code-block':
                return `<pre><code>${children}</code></pre>`;
            case 'list-item':
                return `<li>${children}</li>`;
            case 'bulleted-list':
                return `<ul>${children}</ul>`;
            case 'numbered-list':
                return `<ol>${children}</ol>`;
            default:
                return `<p>${children}</p>`;
        }
    };




    return (
        <div className="flex bg-[#333] flex-col w-[1400px] h-[700px] justify-center items-center">

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}
            >
                <Slate editor={editor}
                    initialValue={value}
                    onChange={(newValue) => {
                        setValue(newValue)
                        setHtml(serializeToHTML(newValue))
                    }}>
                    {/* 툴바 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '12px 16px',
                        background: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef',
                        flexWrap: 'wrap'
                    }}>
                        {/* Font Size Selector */}
                        <select
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #dee2e6',
                                background: 'white',
                                fontSize: '14px',
                                marginRight: '8px'
                            }}
                        >
                            <option value={10}>10px</option>
                            <option value={12}>12px</option>
                            <option value={14}>14px</option>
                            <option value={16}>16px</option>
                            <option value={18}>18px</option>
                            <option value={20}>20px</option>
                            <option value={24}>24px</option>
                            <option value={28}>28px</option>
                            <option value={32}>32px</option>
                            <option value={36}>36px</option>
                        </select>

                        {/* Color Picker */}
                        <input
                            type="color"
                            value={textColor}
                            onChange={handleColorChange}
                            style={{
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '0',
                                marginRight: '8px'
                            }}
                            title="텍스트 색상"
                        />

                        <div style={{
                            width: '1px',
                            height: '24px',
                            background: '#dee2e6',
                            margin: '0 4px'
                        }} />

                        <ToolbarButton
                            format="bold"
                            icon="B"
                            isActive={isMarkActive(editor, 'bold')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="italic"
                            icon="I"
                            isActive={isMarkActive(editor, 'italic')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="underline"
                            icon="U"
                            isActive={isMarkActive(editor, 'underline')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="code"
                            icon="<>"
                            isActive={isMarkActive(editor, 'code')}
                            onMouseDown={handleToolbarMouseDown}
                        />

                        <div style={{
                            width: '1px',
                            height: '24px',
                            background: '#dee2e6',
                            margin: '0 4px'
                        }} />

                        <ToolbarButton
                            format="heading-1"
                            icon="H1"
                            isActive={isBlockActive(editor, 'heading-1')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="heading-2"
                            icon="H2"
                            isActive={isBlockActive(editor, 'heading-2')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="heading-3"
                            icon="H3"
                            isActive={isBlockActive(editor, 'heading-3')}
                            onMouseDown={handleToolbarMouseDown}
                        />

                        <div style={{
                            width: '1px',
                            height: '24px',
                            background: '#dee2e6',
                            margin: '0 4px'
                        }} />

                        <ToolbarButton
                            format="bulleted-list"
                            icon="•"
                            isActive={isListItemActive(editor) && getCurrentListItem(editor)?.listType === 'bulleted'}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="numbered-list"
                            icon="1."
                            isActive={isListItemActive(editor) && getCurrentListItem(editor)?.listType === 'numbered'}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="blockquote"
                            icon="❝"
                            isActive={isBlockActive(editor, 'blockquote')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                        <ToolbarButton
                            format="code-block"
                            icon="{ }"
                            isActive={isBlockActive(editor, 'code-block')}
                            onMouseDown={handleToolbarMouseDown}
                        />
                    </div>

                    {/* 에디터 */}
                    <Editable
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        spellCheck
                        autoFocus
                        onKeyDown={handleKeyDown}
                        style={{
                            padding: '20px',
                            minHeight: '400px',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            color: '#212529',
                            outline: 'none'
                        }}
                    />
                </Slate>
            </div>


            <div>
                <h3>미리보기 (HTML 적용)</h3>
                {html}
            </div>

        </div>
    )
}

export default SlateTextEditor