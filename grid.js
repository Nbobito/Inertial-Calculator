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

    function colorTableCells() {
        const table = document.getElementById('resultsTable');
        const rows = table.getElementsByTagName('tr');
        const columnCount = rows[0].cells.length; // Assuming all rows have the same number of cells
    
        for (let colIndex of [2,3,5,6]) {
            let columnValues = Array.from(rows).slice(1) // Exclude header row
                                    .map(row => parseFloat(row.cells[colIndex].textContent) || 0);
            
            let maxVal = Math.max(...columnValues);
            let minVal = Math.min(...columnValues);
    
            // Apply colors based on values
            columnValues.forEach((val, rowIndex) => {
                let cell = rows[rowIndex + 1].cells[colIndex]; // +1 to skip header row
                cell.style.backgroundColor = getColorForValue(val, minVal, maxVal);
            });
        }
    }
    
    function getColorForValue(value, min, max) {
        const percent = (value - min) / (max - min); // Normalize value to [0, 1]
        const intensityReductionFactor = 0.5; // Adjust this value to control darkness (lower = darker)
        
        // Calculate red and green values with reduced intensity for darker colors
        const red = Math.round((1 - percent) * 255 * intensityReductionFactor);
        const green = Math.round(percent * 255 * intensityReductionFactor);
        
        // Optionally, add a small blue component or reduce it further for different shades
        const blue = 0; // Adjust if a different shade is desired
    
        return `rgb(${red},${green},${blue})`; // Construct darker RGB color string
    } 
    
    function scaleAndRoundValue(value) {
        // Scale by 10^3
        let scaledValue = value * 1000;
        // Round to the nearest thousandth
        let roundedValue = Math.round(scaledValue * 100000) / 100000;
        return roundedValue;
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

    // Calculation controls
    const calculateButton = document.getElementById('calculateButton');
    const resultsTableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];

    let idCounter = 1;

    calculateButton.addEventListener('click', function() {
        // Assuming performCalculation is your function that returns the calculation result and shape representation
        const calculationResult = performCalculation(); // Implement this function based on your specific calculation

        // Insert a new row at the beginning of the table body
        const newRow = resultsTableBody.insertRow(0);
        const idCell = newRow.insertCell(0);
        const shapeCell = newRow.insertCell(1);
        const inertiaXCell = newRow.insertCell(2);
        const inertiaYCell = newRow.insertCell(3);
        const stripCountCell = newRow.insertCell(4);
        const ratioXCell = newRow.insertCell(5);
        const ratioYCell = newRow.insertCell(6);
        newRow.dataset.state = JSON.stringify(calculationResult.gridState); // Store the state as a JSON string

        // Add event listener for restoring grid state
        newRow.addEventListener('click', function() {
            const state = JSON.parse(this.dataset.state);
            restoreGridState(state);
        });
        
        // Delete cell when right clicked
        newRow.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // Prevent the default context menu from showing
            this.remove(); // Remove the clicked table row
            colorTableCells();
            return false; // To prevent any further context menu default actions
        });

        function restoreGridState(state) {
            const gridContainer = document.getElementById('grid-container');
            const rows = state.length;
            const cols = state[0].length;
        
            gridContainer.innerHTML = ''; // Clear current grid
            gridContainer.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
            rowsSlider.value = rows
            colsSlider.value = cols
        
            // Rebuild the grid based on the stored state
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    let cell = document.createElement('div');
                    cell.classList.add('grid-item');
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    if (state[i][j] === 1) cell.classList.add('toggled');

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
                    // Add other cell event listeners as necessary
                    gridContainer.appendChild(cell);
                }
            }
        }
        
        idCell.textContent = idCounter;
        idCounter += 1;
        // Assuming the shape is represented as a small image or canvas drawing
        const shapeImage = document.createElement('img');
        shapeImage.src = calculationResult.shapeImage; // Your method to get the shape image
        shapeImage.style.width = '50px'; // Adjust size as needed
        shapeCell.appendChild(shapeImage);

        inertiaXCell.textContent = calculationResult.inertiaX;
        inertiaYCell.textContent = calculationResult.inertiaY;
        stripCountCell.textContent = calculationResult.stripCount;
        ratioXCell.textContent = calculationResult.stripInertiaX;
        ratioYCell.textContent = calculationResult.stripInertiaY;
        colorTableCells();
    });
    
    function captureGridState() {
        const gridContainer = document.getElementById('grid-container');
        const rows = rowsSlider.value
        const cols = colsSlider.value
        let gridState = [];
    
        for (let i = 0; i < rows; i++) {
            let rowState = [];
            for (let j = 0; j < cols; j++) {
                const cell = gridContainer.children[i * cols + j];
                rowState.push(cell.classList.contains('toggled') ? 1 : 0);
            }
            gridState.push(rowState);
        }
    
        return gridState;
    }

    function performCalculation() {
        const gridState = captureGridState();

        const gridContainer = document.getElementById('grid-container');
        const rows = gridState.length;
        const cols = gridState[0].length;
        const cellSize = 5; // Size of each cell in the miniature grid
        
        // Create a new canvas element
        const canvas = document.createElement('canvas');
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;
        const ctx = canvas.getContext('2d');
    
        // Iterate over each cell in the grid and draw it on the canvas
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = gridContainer.children[i * cols + j];
                ctx.fillStyle = cell.classList.contains('toggled') ? '#0077cc' : '#333'; // Use the colors defined for your grid
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    
        // Convert the canvas to a data URL and return it as the shape image
        const shapeImage = canvas.toDataURL();
    
        // Perform the actual Calculation
        let inertiaX = 0;
        let inertiaY = 0;
        let stripCount = 0;
        const width = 3/32; // Width of balsa wood strips in inches
        const unitInertia = (1/12) * (width ** 4)

        // Cover both even and odd cases for center offsets
        const centerOffsetX = rows % 2 == 0 ? Math.ceil(rows/2) + 0.5 : Math.ceil(rows/2)
        const centerOffsetY = cols % 2 == 0 ? Math.ceil(cols/2) + 0.5 : Math.ceil(cols/2)

        for(let i = 1; i < rows + 1; i++) {
            for (let j = 1; j < cols + 1; j++) {
                let inertiaXij = unitInertia + (width**4)*(Math.abs(centerOffsetX - i)**2)
                let inertiaYij = unitInertia + (width**4)*(Math.abs(centerOffsetY - j)**2)
                inertiaX += gridState[i-1][j-1]*inertiaXij
                inertiaY += gridState[i-1][j-1]*inertiaYij
                stripCount += gridState[i-1][j-1]
            }
        }

        let stripInertiaX = inertiaX / (stripCount**2);
        let stripInertiaY = inertiaY / (stripCount**2);
    
        return {
            shapeImage: shapeImage,
            inertiaX: scaleAndRoundValue(inertiaX),
            inertiaY: scaleAndRoundValue(inertiaY),
            stripCount: stripCount,
            stripInertiaX: scaleAndRoundValue(stripInertiaX),
            stripInertiaY: scaleAndRoundValue(stripInertiaY),
            gridState: gridState
        };
    }
    
});

