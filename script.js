var allComps = [];
var selectedComps = [];
var currentTab = "target"; // Default tab
var cost = 0;
const manaBar = document.getElementById('manaBar');
const stamina1 = document.getElementById('stamina1');
const stamina2 = document.getElementById('stamina2');
const stamina3 = document.getElementById('stamina3');
const mana1 = document.getElementById('mana1');
const mana2 = document.getElementById('mana2');
const mana3 = document.getElementById('mana3');

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
                if (comp.type === currentTab) comp.block.classList.remove('is-hidden');
                else comp.block.classList.add('is-hidden');
        }
    });
}

async function populateComponents() {
    const panel = document.getElementById('components');
    const comps = await fetchComponents();
    comps.sort((a, b) => a.cost - b.cost);
    for (const comp of comps) createBlock(comp, panel); 
    for (const comp of allComps)
        if (comp.type === currentTab) comp.block.classList.remove('is-hidden');
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

function createBlock(comp, panel) {

    const block = document.createElement('div');
    panel.appendChild(block);
    comp.block = block;
    block.className = 'is-hidden is-flex is-align-items-center';

    const btn = document.createElement('button');
    block.appendChild(btn);
    comp.btn = btn;
    allComps.push(comp);
    btn.className = 'button has-text-left red-top mb-2';
    btn.style.width = '100%';
    btn.compType = comp.type;
    btn.id = comp.name
    btn.addEventListener('click', () => selectComp(comp));
    btn.innerHTML = `
        <div class="hide-on-mobile">
            <div class="is-flex" style="width: 100%;">
                <span class="has-text-weight-bold" style="width: 200px; flex-shrink: 0;">${comp.name}</span>
                <span style="width: 150px; flex-shrink: 0;">${comp.cost} Mana</span>
                <span style="width: 200px; flex-shrink: 0;"><i>"${comp.invocation}"</i></span>
                <div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%; width: 100%;">${comp.description}</div>
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

    const arrows = document.createElement('div');
    comp.arrows = arrows;
    block.appendChild(arrows);
    arrows.style.width = '0';
    arrows.style.opacity = '0';
    arrows.className = 'arrow-block ml-2 is-flex is-align-items-center is-justify-content-center mb-2';
    
    // Create left arrow
    const leftArrow = document.createElement('button');
    leftArrow.className = 'is-small mr-1 p-2';
    leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftArrow.addEventListener('click', () => removeComp(comp));
    arrows.appendChild(leftArrow);
    
    // Create number display
    const numberDisplay = document.createElement('strong');
    comp.countDisplay = numberDisplay;
    comp.count = 0; // Initialize count
    numberDisplay.className = 'is-small has-text-primary mx-1';
    numberDisplay.textContent = '0';
    numberDisplay.style.width = '20px'; // Set a fixed width for consistency
    arrows.appendChild(numberDisplay);
    
    // Create right arrow
    const rightArrow = document.createElement('button');
    rightArrow.className = 'is-small ml-1 p-2';
    rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightArrow.addEventListener('click', () => addComp(comp));
    arrows.appendChild(rightArrow);
    
    // Store references for easy access
    comp.leftArrow = leftArrow;
    comp.numberDisplay = numberDisplay;
    comp.rightArrow = rightArrow;
    
}

function selectComp(comp) {
    if (comp.btn.classList.contains('is-primary'))removeComp(comp);
    else addComp(comp);
}

function removeComp(comp) {
    const index = selectedComps.indexOf(comp);
    if (index > -1) {
        selectedComps.splice(index, 1);
        changeCost(-comp.cost);
        if (comp.counter) document.getElementById(comp.counter).classList.remove('is-disabled');
        if (comp.enable) {
            document.getElementById(comp.enable).classList.add('is-disabled');
            for (searchComp of allComps)
                if (searchComp.type === comp.enable)
                    removeComp(searchComp);
        }
        comp.count--;
        if (comp.type === 'target' && comp.count === 0) {
            comp.btn.classList.remove('is-primary');
            comp.arrows.style.width = '0';
            comp.arrows.style.opacity = '0';
            setTimeout(() => {comp.countDisplay.textContent = comp.count;}, 200);
        } else comp.countDisplay.textContent = comp.count;
    }
}

function addComp(comp) {
    comp.count++;
    comp.countDisplay.textContent = comp.count;
    comp.btn.classList.add('is-primary');
    selectedComps.push(comp);
    if (comp.counter) document.getElementById(comp.counter).classList.add('is-disabled');
    if (comp.enable) document.getElementById(comp.enable).classList.remove('is-disabled');
    if (comp.type === 'target') {
        comp.arrows.style.width = '80px';
        comp.arrows.style.opacity = '1';
    }
    changeCost(comp.cost);
}

function changeCost(i) {
    cost += i;
    manaBar.value = cost;

    // Update stamina and mana indicators
    const ranges = [
        { threshold: 0, stamina: stamina1, mana: mana1 },
        { threshold: 5, stamina: stamina2, mana: mana2 },
        { threshold: 10, stamina: stamina3, mana: mana3 }
    ];

    ranges.forEach(range => {
        if (cost > range.threshold) {
            range.stamina.classList.remove('is-disabled');
            range.mana.classList.remove('is-disabled');
        } else {
            range.stamina.classList.add('is-disabled');
            range.mana.classList.add('is-disabled');
        }
    });

    // Disable components whose cost would exceed the mana bar
    allComps.forEach(comp => {
        if (comp.cost + cost > manaBar.max && !comp.btn.classList.contains('is-primary')) {
            comp.btn.classList.add('is-disabled');
        } else {
            comp.btn.classList.remove('is-disabled');
        }
    });
}