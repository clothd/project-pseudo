/**
 * Get the exact cursor coordinates in a textarea
 * @param {HTMLTextAreaElement} textarea - The textarea element
 * @returns {Object} - The position { top, left }
 */
export const getCursorCoordinates = (textarea) => {
    if (!textarea) return { top: 0, left: 0 };
  
    const selectionEnd = textarea.selectionEnd;
  
    // Create a hidden div to measure text
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.overflow = "hidden";
    div.style.fontSize = window.getComputedStyle(textarea).fontSize;
    div.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
    div.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
    div.style.padding = window.getComputedStyle(textarea).padding;
    div.style.width = window.getComputedStyle(textarea).width;
  
    // Create a span at cursor position
    const textBeforeCursor = textarea.value.substring(0, selectionEnd);
    div.textContent = textBeforeCursor;
    const span = document.createElement("span");
    span.id = "cursor-position-span";
    div.appendChild(span);
  
    document.body.appendChild(div);
  
    // Get the position of the span
    const rect = span.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
  
    // Clean up the DOM
    document.body.removeChild(div);
  
    // Return the position relative to the textarea
    return {
      top:
        rect.top -
        textareaRect.top +
        textarea.scrollTop +
        parseInt(window.getComputedStyle(textarea).lineHeight),
      left: rect.left - textareaRect.left + textarea.scrollLeft,
    };
  };