// Global state variables
var allComps;
var selectedComps;
var currentTab;
var cost = 0;
var selectedClassColor = 'primary';
var data;

// DOM element references
const manaBar = document.getElementById('manaBar');
const stamina1 = document.getElementById('stamina1');
const stamina2 = document.getElementById('stamina2');
const stamina3 = document.getElementById('stamina3');
const mana1 = document.getElementById('mana1');
const mana2 = document.getElementById('mana2');
const mana3 = document.getElementById('mana3');
const legendElement = document.getElementById('legend');
const panel = document.getElementById('components');
const fadeTop = document.getElementById('fade-top');
const fadeBottom = document.getElementById('fade-bottom');
const restart = document.getElementById('restart');
const cont = document.getElementById('continue');
var last = {};

// Initialize the application
startup();






async function startup() {
    data = await fetchComponents();
    assignTabClickHandlers(data);
    populateComponents();
}




/**
 * Loads and displays all components from the JSON file
 * Sorts by cost and creates UI blocks for each component
 */
function populateComponents() {
    components.innerHTML = '';
    allComps = [];
    selectedComps = [];
    currentTab = "target";
    changeCost(-100);

    const comps = data.components;
    comps.sort((a, b) => a.cost - b.cost);
    
    // Create UI blocks for each component
    for (const comp of comps) {
        comp.count = 0;
        const block = document.createElement('div');
        panel.appendChild(block);
        comp.block = block;
        block.className = 'is-hidden is-flex is-align-items-center is-flex-direction-column-on-mobile';

        // Component button
        comp.btn = createButton(comp);
        block.appendChild(comp.btn);
        allComps.push(comp);

        // Arrow controls for quantity selection
        if(comp.type === 'target'){
            comp.arrows = createArrowControls(comp);
            block.appendChild(comp.arrows);
        }
    } 
    
    // Show components for the current tab
    for (const comp of allComps)
        if (comp.type === currentTab) {
            comp.block.classList.remove('is-hidden');
            last = comp;
        }
    
    panel.addEventListener('scroll', handleScroll);
    handleScroll();

    assignTabFunction(document.getElementById('target'), data);

    restart.addEventListener('click', () => populateComponents());
}
function fetchComponents() {
    return fetch('components.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load JSON');
        return response.json();
      })
      .then(data => {return data;})
      .catch(error => console.error('Error:', error));
}





/**
 * Sets up click handlers for the tab navigation
 * Switches between different component types (target, form, etc.)
 */
function assignTabClickHandlers(data) {
    document.querySelector('#component-tabs').addEventListener('click', function(event) { 
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains('is-outlined'))
            assignTabFunction(event.target, data);
    });
}


function assignTabFunction(target, data) {
    document.querySelectorAll('#component-tabs button').forEach(tab => tab.classList.add('is-outlined'));
    target.classList.remove('is-outlined');
    
    // Switch to new tab and filter components
    clearScrollDetection();
    currentTab = target.id;
    for (const comp of allComps)
        if (comp.type === currentTab) {
            comp.block.classList.remove('is-hidden');
            last.btn.classList.add('mb-2');
            last = comp;
        }
        else comp.block.classList.add('is-hidden');
    last.btn.classList.remove('mb-2');
    panel.addEventListener('scroll', handleScroll);
    handleScroll();
    
    const tab = data.tabs[currentTab];
    document.getElementById('component-tab-title').innerHTML = tab.title;
    document.getElementById('component-tab-description').innerHTML = tab.description;

    legendElement.innerHTML = `
        <span style="width: 150px">Name</span>
        <span style="width: 150px">Cost</span>
        <span style="width: 150px">Invocation</span>
        ${currentTab === 'aspect' ? `<span style="width: 150px">Counter</span>` : ''}
        <span>Description</span>`;
}





/**
 * Creates the main component button with responsive layout
 * @param {Object} comp - Component data object
 * @returns {HTMLElement} The created button element
 */
function createButton(comp) {
    const btn = document.createElement('button');
    btn.className = 'button has-text-left mb-2';
    btn.style.width = '100%';
    btn.compType = comp.type;
    btn.id = comp.name;
    btn.addEventListener('click', () => {
        if (comp.btn.classList.contains(`is-${selectedClassColor}`))removeComp(comp);
        else addComp(comp);
    });
    
    btn.innerHTML = `
        <div class="hide-on-mobile">
            <div class="is-flex" style="width: 100%;">
                <span class="has-text-weight-bold" style="width: 150px; flex-shrink: 0;">${comp.name}</span>
                <span style="width: 150px; flex-shrink: 0;">${comp.cost} Mana</span>
                <span style="width: 150px; flex-shrink: 0;"><i>"${comp.invocation}"</i></span>
                ${comp.type === 'aspect' ? `<span style="width: 150px; flex-shrink: 0;">${comp.counter}</span>` : ''}
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
            <div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${comp.description}</div>
        </div>`;
    return btn;
}





/**
 * Creates the arrow control container with left/right arrows and number display
 * @param {Object} comp - Component data object
 * @returns {HTMLElement} The arrow controls container
 */
