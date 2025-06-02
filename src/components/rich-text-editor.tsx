import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Link2,
  Undo,
  Redo,
  Code,
  Quote,
  Strikethrough,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  height?: string;
}

interface Command {
  icon: React.ReactNode;
  title: string;
  command: string;
  value?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something amazing...',
  className,
  height = '400px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean | string>>({});
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(!value);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Update content and track state
  const updateContent = useCallback(() => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    onChange(content);
    setIsPlaceholderVisible(!content || content === '<br>' || content === '');
  }, [onChange]);

  // Save state to undo stack
  const saveState = useCallback(() => {
    if (editorRef.current) {
      setUndoStack(prev => [...prev, editorRef.current!.innerHTML]);
      setRedoStack([]);
    }
  }, []);

  // Handle command execution
  const handleCommand = useCallback(
    (command: string, value?: string) => {
      if (!editorRef.current) return;
      
      editorRef.current.focus();
      saveState();
      
      try {
        // Special handling for formatBlock commands
        if (command === 'formatBlock' && value) {
          document.execCommand('formatBlock', false, `<${value}>`);
        } else {
          document.execCommand(command, false, undefined);
        }
        
        updateContent();
      } catch (error) {
        console.error(`Failed to execute command: ${command}`, error);
      }
    },
    [saveState, updateContent]
  );

  // Handle link insertion
  const handleLink = useCallback(() => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      alert('Please select text to link');
      return;
    }

    const url = window.prompt('Enter URL:', 'https://');
    if (url) {
      saveState();
      document.execCommand('createLink', false, url);
      updateContent();
    }
  }, [saveState, updateContent]);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    if (editorRef.current) {
      setRedoStack(prev => [...prev, editorRef.current!.innerHTML]);
      editorRef.current.innerHTML = previousState;
      updateContent();
    }
  }, [undoStack, updateContent]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    if (editorRef.current) {
      setUndoStack(prev => [...prev, editorRef.current!.innerHTML]);
      editorRef.current.innerHTML = nextState;
      updateContent();
    }
  }, [redoStack, updateContent]);

  // Track active formatting commands
  useEffect(() => {
    const updateActiveCommands = () => {
      if (!editorRef.current) return;
      
      const newActiveCommands: Record<string, boolean | string> = {};
      
      // Check inline styles
      newActiveCommands.bold = document.queryCommandState('bold');
      newActiveCommands.italic = document.queryCommandState('italic');
      newActiveCommands.underline = document.queryCommandState('underline');
      newActiveCommands.strikeThrough = document.queryCommandState('strikeThrough');
      
      // Check list states
      newActiveCommands.insertUnorderedList = document.queryCommandState('insertUnorderedList');
      newActiveCommands.insertOrderedList = document.queryCommandState('insertOrderedList');
      
      // Check block formats
      const blockFormat = document.queryCommandValue('formatBlock').toLowerCase();
      if (blockFormat) {
        newActiveCommands.formatBlock = blockFormat;
      }
      
      setActiveCommands(newActiveCommands);
    };
    
    // Set up event listeners
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', updateActiveCommands);
      editor.addEventListener('mouseup', updateActiveCommands);
      editor.addEventListener('keyup', updateActiveCommands);
      editor.addEventListener('blur', updateActiveCommands);
    }
    
    // Initial update
    updateActiveCommands();
    
    return () => {
      if (editor) {
        editor.removeEventListener('input', updateActiveCommands);
        editor.removeEventListener('mouseup', updateActiveCommands);
        editor.removeEventListener('keyup', updateActiveCommands);
        editor.removeEventListener('blur', updateActiveCommands);
      }
    };
  }, []);

  // Handle editor input
  const handleInput = useCallback(() => {
    updateContent();
  }, [updateContent]);

  // Common icon styling
  const commonIconClass = 'h-4 w-4';

  // Command definitions
  const commands: Command[] = [
    { icon: <Bold className={commonIconClass} />, title: 'Bold', command: 'bold' },
    { icon: <Italic className={commonIconClass} />, title: 'Italic', command: 'italic' },
    { icon: <Underline className={commonIconClass} />, title: 'Underline', command: 'underline' },
    { icon: <Strikethrough className={commonIconClass} />, title: 'Strikethrough', command: 'strikeThrough' },
    { icon: <Heading1 className={commonIconClass} />, title: 'Heading 1', command: 'formatBlock', value: 'h1' },
    { icon: <Heading2 className={commonIconClass} />, title: 'Heading 2', command: 'formatBlock', value: 'h2' },
    { icon: <List className={commonIconClass} />, title: 'Bullet List', command: 'insertUnorderedList' },
    { icon: <ListOrdered className={commonIconClass} />, title: 'Numbered List', command: 'insertOrderedList' },
    { icon: <AlignLeft className={commonIconClass} />, title: 'Align Left', command: 'justifyLeft' },
    { icon: <AlignCenter className={commonIconClass} />, title: 'Align Center', command: 'justifyCenter' },
    { icon: <AlignRight className={commonIconClass} />, title: 'Align Right', command: 'justifyRight' },
    { icon: <Quote className={commonIconClass} />, title: 'Quote', command: 'formatBlock', value: 'blockquote' },
    { icon: <Code className={commonIconClass} />, title: 'Code Block', command: 'formatBlock', value: 'pre' },
  ];

  // Determine if a command is active
  const isCommandActive = (command: string, value?: string): boolean => {
    // Handle block-level commands
    if (command === 'formatBlock' && value) {
      return activeCommands.formatBlock === value.toLowerCase();
    }
    
    // Handle list commands
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      return !!activeCommands[command];
    }
    
    // Handle inline styles
    return !!activeCommands[command];
  };

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      <div className="flex flex-wrap gap-1 border-b bg-muted/50 p-1">
        <TooltipProvider delayDuration={0}>
          {commands.map((cmd, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  aria-label={cmd.title}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    isCommandActive(cmd.command, cmd.value) && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleCommand(cmd.command, cmd.value)}
                >
                  {cmd.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{cmd.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Link Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Insert Link"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleLink}
              >
                <Link2 className={commonIconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Insert Link</p>
            </TooltipContent>
          </Tooltip>

          <div className="mx-2 my-1 w-px bg-border" />

          {/* Undo Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Undo"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
              >
                <Undo className={commonIconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Undo</p>
            </TooltipContent>
          </Tooltip>

          {/* Redo Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Redo"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Redo className={commonIconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative" style={{ height }}>
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          className={cn(
            'prose dark:prose-invert max-w-none p-4 focus:outline-none',
            'min-h-full overflow-auto editor-content',
            'flex flex-col',
            '[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:my-2',
            '[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:my-2',
            '[&>p]:my-1',
            '[&>ul]:list-disc [&>ul]:pl-6',
            '[&>ol]:list-decimal [&>ol]:pl-6',
            '[&>blockquote]:border-l-4 [&>blockquote]:pl-4 [&>blockquote]:italic',
            '[&>pre]:bg-gray-100 [&>pre]:dark:bg-gray-800 [&>pre]:p-2 [&>pre]:rounded'
          )}
          onInput={handleInput}
        />
        
        {isPlaceholderVisible && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}