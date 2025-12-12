export const downloadBoard = async () => {
  const element = document.getElementById('vision-board-canvas');
  if (!element || !window.html2canvas) {
    console.error("Canvas element or html2canvas not found");
    return;
  }

  try {
    const canvas = await window.html2canvas(element, {
      useCORS: true,
      scale: 2, // Higher resolution
      backgroundColor: '#fdf8f6', // Ensure bg color matches theme
      ignoreElements: (el) => {
        // Ignore the controls buttons on selected items
         return el.tagName === 'BUTTON';
      }
    });

    const link = document.createElement('a');
    link.download = `my-vision-2026-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error("Download failed:", err);
    alert("Could not download the board. Check console for details.");
  }
};