var compBlocks = [];
var currentTab = "target"; // Default tab

// startup
assignTabClickHandlers();
populateComponents();








function assignTabClickHandlers() {
    document.querySelector('.panel-tabs').addEventListener('click', function(event) {
        if (event.target.tagName === 'A' && !event.target.classList.contains('is-active')) {
            document.querySelectorAll('.panel-tabs a').forEach(tab => tab.classList.remove('is-active'));
            event.target.classList.add('is-active');
            handleTabClick(event.target.id);
        }
    });
}

function handleTabClick(type) {
    currentTab = type;
    for (const block of compBlocks) {
        if (block.classList.contains(currentTab)) {
            block.classList.remove('is-hidden');
        }
        else {
            block.classList.add('is-hidden');
        }
    }
}

async function populateComponents() {
    const panel = document.getElementById('components-panel');
    const comps = await fetchComponents();
    comps.sort((a, b) => a.cost - b.cost);
    for (const comp of comps) {
        panel.appendChild(createPanelBlock(comp)); 
    }
    for (const block of compBlocks) {
        if (block.classList.contains(currentTab)) {
            block.classList.remove('is-hidden');
        }
    }
}







function fetchComponents() {
    return fetch('components.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load JSON');
        return response.json();
      })
      .then(data => {return data.components;})
      .catch(error => console.error('Error:', error));
}

function createPanelBlock(comp) {
const block = document.createElement('div');
    block.className = `panel-block is-hidden ${comp.type}`;
    block.innerHTML = `
        ${comp.name}
        `;
    compBlocks.push(block);
    return block;
}