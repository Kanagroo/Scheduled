import { validate_startend, validate_breaks, validate_cycle } from './validators.js'

const content_body = document.querySelector('#body');
const header = document.querySelector('#header-sub');
const continue_button = document.querySelector('#footer-button-continue');
const steps = [
    {
        'header': 'Set a Start and an End',
        'location': 'scenes/calendar',
        'validator': validate_startend,
        'data-entry': 'sded',
        'dependencies': [
            {'tag': 'link', 'properties':{'rel': 'stylesheet', 'href': 'styles/calendar.css'}},
            {'tag': 'script', 'properties':{'src': 'scripts/calendar.js', 'type':'text/javascript'}}
                     ]
    },
    {
        'header': 'Set your off-days',
        'location': 'scenes/calendar',
        'validator': validate_breaks,
        'data-entry': 'breaks',
        'dependencies': [
            {'tag': 'link', 'properties':{'rel': 'stylesheet', 'href': 'styles/calendar.css'}},
            {'tag': 'script', 'properties':{'src': 'scripts/calendar.js', 'type':'text/javascript'}}
                     ]
    },
    {
        'header': 'Plan your cycle',
        'location': 'scenes/cycle',
        'validator': validate_cycle,
        'data-entry': 'cycle',
        'dependencies': [
            {'tag': 'link', 'properties':{'rel': 'stylesheet', 'href': 'styles/cycle.css'}},
            {'tag': 'script', 'properties':{'src': 'scripts/cycle.js', 'type':'text/javascript'}}
        ]
    }
];

detect_colormode();

let step = 0
if (sessionStorage.getItem('step'))
    step = parseInt(sessionStorage.getItem('step'));
else
    sessionStorage.setItem('step', step)


async function animation(step_element, isEnter) {
    if (!step_element)
        return;
    
    const animation_time = 1000
    

    // Initial Styles
    step_element.style.transition = `0ms transform ease-in-out, 0ms opacity ease-in-out`;
    step_element.style.transform = `translateX(${isEnter ? window.innerWidth/2 + step_element.offsetWidth/2 : 0}px)`
    step_element.style.opacity = isEnter ? 0 : 100;
    header.style.transform = `translateY(${isEnter ? -header.offsetHeight : 0}px)`
    

    step_element.style.transition = `${animation_time}ms transform ease-in-out, ${animation_time}ms opacity ease-in-out`;
    header.style.transition = `${animation_time}ms transform ease-in-out`;

    // Post Styles
    step_element.style.transform = `translateX(${isEnter ? 0 : -(window.innerWidth/2 + step_element.offsetWidth/2)}px)`
    step_element.style.opacity = isEnter ? 100 : 0;
    header.style.transform = `translateY(${isEnter ? 0 : -header.offsetHeight}px)`

    // Wait until transition finish
    await new Promise((r) => setTimeout(r, animation_time));

    step_element.style = null;
}

function detect_colormode() {
    let theme = 'light'
    let saved_theme = localStorage.getItem('theme')
    if (saved_theme) {
        theme = saved_theme;
        return;
    }
    if (window.matchMedia)
        if (window.matchMedia("(prefers-color-scheme: dark)").matches)
            theme = 'dark'
    
    document.documentElement.setAttribute('data-theme', 'dark');
}

async function load_step(step) {
    // Change header
    header.textContent = step.header;
    // Clear Body
    content_body.innerHTML = '';

    //Create 'step' container
    var container = document.createElement('div');
    container.className = 'step';
    container.style.transform = `translateX(${window.innerWidth/2 + container.offsetWidth/2}px)`
    container.style.opacity = 0;


    // Load Step HTML
    var step_html_content = await (await fetch(step.location + '.html')).text();
    container.innerHTML = step_html_content;

    // Load Step Depedendies
    if (step.dependencies) {
        step.dependencies.forEach(dependency => {
            var node = document.createElement(dependency.tag);
            for (var property in dependency.properties) {
                node[property] = dependency.properties[property];
            }
            container.appendChild(node);
        });
    }

    content_body.appendChild(container);

    await animation(container, true);
    return container;
}

async function unload_step() {
    const container = document.querySelector('.step');

    await animation(container, false)
    container.remove();
    
}

function submitHandler() {
    let data = {};
    for (let i=0;i<steps.length;i++)
        data[steps[i]['data-entry']] = JSON.parse(sessionStorage.getItem(`step${i}`)).data

    let start_date = new Date(data.sded.selected[0]);
    let end_date = new Date(data.sded.selected[1]);
    let breaks = data.breaks.selected.map(e => new Date(e));
    let cycle = data.cycle

    let encoded_data = encode_data(start_date, end_date, breaks, cycle);
    console.log(encodeURIComponent(btoa(encoded_data)));
}

async function nextStepHandler(e) {
    if (!steps[step].validator(JSON.parse(sessionStorage.getItem(`step${step}`)).data))
        return;
    if (step >= steps.length - 1) {
        submitHandler();
        return;
    }
    step++;
    sessionStorage.setItem('step', step)
    

    await unload_step()
    load_step(steps[step])
}


function encode_data(start_date, end_date, breaks, cycle) {
    let encode_ascii = n => Math.floor(n/(122-33)) > 0 ? String.fromCharCode(Math.floor(n/(122-33)) + 33) + '~' + String.fromCharCode(n - Math.floor(n/(122-33))*89 + 33) : String.fromCharCode(n - Math.floor(n/(122-33))*89 + 33);
    let encode_date = d => `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}.`;
    let encode_break = (b, l) => `${encode_ascii((b - l)/86400000)}`;
    

    let result = '';
    let start_date_string = encode_date(start_date);
    let end_date_string = encode_date(end_date);

    result += start_date_string + end_date_string;

    result += encode_break(breaks[0], start_date)
    for (let i=1;i<breaks.length;i++) {
        result += encode_break(breaks[i], breaks[i-1])
    }
    result += '.'

    // Science(02:00)Info(03:45)-Anglais(02:00)Francais(03:45
    for (let i=0;i<cycle.days.length;i++) {
        for (let j=0;j<cycle.days[i].length;j++) {
            result += `${cycle.days[i][j].name}(${cycle.days[i][j].time})`
        }
        result = result.slice(0, result.length-1)
        result += '-'
    }
    result = result.slice(0, result.length-1);

    return result;
}

load_step(steps[step]);

continue_button.addEventListener(
    'click', nextStepHandler
);
