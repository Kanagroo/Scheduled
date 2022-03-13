import { validate_startend, validate_breaks, validate_cycle } from './validators.js'

const content_body = document.querySelector('#body');
const content = document.querySelector('#content-wrapper')
const popup = document.querySelector('#popup-container');
const popup_copy_button = document.querySelector('#popup-button-copy');
const popup_open_button = document.querySelector('#popup-button-open');
const header = document.querySelector('#header-sub');
const continue_button = document.querySelector('#footer-button-continue');
const icon_meta = document.getElementById('iconmeta');
const apple_icon_meta = document.getElementById('appleiconmeta');
const animation_time = 1000;


function detect_colormode() {
    /* Get colormode of the user */

    let theme = 'light' // Default theme
    /* Detect last used color mode in local storage */
    let saved_theme = localStorage.getItem('theme');
    if (saved_theme) {
        theme = saved_theme;
    }
    /* Detect prefered color mode */
    if (window.matchMedia)
        if (window.matchMedia("(prefers-color-scheme: dark)").matches)
            theme = 'dark';
    
    /* Set dark mode in css */
    document.documentElement.setAttribute('data-theme', theme);
    icon_meta.href = `./assets/icon_${theme}.png`;
    apple_icon_meta.href = `./assets/icon_${theme}.png`;
}

class AnimationMode {
    static Leave = 0;
    static Enter = 1;
}

class Dependency {
    static Property = class {
        constructor(name, value) {
            this.name = name;
            this.value = value;
        }
    }

    constructor(tag, properties) {
        this.tag = tag;
        this.properties = properties;
    }
    
    load(container) {
        let node = document.createElement(this.tag);
        this.properties.forEach(p => {
            node[p.name] = p.value;
        });
        container.appendChild(node);
    }
}


class Step {
    constructor(header, html_location, data_entry, validator, dependencies) {
        this.element = null;
        this.header = header;
        this.html_location = html_location;
        this.data_entry = data_entry;
        this.validator = validator;
        this.dependencies = dependencies;
    }

    async load() {
        /* Load the element into the DOM */
        if (this.element) return;
        
        header.textContent = this.header;
        
        let container = document.createElement('div');
        container.className = 'step';
        container.style.transform = `translateX(${window.innerWidth/2 + container.offsetWidth/2}px)`;
        container.style.opacity = 0;

        let raw_html = await (await fetch(this.html_location + '.html')).text();
        container.innerHTML = raw_html;

        if (this.dependencies) {
            this.dependencies.forEach(d => {
                d.load(container);
            });
        }

        content_body.innerHTML = '';
        content_body.appendChild(container);
        this.element = container;

        return this;
    }

    unload() {
        /* Unload element from the DOM */
        this.element.remove();
        this.element = null;
        return this;
    }

    async animate(time, animation_mode) {
        /* Animate the element eiter entering or leaving */
        if (!this.element) return;

        // Initial Styles
        this.element.style.transition = `0ms transform ease-in-out, 0ms opacity ease-in-out`;
        this.element.style.transform = `translateX(${animation_mode ? window.innerWidth/2 + this.element.offsetWidth/2 : 0}px)`;
        this.element.style.opacity = animation_mode ? 0 : 100;
        header.style.transform = `translateY(${animation_mode ? -header.offsetHeight : 0}px)`;
        

        this.element.style.transition = `${time}ms transform ease-in-out, ${time}ms opacity ease-in-out`;
        header.style.transition = `${time}ms transform ease-in-out`;

        // Post Styles
        this.element.style.transform = `translateX(${animation_mode ? 0 : -(window.innerWidth/2 + this.element.offsetWidth/2)}px)`;
        this.element.style.opacity = animation_mode ? 100 : 0;
        header.style.transform = `translateY(${animation_mode ? 0 : -header.offsetHeight}px)`;

        // Wait until transition finish
        await new Promise((r) => setTimeout(r, time));

        this.element.style = null;
    }
}


