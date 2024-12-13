document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal
    MicroModal.init();

    // Get the container
    const mapContainer = document.getElementById('map-container');

    // Fetch and inject the SVG
    fetch('us-map.svg')
        .then(response => response.text())
        .then(svgContent => {
            // Insert the SVG content
            mapContainer.innerHTML = svgContent;

            // First pass: find all state IDs and their corresponding groups
            const stateGroups = new Map();
            document.querySelectorAll('svg path, svg rect').forEach(element => {
                if (stateData[element.id]) {
                    const group = element.closest('g');
                    if (group) {
                        stateGroups.set(element.id, group);
                    }
                }
            });

            // Second pass: apply styling and handlers
            stateGroups.forEach((group, stateId) => {
                const data = stateData[stateId];
                if (data) {
                    // Color all paths and rects in the group
                    group.querySelectorAll('path, rect').forEach(element => {
                        element.style.fill = statusColors[data.status];
                        
                        // Add click handler to each element
                        element.addEventListener('click', () => {
                            showModal(data);
                        });
                    });
                }
            });

            // Handle standalone elements
            document.querySelectorAll('svg > path, svg > rect').forEach(element => {
                const data = stateData[element.id];
                if (data) {
                    element.style.fill = statusColors[data.status];
                    element.addEventListener('click', () => {
                        showModal(data);
                    });
                }
            });

            // Handle text labels
            document.querySelectorAll('svg text').forEach(element => {
                const stateId = element.textContent.trim(); // Use the text content instead of the ID
                const data = stateData[stateId];
                if (data) {
                    element.style.cursor = 'pointer'; // Change cursor to pointer for better UX
                    element.addEventListener('click', () => {
                        console.log(`Clicked on ${data.name}`); // Log the click
                        showModal(data);
                    });
                } else {
                    console.warn(`No data found for state ID: ${stateId}`); // Warn if no data found
                }
            });

            // Special handling for MI group
            const miGroup = document.getElementById('MI');
            if (miGroup && stateData['MI']) {
                const data = stateData['MI'];
                miGroup.querySelectorAll('*').forEach(element => {
                    if (element.tagName === 'path' || element.tagName === 'rect') {
                        element.style.fill = statusColors[data.status];
                    }
                });
                miGroup.addEventListener('click', () => {
                    showModal(data);
                });
            }
        })
        .catch(error => {
            mapContainer.innerHTML = 'Failed to load the map';
            console.error('Error loading SVG:', error);
        });

    // Function to show the modal
    function showModal(data) {
        document.getElementById('modal-title').textContent = data.name;

        // Create a bullet list for the details
        const detailsList = document.createElement('ul');
        data.details.forEach(detail => {
            const listItem = document.createElement('li');

            // Check if the detail is a URL
            if (isValidURL(detail)) {
                const link = document.createElement('a');
                link.href = detail; // Set the URL
                link.textContent = detail; // Set the link text
                link.target = '_blank'; // Open in a new tab
                link.rel = 'noopener noreferrer'; // Security best practice
                listItem.appendChild(link); // Append the link to the list item
            } else {
                listItem.textContent = detail; // Set the text for the list item
            }

            detailsList.appendChild(listItem); // Append the list item to the list
        });

        // Clear previous content and append the new list
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = ''; // Clear previous content
        modalContent.appendChild(detailsList); // Append the new list
        MicroModal.show('state-modal');
    }

    // Function to check if a string is a valid URL
    function isValidURL(string) {
        const res = string.match(/(https?:\/\/[^\s]+)/g);
        return (res !== null);
    }
});