function createArrowControls(comp) {
    const arrows = document.createElement('div');
    arrows.className = 'arrow-block is-flex is-align-items-center is-justify-content-center';
    Object.assign(arrows.style, { width: '0', height: '0', opacity: '0' }); // Initially hidden
    
    // Left arrow (decrease quantity)
    const leftArrow = createArrowButton('fas fa-chevron-left', () => removeComp(comp));
    arrows.appendChild(leftArrow);
    
    // Number display (shows current quantity)
    comp.countDisplay = document.createElement('strong');
    comp.countDisplay.className = `is-small has-text-${selectedClassColor} mx-1 has-text-centered dynamic-text`;
    comp.countDisplay.style.width = '20px';
    comp.countDisplay.textContent = '0';
    arrows.appendChild(comp.countDisplay);
    
    // Right arrow (increase quantity)
    const rightArrow = createArrowButton('fas fa-chevron-right', () => addComp(comp));
    comp.rightArrow = rightArrow; // Store reference for later use
    arrows.appendChild(rightArrow);
    
    return arrows;
}
function createArrowButton(iconClass, clickHandler) {
    const button = document.createElement('button');
    button.className = 'is-small p-2 dynamic-arrow has-text-primary';
    button.innerHTML = `<i class="${iconClass}"></i>`;
    button.addEventListener('click', clickHandler);
    return button;
}





/**
 * Adds a component to the selection
 * Handles dependencies, cost updates, and UI changes
 * @param {Object} comp - Component to add
 */
function addComp(comp) {
    comp.count++;
    if (comp.type === 'target') comp.countDisplay.textContent = comp.count;
    comp.btn.classList.add(`is-${selectedClassColor}`);
    selectedComps.push(comp);
    
    // Handle component dependencies
    if (comp.counter) document.getElementById(comp.counter).classList.add('is-disabled');
    if (comp.enable) document.getElementById(comp.enable).classList.remove('is-disabled');
    
    // Show arrows for target components (they support multiple quantities)
    if (comp.type === 'target') 
        Object.assign(comp.arrows.style, {
            width: '100px',
            height: '40px',
            opacity: '1'
        });
    changeCost(comp.cost);
}





/**
 * Removes a component from the selection
 * Handles dependencies, cost updates, and UI changes
 * @param {Object} comp - Component to remove
 */
function removeComp(comp) {
    const index = selectedComps.indexOf(comp);
    if (index === -1) return; // Component not selected
    
    selectedComps.splice(index, 1);
    changeCost(-comp.cost);
    
    // Handle component dependencies
    if (comp.counter) document.getElementById(comp.counter).classList.remove('is-disabled');
    if (comp.enable) {
        document.getElementById(comp.enable).classList.add('is-disabled');
        allComps.filter(c => c.type === comp.enable).forEach(removeComp);
    }
    
    // Update count and UI
    comp.count--;
    if (comp.count == 0) {
        comp.btn.classList.remove(`is-${selectedClassColor}`);
        if (comp.type === 'target') 
            Object.assign(comp.arrows.style, {
                width: '0',
                height: '0',
                opacity: '0'
            });
    }
    
    // Update count display for target components
    if (comp.type === 'target') {
        if (comp.count == 0) setTimeout(() => comp.countDisplay.textContent = comp.count, 200); // Delayed for animation
        else comp.countDisplay.textContent = comp.count;
    }
}





/**
 * Updates the total cost and manages mana/stamina indicators
 * Also handles component availability based on mana limits
 * @param {number} i - Cost change amount (positive or negative)
 */
function changeCost(i) {
    cost += i;
    if (cost < 0) cost = 0; // Prevent negative cost
    manaBar.value = cost;

    // Update stamina and mana indicators based on cost thresholds
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

    // Disable components that would exceed mana limit
    allComps.forEach(comp => {
        if (comp.cost + cost > manaBar.max && !comp.btn.classList.contains(`is-${selectedClassColor}`)) comp.btn.classList.add('is-disabled-for-mana');
        else comp.btn.classList.remove('is-disabled-for-mana');
        if (comp.rightArrow)
            if (comp.cost + cost > manaBar.max) comp.rightArrow.classList.add('is-disabled-for-mana');
            else comp.rightArrow.classList.remove('is-disabled-for-mana');

    });
}



    

/**
 * Sets up scroll event listener to show/hide fade effects based on scroll position
 * Shows top fade when content is scrolled down, bottom fade when more content is below
 */
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = panel;
    
    // Show top fade if scrolled down from top (content hidden above)
    if (scrollTop > 5) fadeTop.style.display = 'block';
    else fadeTop.style.display = 'none';
    
    // Show bottom fade if there's more content below (content hidden below)
    if (scrollTop + clientHeight < scrollHeight - 5) fadeBottom.style.display = 'block';
    else fadeBottom.style.display = 'none';
}

function clearScrollDetection() {
    // Remove scroll listener and hide fades
    panel.removeEventListener('scroll', handleScroll);
    fadeTop.style.display = 'none';
    fadeBottom.style.display = 'none';
}