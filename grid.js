document.addEventListener('DOMContentLoaded', function () {
    const gridContainer = document.getElementById('grid-container');
    const updateButton = document.getElementById('updateGrid');
    const lockButton = document.getElementById('lockButton');
    const rowsSlider = document.getElementById('rowsSlider');
    const colsSlider = document.getElementById('colsSlider');
    let isLocked = false; // Initial lock state

    let rows = parseInt(rowsSlider.value); // Initial number of rows
    let cols = parseInt(colsSlider.value); // Initial number of columns

    function generateGrid() {
        gridContainer.innerHTML = ''; // Clear existing grid
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 50px)`; // Adjust grid columns based on cols

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let cell = document.createElement('div');
                cell.classList.add('grid-item');
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('mousedown', function(e) {
                    e.preventDefault(); // Prevent text selection.
                    isDrawing = true;
                    drawState = !this.classList.contains('toggled');
                    toggleCell(this, drawState);
                });

                cell.addEventListener('mouseenter', function() {
                    if (isDrawing) {
                        toggleCell(this, drawState);
                    }
                });

                gridContainer.appendChild(cell);
            }
        }
    }

    function toggleCell(cell, state) {
        if (state) {
            cell.classList.add('toggled');
        } else {
            cell.classList.remove('toggled');
        }
    }

    let isDrawing = false;
    let drawState = false;
    document.addEventListener('mouseup', function() {
        isDrawing = false;
    });

    // Sync sliders and regenerate grid when sliders are adjusted
    rowsSlider.addEventListener('input', function() {
        if (isLocked) {
            colsSlider.value = rowsSlider.value;
        }
        rows = parseInt(rowsSlider.value);
        cols = parseInt(colsSlider.value);
        generateGrid();
    });

    colsSlider.addEventListener('input', function() {
        if (isLocked) {
            rowsSlider.value = colsSlider.value;
        }
        rows = parseInt(rowsSlider.value);
        cols = parseInt(colsSlider.value);
        generateGrid();
    });

    // Toggle lock state
    lockButton.addEventListener('click', function() {
        isLocked = !isLocked;
        lockButton.textContent = isLocked ? "Unlock" : "Lock";
        if (isLocked) {
            // Sync sliders to the same value based on the last slider adjusted
            colsSlider.value = rowsSlider.value;
            rows = cols = parseInt(rowsSlider.value);
            generateGrid();
        }
    });

    updateButton.addEventListener('click', function() {
        generateGrid();
    });

    generateGrid(); // Generate initial grid
});
