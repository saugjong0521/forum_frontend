// page.tsx 또는 다른 컴포넌트에서

import SlateTextEditor from "../components/SlateTextEditor";

export default function EditorPage() {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>텍스트 에디터</h1>
      <SlateTextEditor />
    </div>
  )
}