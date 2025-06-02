import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  maxHeight?: string;
}

interface Command {
  icon: React.ReactNode;
  title: string;
  command: string;
  value?: string;
  shortcut?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something amazing...',
  className,
  height = '300px',
  maxHeight,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean | string>>({});
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(!value);

  // Common icon styling
  const commonIconClass = 'h-4 w-4';

  // Command definitions with keyboard shortcuts
  const commands: Command[] = [
    { icon: <Bold className={commonIconClass} />, title: 'Bold', command: 'bold', shortcut: 'Ctrl+B' },
    { icon: <Italic className={commonIconClass} />, title: 'Italic', command: 'italic', shortcut: 'Ctrl+I' },
    { icon: <Underline className={commonIconClass} />, title: 'Underline', command: 'underline', shortcut: 'Ctrl+U' },
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

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
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

  // Handle command execution with improved list handling
  const handleCommand = useCallback(
    (command: string, value?: string) => {
      if (!editorRef.current) return;
      
      editorRef.current.focus();
      saveState();
      
      try {
        if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
          // Ensure we're in a paragraph before inserting a list
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer.parentElement;
            
            // If not in a paragraph or list item, wrap in paragraph first
            if (parentElement && !['P', 'LI'].includes(parentElement.tagName)) {
              document.execCommand('formatBlock', false, 'p');
            }
          }
          document.execCommand(command, false);
        } else if (command === 'formatBlock' && value) {
          document.execCommand('formatBlock', false, `<${value}>`);
        } else {
          document.execCommand(command, false, value);
        }
        
        // Force update content after list operations
        if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
          setTimeout(updateContent, 0);
        } else {
          updateContent();
        }
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
      alert('Please select text to create a link');
      return;
    }

    const url = window.prompt('Enter URL:', 'https://');
    if (url) {
      saveState();
      document.execCommand('createLink', false, url);
      updateContent();
    }
  }, [saveState, updateContent]);

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !editorRef.current) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, editorRef.current!.innerHTML]);
    editorRef.current.innerHTML = previousState;
    updateContent();
  }, [undoStack, updateContent]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !editorRef.current) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, editorRef.current!.innerHTML]);
    editorRef.current.innerHTML = nextState;
    updateContent();
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
      
      // Check alignment
      newActiveCommands.justifyLeft = document.queryCommandState('justifyLeft');
      newActiveCommands.justifyCenter = document.queryCommandState('justifyCenter');
      newActiveCommands.justifyRight = document.queryCommandState('justifyRight');
      
      // Check block formats
      const blockFormat = document.queryCommandValue('formatBlock').toLowerCase();
      if (blockFormat) {
        newActiveCommands.formatBlock = blockFormat.replace(/^<|>$/g, '');
      }
      
      setActiveCommands(newActiveCommands);
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', updateActiveCommands);
      editor.addEventListener('mouseup', updateActiveCommands);
      editor.addEventListener('keyup', updateActiveCommands);
      editor.addEventListener('blur', updateActiveCommands);
    }
    
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current) return;
      
      // Handle common keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            handleCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            handleCommand('underline');
            break;
          case 'k':
            e.preventDefault();
            handleLink();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleCommand, handleLink, handleUndo, handleRedo]);

  // Handle editor input
  const handleInput = useCallback(() => {
    updateContent();
  }, [updateContent]);

  // Determine if a command is active
  const isCommandActive = (command: string, value?: string): boolean => {
    if (command === 'formatBlock' && value) {
      return activeCommands.formatBlock === value.toLowerCase();
    }
    
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      return !!activeCommands[command];
    }
    
    return !!activeCommands[command];
  };

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden flex flex-col', className)}>
      <div className="flex flex-wrap gap-1 border-b bg-muted/50 p-1 sticky top-0 z-10">
        <TooltipProvider delayDuration={300}>
          {commands.map((cmd, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  aria-label={cmd.title}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-colors",
                    isCommandActive(cmd.command, cmd.value) && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleCommand(cmd.command, cmd.value)}
                >
                  {cmd.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  {cmd.title}
                  {cmd.shortcut && <span className="ml-2 opacity-70">{cmd.shortcut}</span>}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Insert Link"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 transition-colors"
                onClick={handleLink}
              >
                <Link2 className={commonIconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                Insert Link
                <span className="ml-2 opacity-70">Ctrl+K</span>
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="mx-2 my-1 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Undo"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 transition-colors",
                  undoStack.length === 0 && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleUndo}
                disabled={undoStack.length === 0}
              >
                <Undo className={commonIconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Undo <span className="ml-2 opacity-70">Ctrl+Z</span></p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                aria-label="Redo"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 transition-colors",
                  redoStack.length === 0 && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Redo className={commonIconClass} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Redo <span className="ml-2 opacity-70">Ctrl+Shift+Z</span></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div 
        className="relative" 
        style={{ 
          height, 
          maxHeight: maxHeight || 'none',
          overflow: 'auto'
        }}
      >
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          className={cn(
            'prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none p-4 focus:outline-none',
            'w-full h-full overflow-auto editor-content',
            'flex flex-col',
            '[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:my-2',
            '[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:my-2',
            '[&>p]:my-1',
            '[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-2',
            '[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-2',
            '[&>ul>li]:ml-4 [&>ul>li]:pl-2',
            '[&>ol>li]:ml-4 [&>ol>li]:pl-2',
            '[&>blockquote]:border-l-4 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:border-muted-foreground/40',
            '[&>pre]:bg-muted [&>pre]:p-2 [&>pre]:rounded [&>pre]:my-2 [&>pre]:overflow-x-auto',
            '[&>a]:text-blue-600 [&>a]:underline [&>a:hover]:text-blue-800',
            '[&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800'
          )}
          onInput={handleInput}
          data-placeholder={placeholder}
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