/* Defining each steps */
let startend_step = new Step('Set a Start and an End', 'scenes/calendar', 'sded', validate_startend, [
    new Dependency('link', [new Dependency.Property('rel', 'stylesheet'), new Dependency.Property('href', 'styles/calendar.css')]),
    new Dependency('script', [new Dependency.Property('type', 'text/javascript'), new Dependency.Property('src', 'scripts/calendar.js')])
])
let breaks_step = new Step('Set your off-days', 'scenes/calendar', 'breaks', validate_breaks, [
    new Dependency('link', [new Dependency.Property('rel', 'stylesheet'), new Dependency.Property('href', 'styles/calendar.css')]),
    new Dependency('script', [new Dependency.Property('type', 'text/javascript'), new Dependency.Property('src', 'scripts/calendar.js')])
])
let cycle_step = new Step('Plan your cycle', 'scenes/cycle', 'cycle', validate_cycle, [
    new Dependency('link', [new Dependency.Property('rel', 'stylesheet'), new Dependency.Property('href', 'styles/cycle.css')]),
    new Dependency('script', [new Dependency.Property('type', 'text/javascript'), new Dependency.Property('src', 'scripts/cycle.js')])
])


/*

    Event Handlers

*/

function sumbitHandler() {
    let data = {};

    // Get data from all steps
    for (let i=0;i<steps.length;i++)
        data[steps[i].data_entry] = JSON.parse(sessionStorage.getItem(`step${i}`)).data;

    // Make data into objects
    let start_date = new Date(data[startend_step.data_entry].selected[0]);
    let end_date = new Date(data[startend_step.data_entry].selected[1]);
    let breaks = data[breaks_step.data_entry].selected.map(e => new Date(e));
    let cycle = data[cycle_step.data_entry];

    // Encode data objects into compact string
    let encoded_data = encode_data(start_date, end_date, breaks, cycle);
    
    // URL and Base64 Encode
    encoded_data = encodeURIComponent(btoa(encoded_data));
    
    let url = `${window.location.href}schedule/?d=${encoded_data}`;
    
    popup.className = 'show';
    content.className = 'closed';

    popup_copy_button.addEventListener('click', e=> {
        navigator.clipboard.writeText(url);
    });

    popup_open_button.addEventListener('click', e=> {
        window.location.assign(url);
    });
}

async function nextStepHandler(e) {
    let step = steps[current_step];
    let next_step = steps[current_step + 1];
    let step_data = JSON.parse(sessionStorage.getItem(`step${current_step}`)).data;

    // Validate step data
    if (!step.validator(step_data)) return;

    // If current step is last step, sumbit
    if (current_step >= steps.length - 1) {
        sumbitHandler(); return;
    }

    current_step++;
    sessionStorage.setItem('step', current_step);

    await step.animate(animation_time, AnimationMode.Leave).then(() => {
        step.unload();
    });
    await next_step.load().then(()=> {
        next_step.animate(animation_time, AnimationMode.Enter);
    });
}


/*

    Utility functions

*/

function encode_data(start_date, end_date, breaks, cycle) {
    /* Encode data into a compact string */

    // Encode number into ascii character
    let encode_ascii = n => Math.floor(n/(122-33)) > 0 ? String.fromCharCode(Math.floor(n/(122-33)) + 33) + '~' + String.fromCharCode(n - Math.floor(n/(122-33))*89 + 33) : String.fromCharCode(n - Math.floor(n/(122-33))*89 + 33);
    // Encode date into string
    let encode_date = d => `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}.`;
    // Encode breaks into string of charaters
    let encode_break = (b, l) => `${encode_ascii(Math.round((b - l)/86400000))}`;
    

    let result = '';
    let start_date_string = encode_date(start_date);
    let end_date_string = encode_date(end_date);

    // Add encoded results into one string
    result += start_date_string + end_date_string;
    result += encode_break(breaks[0], start_date);
    for (let i=1;i<breaks.length;i++) {
        result += encode_break(breaks[i], breaks[i-1]);
    }
    result += '.';

    // Name1(HH:MM)Name2(HH:MM)-Name1(HH:MM)Name2(HH:MM
    for (let i=0;i<cycle.days.length;i++) {
        for (let j=0;j<cycle.days[i].length;j++) {
            result += `${cycle.days[i][j].name}(${cycle.days[i][j].time})`;
        }
        result = result.slice(0, result.length-1);
        result += '-';
    }
    result = result.slice(0, result.length-1);

    return result;
}

/*

    Event Listeners

*/

continue_button.addEventListener(
    'click', nextStepHandler
);


/*

    Init

*/

detect_colormode();

let steps = [
    startend_step,
    breaks_step,
    cycle_step
]

let current_step = 0;

// Get step in session storage if it exists
if (sessionStorage.getItem('step'))
    current_step = parseInt(sessionStorage.getItem('step'));
else
    sessionStorage.setItem('step', current_step);

// Load first step
steps[current_step].load().then(s => {
    s.animate(animation_time, AnimationMode.Enter);
});
