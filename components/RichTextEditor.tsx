import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Type, Link as LinkIcon, Youtube, Palette } from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          exec('insertImage', ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addYoutube = () => {
    const url = prompt("Enter YouTube URL:");
    if (url) {
      // Extract Video ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (videoId) {
        const embedHtml = `<div class="relative w-full pb-[56.25%] h-0"><iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full rounded-lg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><br/>`;
        document.execCommand('insertHTML', false, embedHtml);
        if(editorRef.current) onChange(editorRef.current.innerHTML);
      } else {
        alert("Invalid YouTube URL");
      }
    }
  };

  const changeFont = (font: string) => {
    exec('fontName', font);
  };

  return (
    <div className="w-full border border-gray-700 rounded-lg overflow-hidden bg-card-bg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-700 bg-dark-bg">
        
        <select onChange={(e) => changeFont(e.target.value)} className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700">
          <option value="Poppins">Body (Poppins)</option>
          <option value="Anton">Header (Anton)</option>
          <option value="Roboto Condensed">Sub (Roboto)</option>
        </select>

        <select onChange={(e) => exec('fontSize', e.target.value)} className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700">
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <div className="h-6 w-px bg-gray-700 mx-1"></div>

        <ToolBtn onClick={() => exec('bold')} icon={<Bold size={16} />} title="Bold" />
        <ToolBtn onClick={() => exec('italic')} icon={<Italic size={16} />} title="Italic" />
        
        <div className="h-6 w-px bg-gray-700 mx-1"></div>

        <div className="relative group">
            <label className="cursor-pointer flex items-center justify-center p-1.5 rounded hover:bg-gray-700 text-gray-300">
                <Palette size={16} />
                <input 
                    type="color" 
                    className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                    onChange={(e) => {
                        setColor(e.target.value);
                        exec('foreColor', e.target.value);
                    }}
                    value={color}
                />
            </label>
        </div>

        <div className="h-6 w-px bg-gray-700 mx-1"></div>

        <ToolBtn onClick={() => exec('insertUnorderedList')} icon={<List size={16} />} title="Bullet List" />
        <ToolBtn onClick={() => exec('insertOrderedList')} icon={<ListOrdered size={16} />} title="Numbered List" />

        <div className="h-6 w-px bg-gray-700 mx-1"></div>

        <label className="cursor-pointer p-1.5 rounded hover:bg-gray-700 text-gray-300 flex items-center justify-center" title="Upload Image">
          <ImageIcon size={16} />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
        
        <ToolBtn onClick={addYoutube} icon={<Youtube size={16} />} title="Embed YouTube" />

      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        className="prose prose-invert max-w-none p-4 min-h-[400px] outline-none text-gray-200 font-poppins"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

const ToolBtn = ({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
  >
    {icon}
  </button>
);

export default RichTextEditor;