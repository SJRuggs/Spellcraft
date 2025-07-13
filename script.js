var allComps = [];
var selectedComps = [];
var currentTab = "target"; // Default tab
var cost = 0;

// startup
assignTabClickHandlers();
populateComponents();















function assignTabClickHandlers() {
    document.querySelector('.panel-tabs').addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('is-outlined')) {
            document.querySelectorAll('.panel-tabs button').forEach(tab => tab.classList.add('is-outlined'));
            event.target.classList.remove('is-outlined');
            currentTab = event.target.id;
            for (const comp of allComps)
                if (comp.type === currentTab) comp.btn.classList.remove('is-hidden');
                else comp.btn.classList.add('is-hidden');
        }
    });
}

async function populateComponents() {
    const panel = document.getElementById('components');
    const comps = await fetchComponents();
    comps.sort((a, b) => a.cost - b.cost);
    for (const comp of comps) panel.appendChild(createBlock(comp)); 
    for (const comp of allComps)
        if (comp.type === currentTab) comp.btn.classList.remove('is-hidden');
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

function createBlock(comp) {
    const btn = document.createElement('button');
    comp.btn = btn;
    allComps.push(comp);
    btn.className = 'button mb-2 has-text-left is-hidden red-top';
    btn.compType = comp.type;
    btn.id = comp.name
    btn.addEventListener('click', () => selectComp(comp));
    btn.innerHTML = `
        <div class="hide-on-mobile">
            <div class="is-flex" style="width: 100%;">
                <span class="has-text-weight-bold" style="width: 200px; flex-shrink: 0;">${comp.name}</span>
                <span style="width: 150px; flex-shrink: 0;">${comp.cost} Mana</span>
                <span style="width: 200px; flex-shrink: 0;"><i>"${comp.invocation}"</i></span>
                <div style="flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${comp.description}</div>
            </div>
        </div>
        <div class="hide-on-desktop" style="width: 100%;">
            <div class="is-flex" style="width: 100%; justify-content: space-between;">
                <span class="has-text-weight-bold">${comp.name}</span>
                <span>${comp.cost} Mana</span>
            </div>
            <div class="mb-5">
                <i>"${comp.invocation}"</i>
            </div>
            <div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; width: 100%;">${comp.description}</div>
        </div>
        `;

    return btn;
}

function selectComp(comp) {
    if (comp.btn.classList.contains('is-primary')) removeComp(comp);
    else addComp(comp);
}

function removeComp(comp) {
    comp.btn.classList.remove('is-primary');
    const index = selectedComps.indexOf(comp);
    if (index > -1) {
        selectedComps.splice(index, 1);
        cost -= comp.cost;
        if (comp.counter) document.getElementById(comp.counter).classList.remove('is-disabled');
        if (comp.enable) {
            document.getElementById(comp.enable).classList.add('is-disabled');
            for (searchComp of allComps)
                if (searchComp.type === comp.enable)
                    removeComp(searchComp);
        }
    }
}

function addComp(comp) {
    comp.btn.classList.add('is-primary');
    selectedComps.push(comp);
    cost += comp.cost;
    if (comp.counter) document.getElementById(comp.counter).classList.add('is-disabled');
    if (comp.enable) document.getElementById(comp.enable).classList.remove('is-disabled');
}