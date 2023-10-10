const uploadForm = document.getElementById('uploadForm');
const fetchDataButton = document.getElementById('fetchDataButton');
const dataTable = document.getElementById('dataTable');
const loadingFeedback = document.getElementById('loadingFeedback');
const downloadFeedback = document.getElementById('downloadFeedback');
 // Counter variable to track the number of rows created

uploadForm.addEventListener('submit', handleUpload);
fetchDataButton.addEventListener('click', fetchData);

function handleUpload(event) {
    event.preventDefault();

    loadingFeedback.classList.remove('hidden');
    downloadFeedback.classList.add('hidden');

    const formData = new FormData(uploadForm);
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
            loadingFeedback.classList.add('hidden');
            downloadFeedback.classList.remove('hidden');
        } else {
            throw new Error('Failed to upload Excel sheet.');
        }
    })
    .catch(error => {
        console.error('Error uploading Excel sheet:', error);
        loadingFeedback.classList.add('hidden');
    });
}

function fetchData() {
    loadingFeedback.classList.remove('hidden');
    downloadFeedback.classList.add('hidden');

    fetch('/data')
        .then(response => response.json())
        .then(data => {
            renderData(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        })
        .finally(() => {
            loadingFeedback.classList.add('hidden');
        });
}



function renderData(data) {
    dataTable.innerHTML = '';

    const headers = ['Status', 'Project ID:',  'Customer Name', 'Species Name', 'Sequencing ID', 'Kit Type', 'Name','Date','iLabID', 'Run Folder', 'Run Type', 'Edit', 'Actions'];

    const headerRow = dataTable.insertRow();

    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    
    data.forEach((rowData, index) => {
        
       const dataRow = dataTable.insertRow();
            dataRow.dataset.id = rowData._id;

  


            const checkboxCell = document.createElement('td');
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = rowData.clicked;

checkbox.addEventListener('change', function() {
    const isChecked = this.checked;
    fetch(`/update/${rowData._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clicked: isChecked }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Data updated successfully');

            // Toggle color based on checkbox state
            if (isChecked) {
                checkboxCell.style.backgroundColor = 'green';
            } else {
                checkboxCell.style.backgroundColor = 'red';
            }
        } else {
            console.error('Failed to update data');
        }
    })
    .catch(error => {
        console.error('Error updating data:', error);
    });
});

// Set initial background color based on checkbox state
if (rowData.clicked) {
    checkboxCell.style.backgroundColor = 'green';
} else {
    checkboxCell.style.backgroundColor = 'red';
}

checkboxCell.appendChild(checkbox);
dataRow.appendChild(checkboxCell);


            // const fullNameCell = document.createElement('td');
            // fullNameCell.textContent = fullName;
            // dataRow.appendChild(fullNameCell);

            const dataCells = [rowData.projectId,rowData.customerName,rowData.speciesName, rowData.sequencingID, rowData.kitType, rowData.name, rowData.datee,rowData.iLabID, rowData.runFolder, rowData.runType];
            dataCells.forEach(cellText => {
                const dataCell = document.createElement('td');
                dataCell.textContent = cellText;
                dataRow.appendChild(dataCell);
            });

            const editCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('editBtn');
            editButton.addEventListener('click', function() {
                handleEditRow(dataRow);
            });
            editCell.appendChild(editButton);
            dataRow.appendChild(editCell);

            const actionsCell = document.createElement('td');
            actionsCell.classList.add('actionsCell'); // Adding class for Actions cell

           
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('deleteBtn'); // Adding class for Delete button
      deleteButton.setAttribute('data-id', rowData._id);

      deleteButton.addEventListener('click', function() {
        const dataId = this.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this record?')) {
          fetch(`/delete/${dataId}`, {
            method: 'DELETE',
          })
            .then(response => {
                if (response.ok) {
                    console.log('Data deleted successfully');
                    // Remove the row from the table
                    dataRow.remove();
                  } else {
                    console.error('Failed to delete data');
                  }
                })
                .catch(error => {
                  console.error('Error deleting data:', error);
                });
            }
          });
    
          actionsCell.appendChild(deleteButton);
          dataRow.appendChild(actionsCell);
           
        });
    }



function handleEditRow(row) {
    const editButton = row.querySelector('.editBtn');
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('saveBtn');

    // Disable the Edit button
    editButton.disabled = true;

    // Enable contentEditable for cells (excluding Edit and Actions cells)
    for (let i = 0; i < row.cells.length - 2; i++) {
        row.cells[i].contentEditable = true;
    }

    // Show Save button
    const actionsCell = row.querySelector('.actionsCell'); // Assuming you have a specific class for the Actions cell
    actionsCell.appendChild(saveButton);

    saveButton.addEventListener('click', function() {
        // Retrieve edited content from cells
        const editedData = {
           
            ilabID: row.cells[1].textContent,
            status: row.cells[2].textContent,
            customerName: row.cells[3].textContent,
            speciesName: row.cells[4].textContent,
            sequencingID: row.cells[5].textContent,
            kitType: row.cells[6].textContent,
            name: row.cells[7].textContent,
            datee: row.cells[8].textContent,
            runFolder: row.cells[9].textContent,
            runType: row.cells[10].textContent,
            // ... (retrieve other cells as needed)
        };
    
        // Send edited data to the server for updating the database
        fetch(`/update/${row.dataset.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editedData),
        })
        .then(response => {
            if (response.ok) {
                console.log('Data updated successfully');
                // Optionally, you can update the UI or handle success in some way here
            } else {
                console.error('Failed to update data');
            }
        })
        .catch(error => {
            console.error('Error updating data:', error);
        })
        .finally(() => {
            // Disable contentEditable for cells
            for (let i = 0; i < row.cells.length - 2; i++) {
                row.cells[i].contentEditable = false;
            }
    
            // Remove the Save button
            actionsCell.removeChild(saveButton);
    
            // Enable the Edit button
            editButton.disabled = false;
        });
    });
}   
